-- Enums
-- ใช้ DO/EXCEPTION pattern เพื่อ idempotency (ไม่ error ถ้า type มีอยู่แล้ว)

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.media_type AS ENUM ('anime', 'series', 'movie', 'ova', 'special');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.watch_status AS ENUM ('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.airing_status AS ENUM ('ongoing', 'finished', 'upcoming');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.audio_type AS ENUM ('sub', 'dub');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.sync_result AS ENUM ('success', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
