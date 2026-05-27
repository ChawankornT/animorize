-- Watchlogs (Phase 4)
-- immutable — ไม่มี UPDATE/DELETE policy โดยเจตนา

create table public.watchlogs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  media_id       uuid not null references public.media(id) on delete cascade,
  episode_number integer not null,
  watched_at     timestamptz not null default now()
);
