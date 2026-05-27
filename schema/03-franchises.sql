-- Franchises

create table public.franchises (
  id           uuid primary key default gen_random_uuid(),
  title_th     text,
  title_en     text,
  title_romaji text,
  poster_url   text,
  synopsis     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint at_least_one_title check (
    title_th is not null or title_en is not null or title_romaji is not null
  )
);

create trigger franchises_updated_at
  before update on public.franchises
  for each row execute function public.update_updated_at();
