-- System Settings (singleton)

create table public.system_settings (
  id                integer primary key default 1 check (id = 1),
  auto_sync_enabled boolean not null default true,
  updated_at        timestamptz not null default now()
);

insert into public.system_settings (id, auto_sync_enabled)
values (1, true)
on conflict (id) do nothing;

create trigger system_settings_updated_at
  before update on public.system_settings
  for each row execute function public.update_updated_at();
