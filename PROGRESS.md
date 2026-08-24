# ANIMORIZE — PROGRESS.md

> ไฟล์นี้เป็น single source of truth ระหว่าง Chat และ Code
> อัปเดทโดย Claude Code ท้ายทุก session (skill: /sync-progress)
> อัปโหลดไฟล์นี้ใน Chat ทุกครั้งที่เริ่ม conversation ใหม่

---

## Versions (สำหรับ sync check)

```
instructions_version: 2026-06-18-v1
decisions_version: 2026-06-07-v1
schema_version: 2026-06-18-v1
claude_md_version: 2026-06-07-v1
```

## Current Phase

- **Completed:** Phase 3 — User Library & Dashboard ✅ (released to `main` via PR #19, 2026-06-03)
- **Completed:** Phase 4 — Progress Tracking + Watchlog ✅ (released to `main` via PR #28, 2026-08-24)
- **Not started:** Phase 5 — UX Polish (see roadmap in DECISIONS.md; includes "Edit progress" ⋯ More menu — closes the Phase 4 §P4 1.3 deferral and the SeriesTracker branch ⑤ dead-end)

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

| วันที่     | เปลี่ยนอะไร                                                                                                                                          | เปลี่ยนในไฟล์ไหน                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-24 | release: Phase 4 — Progress Tracking + Watchlog released to `main` (PR #28, merge commit `099dd1e`)                                                  | (release merge — no source changes beyond what PR #22–#27 already introduced on `develop`)                                                               |
| 2026-08-24 | fix(phase4): Part 2b gap #1 — favorite button per design (inline variant, last child of tracker card); merged to develop (PR #27)                    | FavoriteButton.tsx (`variant` prop), EpisodeTracker.tsx (`isFavorite` prop + inline fav), MediaDetailView.tsx (removed circular fav row), PROGRESS.md    |
| 2026-08-24 | chore: design bundle sync (8 files) + MediaDetailView watch history bordered container                                                               | .design-bundle/screens/\* (8 files), MediaDetailView.tsx (history border)                                                                                |
| 2026-08-24 | feat(phase4): Part 2b — EpisodeTracker interactive component (computeStatusAfterIncrement, useEpisodeTracker, MovieTracker/SeriesTracker, 150 tests) | UserMedia.ts, useEpisodeTracker.ts, EpisodeTracker.tsx, MediaDetailView.tsx, UserMedia.test.ts                                                           |
| 2026-06-21 | feat(phase4): Part 2a — media detail page (read-only) + card→detail link + formatTimestamp util (146 tests)                                          | MediaDetailView.tsx, media/[id] route (page+loading+error), MediaCard.tsx (overlay link), LibraryView.tsx (href), formatTimestamp.ts + test, PROGRESS.md |

## Blockers

[ยังไม่มี]

## Notes for Chat

### Phase 4 Part 2b — Interactive tracker (merged to develop — PR #27 ✅)

- **`computeStatusAfterIncrement`** — `domain/entities/UserMedia.ts`: client-side mirror of completion guard in RPC (`schema/14`). `nextEp >= total AND airing !== 'ongoing'` → completed; else → watching. Used for optimistic status in `useEpisodeTracker`.
- **`useEpisodeTracker`** — `hooks/useEpisodeTracker.ts`: `useOptimistic<TrackerState>` + `useTransition` + `useToast` + `useRouter`. Returns `{ episode, status, isPending, toasts, dismiss, incrementEpisode, markWatched, startRewatch, unmarkWatched }`. Stale CAS miss (reason="stale") → `router.refresh()` silently, no toast. Error → toast "Failed to update". Pattern adapted from `FavoriteButton`.
- **`EpisodeTracker`** — `components/media/EpisodeTracker.tsx`: delegates to `MovieTracker` or `SeriesTracker` based on `isMovie` prop. Confirm modal for rewatch/watch-again (immediate close → fire optimistic). Toast portal. `More` button always disabled (Phase 5).
- **MovieTracker** — watched = `status === "completed"` (not episode-based). Unwatched: "Mark as watched" button. Watched: "Watch again" (confirm) + "Unmark as watched" (plain text button).
- **SeriesTracker** — 5-state precedence: ① interrupted mid-way (canRewatch && canIncrement → +1 + Rewatch) → ② completed/interrupted at cap (Rewatch only) → ③ mid-way ('+1 episode' only) → ④ caught up (ongoing, ep>=total, watching → hint text) → ⑤ all episodes watched (ongoing→finished while watching, no exit — **Phase 5 dependency: "Edit progress" ⋯ More menu needed for escape**)
- **MediaDetailView changes** — replaced `{/* Part 2b: EpisodeTracker */}` slot with `<EpisodeTracker>`. FavoriteButton moved below tracker. DetailPoster: removed dead `isFavorite`/`userMediaId` props. WatchHistory: movie subtext uses dynamic count instead of hardcoded "1 watch".
- **⚠️ Phase 5 dependency**: Branch ⑤ dead-end — ongoing series → airing_status flips to finished while user is at ep cap with status='watching' → `canIncrement=false`, `canRewatch=false`, `More=disabled`. No exit until Phase 5 "Edit progress" (§P4 1.3). Sort priority puts it at dashboard top permanently. Copy shows "All episodes watched" which is honest but the state is stuck.
- **MediaDetailView.tsx**: Watch history section uses a bordered container (`border-[0.5px] border-default rounded-card`) matching design `.history-list` CSS. Empty state also wrapped in bordered container.

### Phase 4 Part 2b — Design-vs-implementation gaps (5 items — all resolved)

1. **Favorite position** — ✅ **Resolved (2026-08-24, owner: "fav เอาตาม design เลย")** — overrides prior "decision i" (ห้ามแตะ `FavoriteButton.tsx`) from the impl prompt. Added `variant?: "icon" | "inline"` to `FavoriteButton.tsx` (default `"icon"` = unchanged circular overlay for `MediaCard`/`LibraryView`; `"inline"` = full-width `Button variant="ghost"` with `Star`/`Sparkle` + "Favorite"/"Favorited" label). `EpisodeTracker` now takes `isFavorite` prop and renders `<FavoriteButton variant="inline">` as last child of the `.tracker` card (both `MovieTracker` and `SeriesTracker` branches, matching `TrackerFav` in `screens.jsx`). `MediaDetailView` no longer renders the separate circular fav row — passes `isFavorite` straight to `EpisodeTracker`. Only 2 call sites for `FavoriteButton` in the codebase (`LibraryView`, `EpisodeTracker`) — verified no other usages broke.
2. **isMovie logic** — Design: `type === "movie" || total === 1`. Implementation: `!isTrackable(media)` (only movie/special). Business rules (CLAUDE.md) support implementation — anime with 1 ep is trackable normally. **Business rules win over design — no change needed.**
3. **Watch history container** — Design: bordered card (`.history-list`). ✅ **Already applied** (this session edit to MediaDetailView.tsx).
4. **Watch history provider column** — Design: shows `ProviderPill` (3-column grid). Implementation: no provider column (2-column). **Per §P4 1.7**: "ไม่มี provider column" — **business rules win, no change.**
5. **Confirm dialog loading** — Design: shows spinner inside button during loading. Implementation: closes modal immediately with optimistic action. **Implementation is better UX** — optimistic close is faster, spinner only shows on actual errors (which toast handles).

### Phase 4 Part 2a — Detail page (merged to develop — PR #26 ✅)

- **Route** — `app/(main)/media/[id]/page.tsx`: Server Component; gate: `getLibraryItem` → null → `notFound()` (not-in-library = deferred); then `Promise.all([getMedia, listMediaProviders, watchLogs])`
- **MediaDetailView** — `components/media/MediaDetailView.tsx`: Server Component, 7 sub-sections: breadcrumb (link to `/dashboard`), detail poster (aspect-3/4, `next/image`), tracking summary (read-only — `StatusPill` + `ProgressBar` + `FavoriteButton`), titles×3 (separate fields, not `getDisplayTitle`), meta badges, synopsis, provider table (read-only "Switch to" disabled), watch history
- **Hand-off slot** — `{/* Part 2b: EpisodeTracker action buttons + interactivity */}` comment in tracking summary section
- **Provider table** — current marker matches `(providerId, audio)` not just `providerId`; "Switch to" buttons are disabled `<button>` with ghost variant (not wired)
- **Watch history** — `formatTimestamp` util (`lib/utils/formatTimestamp.ts`): relative < 7d, absolute otherwise; movie uses "Full film" label instead of "ep 1"
- **Card→detail link** — `MediaCard.Library` has `href?` prop; renders overlay `<Link>` at `z-2` (above poster text, below fav slot z-3); no `<button>` inside `<a>` — proper a11y
- **`generateMetadata`** — dynamic title using `getDisplayTitle`
- **Deferred** — not-in-library → `notFound()`, provider "Switch to" → disabled, action buttons → Part 2b

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

### Phase 4 Part 1 backend (session 2026-06-18)

- **Schema**: `schema/13-phase4-alter-user-media.sql` (rewatch_count) + `schema/14-increment-episode.sql` (CAS RPC, SECURITY INVOKER)
- **RPC contract**: `increment_episode(p_user_media_id uuid, p_from_episode int)` → returns `user_media` row on success, `NULL` on CAS miss (stale)
- **Completion guard**: `new_ep >= total AND airing_status <> 'ongoing'` — ใน RPC SQL
- **WatchLog entity** — `src/domain/entities/WatchLog.ts`: pure interface `{ id, userId, mediaId, episodeNumber, watchedAt }`
- **WatchLog repo** — read-only (`findByUserAndMedia` with limit); INSERT happens atomically inside RPC
- **IUserMediaRepository** — 4 new methods: `findWithMediaByUserAndMedia` (single item), `incrementEpisode` (RPC wrapper → `IncrementEpisodeResult`), `startRewatch` (read-modify-write with status guard), `unmarkWatched` (reset pointer)
- **`IncrementEpisodeResult`** — discriminated union: `{ status: "updated"; userMedia } | { status: "stale" }`
- **Usecases** — thin delegates: `IncrementEpisode`, `StartRewatch`, `UnmarkWatched`, `GetLibraryItem`
- **Actions** — `incrementEpisodeAction` (stale → reason "stale", revalidate always), `startRewatchAction` (null → reason "stale"), `unmarkWatchedAction`
- **`UserMediaActionResult.reason`** — extended with `"stale"` (CAS no-op, ไม่ใช่ error → client ไม่ toast)
- **`types/enums.ts`** — centralized enum exports; entity imports refactored (Media, MediaProvider, SyncLog)
- **`lib/supabase/types.ts`** — `Functions` type changed from `Record<string, never>` to `Database["public"]["Functions"]` for `.rpc()` type inference
- **Mock harness** — `makeWatchLog`, `createMockWatchLogRepository`, extended `createMockUserMediaRepository` with 4+1 new methods
- ~~Stale path unverified~~ ✅ **Stale path hardened** — `data == null || data.id == null` guard ปิด all-null composite by construction; `startRewatchAction` revalidate ย้ายก่อน stale return; 4 repo unit tests lock guard (fix/phase4-stale-path-hardening)

### Phase 4 pre-implementation (2026-06-07)

- **Pre-Phase 4 decisions locked** — ดู DECISIONS.md §P4 (9 sub-decisions)
- **Phase 4 scope**: +1 CAS RPC (`increment_episode` — SECURITY INVOKER, atomic) + Rewatch (confirm → reset pointer, rewatch_count+1) + per-media watch history (5 entries) + movie/special toggle Watched (mark=RPC, unmark=reset pointer)
- **Completion guard revised**: `new_ep >= total AND airing_status <> 'ongoing'` (แทนกฎเดิม `current=total → completed` — กัน false-complete ของ ongoing + ครอบ movie/special ที่ default upcoming)
- **Schema addition**: `user_media.rewatch_count integer NOT NULL DEFAULT 0` — migration manual + regenerate types
- **−1 / correction deferred** → Phase 5 "Edit progress" (⋯ More menu)
- **Design addendum pending**: Rewatch UI ยังไม่มีใน design bundle → ต้องขอ design ก่อนทำ UI; backend เริ่มก่อนได้
- **Error-handling convention**: imperative client mutation → try/catch + toast เสมอ; TanStack queryFn → throw ไม่ swallow
- **Fix round backlog** — ~~handleSubmit try/catch, FavoriteButton try/catch, AddToLibrary TOCTOU race~~ แก้แล้วใน `fix/pre-phase4-hardening` (ดู "Pre-Phase 4 fix round" section)
- ~~PROJECT_INSTRUCTIONS.md ต้องอัปเดต~~ ✅ อัปเดตแล้ว session 2026-06-18 — CAS business rule + dashboard cross-ref แก้แล้ว (instructions_version → 2026-06-18-v1)

### Pre-Phase 4 fix round (on `fix/pre-phase4-hardening`)

- **`FavoriteButton.handleToggle`** — try/catch inside `startTransition`; catch → curated toast "Failed to update favorite" (optimistic revert = React auto)
- **`AddToLibraryModal.handleSubmit`** — try/catch/finally; catch → toast title "Couldn't add to library" + description "Something went wrong — try again."; `setSubmitting(false)` ย้ายเข้า finally
- **TOCTOU `addToLibraryAction`** — `SupabaseError` class (`lib/supabase/errors.ts`) preserves `.code` from PostgrestError; `SupabaseUserMediaRepository.add()` throws `SupabaseError` แทน plain Error; `isPgUniqueViolation` helper เช็ค `code === "23505"`; action catch: `instanceof DuplicateLibraryEntryError || isPgUniqueViolation(error)` → reason `"duplicate"`
- **`SearchView` isError** — destructure `isError` + `refetch` จาก `useQuery`; เพิ่ม error state "Couldn't search — try again." + retry Button; no-results branch เพิ่ม `&& !isError`
- **`getAuthedUser()` helper** — `lib/supabase/auth.ts`; refactor ทั้ง 6 actions ใน `userMedia.ts` ใช้ helper (behavior เหมือนเดิม 100%); ลบ `createClient` import (ใช้ผ่าน helper แทน)
- 122 tests passed (116 + 6 ใหม่ `isPgUniqueViolation`) — lint ✅ typecheck ✅

### Git state (สำคัญ)

- **`main`** — Phase 4 released (PR #28, merge commit `099dd1e`, 2026-08-24). Up to date with `develop` as of this release (both at the same content).
- **`develop`** — Phase 4 complete (PR #22–#27 all merged). Tip: `d5dc8d7` (PR #27).
- **`feature/phase4-part2b-tracker`** — deleted (remote + local) after PR #27 merge.
- **Docker Supabase ใช้ได้แล้ว** — `supabase gen types --local` ใช้ได้
- Design bundle synced (2026-08-24) — Claude Design project URL provided; used for Part 2b tracker UI

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
