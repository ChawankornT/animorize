-- Animorize — Phase 1 schema (profiles + auth)
-- Run in Supabase SQL Editor

-- Enum: user roles
create type public.user_role as enum ('user', 'admin');

-- Profiles table
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  role         public.user_role not null default 'user',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- RLS
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Prevent users from changing their own role
create policy "Users cannot update role"
  on public.profiles as restrictive for update
  using (true)
  with check (role = (select role from public.profiles where id = auth.uid()));

-- pg_cron keep-alive (prevents free tier pause after 7 days inactive)
-- Requires pg_cron extension enabled in Supabase dashboard
-- select cron.schedule('keep-alive', '0 0 */3 * *', 'select 1');
