create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  email text,
  whatsapp text,
  source text,
  status text not null default 'new',
  consent boolean not null default false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  notes text
);

create table if not exists public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  email text,
  whatsapp text,
  niche text,
  city text,
  state text,
  cnae text,
  opening_date_start date,
  opening_date_end date,
  company_size text,
  registration_status text,
  requested_quantity integer,
  commercial_goal text,
  requested_fields text[],
  notes text,
  status text not null default 'new'
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
alter table public.custom_requests add column if not exists internal_notes text;
alter table public.custom_requests add column if not exists updated_at timestamptz not null default now();
alter table public.custom_requests add column if not exists delivered_at timestamptz;
alter table public.custom_requests add column if not exists commercial_goal text;
alter table public.custom_requests add column if not exists job_id uuid;
alter table public.custom_requests add column if not exists export_id uuid;
alter table public.custom_requests add column if not exists warning_message text;

create unique index if not exists custom_requests_public_code_uidx
on public.custom_requests(public_code)
where public_code is not null;

create table if not exists public.request_filters (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.custom_requests(id) on delete cascade,
  uf text,
  city text,
  cities jsonb default '[]'::jsonb,
  city_ibge_code text,
  city_ibge_codes jsonb default '[]'::jsonb,
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
  claimed_at timestamptz,
  next_retry_at timestamptz,
  max_attempts integer not null default 3,
  run_id uuid,
  priority integer not null default 100,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  delivery_mode text not null default 'local'
);

alter table public.rfb_processing_jobs add column if not exists filters_snapshot jsonb not null default '{}'::jsonb;
alter table public.rfb_processing_jobs add column if not exists search_provider text not null default 'minha_receita';
alter table public.rfb_processing_jobs add column if not exists search_stats jsonb not null default '{}'::jsonb;
alter table public.rfb_processing_jobs add column if not exists rows_matched integer not null default 0;
alter table public.rfb_processing_jobs add column if not exists rows_exported integer not null default 0;
alter table public.rfb_processing_jobs add column if not exists heartbeat_at timestamptz;
alter table public.rfb_processing_jobs add column if not exists lease_expires_at timestamptz;
alter table public.rfb_processing_jobs add column if not exists cancel_requested_at timestamptz;
alter table public.rfb_processing_jobs add column if not exists filter_hash text;
alter table public.rfb_processing_jobs add column if not exists provider_error_code text;
alter table public.rfb_processing_jobs add column if not exists warning_message text;

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

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_slug text not null,
  customer_name text,
  customer_email text,
  customer_whatsapp text,
  amount numeric(12,2) not null,
  currency text not null default 'BRL',
  payment_provider text not null,
  provider_payment_id text,
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_type text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  email text not null,
  whatsapp text,
  subject text not null,
  message text not null,
  status text not null default 'new',
  consent boolean not null default true
);

create table if not exists public.sample_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  email text not null,
  whatsapp text,
  niche text,
  city text,
  status text not null default 'new',
  consent boolean not null default true,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid references public.orders(id),
  provider text not null,
  provider_payment_id text,
  idempotency_key text,
  status text not null default 'pending',
  raw_payload jsonb not null default '{}'::jsonb
);

alter table public.payments add column if not exists request_id uuid references public.custom_requests(id) on delete cascade;
alter table public.payments add column if not exists product_slug text;
alter table public.payments add column if not exists amount_cents integer not null default 0;
alter table public.payments add column if not exists currency text not null default 'BRL';
alter table public.payments add column if not exists paid_at timestamptz;

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid references public.orders(id),
  status text not null default 'pending',
  snapshot_date date,
  filters jsonb not null default '{}'::jsonb,
  fields text[] not null default '{}',
  file_url text,
  expires_at timestamptz
);

alter table public.exports add column if not exists request_id uuid references public.custom_requests(id) on delete cascade;
alter table public.exports add column if not exists job_id uuid references public.rfb_processing_jobs(id);
alter table public.exports add column if not exists row_count integer default 0;
alter table public.exports add column if not exists file_name text;
alter table public.exports add column if not exists file_format text default 'xlsx';
alter table public.exports add column if not exists storage_provider text default 'local';
alter table public.exports add column if not exists storage_bucket text;
alter table public.exports add column if not exists storage_path text;
alter table public.exports add column if not exists signed_url text;
alter table public.exports add column if not exists signed_url_expires_at timestamptz;
alter table public.exports add column if not exists filters_snapshot jsonb not null default '{}'::jsonb;
alter table public.exports add column if not exists fields_snapshot jsonb not null default '[]'::jsonb;
alter table public.exports add column if not exists generated_by text default 'rfb_worker';
alter table public.exports add column if not exists run_id uuid;

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
  checksum_sha256 text,
  created_at timestamptz not null default now()
);

