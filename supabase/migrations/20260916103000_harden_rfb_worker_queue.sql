alter table public.rfb_processing_jobs add column if not exists claimed_at timestamptz;
alter table public.rfb_processing_jobs add column if not exists next_retry_at timestamptz;
alter table public.rfb_processing_jobs add column if not exists max_attempts integer not null default 3;
alter table public.rfb_processing_jobs add column if not exists run_id uuid;
alter table public.rfb_processing_jobs add column if not exists priority integer not null default 100;
alter table public.export_files add column if not exists checksum_sha256 text;

create index if not exists idx_rfb_jobs_claim_queue
  on public.rfb_processing_jobs (status, next_retry_at, priority, created_at);

create index if not exists idx_rfb_jobs_lease
  on public.rfb_processing_jobs (status, lease_expires_at)
  where status = 'running';

create index if not exists idx_rfb_jobs_request
  on public.rfb_processing_jobs (request_id, created_at desc);

create index if not exists idx_export_files_export
  on public.export_files (export_id);

create index if not exists idx_export_files_request
  on public.export_files (request_id, created_at desc);

create or replace function public.claim_next_rfb_job(
  p_worker_id text,
  p_lease_seconds integer default 300
)
returns setof public.rfb_processing_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with next_job as (
    select id
    from public.rfb_processing_jobs
    where status = 'queued'
      and (next_retry_at is null or next_retry_at <= now())
      and attempts < coalesce(max_attempts, 3)
    order by priority asc, created_at asc
    for update skip locked
    limit 1
  )
  update public.rfb_processing_jobs job
     set status = 'running',
         progress = greatest(job.progress, 5),
         current_step = 'claimed',
         worker_id = p_worker_id,
         attempts = job.attempts + 1,
         claimed_at = now(),
         started_at = coalesce(job.started_at, now()),
         heartbeat_at = now(),
         lease_expires_at = now() + make_interval(secs => greatest(coalesce(p_lease_seconds, 300), 30)),
         run_id = gen_random_uuid(),
         updated_at = now()
    from next_job
   where job.id = next_job.id
  returning job.*;
end;
$$;

create or replace function public.recover_stale_rfb_jobs(
  p_max_attempts integer default 3
)
returns table(recovered_count integer, failed_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  recovered integer := 0;
  failed integer := 0;
begin
  with stale as (
    select id
    from public.rfb_processing_jobs
    where status = 'running'
      and lease_expires_at is not null
      and lease_expires_at < now()
      and attempts < coalesce(max_attempts, p_max_attempts, 3)
    for update skip locked
  ),
  updated as (
    update public.rfb_processing_jobs job
       set status = 'queued',
           current_step = 'retry_scheduled',
           worker_id = null,
           lease_expires_at = null,
           next_retry_at = now(),
           updated_at = now()
      from stale
     where job.id = stale.id
    returning job.id
  )
  select count(*) into recovered from updated;

  with expired as (
    select id
    from public.rfb_processing_jobs
    where status = 'running'
      and lease_expires_at is not null
      and lease_expires_at < now()
      and attempts >= coalesce(max_attempts, p_max_attempts, 3)
    for update skip locked
  ),
  updated as (
    update public.rfb_processing_jobs job
       set status = 'failed',
           current_step = 'lease_expired',
           error_message = 'Lease expirado apos limite de tentativas.',
           worker_id = null,
           lease_expires_at = null,
           finished_at = now(),
           updated_at = now()
      from expired
     where job.id = expired.id
    returning job.id
  )
  select count(*) into failed from updated;

  return query select recovered, failed;
end;
$$;

revoke all on function public.claim_next_rfb_job(text, integer) from public, anon, authenticated;
revoke all on function public.recover_stale_rfb_jobs(integer) from public, anon, authenticated;
grant execute on function public.claim_next_rfb_job(text, integer) to service_role;
grant execute on function public.recover_stale_rfb_jobs(integer) to service_role;
