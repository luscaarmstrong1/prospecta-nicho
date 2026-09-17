alter table public.exports add column if not exists run_id uuid;
alter table public.suppression_list add column if not exists suppression_type text;
alter table public.suppression_list add column if not exists suppression_value text;
alter table public.suppression_list add column if not exists is_active boolean not null default true;

update public.suppression_list
   set suppression_type = coalesce(
         suppression_type,
         case
           when regexp_replace(coalesce(normalized_identifier, ''), '[^0-9]', '', 'g') ~ '^[0-9]{14}$' then 'cnpj'
           when coalesce(normalized_identifier, '') ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then 'email'
           when regexp_replace(coalesce(normalized_identifier, ''), '[^0-9]', '', 'g') ~ '^[0-9]{10,11}$' then 'phone'
           else 'company'
         end
       ),
       suppression_value = coalesce(suppression_value, normalized_identifier),
       is_active = case when lower(coalesce(status, 'active')) = 'active' then true else false end
 where suppression_type is null
    or suppression_value is null
    or is_active is distinct from (lower(coalesce(status, 'active')) = 'active');

create unique index if not exists idx_exports_job_run
  on public.exports (job_id, run_id)
  where job_id is not null and run_id is not null;

create unique index if not exists idx_export_files_export_format
  on public.export_files (export_id, file_format)
  where export_id is not null;

create index if not exists idx_suppression_active
  on public.suppression_list (suppression_type, suppression_value)
  where is_active = true;

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
  if nullif(btrim(p_worker_id), '') is null then
    raise exception 'WORKER_ID_REQUIRED';
  end if;
  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 then
    raise exception 'INVALID_LEASE_SECONDS';
  end if;

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
     set status = 'running', progress = greatest(job.progress, 5), current_step = 'claimed',
         worker_id = btrim(p_worker_id), attempts = job.attempts + 1, claimed_at = now(),
         started_at = coalesce(job.started_at, now()), heartbeat_at = now(),
         lease_expires_at = now() + make_interval(secs => p_lease_seconds),
         run_id = gen_random_uuid(), next_retry_at = null, finished_at = null, updated_at = now()
    from next_job
   where job.id = next_job.id
  returning job.*;
end;
$$;

create or replace function public.heartbeat_rfb_job(
  p_job_id uuid,
  p_run_id uuid,
  p_worker_id text,
  p_lease_seconds integer default 300,
  p_current_step text default null,
  p_progress integer default null,
  p_search_stats jsonb default null
)
returns setof public.rfb_processing_jobs
language sql
security definer
set search_path = public
as $$
  update public.rfb_processing_jobs
     set heartbeat_at = now(),
         lease_expires_at = now() + make_interval(secs => least(greatest(coalesce(p_lease_seconds, 300), 30), 3600)),
         current_step = coalesce(p_current_step, current_step),
         progress = coalesce(least(greatest(p_progress, 0), 99), progress),
         search_stats = coalesce(p_search_stats, search_stats),
         updated_at = now()
   where id = p_job_id
     and run_id = p_run_id
     and worker_id = p_worker_id
     and status = 'running'
     and lease_expires_at > now()
  returning *;
$$;

create or replace function public.transition_rfb_job(
  p_job_id uuid,
  p_run_id uuid,
  p_worker_id text,
  p_status text,
  p_current_step text,
  p_progress integer default null,
  p_error_message text default null,
  p_provider_error_code text default null,
  p_search_stats jsonb default null,
  p_next_retry_at timestamptz default null,
  p_request_status text default null
)
returns setof public.rfb_processing_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  changed public.rfb_processing_jobs%rowtype;
begin
  if p_status not in ('queued', 'failed', 'cancelled', 'no_results') then
    raise exception 'Transicao de worker nao permitida: %', p_status;
  end if;

  update public.rfb_processing_jobs
     set status = p_status,
         current_step = p_current_step,
         progress = coalesce(least(greatest(p_progress, 0), 100), progress),
         error_message = p_error_message,
         provider_error_code = p_provider_error_code,
         search_stats = coalesce(p_search_stats, search_stats),
         next_retry_at = case when p_status = 'queued' then p_next_retry_at else null end,
         finished_at = case when p_status = 'queued' then null else now() end,
         worker_id = null,
         claimed_at = null,
         heartbeat_at = null,
         lease_expires_at = null,
         run_id = null,
         updated_at = now()
   where id = p_job_id
     and run_id = p_run_id
     and worker_id = p_worker_id
     and status = 'running'
     and lease_expires_at > now()
  returning * into changed;

  if changed.id is null then
    raise exception 'JOB_OWNERSHIP_LOST';
  end if;

  if p_request_status is not null and changed.request_id is not null then
    update public.custom_requests
       set status = p_request_status,
           updated_at = now()
     where id = changed.request_id;
  end if;

  insert into public.rfb_job_logs(job_id, request_id, level, step, message, metadata)
  values (
    changed.id,
    changed.request_id,
    case when p_status = 'failed' then 'error' when p_status in ('cancelled', 'no_results') then 'warning' else 'info' end,
    p_current_step,
    coalesce(p_error_message, 'Job alterado para ' || p_status || '.'),
    jsonb_build_object('worker_id', p_worker_id, 'transition_status', p_status)
  );

  return next changed;
