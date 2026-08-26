# ANIMORIZE — PROGRESS.md

> ไฟล์นี้เป็น single source of truth ระหว่าง Chat และ Code
> อัปเดทโดย Claude Code ท้ายทุก session (skill: /sync-progress)
> อัปโหลดไฟล์นี้ใน Chat ทุกครั้งที่เริ่ม conversation ใหม่

---

## Versions (สำหรับ sync check)

```
instructions_version: 2026-08-25-v1
decisions_version: 2026-08-27-v1
schema_version: 2026-06-18-v1
claude_md_version: 2026-08-27-v1
brand_version: 2026-08-27-v1
```

## Current Phase

- **Completed:** Phase 3 — User Library & Dashboard ✅ (released to `main` via PR #19, 2026-06-03)
- **Completed:** Phase 4 — Progress Tracking + Watchlog ✅ (released to `main` via PR #28, 2026-08-24)
- **In progress:** Phase 5 — UX Polish — **P0 ✅** (PR #29, 2026-08-26) → **P1 ✅** (`Popover` + `Modal` gap-fill + shared `ToastPortal` + doc sync, PR #30 merged to `develop`, 2026-08-27); full spec = 16 decisions in `DECISIONS.md` §P5; next up: P2 (Edit progress + `⋯ More` menu) and P3 (Filter/Sort/Search) — both unblocked, either can start

## Phase 5 Progress

> Planning session 2026-08-25 → **DECISIONS.md §P5 1.1–1.16** (16 decisions). `develop` recreated from `main` 2026-08-26 (clean history, content was already identical — no code change).

| Part | ขอบเขต                                                                                                                                                                                                 | สถานะ                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| P0   | Pre-phase docs                                                                                                                                                                                         | ✅ done (PR #29, `dd0f903`)                                                         |
| P1   | DS chore — `Popover` component ใหม่ · `Modal` → native `<dialog>` (rescoped — verify/gap-fill only, not full conversion) · shared `ToastPortal` (ยุบ 3 duplicate) + BRAND/DECISIONS/CLAUDE.md doc-sync | ✅ done (PR #30, merge commit `0f120c8`, 2026-08-27)                                |
| P2   | Edit progress + `⋯ More` menu + Back button                                                                                                                                                            | ready — no blockers (design addendum ✅ delivered 2026-08-27, `Popover` ✅ shipped) |
| P3   | Filter / Sort / Library search (design พร้อมใน bundle แล้ว)                                                                                                                                            | ready — no blockers (`Popover` ✅ shipped)                                          |
| P4   | Admin เก็บตก — MediaCard admin shortcut · media list search · mapper → `coverImage.extraLarge` (forward-only, ไม่แตะ sync path)                                                                        | —                                                                                   |
| P5   | loading / error / empty audit + retry · `sanitizeSearchTerm` escape แทน strip                                                                                                                          | —                                                                                   |
| P6   | Dark mode (cookie + SSR)                                                                                                                                                                               | —                                                                                   |
| P7a  | Wide-screen scaling                                                                                                                                                                                    | —                                                                                   |
| P8   | a11y WCAG 2.1 AA (ยกเว้น 1.4.10 Reflow)                                                                                                                                                                | —                                                                                   |
| P9   | Motion wrapper — page transition, card enter, list stagger, `prefers-reduced-motion`                                                                                                                   | —                                                                                   |

จบ P9 → **release PR `develop → main`** (single release, §P5 1.12)

**Design addendum for P2 — ✅ delivered (2026-08-27)** — re-synced bundle via `claude_design` MCP (project id `33a82807-b0b0-42a2-bb95-2c53feda3033`), new section **"6 · Phase 5 — More menu + Edit progress"** in `screens/app.jsx`, 20 artboards covering both `⋯ More` states (enabled / 2 disabled-reason variants / in-context) and all 5 Edit-progress states (default/focused/warning/error/saving) × light+dark. `ds/components.jsx` `PopoverMenu` now has the disabled-item + fixed 16px icon-slot CSS baked in; `screens/screens.jsx` `Tracker` has the real `moreMenuItems(reason)` + `edit`-prop wiring. Ask doc: `docs/Promp/phase5-p2.design-addendum-prompt.md`.

**P3 ไม่ต้องรอ design** — `library-screens.jsx#FilterPopoverDemo` / `#SortPopoverDemo` + `PopoverMenu` + `.popover*` CSS + `SearchInput` มีครบใน bundle แล้ว (verified 2026-08-25)

**Guardrail:** P2/P3 ต้องเขียน UI ใหม่ให้ได้ a11y baseline (keyboard + aria + focus) ตั้งแต่แรก — P8 = audit ทั้ง codebase ไม่ใช่ retrofit ของที่เพิ่งสร้างเอง

## Phase 4 Progress

> **Phase 4 ✅ released to `main` — PR #28 (merge commit `099dd1e`, 2026-08-24).** All parts below merged to `develop` first (PR #24, #25, #26, #27), then released together.

### Part 1 — Backend (merged to develop — PR #24 ✅)

- [x] Schema migration: `rewatch_count` column (`schema/13`) + `increment_episode` RPC (`schema/14`) + canonical `07` updated
- [x] `types/database.ts` regenerated (via `supabase gen types`) — `rewatch_count`, `increment_episode` function, `watch_status` enum
- [x] `types/enums.ts` — centralized enum exports (entity imports refactored)
- [x] `lib/supabase/types.ts` — `Functions` type changed for `.rpc()` type inference
- [x] `WatchLog` entity + `IWatchLogRepository` (read-only) + `SupabaseWatchLogRepository` + factory
- [x] `IUserMediaRepository` extended: `findWithMediaByUserAndMedia`, `incrementEpisode`, `startRewatch`, `unmarkWatched`
- [x] `SupabaseUserMediaRepository` implements all 4 new methods + mappers (`toWatchLog`, `rewatchCount`)
- [x] 4 usecases: `IncrementEpisode`, `StartRewatch`, `UnmarkWatched`, `GetLibraryItem` — JSDoc + unit tests
- [x] 3 server actions: `incrementEpisodeAction`, `startRewatchAction`, `unmarkWatchedAction` — `getAuthedUser()` + reason codes
- [x] `UserMediaActionResult.reason` extended with `"stale"` for CAS no-op
- [x] `incrementEpisodeAction` stale branch revalidates before return (§P4 1.1 "ปล่อย revalidate sync เงียบ")
- [x] 14 new tests (136 → 140 after stale-path hardening) — lint ✅ typecheck ✅
- [x] `schema/README.md` updated — prose 00→14 + "Existing Phase 3 DB" section
- [x] `.gitignore` — added `supabase/.temp/`
- [x] `PROJECT_INSTRUCTIONS.md` — Phase 4 business rules updated

### Part 1 — Verification findings

- **Stale path hardened** ✅ — `incrementEpisode` repo guard เปลี่ยนเป็น `data == null || data.id == null` (ปิด all-null composite gotcha by construction → Task B runtime probe ไม่จำเป็นแล้ว); `startRewatchAction` ย้าย `revalidatePath` ก่อน stale return (ตรงกับ `incrementEpisodeAction`); 4 repo unit tests lock guard
- **Docker Supabase ใช้ได้แล้ว** — `supabase gen types --local` ใช้ได้แทน `--project-id` remote

### Part 2a — Detail page (read-only) (merged to develop — PR #26 ✅)

- [x] `app/(main)/media/[id]/page.tsx` — Server Component, data composition (getLibraryItem gate → getMedia + listMediaProviders + watchLogs parallel)
- [x] `app/(main)/media/[id]/loading.tsx` + `error.tsx` — skeleton + error boundary
- [x] `components/media/MediaDetailView.tsx` — Server Component: breadcrumb, poster, tracking summary (read-only), titles×3, meta badges, synopsis, provider table (read-only "Switch to"), watch history
- [x] `lib/utils/formatTimestamp.ts` — relative/absolute timestamp formatter + 6 unit tests
- [x] `MediaCard.Library` — overlay link (`href` prop) → `/media/${mediaId}`, z-2 above poster text, below fav button (z-3); no nested `<button>` in `<a>`
- [x] `LibraryView` — passes `href` to renderCard
- [x] `generateMetadata` — dynamic page title
- [x] 146 tests (140 + 6 formatTimestamp) — lint ✅ typecheck ✅

### Part 2b — Interactive tracker (merged to develop — PR #27 ✅)

- [x] Design bundle synced 2026-08-24 — 8 files to `.design-bundle/screens/` (screens, styles, data, app, modal, library-screens, library-data, tracker-states)
- [x] Design-vs-implementation adjustments — all 5 gaps resolved (see Notes for Chat)
- [x] `domain/entities/UserMedia.ts` — `computeStatusAfterIncrement` helper (client-side mirror of RPC completion guard) + 4 unit tests
- [x] `hooks/useEpisodeTracker.ts` — `useOptimistic` + `useTransition` + CAS increment + stale-silent pattern (router.refresh, no toast)
- [x] `components/media/EpisodeTracker.tsx` — `MovieTracker` (mark/unmark/watch again) + `SeriesTracker` (5-state precedence: interrupted→completed→mid-way→caught-up→all watched)
- [x] Rewatch confirm dialog (Modal with copy variants for series vs movie)
- [x] `MediaDetailView.tsx` — replaced read-only tracking summary with interactive `<EpisodeTracker>`; moved FavoriteButton below; cleaned DetailPoster dead props; fixed WatchHistory movie subtext
- [x] `FavoriteButton.tsx` — added `variant?: "icon" | "inline"` prop; `EpisodeTracker` renders `variant="inline"` as last child of tracker card (gap #1 resolved per owner — favorite follows design instead of as-built circle)
- [x] 150 tests (146 + 4 computeStatusAfterIncrement) — lint ✅ typecheck ✅

## Phase 3 Progress

### Foundation (merged to develop — PR #14 ✅)

- [x] RLS ยืนยัน — `user_media` `for all` (4 ops), `watchlogs` SELECT+INSERT only (immutable) — อยู่ใน `11-rls.sql` แล้ว, ไม่ต้อง apply เพิ่ม
- [x] `UserMedia` entity + `UserMediaWithMedia` + `AddToLibraryInput` + 3 business-rule functions — `src/domain/entities/UserMedia.ts`
- [x] `IUserMediaRepository` interface — `src/repositories/interfaces/IUserMediaRepository.ts`
- [x] `SupabaseUserMediaRepository` (server.ts client, nested JOIN) + mappers + factory — `src/repositories/supabase/SupabaseUserMediaRepository.ts`
- [x] 4 usecases: `AddToLibrary`, `SetFavorite` (renamed from ToggleFavorite — idempotent setter), `RemoveFromLibrary`, `ListUserLibrary` — `src/domain/usecases/`
- [x] mock harness ขยาย (`makeUserMedia`, `makeUserMediaWithMedia`, `createMockUserMediaRepository`) — `src/__tests__/utils/mockRepositories.ts`
- [x] 98 tests ผ่าน (38 เพิ่มใน session นี้) — `npm run lint` + `npm run typecheck` + `npm test` ผ่านทั้งหมด

### Features — Part 2a (merged to develop — PR #16 ✅)

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

### Features — Part 2b (merged to develop — PR #17 ✅)

- [x] `sanitizeSearchTerm` shared helper — `lib/supabase/sanitizeSearchTerm.ts` (strip ILIKE wildcards + PostgREST structural chars, preserve Thai/Unicode)
- [x] `IMediaRepository.findAll({ search? })` + `listMedia` usecase search option — `SupabaseMediaRepository` `.or()` across 3 title columns
- [x] Backport franchise search sanitize — `SupabaseFranchiseRepository.findAll` ใช้ shared helper เดียวกัน
- [x] `UpdateLibraryProvider` thin usecase — `domain/usecases/UpdateLibraryProvider.ts`
- [x] Server Actions append — `searchMediaAction`, `getAddToLibraryDataAction` (combined parallel), `addToLibraryAction`, `changeLibraryProviderAction` ใน `app/actions/userMedia.ts`
- [x] `QueryProvider` (scoped) — `components/providers/QueryProvider.tsx` + `(main)/search/layout.tsx`
- [x] Search page — `(main)/search/page.tsx` (server shell + cross-ref library Set) + `SearchView.tsx` (TanStack Query autocomplete, debounce 300ms)
- [x] Add-to-library modal — `AddToLibraryModal.tsx` (single-action parallel fetch, all providers dropdown, audio segmented sub/dub, custom URL validation, dup toast)
- [x] `MediaCard.Search` — "In library" state (check icon) when `onAdd` is undefined (ไม่แสดงปุ่ม Add ที่คลิกไม่ได้)
- [x] `(main)/search/loading.tsx` + `error.tsx`
- [x] 111 tests ผ่าน — lint ✅ typecheck ✅
- [x] DECISIONS.md updated — TanStack Query adoption + Package Change Log
- [x] Tailwind v4 canonical class cleanup (arbitrary → canonical ทั้ง project)
- [x] `.claude/rules/ui.md` — design bundle storage convention (`.design-bundle/` at root)

### Features — Part 2c (merged to develop — PR #18 ✅)

- [x] `components/ui/Tabs.tsx` — DS component, tablist + count badges, optional `onChange` (server/client compatible)
- [x] `components/ui/Empty.tsx` — DS component, icon + title + body + action slot
- [x] `constants/userMedia.ts` — added `STATUS_PRIORITY` (watching=0 → dropped=4)
- [x] `lib/utils/librarySort.ts` — composite sort: status priority → favorite tie-break → recency DESC
- [x] `app/(main)/dashboard/page.tsx` — Server Component, `listUserLibrary('all')` + counts → LibraryView | DashboardEmpty
- [x] `components/media/LibraryView.tsx` — `'use client'`, 3 tabs (All/Watching/Favorites), All = 3 sections (Currently watching / Favorites / All titles)
- [x] `components/media/DashboardEmpty.tsx` — empty state "Your library is empty" + "Add your first title" → `/search`
- [x] `app/(main)/dashboard/loading.tsx` + `error.tsx`
- [x] `MediaCard.tsx` — poster `quality={90}` for sharper rendering
- [x] DECISIONS.md — `/dashboard` = full library decision + composite sort spec
- [x] CLAUDE.md — Dashboard business rule reworded
- [x] `isDashboardItem` JSDoc updated (comment only, no logic change)
- [x] 5 unit tests for `librarySort` — 116 tests total, lint ✅ typecheck ✅ build ✅

### Post-2c commits (on develop ✅)

- [x] Prettier 3.8 setup — `.prettierrc.json` (double quotes, trailing commas, 100 char width), `eslint-config-prettier`, lint-staged integration, `npm run format` / `format:check` scripts, formatted entire codebase
- [x] Header — admin nav link with `internal` badge (query `profiles.role`), renamed "Dashboard" → "Library"
- [x] DECISIONS.md — Phase 5 roadmap items (admin card shortcut, media search, extraLarge poster, filter/sort, motion); Phase 6 (admin pagination)

### Code review fixes (on develop ✅)

- [x] `AddToLibraryModal` — hardcoded toast `"Already in your library."` for all errors → uses `result.message` (curated by action)
- [x] `AddToLibraryModal` — no `.catch()` on data fetch → `try/catch/finally` with error toast + `setLoading(false)`
- [x] `AddToLibraryModal` — no Escape key / focus trap → added `onKeyDown` Escape handler + `role="dialog"` + `aria-modal`
- [x] `sanitizeSearchTerm` → empty string returned full catalog → repos now return `[]` when sanitized to empty; search `.limit(50)` added
- [x] `search/page.tsx` — full JOIN for media IDs → new `findMediaIdsByUserId()` (flat `SELECT media_id`)
- [x] `Header.tsx` — profiles query no error handling → added `error` check
- [x] `SupabaseUserMediaRepository` — `as any` cast → exported `UserMediaRowWithJoin` type, cast to specific type
- [x] `SupabaseUserMediaRepository.remove()` — silent success on 0 rows → added `.select("id")` + row count check
- [x] `FavoriteButton` — missing `typeof document` guard → added guard consistent with AddToLibraryModal
- [x] `LibraryView` — sort+filter on every render → wrapped in `useMemo`
- [x] `DuplicateLibraryEntryError` typed error class in `AddToLibrary` usecase — `instanceof` check in action replaces string-sniffing
- [x] `UserMediaActionResult` → discriminated union with `reason: "duplicate" | "unauthorized" | "invalid" | "error"`
- [x] `useToast` — added `description` field support + `clearTimeout` cleanup on unmount via `timersRef`
- [x] 116 tests pass — lint ✅ typecheck ✅

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

| วันที่     | เปลี่ยนอะไร                                                                                                                                                                                                                                                                                                                                                                                                         | เปลี่ยนในไฟล์ไหน                                                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-27 | feat(phase5): P1 DS chore — new `Popover` (roving-tabindex a11y, 7 tests) · `Modal` gap-fill (dark rule + `AddToLibraryModal` migration) · shared `ToastPortal` (3 duplicates → 1, standardized position/z-index) · `Toast.tsx` role-per-variant fix · BRAND/DECISIONS/CLAUDE.md doc sync; **merged PR #30 (`0f120c8`)** — P2/P3 unblocked                                                                          | `Popover.tsx`, `ToastPortal.tsx` (new); `Modal.tsx`, `Toast.tsx`, `AddToLibraryModal.tsx`, `FavoriteButton.tsx`, `EpisodeTracker.tsx`, `globals.css`, `dev/components/page.tsx`; `BRAND.md`, `DECISIONS.md`, `CLAUDE.md`, `PROGRESS.md` |
| 2026-08-27 | chore(phase5): re-sync design bundle via `claude_design` MCP (P2 addendum confirmed delivered — 20 new artboards) + P1 impl prompt hardened to v2 across 3 review rounds (Modal already-`<dialog>` rescope, `AddToLibraryModal` migration gap, `IconName` union doesn't exist, `Toast.tsx` `role="alert"` hardcode fix, BRAND.md/DECISIONS.md/CLAUDE.md doc-sync tasks added) — no code changes, review + prep only | `.design-bundle/**` (15 files, full re-sync), `docs/Promp/phase5-p1-ds-chore.impl-prompt.md` (edited by owner)                                                                                                                          |
| 2026-08-26 | docs(phase5): P0 pre-phase docs — §P5 decisions (16), Phase 4 as-built findings → DECISIONS, roadmap reword + Backlog (7 items), `develop` recreated from `main`; **merged PR #29 (`dd0f903`)**                                                                                                                                                                                                                     | DECISIONS.md, CLAUDE.md, PROGRESS.md, CHANGELOG.md, PROJECT_INSTRUCTIONS.md                                                                                                                                                             |
| 2026-08-24 | release: Phase 4 — Progress Tracking + Watchlog released to `main` (PR #28, merge commit `099dd1e`)                                                                                                                                                                                                                                                                                                                 | (release merge — no source changes beyond what PR #22–#27 already introduced on `develop`)                                                                                                                                              |
| 2026-08-24 | fix(phase4): Part 2b gap #1 — favorite button per design (inline variant, last child of tracker card); merged to develop (PR #27)                                                                                                                                                                                                                                                                                   | FavoriteButton.tsx (`variant` prop), EpisodeTracker.tsx (`isFavorite` prop + inline fav), MediaDetailView.tsx (removed circular fav row), PROGRESS.md                                                                                   |
| 2026-08-24 | chore: design bundle sync (8 files) + MediaDetailView watch history bordered container                                                                                                                                                                                                                                                                                                                              | .design-bundle/screens/\* (8 files), MediaDetailView.tsx (history border)                                                                                                                                                               |
| 2026-08-24 | feat(phase4): Part 2b — EpisodeTracker interactive component (computeStatusAfterIncrement, useEpisodeTracker, MovieTracker/SeriesTracker, 150 tests)                                                                                                                                                                                                                                                                | UserMedia.ts, useEpisodeTracker.ts, EpisodeTracker.tsx, MediaDetailView.tsx, UserMedia.test.ts                                                                                                                                          |

## Blockers

[ยังไม่มี]

## Notes for Chat

**Phase 4 as-built findings & implementation notes → moved to `DECISIONS.md` §P4 as-built findings / §P4 1.1–1.9** (living-spec notes cleared now that Phase 5 begins overwriting this section)

### Phase 5 — P0 ✅ done (2026-08-26)

- `develop` recreated from `main` (owner confirmed) — content was already identical, clean ref history only, no code change
- **PR #29 merged to `develop`** (squash, `dd0f903`) — docs-only (`DECISIONS.md`, `CLAUDE.md`, `PROGRESS.md`, `CHANGELOG.md`, `PROJECT_INSTRUCTIONS.md`, `docs/Promp/phase5-p0-docs.impl-prompt.md`); `feature/phase5-p0-docs` deleted (remote + local)
- ✅ **`PROJECT_INSTRUCTIONS.md` re-uploaded** เข้า Claude Chat project แล้ว (`instructions_version` → `2026-08-25-v1`)

### Phase 5 — P1 prep session (2026-08-27) — handoff to next session, no code changes

- **`claude_design` MCP server added** (project-local, `claude mcp add --transport http claude_design https://api.anthropic.com/v1/design/mcp`) + user ran `/design-login` — session restart required after adding before the server's tools loaded
- **Design bundle re-synced** — old `.design-bundle/` (2026-08-24, 8 files) deleted and replaced with a fresh 15-file pull from the Claude Design project (`33a82807-b0b0-42a2-bb95-2c53feda3033`). **P2 design addendum confirmed fully delivered**: new section "6 · Phase 5 — More menu + Edit progress" in `screens/app.jsx` (20 artboards), `PopoverMenu` (`ds/components.jsx`) has the disabled-item state + fixed 16px icon slot built in, `Tracker` (`screens/screens.jsx`) has the real `moreMenuItems(reason)` + `edit`-prop wiring matching §P5 1.15/B1. **P2 is no longer blocked on design** — only on P1 shipping `Popover`.
- **P1 impl prompt (`docs/Promp/phase5-p1-ds-chore.impl-prompt.md`) hardened to v2** across 3 review rounds (Code reviewed against live source + bundle each time, owner edited the file directly incorporating every finding — verified zero remaining factual errors on the final pass). Key corrections baked into v2, **do not re-litigate these when implementing:**
  - `Modal.tsx` is **already** native `<dialog>`-based (has been since before Phase 1) — §4 in the prompt is rescoped from "convert" to "verify + fill 2 gaps": add the dark-mode surface-lift rule if missing, and migrate `AddToLibraryModal` (which never consumed `<Modal>` — hand-rolled its own backdrop div) onto it
  - No `IconName` string-union exists anywhere in the codebase — `Icon.tsx` takes a component ref (`as: LucideIcon`), not a string key. `Popover`'s `icon` prop must use `LucideIcon`, not an invented union
  - Dark mode isn't wired yet (P6) — anything dark-mode-related in P1 can be coded/reviewed but not visually tested until then
  - The "build a provisional disabled-item visual now, finalize in P2" plan from the first prompt draft is **cancelled** — since the addendum bundle already has the final disabled-item design, P1 implements it directly, no rework pass
  - `Toast.tsx` currently hardcodes `role="alert"` for every variant — conflicts with the new `ToastPortal` a11y spec (`role="status"` for success/info, `role="alert"` only for error); must be fixed inside `Toast.tsx` itself, not layered on top at the portal
  - Popover keyboard/ARIA got a real design pass: disabled items are focusable via roving `tabindex="-1"` (not skipped — screen readers need `role="menu"` focus-mode to reach them at all) with a focus ring and `aria-describedby` to the reason; Filter/Sort's checked item gets `role="menuitemradio"` + `aria-checked` instead of the bundle's plain `role="menuitem"`
  - P1's Task 4 doc-sync scope grew: BRAND.md needs 3 fixes (§10.3/10.10 token-row correction already-scoped, §10.10 dark-mode row, §10.11 disabled-item spec) + its own version header bump; DECISIONS.md gets a new §P5 entry documenting that the bundle is a visual/token SoT only, not an a11y SoT (codebase intentionally adds ARIA the bundle doesn't have — future bundle re-imports must not strip it back out); CLAUDE.md gets one line stating the same principle
- **Next up:** implement P1 in a fresh session — prompt is final, bundle is current, no known blockers

### Phase 5 — P1 implementation ✅ (2026-08-27) — merged to develop, PR #30

- **`components/ui/Popover.tsx`** — new, render-prop trigger API (`renderTrigger`), no new dependency (no floating-ui/popper), roving-tabindex keyboard nav incl. disabled items, `menuitemradio`+`aria-checked` for `checked` items, `role="separator"` dividers, `aria-describedby` reason on disabled items. 7 unit tests (`src/__tests__/components/ui/Popover.test.tsx`, jsdom via `// @vitest-environment jsdom` docblock — no global vitest.config change) covering the full §3.6/§3.7 keyboard flow. **Not consumed anywhere yet** (P2/P3 job) — previewed in `/dev/components` (4 new rows: More enabled, More w/ disabled item, Filter align-start, Sort w/ checked items).
- **`Modal.tsx`** — confirmed already native `<dialog>` (§2b baseline correction held up under direct source read). Added stable `.modal` class + `[data-theme="dark"] .modal { background: bg-surface; border-color: border-strong }` in `globals.css` (not visually testable until P6). Did **not** add explicit `cancel`-event interception — the existing `onClose={onClose}` binds the native `close` event, which already fires correctly after Esc-driven auto-close; adding a redundant `cancel` handler was judged unnecessary after tracing the native `<dialog>` event order. Flagging this deviation from the prompt's literal §4.1 instruction here per the "report, don't silently resolve" rule — revisit if a real Esc-related bug ever surfaces.
- **`AddToLibraryModal.tsx`** migrated onto `<Modal>` — dropped the hand-rolled backdrop div + `role="dialog"`/`aria-modal`/Escape handler (native `<dialog>` supplies all three). Header/form moved into `children`, Cancel/Add buttons moved into the `actions` prop. One paper-cut fixed during migration: the title div had no explicit text color (relied on ambient default) — under Modal's `text-secondary` children wrapper it would have rendered wrong, so added `text-primary` explicitly.
- **Shared `components/ui/ToastPortal.tsx`** — new, position/z-index-only container (no ARIA — a live region here would double up with each `Toast`'s own `role`). Replaced the duplicated inline portal in `FavoriteButton.tsx`, `EpisodeTracker.tsx`, `AddToLibraryModal.tsx` (`grep -rn "createPortal" src/` now finds exactly one hit). **Real markup mismatch found across the 3 old copies, resolved by standardizing on the majority pattern** rather than silently averaging: `AddToLibraryModal`'s old portal used `bottom-right` + `z-60` (wrong token — that's `--z-popover`, not `--z-toast`) + no `aria-live`, while `FavoriteButton`/`EpisodeTracker` used `bottom-center` + `z-90` + `aria-live="polite"`. Standardized everyone on `bottom-center` + `z-90`; dropped the `aria-live` wrapper entirely per §5.1 (now redundant with `Toast.tsx`'s own `role`).
- **`Toast.tsx`** — `role="alert"` hardcode → `role={variant === "error" ? "alert" : "status"}` per §5.1 Option A.
- New React Compiler ESLint rules caught two real issues during implementation (not pre-existing): `react-hooks/refs` on `Popover`'s render-prop trigger call (false positive for this idiom — the ref is only ever attached via JSX in the consumer, never dereferenced during render; suppressed with a scoped `eslint-disable-next-line` + comment) and `react-hooks/set-state-in-effect` on an initial `ToastPortal` draft that used a `mounted` state flag — replaced with the same `typeof document !== "undefined"` inline guard the 3 original call sites already used, which is both simpler and lint-clean.
- **Found, not fixed (flagging for whoever picks up P2):** `Button.tsx` is not `forwardRef`/React-19-ref-prop-aware, so `Popover`'s `renderTrigger` demo in `/dev/components` had to use a raw `<button className={buttonVariants(...)}>` instead of `<Button ref={...}>`. P2's real `⋯ More` button in `EpisodeTracker.tsx` will hit the same wall when it swaps its `disabled`-forever `<Button>` for a working `Popover` trigger.
- Verification: `npm run lint` ✅ (0 errors, 1 pre-existing unrelated warning in `useToast.ts`) · `npx tsc --noEmit` ✅ · `npx vitest run` ✅ 157/157 (150 baseline + 7 new) · `npm run build` ✅. **Manual smoke test (keyboard/Esc/backdrop in an actual browser) done by owner** at `localhost:3000/dev/components` — no browser-automation tool was available to Claude Code this session — owner confirmed no issues found before merge.
- Doc sync done: `BRAND.md` (§3.3 `bg-surface` row corrected, §10.10 dark row added, §10.11 disabled-item/icon-slot/focus-ring bullets added, header bumped `v1.0 · May 2026` → `v1.1 · Aug 2026`) · `DECISIONS.md` new §P5 1.17 (bundle = visual/token SoT, not a11y SoT — deviation table, "do not revert" line) · `CLAUDE.md` one line in UI/Design workflow · this file's versions block.
- **PR #30 merged to `develop`** (squash, merge commit `0f120c8`) — `feature/phase5-p1-ds-chore` deleted (remote + local). Base branch verified `develop` before opening (CI `Guard — PR target branch` passed); `Build (required for main)` correctly skipped since base ≠ `main`.
- **Local/remote `develop` divergence caught and fixed post-merge**: the earlier P1-prep-session commit (`389f88a`, docs-only) had been committed to local `develop` but never pushed before branching for P1 — so GitHub's squash merge parented PR #30 onto the older remote tip instead of onto that commit. Verified via `git diff develop origin/develop` that `origin/develop` was a strict content superset (prep-session changes + full P1 diff, nothing local-only) before running `git reset --hard origin/develop` on the local branch (owner confirmed first). Lesson: push docs/prep commits to `develop` before branching a feature off them, not after.

### Phase 3 Part 2a (merged to develop — PR #16 ✅)

- **SetFavorite usecase** — `src/domain/usecases/SetFavorite.ts`: idempotent setter (`setFavorite(repo, id, isFavorite)`) แทน ToggleFavorite flip — เหมาะกับ optimistic UI ที่ส่งค่าที่ต้องการตรงๆ
- **Icon wrapper** — `components/ui/Icon.tsx`: `<Icon as={Star} size={16} />`, strokeWidth 1.5, ไม่มี color prop (ใช้ CSS `color` บน parent)
- **STATUS_LABEL** — `constants/userMedia.ts`: `Record<WatchStatus, string>` สำหรับ display label (ไม่ใช่ constants/admin.ts)
- **Sparkle** — เพิ่ม `size` prop, height = size × 1.6 (viewBox 100×160)
- **Server Actions** — `app/actions/userMedia.ts`: `toggleFavoriteAction(id, next)` + `removeFromLibraryAction(id)` — **append ต่อ** ได้ (Part 2b จะเพิ่ม `searchMediaAction` + `addToLibraryAction` ในไฟล์เดียวกัน)
- **ProviderBadge** — `components/media/ProviderBadge.tsx`: `name` + `color` props, swatch 8×8 radius-2px
- **MediaCard** — `components/media/MediaCard.tsx`:
  - `MediaCard.Library` — รับ `favoriteSlot` prop (slot สำหรับ FavoriteButton), `showStatus`, data type `LibraryCardData`
  - `MediaCard.Search` — รับ `onAdd` callback, data type `SearchCardData`
  - Export: `StatusPill`, `ProgressBar` ด้วย
- **FavoriteButton** — `components/media/FavoriteButton.tsx`: `'use client'`, `useOptimistic` + motion sparkle animation (1100ms, ease-out cubic-bezier(0.16,1,0.3,1)) + portal toast on error
- **useToast** — `hooks/useToast.ts`: self-contained toast state + auto-dismiss

### Phase 3 Foundation (on develop — PR #14 ✅)

- **UserMedia entity** — `src/domain/entities/UserMedia.ts`: types + `getEffectiveUrl`, `isDashboardItem`, `getDisplayTitle`
- **Repository** — `IUserMediaRepository` (7 methods) + `SupabaseUserMediaRepository` (nested JOIN `media.media_providers.base_url`) + factory `createUserMediaRepository(supabase)`
  - ⚠️ **baseUrl** มาจาก `media_providers.base_url` (match `provider_id + audio`) **ไม่ใช่** `providers.base_url`
  - **SupabaseUserMediaRepository ต้องรับ server.ts client เท่านั้น** (RLS)
- **usecases**: `addToLibrary` (dup→error) · `setFavorite` (idempotent) · `removeFromLibrary` · `listUserLibrary('all'|'dashboard')`
- **mock harness**: `makeUserMedia`, `makeUserMediaWithMedia`, `createMockUserMediaRepository`

### Phase 3 Part 2b (merged to develop — PR #17 ✅)

- **`sanitizeSearchTerm`** — `lib/supabase/sanitizeSearchTerm.ts`: shared helper strip ILIKE wildcards (`%_`) + PostgREST structural chars, preserve Thai/Unicode — ใช้ทั้ง media + franchise (backport)
- **`IMediaRepository.findAll({ search? })`** — `.or()` across `title_en`, `title_romaji`, `title_th`; `listMedia` usecase pass-through
- **`UpdateLibraryProvider`** — thin usecase wrap `repo.updateProvider`
- **Server Actions** (append ใน `app/actions/userMedia.ts`):
  - `searchMediaAction(query)` — read, return `Media[]` ตรงๆ
  - `getAddToLibraryDataAction(mediaId)` — **single action** ดึง allProviders + mediaProviders parallel ฝั่ง server (ลด network roundtrips)
  - `addToLibraryAction(input)` — Zod + getUser + addToLibrary; empty customUrl → undefined (ไม่ส่ง `""` เข้า `.url()`)
  - `changeLibraryProviderAction(id, input)` — ชื่อไม่ชน admin `updateProviderAction`
- **QueryProvider** — scoped ที่ `(main)/search/layout.tsx` เท่านั้น (ไม่ mount root)
- **SearchView** — TanStack Query `useQuery` + debounce 300ms + library cross-ref Set (ไม่ N+1)
- **AddToLibraryModal** — provider dropdown แสดง **ทุก provider ในระบบ** (admin-assigned = default เท่านั้น ไม่จำกัดตัวเลือก); audio แสดง sub + dub เสมอ; labels: `sub` = "original · sub", `dub` = "thai · dub"; poster image + tile color fallback
- **MediaCard.Search** — `onAdd` undefined → แสดง "In library" + check icon แทนปุ่ม Add
- **@tanstack/react-query** — `^5.100.14` install แล้วก่อนหน้า; DECISIONS.md Package Change Log updated

### Phase 3 Part 2c (merged to develop — PR #18 ✅)

- **Dashboard page** — `app/(main)/dashboard/page.tsx`: Server Component, `listUserLibrary('all')` → full library (ไม่ filter); counts pre-computed server-side
- **Decision: `/dashboard` = full library** — `'all'` ไม่ใช่ `'dashboard'` filter เพราะ items ที่เพิ่ง add = `plan_to_watch` + ไม่ fav → ไม่โผล่ที่ไหนถ้า filter; "watching OR favorite" = section highlight + sort priority เท่านั้น — ดู DECISIONS.md
- **LibraryView** — `'use client'`, 3 tabs (All/Watching/Favorites):
  - All view = 3 sections: "Currently watching" (showStatus=false) / "Favorites" (status≠watching, sparkle icon, ซ่อนเมื่อว่าง) / "All titles" (showStatus=true)
  - Favorites **tab** = ทุก favorite (รวม watching); Favorites **section** = favorite ที่ status≠watching → คนละ filter ตั้งใจ
- **Composite sort (`librarySort`)**: (1) STATUS_PRIORITY (watching=0→dropped=4) (2) favorite tie-break ภายใน status (3) `updatedAt` DESC — sort `UserMediaWithMedia[]` ก่อน map เป็น `LibraryCardData` (ไม่มี `updatedAt`)
- **`tileColorIndex`** — `item.mediaId.charCodeAt(0) % TILE_COLORS.length` (same pattern as AddToLibraryModal + admin)
- **DS components**: `Tabs` (`onChange` optional — server compatible), `Empty` (icon + title + body + action)
- **DashboardEmpty** — empty state, no AniList button, "Add your first title" → `/search`
- **Image quality** — `quality={90}` on MediaCard poster (default 75 too blurry for small AniList images)
- **Phase 5 backlog**: AniList `coverImage.extraLarge` instead of `large` for better poster resolution

### Code review fixes (session 2026-06-03)

- **`DuplicateLibraryEntryError`** — typed error class ใน `AddToLibrary.ts` usecase; action ใช้ `instanceof` check แทน `.includes()` string-sniffing
- **`UserMediaActionResult`** — discriminated union: `{ success: true; message } | { success: false; message; reason: "duplicate" | "unauthorized" | "invalid" | "error" }` — ทุก action error branch มี reason code, Phase 4 reuse ได้
- **`IUserMediaRepository.findMediaIdsByUserId()`** — flat `SELECT media_id` query; `/search` page ใช้แทน full JOIN
- **`SupabaseUserMediaRepository.remove()`** — `.select("id")` + row count check → throw ถ้า 0 rows
- **`useToast`** — เพิ่ม `description?` field + `timersRef` cleanup on unmount (clearTimeout ทุก pending timer)
- **`AddToLibraryModal`** — try/catch/finally (ไม่ใช่ .then/.catch) + Escape key + `role="dialog"` + `aria-modal` + dynamic toast description
- **`sanitizeSearchTerm`** → empty string → repos return `[]` (ไม่ใช่ full catalog); search query มี `.limit(50)` (เฉพาะ search mode ไม่กระทบ admin list)
- **`mappers.ts`** — exported `UserMediaRowWithJoin` type; repo cast `as unknown as UserMediaRowWithJoin` แทน `as any`

### Git state (สำคัญ)

- **`main`** — Phase 4 released (PR #28, merge commit `099dd1e`, 2026-08-24). Content identical to `develop` as of this release.
- **`develop`** — recreated from `main` 2026-08-26 (force-delete + recreate, owner confirmed) for clean history going into Phase 5; then Phase 5 P0 merged (PR #29, `dd0f903`), then Phase 5 P1 merged (PR #30, `0f120c8`, 2026-08-27). Tip: `0f120c8`.
- **`feature/phase5-p0-docs`** — deleted (remote + local) after PR #29 merge.
- **`feature/phase5-p1-ds-chore`** — deleted (remote + local) after PR #30 merge. Local `develop` needed a `git reset --hard origin/develop` post-merge (owner confirmed) — the prep-session commit `389f88a` had only ever existed locally, so GitHub's squash merge parented onto the older pushed tip instead of onto it. Verified zero content loss (`git diff` showed `origin/develop` = local + full P1 diff) before resetting.
- **Docker Supabase ใช้ได้แล้ว** — `supabase gen types --local` ใช้ได้
- Design bundle **re-synced 2026-08-27** via `claude_design` MCP (project id `33a82807-b0b0-42a2-bb95-2c53feda3033`) — old 2026-08-24 bundle deleted first per `.claude/rules/ui.md`; full 15-file mirror in `.design-bundle/` (gitignored). MCP server added to project-local Claude Code config (`claude mcp add --transport http claude_design https://api.anthropic.com/v1/design/mcp`) — future imports can go straight through this instead of manual download+extract.

### Prettier (session 2026-06-02)

- **Setup**: `.prettierrc.json` (double quotes, trailing commas, 100 char width, `arrowParens: "avoid"`), `eslint-config-prettier`, lint-staged runs `prettier --write` before `eslint --fix`
- **Scripts**: `npm run format` (write) / `npm run format:check` (CI-ready check)
- **Entire codebase formatted** — all `src/**/*.{ts,tsx}` consistent

### Header admin link (session 2026-06-02)

- Admin users see **"Admin"** nav link with `internal` badge → `/admin`
- Header queries `profiles.role` to determine admin status
- "Dashboard" renamed to **"Library"** to match page title
- DECISIONS.md updated — Phase 5 roadmap: admin card shortcut, media search, extraLarge poster, filter/sort, motion; Phase 6: admin pagination

### ข้อมูล Admin (Phase 2 stable)

- **Import flow**: fetchAnilistPreviewAction → saveImportAction — ห้าม auto-save
- **src/constants/admin.ts** — `MEDIA_TYPE_LABELS`, `MEDIA_STATUS_VARIANT`, `SEASON_LABELS`, `TILE_COLORS`
- **next/image host** — `s4.anilist.co` config อยู่แล้ว

### Code review findings (session 2026-06-03 — high effort, 10 findings)

Top 3 correctness findings — **fixed in `fix/pre-phase4-hardening`**:

1. ~~`AddToLibraryModal.handleSubmit` no try/catch~~ ✅ try/catch/finally + toast with description
2. ~~`FavoriteButton` startTransition no try/catch~~ ✅ try/catch + curated toast
3. ~~`AddToLibrary` TOCTOU race~~ ✅ `SupabaseError` (preserves `.code`) + `isPgUniqueViolation` helper → reason `"duplicate"`

Other findings (still open): Modal reinvents `<dialog>`, toast portal duplicated, sanitizeSearchTerm strips instead of escapes, favorites tab inline filter not memoized, ~~auth boilerplate repeated 6x~~ ✅ `getAuthedUser()` helper, redundant server/client count computation, sort has no stable tiebreaker

### Misc

- Google OAuth ยังไม่ทำ — Email/Password เท่านั้น
- ⚠️ **PROJECT_INSTRUCTIONS.md เปลี่ยน** (Phase 4 business rules + Phase 7) — Chat ต้อง re-upload (instructions_version → 2026-06-18-v1)
- ⚠️ **CLAUDE.md เปลี่ยน** (Phase 4 business rules + error-handling convention) — claude_md_version → 2026-06-07-v1
- ⚠️ **DECISIONS.md เปลี่ยน** (เพิ่ม §P4 section — 9 pre-implementation decisions) — decisions_version → 2026-06-07-v1
