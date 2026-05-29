-- User Media (Phase 3)
-- NOTE: provider_id ไม่ enforce FK กับ media_providers — validated at application layer

create table public.user_media (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  media_id        uuid not null references public.media(id) on delete cascade,
  provider_id     uuid references public.providers(id) on delete set null,
  audio           public.audio_type not null default 'sub',
  status          public.watch_status not null default 'plan_to_watch',
  current_episode integer not null default 0,
  is_favorite     boolean not null default false,
  custom_url      text,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (user_id, media_id)
);

create trigger user_media_updated_at
  before update on public.user_media
  for each row execute function public.update_updated_at();
