-- Sync Logs

create table public.sync_logs (
  id            uuid primary key default gen_random_uuid(),
  media_id      uuid not null references public.media(id) on delete cascade,
  result        public.sync_result not null,
  error_message text,
  synced_at     timestamptz not null default now()
);
