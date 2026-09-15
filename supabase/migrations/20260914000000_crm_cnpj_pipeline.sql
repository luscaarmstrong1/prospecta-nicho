create table if not exists public.crm_requests (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null,
  status text not null default 'analysis',
  customer_json jsonb not null default '{}'::jsonb,
  filters_json jsonb not null default '{}'::jsonb,
  commercial_goal text,
  notes text,
  payment_status text not null default 'pending',
  enrichment_paid boolean not null default false,
  enrichment_enabled boolean not null default false,
  enrichment_status text not null default 'locked',
  job_id uuid,
  export_id uuid
);

create table if not exists public.cnpj_jobs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.crm_requests(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'queued',
  worker text not null default 'rfb_cnpj',
  filters_snapshot jsonb not null default '{}'::jsonb,
  rows_matched integer not null default 0,
  rows_exported integer not null default 0,
  logs jsonb not null default '[]'::jsonb,
  error text
);

create table if not exists public.crm_exports (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.crm_requests(id) on delete cascade,
  job_id uuid references public.cnpj_jobs(id) on delete set null,
  created_at timestamptz not null default now(),
  status text not null default 'pending',
  format text not null default 'xlsx',
  fields text[] not null default array[]::text[],
  row_count integer not null default 0,
  file_url text,
  storage_provider text not null default 'supabase',
  expires_at timestamptz
);

create table if not exists public.segment_mappings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  segment text not null,
  cnaes text[] not null default array[]::text[],
  keywords text[] not null default array[]::text[],
  active boolean not null default true,
  notes text
);

create table if not exists public.concessionarias (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  uf text not null,
  cities text[] not null default array[]::text[],
  aliases text[] not null default array[]::text[],
  active boolean not null default true,
  notes text
);

create table if not exists public.enrichment_runs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.crm_requests(id) on delete cascade,
  created_at timestamptz not null default now(),
  status text not null default 'locked',
  paid_confirmed boolean not null default false,
  executed_by uuid,
  input_export_id uuid references public.crm_exports(id) on delete set null,
  output_export_id uuid references public.crm_exports(id) on delete set null,
  logs jsonb not null default '[]'::jsonb
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_type text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb
);

alter table public.crm_requests enable row level security;
alter table public.cnpj_jobs enable row level security;
alter table public.crm_exports enable row level security;
alter table public.segment_mappings enable row level security;
alter table public.concessionarias enable row level security;
alter table public.enrichment_runs enable row level security;
alter table public.audit_logs enable row level security;

create policy "service role manages crm requests"
  on public.crm_requests for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages cnpj jobs"
  on public.cnpj_jobs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages crm exports"
  on public.crm_exports for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages segment mappings"
  on public.segment_mappings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages concessionarias"
  on public.concessionarias for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages enrichment runs"
  on public.enrichment_runs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages audit logs"
  on public.audit_logs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

insert into storage.buckets (id, name, public)
values ('crm-exports', 'crm-exports', false)
on conflict (id) do update set public = false;

