alter table public.custom_requests add column if not exists client_request_id uuid;
alter table public.custom_requests add column if not exists commercial_goal text;
alter table public.custom_requests add column if not exists job_id uuid;
alter table public.custom_requests add column if not exists export_id uuid;
alter table public.custom_requests add column if not exists delivered_at timestamptz;
alter table public.custom_requests add column if not exists warning_message text;

do $$
begin
  if exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name = 'custom_requests'
       and column_name = 'name'
  ) then
    alter table public.custom_requests alter column name drop not null;
  end if;
end;
$$;

create unique index if not exists custom_requests_client_request_id_uidx
  on public.custom_requests (client_request_id)
  where client_request_id is not null;

create unique index if not exists custom_requests_public_code_uidx
  on public.custom_requests (public_code)
  where public_code is not null;

create unique index if not exists rfb_processing_jobs_one_active_per_request_uidx
  on public.rfb_processing_jobs (request_id)
  where status in ('queued', 'running');

create table if not exists public.edge_rate_limits (
  scope text not null,
  fingerprint_hash text not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  expires_at timestamptz not null,
  primary key (scope, fingerprint_hash, window_start)
);

alter table public.edge_rate_limits enable row level security;

create or replace function public.consume_edge_rate_limit(
  p_scope text,
  p_fingerprint_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  bucket_start timestamptz;
  bucket_count integer;
  retry_after integer;
begin
  if nullif(btrim(p_scope), '') is null
     or p_fingerprint_hash !~ '^[0-9a-f]{64}$'
     or p_limit < 1 or p_limit > 1000
     or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'INVALID_RATE_LIMIT_ARGUMENTS';
  end if;

  bucket_start := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  insert into public.edge_rate_limits(scope, fingerprint_hash, window_start, request_count, expires_at)
  values (btrim(p_scope), p_fingerprint_hash, bucket_start, 1, bucket_start + make_interval(secs => p_window_seconds * 2))
  on conflict (scope, fingerprint_hash, window_start)
  do update set request_count = public.edge_rate_limits.request_count + 1
  returning request_count into bucket_count;

  if random() < 0.02 then
    delete from public.edge_rate_limits where expires_at < now();
  end if;

  retry_after := greatest(1, ceil(extract(epoch from bucket_start + make_interval(secs => p_window_seconds) - clock_timestamp())))::integer;
  return jsonb_build_object(
    'allowed', bucket_count <= p_limit,
    'remaining', greatest(0, p_limit - bucket_count),
    'retry_after', retry_after
  );
end;
$$;

create or replace function public.create_public_request(
  p_request jsonb,
  p_filters jsonb,
  p_fields jsonb,
  p_event jsonb,
  p_client_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.custom_requests%rowtype;
  created public.custom_requests%rowtype;
  generated_code text;
  field_item jsonb;
begin
  if p_client_request_id is null then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_client_request_id::text, 0));
  select * into existing
    from public.custom_requests
   where client_request_id = p_client_request_id;

  if existing.id is not null then
    return jsonb_build_object(
      'id', existing.id,
      'public_code', existing.public_code,
      'status', existing.status,
      'idempotent', true
    );
  end if;

  loop
    generated_code := 'PN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from public.custom_requests where public_code = generated_code);
  end loop;

  insert into public.custom_requests(
    public_code, client_request_id, requester_name, requester_company,
    requester_email, requester_whatsapp, segment_slug, segment_label,
    product_slug, source, status, commercial_goal, priority, is_paid,
    enrichment_requested, enrichment_paid, enrichment_enabled,
    enrichment_status, created_at, updated_at
  ) values (
    generated_code, p_client_request_id, p_request->>'requester_name',
    nullif(p_request->>'requester_company', ''), nullif(p_request->>'requester_email', ''),
    p_request->>'requester_whatsapp', p_request->>'segment_slug', p_request->>'segment_label',
    p_request->>'product_slug', p_request->>'source', 'analysis',
    nullif(p_request->>'commercial_goal', ''), coalesce(nullif(p_request->>'priority', ''), 'normal'),
    false, false, false, false, 'locked', now(), now()
  ) returning * into created;

  insert into public.request_filters(
    request_id, uf, city, cities, opening_period, opening_date_start,
    opening_date_end, company_sizes, registration_status, establishment_type,
    cnae_principal, cnae_secondary, include_secondary_cnaes, exclude_mei,
    only_headquarters, desired_quantity, delivery_format
  ) values (
    created.id, nullif(p_filters->>'uf', ''), nullif(p_filters->>'city', ''),
    coalesce(p_filters->'cities', '[]'::jsonb), nullif(p_filters->>'opening_period', ''),
    nullif(p_filters->>'opening_date_start', '')::date, nullif(p_filters->>'opening_date_end', '')::date,
    coalesce(p_filters->'company_sizes', '[]'::jsonb), coalesce(nullif(p_filters->>'registration_status', ''), 'ATIVA'),
    coalesce(nullif(p_filters->>'establishment_type', ''), 'QUALQUER'),
    coalesce(p_filters->'cnae_principal', '[]'::jsonb), coalesce(p_filters->'cnae_secondary', '[]'::jsonb),
    coalesce((p_filters->>'include_secondary_cnaes')::boolean, true),
    coalesce((p_filters->>'exclude_mei')::boolean, false),
    coalesce((p_filters->>'only_headquarters')::boolean, false),
    nullif(p_filters->>'desired_quantity', '')::integer,
    coalesce(nullif(p_filters->>'delivery_format', ''), 'xlsx')
  );

  if p_fields is not null and jsonb_typeof(p_fields) = 'array' then
    for field_item in select value from jsonb_array_elements(p_fields)
    loop
      insert into public.request_fields(
        request_id, field_key, field_label, is_default, is_available, requires_validation
      ) values (
        created.id, field_item->>'field_key', coalesce(field_item->>'field_label', field_item->>'field_key'),
        coalesce((field_item->>'is_default')::boolean, true),
        coalesce((field_item->>'is_available')::boolean, true),
        coalesce((field_item->>'requires_validation')::boolean, false)
      );
    end loop;
  end if;

  insert into public.request_status_events(request_id, status, message, metadata)
  values (
    created.id, 'analysis', coalesce(nullif(p_event->>'message', ''), 'Pedido recebido e aguardando validação.'),
    coalesce(p_event->'metadata', '{}'::jsonb)
  );

  return jsonb_build_object(
    'id', created.id,
    'public_code', created.public_code,
    'status', created.status,
    'idempotent', false
  );
