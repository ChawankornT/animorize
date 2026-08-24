-- Phase 4: Atomic +1 episode RPC (CAS idempotent)
-- SECURITY INVOKER — RLS runs as caller (auth.uid() guard in WHERE)
-- Documented exception to domain-purity rule: atomicity > layer purity (§P4 1.1)

CREATE OR REPLACE FUNCTION public.increment_episode(
  p_user_media_id uuid,
  p_from_episode  int
)
RETURNS public.user_media
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_row public.user_media;
BEGIN
  UPDATE public.user_media AS um
  SET
    current_episode = p_from_episode + 1,
    started_at      = COALESCE(um.started_at, now()),
    status = CASE
      WHEN p_from_episode + 1 >= m.total_episodes AND m.airing_status <> 'ongoing'
        THEN 'completed'::public.watch_status
      ELSE 'watching'::public.watch_status
    END,
    completed_at = CASE
      WHEN p_from_episode + 1 >= m.total_episodes AND m.airing_status <> 'ongoing'
        THEN now()
      ELSE NULL
    END
  FROM public.media AS m
  WHERE um.id = p_user_media_id
    AND um.media_id = m.id
    AND um.user_id = auth.uid()
    AND um.current_episode = p_from_episode
    AND p_from_episode + 1 <= m.total_episodes
  RETURNING um.* INTO v_row;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.watchlogs (user_id, media_id, episode_number)
  VALUES (v_row.user_id, v_row.media_id, p_from_episode + 1);

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_episode(uuid, int) TO authenticated;
