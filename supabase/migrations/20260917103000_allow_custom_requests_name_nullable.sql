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
end $$;