end;
$$;

create or replace function public.admin_transition_request(
  p_request_id uuid,
  p_action text,
  p_internal_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item public.custom_requests%rowtype;
  next_status text;
  event_message text;
  ready_export_id uuid;
begin
  select * into item from public.custom_requests where id = p_request_id for update;
  if item.id is null then raise exception 'REQUEST_NOT_FOUND'; end if;

  if p_action = 'validate' then
    if item.status = 'validated' then
      return jsonb_build_object('request', to_jsonb(item), 'idempotent', true);
    end if;
    if item.status <> 'analysis' then raise exception 'INVALID_STATE_TRANSITION'; end if;
    next_status := 'validated';
    event_message := 'Filtros validados pela equipe.';
  elsif p_action = 'mark-paid' then
    if item.product_slug = 'amostra-gratuita' then raise exception 'INVALID_STATE_TRANSITION'; end if;
    if item.status = 'paid' and item.is_paid then
      return jsonb_build_object('request', to_jsonb(item), 'idempotent', true);
    end if;
    if item.status <> 'validated' then raise exception 'REQUEST_NOT_VALIDATED'; end if;
    next_status := 'paid';
    event_message := 'Pagamento confirmado pela equipe.';
  elsif p_action = 'mark-delivered' then
    if item.status = 'delivered' then
      return jsonb_build_object('request', to_jsonb(item), 'idempotent', true);
    end if;
    if item.status <> 'ready_for_delivery' then raise exception 'EXPORT_NOT_READY'; end if;
    select id into ready_export_id
      from public.exports
     where request_id = item.id and status in ('ready', 'completed', 'ready_for_delivery')
     order by created_at desc limit 1;
    if ready_export_id is null then raise exception 'EXPORT_NOT_READY'; end if;
    next_status := 'delivered';
    event_message := 'Entrega confirmada pela equipe.';
  elsif p_action = 'offer-enrichment' then
    if item.status not in ('validated', 'paid', 'queued', 'running', 'ready_for_delivery', 'delivered') then
      raise exception 'INVALID_STATE_TRANSITION';
    end if;
    update public.custom_requests
       set enrichment_requested = true, enrichment_status = 'offered',
           internal_notes = coalesce(p_internal_notes, internal_notes), updated_at = now()
     where id = item.id returning * into item;
    insert into public.request_status_events(request_id, status, message, metadata)
    values (item.id, 'enrichment_offered', 'Enriquecimento opcional disponibilizado.', jsonb_build_object('action', p_action));
    return jsonb_build_object('request', to_jsonb(item), 'idempotent', false);
  elsif p_action = 'mark-enrichment-paid' then
    if not item.enrichment_requested then raise exception 'INVALID_STATE_TRANSITION'; end if;
    update public.custom_requests
       set enrichment_paid = true, enrichment_enabled = true, enrichment_status = 'paid',
           internal_notes = coalesce(p_internal_notes, internal_notes), updated_at = now()
     where id = item.id returning * into item;
    insert into public.request_status_events(request_id, status, message, metadata)
    values (item.id, 'enrichment_paid', 'Enriquecimento opcional liberado.', jsonb_build_object('action', p_action));
    return jsonb_build_object('request', to_jsonb(item), 'idempotent', false);
  else
    raise exception 'INVALID_STATE_TRANSITION';
  end if;

  update public.custom_requests
     set status = next_status,
         is_paid = case when p_action = 'mark-paid' then true else is_paid end,
         paid_at = case when p_action = 'mark-paid' then coalesce(paid_at, now()) else paid_at end,
         delivered_at = case when p_action = 'mark-delivered' then coalesce(delivered_at, now()) else delivered_at end,
         export_id = case when p_action = 'mark-delivered' then coalesce(export_id, ready_export_id) else export_id end,
         internal_notes = coalesce(p_internal_notes, internal_notes), updated_at = now()
   where id = item.id returning * into item;

  insert into public.request_status_events(request_id, status, message, metadata)
  values (item.id, next_status, event_message, jsonb_build_object('action', p_action));
  return jsonb_build_object('request', to_jsonb(item), 'idempotent', false);
end;
$$;

create or replace function public.create_rfb_job_for_request(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item public.custom_requests%rowtype;
  active_job public.rfb_processing_jobs%rowtype;
  created_job public.rfb_processing_jobs%rowtype;
  filter_row jsonb;
begin
  select * into item from public.custom_requests where id = p_request_id for update;
  if item.id is null then raise exception 'REQUEST_NOT_FOUND'; end if;

  select * into active_job
    from public.rfb_processing_jobs
   where request_id = item.id and status in ('queued', 'running')
   order by created_at desc limit 1;
  if active_job.id is not null then
    return jsonb_build_object('job', to_jsonb(active_job), 'idempotent', true);
  end if;

  if item.product_slug = 'amostra-gratuita' then
    if item.status <> 'validated' then raise exception 'REQUEST_NOT_VALIDATED'; end if;
  else
    if item.status not in ('validated', 'paid') then raise exception 'REQUEST_NOT_VALIDATED'; end if;
    if not item.is_paid then raise exception 'PAYMENT_REQUIRED'; end if;
  end if;

  select coalesce(to_jsonb(filters) - 'id' - 'request_id' - 'created_at', '{}'::jsonb)
    into filter_row from public.request_filters filters where request_id = item.id limit 1;

  insert into public.rfb_processing_jobs(request_id, status, progress, filters_snapshot)
  values (item.id, 'queued', 0, coalesce(filter_row, '{}'::jsonb))
  returning * into created_job;

  update public.custom_requests
     set status = 'queued', job_id = created_job.id, updated_at = now()
   where id = item.id;
  insert into public.request_status_events(request_id, status, message, metadata)
  values (item.id, 'queued', 'Processamento adicionado à fila.', jsonb_build_object('jobId', created_job.id));
  return jsonb_build_object('job', to_jsonb(created_job), 'idempotent', false);
end;
$$;

revoke all on table public.edge_rate_limits from anon, authenticated;
revoke all on function public.consume_edge_rate_limit(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.create_public_request(jsonb, jsonb, jsonb, jsonb, uuid) from public, anon, authenticated;
revoke all on function public.admin_transition_request(uuid, text, text) from public, anon, authenticated;
revoke all on function public.create_rfb_job_for_request(uuid) from public, anon, authenticated;
grant execute on function public.consume_edge_rate_limit(text, text, integer, integer) to service_role;
grant execute on function public.create_public_request(jsonb, jsonb, jsonb, jsonb, uuid) to service_role;
grant execute on function public.admin_transition_request(uuid, text, text) to service_role;
grant execute on function public.create_rfb_job_for_request(uuid) to service_role;
