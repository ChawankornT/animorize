# Animorize — Schema Files

## File Structure

| File                           | Phase | Description                                             |
| ------------------------------ | ----- | ------------------------------------------------------- |
| 00-extensions.sql              | 1     | pg_cron setup (reference/comment เท่านั้น)              |
| 01-enums.sql                   | 1+2   | Enum types ทั้งหมด (idempotent via DO/EXCEPTION)        |
| 02-profiles.sql                | 1     | Profiles table + auth trigger + RLS                     |
| 03-franchises.sql              | 2     | Franchises table                                        |
| 04-providers.sql               | 2     | Providers table                                         |
| 05-media.sql                   | 2     | Media table                                             |
| 06-media-providers.sql         | 2     | Media ↔ Providers junction                              |
| 07-user-media.sql              | 3     | User library (สร้างไว้ก่อน ใช้จริงใน Phase 3)           |
| 08-watchlogs.sql               | 4     | Watch history (สร้างไว้ก่อน ใช้จริงใน Phase 4)          |
| 09-sync-logs.sql               | 2     | AniList sync logs                                       |
| 10-system-settings.sql         | 2     | System settings singleton (id=1 เสมอ)                   |
| 11-rls.sql                     | 2     | RLS policies + is_admin() helper                        |
| 12-indexes.sql                 | 2     | Performance indexes (idempotent via IF NOT EXISTS)      |
| 13-phase4-alter-user-media.sql | 4     | Add rewatch_count column (idempotent via IF NOT EXISTS) |
| 14-increment-episode.sql       | 4     | Atomic +1 episode RPC (CAS, SECURITY INVOKER)           |

## Running Migrations

**ลำดับสำคัญ** — FK references ต้องรันตามลำดับ 00 → 14

### Fresh DB (ไม่มี data เดิม)

รันทั้งหมด 00 → 14 ตามลำดับใน Supabase SQL Editor

### Existing Phase 3 DB (Phase 1-3 applied แล้ว)

รันเฉพาะ:

1. `13-phase4-alter-user-media.sql` — idempotent (IF NOT EXISTS)
2. `14-increment-episode.sql` — CREATE OR REPLACE + GRANT

### Existing Phase 1 DB

Phase 1 ที่ apply ไปแล้ว: `user_role` enum, `profiles` table, auth triggers, profiles RLS policies

รันเฉพาะ:

1. `01-enums.sql` — safe เพราะใช้ DO/EXCEPTION pattern (user_role ที่มีอยู่แล้วจะ skip อัตโนมัติ)
2. `03-franchises.sql` → `14-increment-episode.sql` ตามลำดับ

ข้าม:

- `00-extensions.sql` — เป็น comment เท่านั้น ไม่มี SQL จริง
- `02-profiles.sql` — มีอยู่แล้ว (CREATE TABLE จะ error ถ้ารันซ้ำ)

## Notes

- `update_updated_at()` function ถูก define ใน `02-profiles.sql` — tables 03-10 reuse function นี้
- `is_admin()` function ถูก define ใน `11-rls.sql`
- `system_settings` เป็น singleton — INSERT ... ON CONFLICT DO NOTHING ใน `10-system-settings.sql`
- Phase 1 RLS policies สำหรับ `profiles` อยู่ใน `02-profiles.sql` — `11-rls.sql` เพิ่มเฉพาะ admin policy
- `documentary` ไม่อยู่ใน `media_type` enum — เพิ่มได้ทีหลังด้วย `ALTER TYPE media_type ADD VALUE 'documentary'`
