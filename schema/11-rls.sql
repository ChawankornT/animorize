-- RLS Policies (Phase 2)
-- profiles Phase 1 policies มีอยู่แล้วใน 02-profiles.sql
-- ไฟล์นี้: is_admin() + policies สำหรับ tables ใหม่ + admin policy เพิ่มเติมบน profiles

-- is_admin() helper — STABLE ให้ PG cache ผลใน 1 transaction
create or replace function public.is_admin()
returns boolean
stable
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Enable RLS on all Phase 2 tables
alter table public.franchises enable row level security;
alter table public.providers enable row level security;
alter table public.media enable row level security;
alter table public.media_providers enable row level security;
alter table public.user_media enable row level security;
alter table public.watchlogs enable row level security;
alter table public.sync_logs enable row level security;
alter table public.system_settings enable row level security;

-- profiles: เพิ่ม admin policy (Phase 1 policies มีอยู่แล้ว ไม่ recreate)
drop policy if exists "Admin can view all profiles" on public.profiles;
create policy "Admin can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- franchises
drop policy if exists "Authenticated can view franchises" on public.franchises;
create policy "Authenticated can view franchises"
  on public.franchises for select
  using (auth.uid() is not null);

drop policy if exists "Admin can manage franchises" on public.franchises;
create policy "Admin can manage franchises"
  on public.franchises for all
  using (public.is_admin())
  with check (public.is_admin());

-- providers
drop policy if exists "Authenticated can view providers" on public.providers;
create policy "Authenticated can view providers"
  on public.providers for select
  using (auth.uid() is not null);

drop policy if exists "Admin can manage providers" on public.providers;
create policy "Admin can manage providers"
  on public.providers for all
  using (public.is_admin())
  with check (public.is_admin());

-- media
drop policy if exists "Authenticated can view media" on public.media;
create policy "Authenticated can view media"
  on public.media for select
  using (auth.uid() is not null);

drop policy if exists "Admin can manage media" on public.media;
create policy "Admin can manage media"
  on public.media for all
  using (public.is_admin())
  with check (public.is_admin());

-- media_providers
drop policy if exists "Authenticated can view media providers" on public.media_providers;
create policy "Authenticated can view media providers"
  on public.media_providers for select
  using (auth.uid() is not null);

drop policy if exists "Admin can manage media providers" on public.media_providers;
create policy "Admin can manage media providers"
  on public.media_providers for all
  using (public.is_admin())
  with check (public.is_admin());

-- user_media
drop policy if exists "Users can manage own media" on public.user_media;
create policy "Users can manage own media"
  on public.user_media for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- watchlogs (immutable — SELECT + INSERT only)
drop policy if exists "Users can view own watchlogs" on public.watchlogs;
create policy "Users can view own watchlogs"
  on public.watchlogs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own watchlogs" on public.watchlogs;
create policy "Users can insert own watchlogs"
  on public.watchlogs for insert
  with check (auth.uid() = user_id);

-- sync_logs
drop policy if exists "Admin can view sync logs" on public.sync_logs;
create policy "Admin can view sync logs"
  on public.sync_logs for select
  using (public.is_admin());

drop policy if exists "Admin can insert sync logs" on public.sync_logs;
create policy "Admin can insert sync logs"
  on public.sync_logs for insert
  with check (public.is_admin());

-- system_settings
drop policy if exists "Admin can view system settings" on public.system_settings;
create policy "Admin can view system settings"
  on public.system_settings for select
  using (public.is_admin());

drop policy if exists "Admin can update system settings" on public.system_settings;
create policy "Admin can update system settings"
  on public.system_settings for update
  using (public.is_admin())
  with check (public.is_admin());