create table if not exists public.export_downloads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  export_id uuid references public.exports(id),
  ip_hash text,
  user_agent text
);

alter table public.export_downloads add column if not exists request_id uuid references public.custom_requests(id) on delete cascade;
alter table public.export_downloads add column if not exists downloaded_by uuid;

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  subject_email text,
  subject_whatsapp text,
  source text not null,
  consent_text text not null,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.suppression_list (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  normalized_identifier text not null,
  reason text not null,
  status text not null default 'active'
);

alter table public.suppression_list add column if not exists suppression_type text;
alter table public.suppression_list add column if not exists suppression_value text;
alter table public.suppression_list add column if not exists is_active boolean not null default true;

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id),
  created_at timestamptz not null default now(),
  role text not null check (role in ('admin', 'editor', 'operador', 'leitura'))
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'ProspectaNicho',
  site_url text not null,
  support_email text,
  whatsapp_number text,
  preview_banner_enabled boolean not null default true,
  preview_banner_text text,
  default_seo_title text,
  default_seo_description text,
  default_og_image text,
  analytics_enabled boolean not null default false,
  maintenance_mode boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  destination text not null,
  sort_order integer not null default 0,
  is_visible_desktop boolean not null default true,
  is_visible_mobile boolean not null default true,
  cta_type text not null default 'internal',
  icon text,
  is_external boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  template text not null,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.content_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.content_pages(id) on delete cascade,
  section_key text not null,
  section_type text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  settings_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.content_sections(id) on delete cascade,
  field_key text not null,
  field_type text not null,
  value_json jsonb not null default 'null'::jsonb,
  draft_value_json jsonb,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  badge text,
  price numeric(12,2),
  price_label text,
  description text,
  recommended_for text,
  fields text[] not null default '{}',
  delivery_time text,
  delivery_format text,
  cta_label text,
  checkout_url text,
  fallback_whatsapp text,
  status text not null default 'draft' check (status in ('rascunho', 'ativo', 'pausado', 'arquivado', 'draft')),
  sort_order integer not null default 0,
  featured boolean not null default false,
  image_url text,
  icon text,
  seo_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.product_features (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0
);

