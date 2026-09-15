create table if not exists public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  request_id uuid,
  source text,
  name text not null,
  company text,
  email text,
  whatsapp text,
  status text not null default 'new',
  consent boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  public_code text unique not null,
  requester_name text not null,
  requester_whatsapp text not null,
  requester_email text,
  requester_company text,
  segment_slug text,
  segment_label text,
  product_slug text,
  source text,
  status text not null default 'novo',
  priority text not null default 'normal',
  is_paid boolean not null default false,
  paid_at timestamptz,
  enrichment_requested boolean not null default false,
  enrichment_paid boolean not null default false,
  enrichment_enabled boolean not null default false,
  enrichment_status text not null default 'locked',
  notes text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.custom_requests add column if not exists public_code text;
alter table public.custom_requests add column if not exists requester_name text;
alter table public.custom_requests add column if not exists requester_whatsapp text;
alter table public.custom_requests add column if not exists requester_email text;
alter table public.custom_requests add column if not exists requester_company text;
alter table public.custom_requests add column if not exists segment_slug text;
alter table public.custom_requests add column if not exists segment_label text;
alter table public.custom_requests add column if not exists product_slug text;
alter table public.custom_requests add column if not exists source text;
alter table public.custom_requests add column if not exists priority text not null default 'normal';
alter table public.custom_requests add column if not exists is_paid boolean not null default false;
alter table public.custom_requests add column if not exists paid_at timestamptz;
alter table public.custom_requests add column if not exists enrichment_requested boolean not null default false;
alter table public.custom_requests add column if not exists enrichment_paid boolean not null default false;
alter table public.custom_requests add column if not exists enrichment_enabled boolean not null default false;
alter table public.custom_requests add column if not exists enrichment_status text not null default 'locked';
alter table public.custom_requests add column if not exists notes text;
alter table public.custom_requests add column if not exists internal_notes text;
alter table public.custom_requests add column if not exists updated_at timestamptz not null default now();

update public.custom_requests
set
  public_code = coalesce(public_code, 'PN-' || upper(substr(md5(id::text), 1, 10))),
  requester_name = coalesce(requester_name, name, ''),
  requester_whatsapp = coalesce(requester_whatsapp, whatsapp, ''),
  requester_email = coalesce(requester_email, email),
  requester_company = coalesce(requester_company, company),
  segment_label = coalesce(segment_label, niche),
  updated_at = coalesce(updated_at, created_at, now());

alter table public.custom_requests alter column public_code set not null;
alter table public.custom_requests alter column requester_name set not null;
alter table public.custom_requests alter column requester_whatsapp set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'custom_requests_public_code_key'
  ) then
    alter table public.custom_requests add constraint custom_requests_public_code_key unique (public_code);
  end if;
end $$;

create unique index if not exists custom_requests_public_code_uidx
on public.custom_requests(public_code)
where public_code is not null;

create table if not exists public.request_filters (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.custom_requests(id) on delete cascade,
  uf text,
  city text,
  cities jsonb default '[]'::jsonb,
  utility_id uuid,
  opening_period text,
  opening_date_start date,
  opening_date_end date,
  company_sizes jsonb default '[]'::jsonb,
  registration_status text default 'ATIVA',
  establishment_type text default 'qualquer',
  min_capital numeric,
  max_capital numeric,
  cnae_principal jsonb default '[]'::jsonb,
  cnae_secondary jsonb default '[]'::jsonb,
  include_secondary_cnaes boolean default true,
  exclude_mei boolean default true,
  only_headquarters boolean default false,
  desired_quantity integer,
  delivery_format text default 'xlsx',
  created_at timestamptz not null default now()
);

