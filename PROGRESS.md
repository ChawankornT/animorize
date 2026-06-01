# ANIMORIZE — PROGRESS.md

> ไฟล์นี้เป็น single source of truth ระหว่าง Chat และ Code
> อัปเดทโดย Claude Code ท้ายทุก session (skill: /sync-progress)
> อัปโหลดไฟล์นี้ใน Chat ทุกครั้งที่เริ่ม conversation ใหม่

---

## Versions (สำหรับ sync check)

```
instructions_version: 2026-05-30-v2
decisions_version: 2026-05-31-v2
schema_version: 2026-05-27-v2
claude_md_version: 2026-05-31-v1
```

## Current Phase

- **Active:** Phase 3 — User Library & Dashboard
- **Status:** Foundation merged to develop (PR #14) — พร้อมเริ่ม Phase 3 Features

## Phase 3 Progress

### Foundation (merged to develop — PR #14 ✅)

- [x] RLS ยืนยัน — `user_media` `for all` (4 ops), `watchlogs` SELECT+INSERT only (immutable) — อยู่ใน `11-rls.sql` แล้ว, ไม่ต้อง apply เพิ่ม
- [x] `UserMedia` entity + `UserMediaWithMedia` + `AddToLibraryInput` + 3 business-rule functions — `src/domain/entities/UserMedia.ts`
- [x] `IUserMediaRepository` interface — `src/repositories/interfaces/IUserMediaRepository.ts`
- [x] `SupabaseUserMediaRepository` (server.ts client, nested JOIN) + mappers + factory — `src/repositories/supabase/SupabaseUserMediaRepository.ts`
- [x] 4 usecases: `AddToLibrary`, `SetFavorite` (renamed from ToggleFavorite — idempotent setter), `RemoveFromLibrary`, `ListUserLibrary` — `src/domain/usecases/`
- [x] mock harness ขยาย (`makeUserMedia`, `makeUserMediaWithMedia`, `createMockUserMediaRepository`) — `src/__tests__/utils/mockRepositories.ts`
- [x] 98 tests ผ่าน (38 เพิ่มใน session นี้) — `npm run lint` + `npm run typecheck` + `npm test` ผ่านทั้งหมด

### Features — Part 2a (in PR — feat/phase3-card-favorite)

- [x] `SetFavorite` usecase + test (idempotent, replaces ToggleFavorite flip) — `src/domain/usecases/SetFavorite.ts`
- [x] `components/ui/Icon.tsx` — lucide-react wrapper, strokeWidth 1.5
- [x] `constants/userMedia.ts` — `STATUS_LABEL` (WatchStatus → display string)
- [x] `components/brand/Sparkle.tsx` — added `size` prop (ratio 1.6:1 from viewBox)
- [x] `app/actions/userMedia.ts` — `toggleFavoriteAction` + `removeFromLibraryAction`
- [x] `components/media/ProviderBadge.tsx` — swatch 8×8 + plain text, no fill
- [x] `components/media/MediaCard.tsx` — Library variant (fav slot, status pill, progress bar, ep count) + Search variant (Add button)
- [x] `components/media/FavoriteButton.tsx` — useOptimistic + motion sparkle animation + portal toast on error
- [x] `/dev/components` — MediaCard (6 library states + 3 search) + ProviderBadge + StatusPill previews
- [x] 98 tests ผ่าน — lint ✅ typecheck ✅

### Features — Part 2b / 2c (ยังไม่เริ่ม)

- [ ] Search — match ข้าม title_th / title_en / title_romaji + autocomplete
- [ ] เพิ่ม media เข้า library จาก search result + เลือก Provider + audio + custom URL
- [ ] Dashboard: status='watching' OR is_favorite=true (wire FavoriteButton + MediaCard.Library)

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

| วันที่     | เปลี่ยนอะไร                                                                                                                                      | เปลี่ยนในไฟล์ไหน                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-01 | feat(phase3): Part 2a — MediaCard (2 variants) + FavoriteButton (optimistic) + SetFavorite usecase + actions + Icon/ProviderBadge/StatusPill      | components/media/ (4 files), components/ui/Icon.tsx, constants/userMedia.ts, domain/usecases/SetFavorite.ts, app/actions/userMedia.ts, hooks/useToast.ts |
| 2026-05-31 | docs: DECISIONS.md เพิ่ม "User-facing AniList Import — Deferred (post-Phase 7)" — ไอเดีย request queue + ต้องเคาะตอนเริ่ม                        | DECISIONS.md                                                                                                                      |
| 2026-05-31 | chore(rules): branch protection loud + UI design workflow gating (PR #15 → develop) — CI guard check-branch-target + build job สำหรับ release PR | .claude/rules/git.md, .claude/rules/ui.md (ใหม่), CLAUDE.md, DECISIONS.md, ci.yml, PULL_REQUEST_TEMPLATE.md (ใหม่)                |
| 2026-05-31 | feat(phase3): Phase 3 Foundation merged to develop (PR #14) — UserMedia entity, repo, 4 usecases, 98 tests                                       | domain/entities/UserMedia.ts, repositories/ (3 files), domain/usecases/ (4 files), src/**tests**/ (5 files), mappers.ts, index.ts |
| 2026-05-31 | docs: DECISIONS.md เพิ่ม URL resolution model 3 ชั้น + Phase 3 Foundation section                                                                | DECISIONS.md                                                                                                                      |

## Blockers

[ยังไม่มี]

## Notes for Chat

### Phase 3 Foundation (on develop — merged PR #14 ✅)

- **UserMedia entity** — `src/domain/entities/UserMedia.ts`: types + 3 business-rule functions (`getEffectiveUrl`, `isDashboardItem`, `getDisplayTitle` reuse)
- **Repository** — `IUserMediaRepository` (7 methods) + `SupabaseUserMediaRepository` (nested JOIN `media.media_providers.base_url`) + factory `createUserMediaRepository(supabase)`
  - ⚠️ **baseUrl** มาจาก `media_providers.base_url` (match `provider_id + audio`) **ไม่ใช่** `providers.base_url` — ดู DECISIONS.md § "URL Resolution Model"
  - **SupabaseUserMediaRepository ต้องรับ server.ts client เท่านั้น** (RLS) — Server Action ต้อง `createServerClient()` ก่อนส่งเข้า factory
- **4 usecases**: `addToLibrary` (dup → error), `toggleFavorite` (flip), `removeFromLibrary`, `listUserLibrary(filter: 'all'|'dashboard')`
- **mock harness**: `makeUserMedia`, `makeUserMediaWithMedia`, `createMockUserMediaRepository` ใน `mockRepositories.ts`
- **98 tests ผ่าน** (entity 17, mapper +14, usecases 13); lint + typecheck ผ่าน

### Phase 3 Features — สิ่งที่ต้องทำต่อ

- **Server Actions** สำหรับ add/favorite/remove (เรียก usecases + return `{success, message, errors?}`)
- **Search + autocomplete** (TanStack Query candidate สำหรับ dedup/stale-while-revalidate)
- **Dashboard page** — filter `listUserLibrary(userId, 'dashboard')` → `useOptimistic` สำหรับ favorite toggle
- **MediaCard** — poster (next/image `s4.anilist.co`), fallback color tile, Provider badge

### Git state (สำคัญ)

- **develop** — มี Phase 3 Foundation (PR #14) + rules update (PR #15) ✅
- **main** — ยังเป็น reverted state (PR #13 Revert) — ยังไม่ได้ merge develop → main
- ต้องเปิด PR develop → main เพื่อให้ main ตาม develop (จะ trigger build job อัตโนมัติ)

### Foundation (stable)

- **Pre-Phase 3 foundation** (PR #11 → main): ESLint dependency rules, `getDisplayTitle` shared util, vitest + 60 tests
- **ESLint rules** — `domain/` + `repositories/` `no-restricted-imports` fail ที่ CI อัตโนมัติ

### ข้อมูล Admin (Phase 2 stable)

- **Import flow**: fetchAnilistPreviewAction → saveImportAction — ห้าม auto-save
- **src/constants/admin.ts** — `MEDIA_TYPE_LABELS`, `MEDIA_STATUS_VARIANT`, `SEASON_LABELS`, `TILE_COLORS`
- **next/image host** — `s4.anilist.co` config อยู่แล้ว พร้อมให้ Phase 3 MediaCard ใช้

### Rules update (PR #15 — merged to develop ✅)

- **`.claude/rules/git.md`** — callout ⛔ ห้าม PR เข้า `main` ระหว่าง phase + build required สำหรับ release PR
- **`.claude/rules/ui.md`** (ใหม่) — บังคับ fetch Claude Design handoff bundle ก่อน implement UI; ห้ามประดิษฐ์ UI เอง
- **`ci.yml`** — `check-branch-target` job (guard) + `build` job (runs เมื่อ base=main เท่านั้น; ใช้ Supabase secrets)
- **`.github/PULL_REQUEST_TEMPLATE.md`** (ใหม่) — checklist base branch verify + build
- **`CLAUDE.md`** — เพิ่มหัวข้อ "Git & Deploy" + "UI / Design workflow" → claude_md_version bump
- **`DECISIONS.md`** — เพิ่ม 2 decisions → decisions_version bump

### Misc

- Google OAuth ยังไม่ทำ — Email/Password เท่านั้น
- ⚠️ **PROJECT_INSTRUCTIONS.md เปลี่ยน** (เพิ่ม Phase 7) — Chat ต้อง re-upload (instructions_version → 2026-05-30-v2)
- ⚠️ **CLAUDE.md เปลี่ยน** (เพิ่ม Git & Deploy + UI/Design workflow) — claude_md_version → 2026-05-31-v1
- ⚠️ **DECISIONS.md เปลี่ยน** (เพิ่ม user-facing AniList import deferred + branch protection + UI handoff gate) — decisions_version → 2026-05-31-v2