create table if not exists public.product_price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  previous_price numeric(12,2),
  new_price numeric(12,2) not null,
  promotional_price numeric(12,2),
  starts_at timestamptz,
  ends_at timestamptz,
  internal_reason text not null,
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'active', 'expired', 'cancelled')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.segment_presets (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  preset_json jsonb not null default '{}'::jsonb,
  cta_label text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  image_url text,
  seo_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  schema_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.cta_definitions (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  destination text not null,
  kind text not null check (kind in ('internal', 'checkout', 'whatsapp', 'anchor', 'form', 'external')),
  whatsapp_message text,
  visual_variant text not null default 'primary',
  size text not null default 'default',
  icon text,
  is_visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_entries (
  id uuid primary key default gen_random_uuid(),
  route_path text unique not null,
  title text,
  meta_description text,
  canonical text,
  og_image text,
  robots text,
  schema_json jsonb not null default '{}'::jsonb,
  noindex boolean not null default false,
  nofollow boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  alt text,
  kind text not null,
  width integer,
  height integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  snapshot_json jsonb not null,
  action text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.content_publications (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  revision_id uuid references public.content_revisions(id),
  route_paths text[] not null default '{}',
  status text not null default 'published',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.preview_links (
  id uuid primary key default gen_random_uuid(),
  token_hash text unique not null,
  page_slug text not null,
  revision_id uuid references public.content_revisions(id),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

insert into storage.buckets (id, name, public)
values
  ('brand-assets', 'brand-assets', true),
  ('site-media', 'site-media', true),
  ('product-media', 'product-media', true),
  ('preview-assets', 'preview-assets', false)
on conflict (id) do nothing;

alter table public.leads enable row level security;
alter table public.custom_requests enable row level security;
alter table public.request_filters enable row level security;
alter table public.request_fields enable row level security;
alter table public.request_status_events enable row level security;
alter table public.rfb_processing_jobs enable row level security;
alter table public.rfb_job_logs enable row level security;
alter table public.orders enable row level security;
alter table public.audit_logs enable row level security;
alter table public.contact_requests enable row level security;
alter table public.sample_requests enable row level security;
alter table public.payments enable row level security;
alter table public.exports enable row level security;
alter table public.export_files enable row level security;
alter table public.export_downloads enable row level security;
alter table public.consents enable row level security;
alter table public.suppression_list enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.navigation_items enable row level security;
alter table public.content_pages enable row level security;
alter table public.content_sections enable row level security;
alter table public.content_entries enable row level security;
alter table public.products enable row level security;
alter table public.product_features enable row level security;
alter table public.product_price_history enable row level security;
alter table public.segment_presets enable row level security;
alter table public.faq_items enable row level security;
alter table public.cta_definitions enable row level security;
alter table public.seo_entries enable row level security;
alter table public.media_assets enable row level security;
alter table public.content_revisions enable row level security;
alter table public.content_publications enable row level security;
alter table public.preview_links enable row level security;

create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.admin_profiles where id = auth.uid()
$$;

create or replace function public.is_admin_role(allowed text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() = any(allowed), false) or auth.role() = 'service_role'
$$;

create policy "service role manages leads" on public.leads for all using (auth.role() = 'service_role');
create policy "service role manages custom requests" on public.custom_requests for all using (auth.role() = 'service_role');
create policy "service role manages request filters" on public.request_filters for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages request fields" on public.request_fields for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages request status events" on public.request_status_events for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages rfb processing jobs" on public.rfb_processing_jobs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages rfb job logs" on public.rfb_job_logs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages orders" on public.orders for all using (auth.role() = 'service_role');
create policy "service role manages audit logs" on public.audit_logs for all using (auth.role() = 'service_role');
create policy "service role manages contact requests" on public.contact_requests for all using (auth.role() = 'service_role');
create policy "service role manages sample requests" on public.sample_requests for all using (auth.role() = 'service_role');
create policy "service role manages payments" on public.payments for all using (auth.role() = 'service_role');
create policy "service role manages exports" on public.exports for all using (auth.role() = 'service_role');
create policy "service role manages export files" on public.export_files for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages export downloads" on public.export_downloads for all using (auth.role() = 'service_role');
create policy "service role manages consents" on public.consents for all using (auth.role() = 'service_role');
create policy "service role manages suppression list" on public.suppression_list for all using (auth.role() = 'service_role');
create policy "admins read admin profiles" on public.admin_profiles for select using (auth.uid() = id or auth.role() = 'service_role');
create policy "admins manage admin profiles" on public.admin_profiles for all using (public.is_admin_role(array['admin']));

create policy "admins manage site settings" on public.site_settings for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage navigation items" on public.navigation_items for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage content pages" on public.content_pages for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage content sections" on public.content_sections for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage content entries" on public.content_entries for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage products" on public.products for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage product features" on public.product_features for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage product price history" on public.product_price_history for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage segment presets" on public.segment_presets for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage faq items" on public.faq_items for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage cta definitions" on public.cta_definitions for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage seo entries" on public.seo_entries for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage media assets" on public.media_assets for all using (public.is_admin_role(array['admin', 'editor']));
create policy "admins read content revisions" on public.content_revisions for select using (public.is_admin_role(array['admin', 'editor', 'leitura']));
create policy "admins write content revisions" on public.content_revisions for insert with check (public.is_admin_role(array['admin', 'editor']));
create policy "admins read content publications" on public.content_publications for select using (public.is_admin_role(array['admin', 'editor', 'leitura']));
create policy "admins write content publications" on public.content_publications for insert with check (public.is_admin_role(array['admin', 'editor']));
create policy "admins manage preview links" on public.preview_links for all using (public.is_admin_role(array['admin', 'editor']));

create policy "public reads public brand assets" on storage.objects
  for select using (bucket_id in ('brand-assets', 'site-media', 'product-media'));
create policy "admins manage site storage assets" on storage.objects
  for all using (bucket_id in ('brand-assets', 'site-media', 'product-media', 'preview-assets') and public.is_admin_role(array['admin', 'editor']));

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

alter table public.crm_requests enable row level security;
alter table public.cnpj_jobs enable row level security;
alter table public.crm_exports enable row level security;
alter table public.segment_mappings enable row level security;
alter table public.concessionarias enable row level security;
alter table public.enrichment_runs enable row level security;

create policy "service role manages crm requests" on public.crm_requests for all using (auth.role() = 'service_role');
create policy "service role manages cnpj jobs" on public.cnpj_jobs for all using (auth.role() = 'service_role');
create policy "service role manages crm exports" on public.crm_exports for all using (auth.role() = 'service_role');
create policy "service role manages segment mappings" on public.segment_mappings for all using (auth.role() = 'service_role');
create policy "service role manages concessionarias" on public.concessionarias for all using (auth.role() = 'service_role');
create policy "service role manages enrichment runs" on public.enrichment_runs for all using (auth.role() = 'service_role');

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
           run_id = null,
           claimed_at = null,
           heartbeat_at = null,
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
           run_id = null,
           claimed_at = null,
           heartbeat_at = null,
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