create table if not exists public.request_fields (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.custom_requests(id) on delete cascade,
  field_key text not null,
  field_label text not null,
  is_default boolean not null default true,
  is_available boolean not null default true,
  requires_validation boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.request_status_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.custom_requests(id) on delete cascade,
  status text not null,
  message text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rfb_snapshots (
  id uuid primary key default gen_random_uuid(),
  base_dir text,
  status text not null default 'waiting_data',
  files_manifest jsonb not null default '{}'::jsonb,
  generated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.rfb_processing_jobs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.custom_requests(id) on delete cascade,
  job_type text not null default 'rfb_export',
  status text not null default 'queued',
  progress integer not null default 0,
  current_step text,
  error_message text,
  worker_id text,
  attempts integer not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rfb_job_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.rfb_processing_jobs(id) on delete cascade,
  request_id uuid references public.custom_requests(id) on delete cascade,
  level text not null default 'info',
  step text,
  message text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.custom_requests(id) on delete cascade,
  job_id uuid references public.rfb_processing_jobs(id),
  status text not null default 'pending',
  row_count integer default 0,
  file_name text,
  file_format text default 'xlsx',
  storage_provider text default 'local',
  storage_bucket text,
  storage_path text,
  signed_url text,
  signed_url_expires_at timestamptz,
  filters_snapshot jsonb not null default '{}'::jsonb,
  fields_snapshot jsonb not null default '[]'::jsonb,
  generated_by text default 'rfb_worker',
  created_at timestamptz not null default now()
);

create table if not exists public.export_files (
  id uuid primary key default gen_random_uuid(),
  export_id uuid references public.exports(id) on delete cascade,
  request_id uuid references public.custom_requests(id) on delete cascade,
  file_name text not null,
  file_format text not null,
  storage_provider text not null default 'local',
  storage_bucket text,
  storage_path text,
  byte_size bigint,
  checksum text,
  created_at timestamptz not null default now()
);

create table if not exists public.export_downloads (
  id uuid primary key default gen_random_uuid(),
  export_id uuid references public.exports(id) on delete cascade,
  request_id uuid references public.custom_requests(id) on delete cascade,
  downloaded_by uuid,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price_cents integer not null default 0,
  currency text not null default 'BRL',
  product_type text not null,
  is_active boolean not null default true,
  requires_manual_validation boolean not null default true,
  includes_enrichment boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.custom_requests(id) on delete cascade,
  product_slug text,
  provider text,
  provider_payment_id text,
  status text not null default 'pending',
  amount_cents integer not null default 0,
  currency text not null default 'BRL',
  paid_at timestamptz,
  raw_payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.segment_cnae_mappings (
  id uuid primary key default gen_random_uuid(),
  segment_slug text not null,
  segment_label text not null,
  cnae_code text not null,
  cnae_label text not null,
  match_type text not null default 'ambos',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.utilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  uf text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.utility_cities (
  id uuid primary key default gen_random_uuid(),
  utility_id uuid references public.utilities(id) on delete cascade,
  city_name text not null,
  uf text not null,
  ibge_code text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.suppression_list (
  id uuid primary key default gen_random_uuid(),
  suppression_type text not null,
  suppression_value text not null,
  reason text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value jsonb not null default '{}'::jsonb,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.crm_leads enable row level security;
alter table public.custom_requests enable row level security;
alter table public.request_filters enable row level security;
alter table public.request_fields enable row level security;
alter table public.request_status_events enable row level security;
alter table public.rfb_snapshots enable row level security;
alter table public.rfb_processing_jobs enable row level security;
alter table public.rfb_job_logs enable row level security;
alter table public.exports enable row level security;
alter table public.export_files enable row level security;
alter table public.export_downloads enable row level security;
alter table public.products enable row level security;
alter table public.payments enable row level security;
alter table public.segment_cnae_mappings enable row level security;
alter table public.utilities enable row level security;
alter table public.utility_cities enable row level security;
alter table public.suppression_list enable row level security;
alter table public.system_settings enable row level security;

create policy "service role manages profiles" on public.profiles for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages crm leads" on public.crm_leads for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages custom requests" on public.custom_requests for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages request filters" on public.request_filters for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages request fields" on public.request_fields for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages request status events" on public.request_status_events for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages rfb snapshots" on public.rfb_snapshots for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages rfb processing jobs" on public.rfb_processing_jobs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages rfb job logs" on public.rfb_job_logs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages exports" on public.exports for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages export files" on public.export_files for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages export downloads" on public.export_downloads for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages products" on public.products for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages payments" on public.payments for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages segment cnae mappings" on public.segment_cnae_mappings for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages utilities" on public.utilities for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages utility cities" on public.utility_cities for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages suppression list" on public.suppression_list for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages system settings" on public.system_settings for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
