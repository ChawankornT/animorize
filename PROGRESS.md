# ANIMORIZE — PROGRESS.md
> ไฟล์นี้เป็น single source of truth ระหว่าง Chat และ Code
> อัปเดทโดย Claude Code ท้ายทุก session (skill: /sync-progress)
> อัปโหลดไฟล์นี้ใน Chat ทุกครั้งที่เริ่ม conversation ใหม่

---

## Versions (สำหรับ sync check)
```
instructions_version: 2026-05-30-v2
decisions_version: 2026-05-30-v4
schema_version: 2026-05-27-v2
claude_md_version: 2026-05-30-v5
```

## Current Phase
- **Active:** Phase 3 — User Library & Dashboard
- **Status:** Pre-Phase 3 foundation merged to main (PR #10 → #11) — พร้อมเริ่ม Phase 3 Foundation

## Phase 2 Progress
- [x] Phase 2 schema migration — schema/ folder (13 SQL files) + types/database.ts updated
- [x] Domain entities + usecases — Provider, Franchise, Media, SyncLog, SystemSettings
- [x] Repository interfaces + Supabase implementations + factory
- [x] Provider CRUD UI (ชื่อ, สี, logo, URL) — Server Actions + Admin pages + components
- [x] Franchise CRUD UI — Server Actions + Admin pages (list/new/edit) + FranchiseForm + FranchiseDeleteButton
- [x] Media CRUD UI (manual)
- [x] AniList import by ID + preview before save
- [x] Media Provider assignment (media → provider + audio + base_url)
- [x] Sync log viewer + retry button
- [x] system_settings: auto-sync toggle

## Phase 1 Progress
- [x] Supabase project setup (dev) — สร้างแล้ว + apply schema + .env.local พร้อม
- [x] Schema (profiles + auth) — applied ใน Supabase SQL Editor แล้ว
- [x] pg_cron keep-alive — schedule 'keep-alive' ทุก 3 วัน applied แล้วใน Supabase
- [x] Supabase Auth: Email/Password — actions + login/signup pages done (Google OAuth ทีหลัง)
- [x] Auto-create profile trigger — ใน schema/02-profiles.sql
- [x] Header (logged out / logged in) — Wordmark + nav + avatar/logout
- [x] Footer — wordmark + © 2026
- [x] Next.js proxy — session refresh via @supabase/ssr (renamed middleware→proxy per Next.js 16)
- [x] Protected routes — (main)/layout.tsx + admin/layout.tsx
- [x] GitHub repo + branch protection — ruleset on main, CI required before merge
- [x] GitHub Actions CI — .github/workflows/ci.yml (trigger: PR to main/develop)
- [x] Husky + lint-staged — pre-commit: eslint --fix + tsc-files --noEmit

## Design System Progress (pre-Phase 1)
- [x] CSS design tokens (tokens.css)
- [x] Tailwind v4 theme mapping (globals.css @theme inline)
- [x] Base UI components (Button, Input, Textarea, Select, Card, Badge, Modal, Toast, Skeleton)
- [x] buttonVariants() helper — styled Link ใช้ได้โดยไม่ duplicate styles
- [x] Brand components: Sparkle.tsx, Wordmark.tsx
- [x] Layout components: Header.tsx, Footer.tsx
- [x] Layout updated to Inter font + brand metadata
- [x] cn() utility (lib/utils/cn.ts)
- [x] Dev preview page (/dev/components)

## Recent Changes (last 5)
| วันที่ | เปลี่ยนอะไร | เปลี่ยนในไฟล์ไหน |
|--------|------------|----------------|
| 2026-05-30 | chore(rules): เพิ่มกฎ branch cleanup — `[gone]` vs unpushed แยกชัด; merge เข้า `develop` ห้าม `--delete-branch` | .claude/rules/git.md |
| 2026-05-30 | chore(pre-phase3): ESLint dependency rules, getDisplayTitle refactor, vitest + 60 tests, decisions + CLAUDE.md + rules update (PR #10 → #11 → main) | eslint.config.mjs, domain/entities/title.ts, Media.ts, Franchise.ts, vitest.config.ts, src/__tests__/ (7 files), DECISIONS.md, CLAUDE.md, .claude/rules/ (5 files) |
| 2026-05-30 | docs: revise roadmap Phase 3-6 + เพิ่ม Phase 7 (Discovery & Bulk Import, admin) | DECISIONS.md, PROJECT_INSTRUCTIONS.md, CHANGELOG.md, PROGRESS.md |
| 2026-05-29 | fix(admin): poster rendering + Sync now button + UI consistency (PR #6) | media/page.tsx, media/[id]/page.tsx, ImportPanel.tsx, RetrySyncButton.tsx, AssignProviderForm.tsx, DeleteConfirmModal.tsx, RemoveProviderButton.tsx, Modal.tsx |
| 2026-05-29 | fix(admin): 4 bugs (PR #5) — toSyncLog EN-first, secondary title, AniList episodes null→undefined, retrySync fetch fail log | mappers.ts, media/page.tsx, anilist/mapper.ts, RetrySync.ts, actions/anilist.ts |

## Blockers
[ยังไม่มี]

## Notes for Chat
### Foundation (on main — พร้อมใช้)
- **Pre-Phase 3 foundation merged to main** (PR #10 develop, PR #11 main) — ESLint rules, getDisplayTitle refactor, vitest + 60 tests, decisions + rules
- **ESLint dependency rules active** — `domain/` + `repositories/` มี `no-restricted-imports`; violations fail ที่ CI lint step อัตโนมัติ
- **getDisplayTitle** — single impl ที่ `domain/entities/title.ts`, re-exported จาก Media + Franchise; ห้าม inline `titleEn ?? titleRomaji ?? titleTh` ในโค้ดใหม่
- **vitest + 60 tests** — harness ที่ `src/__tests__/utils/mockRepositories.ts`; Phase 3 usecases ใช้ harness นี้ต่อได้เลย
- **DECISIONS.md มี 7 entries ใหม่** (Pre-Phase 3): client data layer (Server Actions + useOptimistic, TanStack Query defer), validation SoT, testing policy, ESLint enforcement, RLS pattern, atomic +1 RPC exception, optimistic UI pattern
- **Git rule** — merge `develop → main` ห้าม `--delete-branch` (develop = long-lived branch); `[gone]` vs unpushed แยกชัดในกฎ

### Phase 3 — สิ่งที่ต้องทำต่อ
- **Phase 3 พร้อมเริ่ม** — schema `user_media` + `watchlogs` มีแล้วใน DB; ยังไม่มี entity/repository (= งาน Phase 3 Foundation)
- **เริ่มที่ Foundation ก่อน**: UserMedia entity → IUserMediaRepository interface → SupabaseUserMediaRepository → factory → usecases (AddToLibrary, ToggleFavorite, RemoveFromLibrary, ListUserLibrary) — แล้วค่อยทำ UI
- **RLS pattern**: `user_media` + `watchlogs` ต้องใช้ `server.ts` (session client) เท่านั้น — ห้าม service-role

### ข้อมูล Admin (Phase 2 stable)
- **Import flow**: fetchAnilistPreviewAction (fetch + dup check, ไม่ save) → saveImportAction — ห้าม auto-save
- **src/constants/admin.ts** — `MEDIA_TYPE_LABELS`, `MEDIA_STATUS_VARIANT`, `SEASON_LABELS`, `TILE_COLORS`
- **MediaProvider JOIN** — `findByMediaId()` ใช้ `select('*, providers(name, color)')` → entity มี `providerName`, `providerColor`
- **next/image host** — `s4.anilist.co` config อยู่แล้ว พร้อมให้ Phase 3 MediaCard ใช้

### Misc
- Google OAuth ยังไม่ทำ — Email/Password เท่านั้น
- ⚠️ **PROJECT_INSTRUCTIONS.md เปลี่ยน** (เพิ่ม Phase 7) — Chat ต้อง re-upload (instructions_version → 2026-05-30-v2)
