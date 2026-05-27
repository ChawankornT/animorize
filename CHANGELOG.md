# ANIMORIZE — CHANGELOG.md

> บันทึกทุกการเปลี่ยนแปลงสำคัญ เรียงจากใหม่ไปเก่า
> อัปเดทโดย Claude Code ทุกครั้งที่มีการเปลี่ยนแปลง decisions, architecture, หรือ scope

---

## [2026-05-27] Phase 2 Part 0 — Schema Migration

### Schema Restructure
- ย้ายจาก `schema.sql` ไฟล์เดียว → `schema/` folder (14 files: 00-extensions ถึง 12-indexes + README)
- `01-enums.sql` ใช้ DO/EXCEPTION pattern — idempotent, safe บน existing Phase 1 DB
- `11-rls.sql` เพิ่ม `is_admin()` helper (STABLE + SECURITY DEFINER + SET search_path = '')
- `12-indexes.sql` ใช้ CREATE INDEX IF NOT EXISTS
- CLAUDE.md: อัปเดท reference จาก @schema.sql → @schema/

### Types
- `types/database.ts` — เพิ่ม 8 tables ใหม่ (franchises, providers, media, media_providers, user_media, watchlogs, sync_logs, system_settings)
- เพิ่ม 5 enum types: MediaType, WatchStatus, AiringStatus, AudioType, SyncResult
- เพิ่ม Enums section ใน Database interface

---

## [2026-05-24] Initial Setup

### Architecture

- ตัดสินใจใช้ Clean Architecture (แทน 3-Layer)
- เพิ่ม domain/entities/, domain/usecases/, repositories/interfaces/, repositories/supabase/

### Tech Stack

- เปลี่ยน package manager จาก pnpm เป็น npm
- เพิ่ม Husky + lint-staged สำหรับ git hooks
- Logging strategy: console.error MVP → Pino/Sentry ภายหลัง
- Error strategy: Next.js built-in error.tsx + loading.tsx ทุก route group

### Files Created

- CLAUDE.md (สำหรับ Claude Code)
- DECISIONS.md (อัปเดท)
- PROJECT_INSTRUCTIONS.md (อัปเดท)
- PROGRESS.md (sync ระหว่าง Chat/Code)
- CLAUDE.local.md (personal, gitignore)
- .claude/rules/ (5 files: admin, domain, repositories, actions, testing)
- .claude/skills/ (6 skills: new-feature, anilist-import, fix-tests, review, commit, sync-progress)
