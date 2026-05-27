-- Media Providers (junction table)

create table public.media_providers (
  id          uuid primary key default gen_random_uuid(),
  media_id    uuid not null references public.media(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  audio       public.audio_type not null default 'sub',
  base_url    text,
  created_at  timestamptz not null default now(),

  unique (media_id, provider_id, audio)
);
