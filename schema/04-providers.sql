-- Providers

create table public.providers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  color      text not null,
  logo_url   text,
  base_url   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger providers_updated_at
  before update on public.providers
  for each row execute function public.update_updated_at();
