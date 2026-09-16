alter table public.request_filters add column if not exists city_ibge_code text;
alter table public.request_filters add column if not exists city_ibge_codes jsonb default '[]'::jsonb;

alter table public.rfb_processing_jobs add column if not exists delivery_mode text not null default 'local';

alter table public.custom_requests add column if not exists delivered_at timestamptz;

create index if not exists request_filters_city_ibge_code_idx
on public.request_filters(city_ibge_code)
where city_ibge_code is not null;
