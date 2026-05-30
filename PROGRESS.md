# ANIMORIZE — PROGRESS.md
> ไฟล์นี้เป็น single source of truth ระหว่าง Chat และ Code
> อัปเดทโดย Claude Code ท้ายทุก session (skill: /sync-progress)
> อัปโหลดไฟล์นี้ใน Chat ทุกครั้งที่เริ่ม conversation ใหม่

---

## Versions (สำหรับ sync check)
```
instructions_version: 2026-05-30-v2
decisions_version: 2026-05-31-v1
schema_version: 2026-05-27-v2
claude_md_version: 2026-05-30-v5
```

## Current Phase
- **Active:** Phase 3 — User Library & Dashboard
- **Status:** Foundation (domain + repository + usecases) done on branch `feat/user-library` — พร้อม PR เข้า develop, รอ review + CI ก่อน merge

## Phase 3 Progress

### Foundation (branch: feat/user-library — รอ PR merge)
- [x] RLS ยืนยัน — `user_media` `for all` (4 ops), `watchlogs` SELECT+INSERT only (immutable) — อยู่ใน `11-rls.sql` แล้ว, ไม่ต้อง apply เพิ่ม
- [x] `UserMedia` entity + `UserMediaWithMedia` + `AddToLibraryInput` + 3 business-rule functions — `src/domain/entities/UserMedia.ts`
- [x] `IUserMediaRepository` interface — `src/repositories/interfaces/IUserMediaRepository.ts`
- [x] `SupabaseUserMediaRepository` (server.ts client, nested JOIN) + mappers + factory — `src/repositories/supabase/SupabaseUserMediaRepository.ts`
- [x] 4 usecases: `AddToLibrary`, `ToggleFavorite`, `RemoveFromLibrary`, `ListUserLibrary` — `src/domain/usecases/`
- [x] mock harness ขยาย (`makeUserMedia`, `makeUserMediaWithMedia`, `createMockUserMediaRepository`) — `src/__tests__/utils/mockRepositories.ts`
- [x] 98 tests ผ่าน (38 เพิ่มใน session นี้) — `npm run lint` + `npm run typecheck` + `npm test` ผ่านทั้งหมด

### Features (ยังไม่เริ่ม — หลัง Foundation merge)
- [ ] Search — match ข้าม title_th / title_en / title_romaji + autocomplete
- [ ] เพิ่ม media เข้า library จาก search result + เลือก Provider + audio + custom URL
- [ ] Favorite (star) toggle + optimistic update
- [ ] Dashboard: status='watching' OR is_favorite=true
- [ ] MediaCard: poster จริง (next/image) + fallback color tile + Provider badge

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
| 2026-05-31 | feat: Phase 3 Foundation — UserMedia entity, IUserMediaRepository, SupabaseUserMediaRepository (nested JOIN), 4 usecases, mock harness ขยาย, 98 tests ผ่าน, URL resolution model documented | domain/entities/UserMedia.ts, repositories/interfaces/IUserMediaRepository.ts, repositories/supabase/SupabaseUserMediaRepository.ts, repositories/supabase/mappers.ts, repositories/index.ts, src/__tests__/ (5 files) |
| 2026-05-31 | docs: DECISIONS.md เพิ่ม URL resolution model 3 ชั้น (providers/media_providers/user_media) | DECISIONS.md |
| 2026-05-30 | chore(rules): เพิ่มกฎ branch cleanup — `[gone]` vs unpushed แยกชัด; merge เข้า `develop` ห้าม `--delete-branch` | .claude/rules/git.md |
| 2026-05-30 | chore(pre-phase3): ESLint dependency rules, getDisplayTitle refactor, vitest + 60 tests, decisions + CLAUDE.md + rules update (PR #10 → #11 → main) | eslint.config.mjs, domain/entities/title.ts, Media.ts, Franchise.ts, vitest.config.ts, src/__tests__/ (7 files), DECISIONS.md, CLAUDE.md, .claude/rules/ (5 files) |
| 2026-05-30 | docs: revise roadmap Phase 3-6 + เพิ่ม Phase 7 (Discovery & Bulk Import, admin) | DECISIONS.md, PROJECT_INSTRUCTIONS.md, CHANGELOG.md, PROGRESS.md |

## Blockers
[ยังไม่มี]

## Notes for Chat
### Phase 3 Foundation (branch: feat/user-library — รอ PR + merge)
- **Foundation สร้างครบแล้ว** บน branch `feat/user-library` — ยังไม่ merge; รอ PR เข้า develop + CI ผ่าน
- **UserMedia entity** — `src/domain/entities/UserMedia.ts`: types + 3 business-rule functions (`getEffectiveUrl`, `isDashboardItem`, `getDisplayTitle` reuse)
- **Repository** — `IUserMediaRepository` (7 methods) + `SupabaseUserMediaRepository` (nested JOIN `media.media_providers.base_url`) + factory `createUserMediaRepository(supabase)`
  - ⚠️ **baseUrl** มาจาก `media_providers.base_url` (match `provider_id + audio`) **ไม่ใช่** `providers.base_url` (หน้าแรก provider) — ดู DECISIONS.md § "URL Resolution Model"
  - **SupabaseUserMediaRepository ต้องรับ server.ts client เท่านั้น** — factory caller (Server Action) ต้องสร้าง `createServerClient()` ก่อนส่งเข้า
- **4 usecases**: `addToLibrary` (dup → error), `toggleFavorite` (flip), `removeFromLibrary`, `listUserLibrary(filter: 'all'|'dashboard')`
- **mock harness** ขยายแล้ว: `makeUserMedia`, `makeUserMediaWithMedia`, `createMockUserMediaRepository` ใน `mockRepositories.ts`
- **98 tests ผ่าน** (38 ใหม่: entity 17, mapper +14, usecases 13); lint + typecheck ผ่าน

### Phase 3 Features — สิ่งที่ต้องทำต่อ (หลัง Foundation merge)
- **Server Actions** สำหรับ add/favorite/remove (เรียก usecases + return `{success, message, errors?}`)
- **Search + autocomplete** (TanStack Query candidate สำหรับ dedup/stale-while-revalidate)
- **Dashboard page** — filter `listUserLibrary(userId, 'dashboard')` → `useOptimistic` สำหรับ favorite toggle
- **MediaCard** — poster (next/image `s4.anilist.co`), fallback color tile, Provider badge

### Foundation (on main — stable)
- **Pre-Phase 3 foundation** (PR #11 → main): ESLint dependency rules, `getDisplayTitle` shared util, vitest + 60 tests
- **ESLint rules** — `domain/` + `repositories/` `no-restricted-imports` fail ที่ CI อัตโนมัติ
- **Git rule** — merge `develop → main` ห้าม `--delete-branch`; `[gone]` vs no-tracking แยกชัด

### ข้อมูล Admin (Phase 2 stable)
- **Import flow**: fetchAnilistPreviewAction → saveImportAction — ห้าม auto-save
- **src/constants/admin.ts** — `MEDIA_TYPE_LABELS`, `MEDIA_STATUS_VARIANT`, `SEASON_LABELS`, `TILE_COLORS`
- **next/image host** — `s4.anilist.co` config อยู่แล้ว พร้อมให้ Phase 3 MediaCard ใช้

### Misc
- Google OAuth ยังไม่ทำ — Email/Password เท่านั้น
- ⚠️ **PROJECT_INSTRUCTIONS.md เปลี่ยน** (เพิ่ม Phase 7) — Chat ต้อง re-upload (instructions_version → 2026-05-30-v2)
