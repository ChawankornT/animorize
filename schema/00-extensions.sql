-- Extensions
-- pg_cron ต้อง enable ใน Supabase Dashboard → Database → Extensions ก่อนรัน schedule

-- Keep-alive: ป้องกัน free tier pause หลัง 7 วัน inactive
-- SELECT cron.schedule('keep-alive', '0 0 */3 * *', 'SELECT 1');

-- Auto-sync placeholder (Phase 6)
-- SELECT cron.schedule('daily-sync', '0 2 * * *', 'SELECT 1');
