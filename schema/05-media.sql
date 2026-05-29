-- Media

create table public.media (
  id             uuid primary key default gen_random_uuid(),
  franchise_id   uuid references public.franchises(id) on delete set null,
  anilist_id     integer unique,
  media_type     public.media_type not null,
  title_th       text,
  title_en       text,
  title_romaji   text,
  synopsis       text,
  poster_url     text,
  genres         text[] not null default '{}',
  total_episodes integer not null default 1,
  season_quarter integer check (season_quarter between 1 and 4),
  season_year    integer,
  air_date_start date,
  air_date_end   date,
  airing_status  public.airing_status not null default 'upcoming',
  auto_sync      boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint at_least_one_title check (
    title_th is not null or title_en is not null or title_romaji is not null
  )
);

create trigger media_updated_at
  before update on public.media
  for each row execute function public.update_updated_at();