end;
$$;

create or replace function public.finalize_local_rfb_job(
  p_job_id uuid,
  p_run_id uuid,
  p_worker_id text,
  p_job_status text,
  p_request_status text,
  p_row_count integer,
  p_search_stats jsonb,
  p_files jsonb,
  p_filters_snapshot jsonb,
  p_fields_snapshot jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  owned public.rfb_processing_jobs%rowtype;
  export_row public.exports%rowtype;
  file_item jsonb;
  primary_file jsonb;
begin
  if p_job_status not in ('ready_for_delivery', 'completed_partial') then
    raise exception 'Status final invalido: %', p_job_status;
  end if;
  if p_request_status <> 'ready_for_delivery' then
    raise exception 'Status final do pedido invalido: %', p_request_status;
  end if;
  if p_row_count is null or p_row_count < 0 then
    raise exception 'Quantidade de linhas invalida.';
  end if;
  if p_files is null or jsonb_typeof(p_files) <> 'array' or jsonb_array_length(p_files) = 0 then
    raise exception 'Manifesto de arquivos vazio ou invalido.';
  end if;

  select * into owned
    from public.rfb_processing_jobs
   where id = p_job_id
     and run_id = p_run_id
   for update;
  if owned.id is null then
    raise exception 'JOB_OWNERSHIP_LOST';
  end if;

  if owned.status in ('ready_for_delivery', 'completed_partial') and owned.worker_id is null then
    select * into export_row
      from public.exports
     where job_id = owned.id and run_id = p_run_id
     limit 1;
    if export_row.id is not null then
      return jsonb_build_object(
        'job_id', owned.id,
        'request_id', owned.request_id,
        'export_id', export_row.id,
        'status', owned.status
      );
    end if;
  end if;

  if owned.worker_id is distinct from p_worker_id
     or owned.status <> 'running'
     or owned.lease_expires_at is null
     or owned.lease_expires_at <= now() then
    raise exception 'JOB_OWNERSHIP_LOST';
  end if;

  select value into primary_file
    from jsonb_array_elements(p_files)
   order by case when value->>'format' = 'xlsx' then 0 else 1 end
   limit 1;

  insert into public.exports(
    request_id, job_id, run_id, status, row_count, file_name, file_format,
    storage_provider, storage_path, filters_snapshot, fields_snapshot, generated_by
  ) values (
    owned.request_id, owned.id, p_run_id, 'ready', greatest(coalesce(p_row_count, 0), 0),
    primary_file->>'name', primary_file->>'format', 'local', primary_file->>'path',
    coalesce(p_filters_snapshot, '{}'::jsonb), coalesce(p_fields_snapshot, '[]'::jsonb),
    'minha_receita_worker'
  )
  on conflict (job_id, run_id) where job_id is not null and run_id is not null
  do update set
    status = excluded.status,
    row_count = excluded.row_count,
    file_name = excluded.file_name,
    file_format = excluded.file_format,
    storage_provider = excluded.storage_provider,
    storage_path = excluded.storage_path,
    filters_snapshot = excluded.filters_snapshot,
    fields_snapshot = excluded.fields_snapshot
  returning * into export_row;

  for file_item in select value from jsonb_array_elements(p_files)
  loop
    if coalesce(file_item->>'format', '') not in ('csv', 'xlsx')
       or nullif(file_item->>'name', '') is null
       or nullif(file_item->>'path', '') is null
       or coalesce(file_item->>'checksum_sha256', '') !~ '^[0-9a-f]{64}$' then
      raise exception 'Manifesto de arquivo invalido.';
    end if;
    insert into public.export_files(
      export_id, request_id, file_name, file_format, storage_provider,
      storage_path, byte_size, checksum, checksum_sha256
    ) values (
      export_row.id, owned.request_id, file_item->>'name', file_item->>'format', 'local',
      file_item->>'path', nullif(file_item->>'byte_size', '')::bigint,
      file_item->>'checksum_sha256', file_item->>'checksum_sha256'
    )
    on conflict (export_id, file_format) where export_id is not null
    do update set
      file_name = excluded.file_name,
      storage_provider = excluded.storage_provider,
      storage_path = excluded.storage_path,
      byte_size = excluded.byte_size,
      checksum = excluded.checksum,
      checksum_sha256 = excluded.checksum_sha256;
  end loop;

  update public.custom_requests
     set status = p_request_status,
         export_id = export_row.id,
         job_id = owned.id,
         updated_at = now()
   where id = owned.request_id;

  update public.rfb_processing_jobs
     set status = p_job_status,
         progress = 100,
         current_step = p_job_status,
         search_stats = coalesce(p_search_stats, '{}'::jsonb),
         finished_at = now(),
         worker_id = null,
         claimed_at = null,
         heartbeat_at = null,
         lease_expires_at = null,
         updated_at = now()
   where id = owned.id;

  insert into public.rfb_job_logs(job_id, request_id, level, step, message, metadata)
  values (
    owned.id, owned.request_id, 'info', p_job_status,
    'Export local finalizado com ' || greatest(coalesce(p_row_count, 0), 0) || ' linhas.',
    jsonb_build_object('worker_id', p_worker_id, 'run_id', p_run_id, 'export_id', export_row.id)
  );

  return jsonb_build_object(
    'job_id', owned.id,
    'request_id', owned.request_id,
    'export_id', export_row.id,
    'status', p_job_status
  );
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
  ), updated as (
    update public.rfb_processing_jobs job
       set status = 'queued', current_step = 'retry_scheduled', worker_id = null,
           claimed_at = null, heartbeat_at = null, lease_expires_at = null,
           run_id = null, next_retry_at = now(), finished_at = null, updated_at = now()
      from stale where job.id = stale.id
    returning job.id, job.request_id
  ), logged as (
    insert into public.rfb_job_logs(job_id, request_id, level, step, message, metadata)
    select id, request_id, 'warning', 'lease_recovered', 'Lease expirado; job devolvido a fila.', '{}'::jsonb
      from updated
    returning 1
  )
  select count(*) into recovered from logged;

  with expired as (
    select id
      from public.rfb_processing_jobs
     where status = 'running'
       and lease_expires_at is not null
       and lease_expires_at < now()
       and attempts >= coalesce(max_attempts, p_max_attempts, 3)
     for update skip locked
  ), updated as (
    update public.rfb_processing_jobs job
       set status = 'failed', current_step = 'lease_expired',
           error_message = 'Lease expirado apos limite de tentativas.', worker_id = null,
           claimed_at = null, heartbeat_at = null, lease_expires_at = null,
           run_id = null, finished_at = now(), updated_at = now()
      from expired where job.id = expired.id
    returning job.id, job.request_id
  ), logged as (
    insert into public.rfb_job_logs(job_id, request_id, level, step, message, metadata)
    select id, request_id, 'error', 'lease_expired', 'Lease expirado apos limite de tentativas.', '{}'::jsonb
      from updated
    returning 1
  )
  select count(*) into failed from logged;

  return query select recovered, failed;
end;
$$;

revoke all on function public.heartbeat_rfb_job(uuid, uuid, text, integer, text, integer, jsonb) from public, anon, authenticated;
revoke all on function public.transition_rfb_job(uuid, uuid, text, text, text, integer, text, text, jsonb, timestamptz, text) from public, anon, authenticated;
revoke all on function public.finalize_local_rfb_job(uuid, uuid, text, text, text, integer, jsonb, jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.claim_next_rfb_job(text, integer) from public, anon, authenticated;
grant execute on function public.heartbeat_rfb_job(uuid, uuid, text, integer, text, integer, jsonb) to service_role;
grant execute on function public.transition_rfb_job(uuid, uuid, text, text, text, integer, text, text, jsonb, timestamptz, text) to service_role;
grant execute on function public.finalize_local_rfb_job(uuid, uuid, text, text, text, integer, jsonb, jsonb, jsonb, jsonb) to service_role;
grant execute on function public.claim_next_rfb_job(text, integer) to service_role;
