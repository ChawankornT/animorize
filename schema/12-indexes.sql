-- Performance Indexes

create index if not exists idx_media_franchise   on public.media(franchise_id);
create index if not exists idx_media_anilist     on public.media(anilist_id);
create index if not exists idx_media_type        on public.media(media_type);
create index if not exists idx_media_airing      on public.media(airing_status);
create index if not exists idx_user_media_user   on public.user_media(user_id);
create index if not exists idx_user_media_status on public.user_media(user_id, status);
create index if not exists idx_watchlogs_user    on public.watchlogs(user_id);
create index if not exists idx_watchlogs_media   on public.watchlogs(user_id, media_id);
create index if not exists idx_sync_logs_media   on public.sync_logs(media_id);
