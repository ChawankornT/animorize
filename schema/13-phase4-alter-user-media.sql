-- Phase 4: Add rewatch_count to user_media
-- Idempotent — safe to re-run on existing data

ALTER TABLE public.user_media ADD COLUMN IF NOT EXISTS rewatch_count integer NOT NULL DEFAULT 0;
