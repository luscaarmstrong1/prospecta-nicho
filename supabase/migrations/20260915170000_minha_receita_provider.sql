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

alter table public.custom_requests add column if not exists commercial_goal text;
alter table public.custom_requests add column if not exists job_id uuid;
alter table public.custom_requests add column if not exists export_id uuid;
alter table public.custom_requests add column if not exists warning_message text;

alter table public.utility_cities add column if not exists ibge_code text;

create index if not exists rfb_processing_jobs_status_created_idx
on public.rfb_processing_jobs(status, created_at);

create index if not exists rfb_processing_jobs_provider_idx
on public.rfb_processing_jobs(search_provider);

create index if not exists rfb_processing_jobs_request_idx
on public.rfb_processing_jobs(request_id);

create unique index if not exists utility_cities_utility_city_uf_uidx
on public.utility_cities(utility_id, lower(city_name), upper(uf))
where utility_id is not null;

create index if not exists utility_cities_ibge_idx
on public.utility_cities(ibge_code)
where ibge_code is not null;
