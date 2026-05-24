# ANIMORIZE — CHANGELOG.md

> บันทึกทุกการเปลี่ยนแปลงสำคัญ เรียงจากใหม่ไปเก่า
> อัปเดทโดย Claude Code ทุกครั้งที่มีการเปลี่ยนแปลง decisions, architecture, หรือ scope

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
