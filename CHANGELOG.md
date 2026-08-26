# ANIMORIZE — CHANGELOG.md

> บันทึกทุกการเปลี่ยนแปลงสำคัญ เรียงจากใหม่ไปเก่า
> อัปเดทโดย Claude Code ทุกครั้งที่มีการเปลี่ยนแปลง decisions, architecture, หรือ scope

---

## [2026-08-27] feat(phase5): P1 — DS chore (Popover, Modal gap-fill, shared ToastPortal)

### Components

- **`Popover`** (new, `components/ui/Popover.tsx`) — render-prop trigger API, no new dependency (no floating-ui/popper). Roving-tabindex keyboard menu: `ArrowUp`/`ArrowDown`/`Home`/`End`/`Escape`, disabled items stay focusable (roving visits them, `aria-disabled` + `aria-describedby` reason, focus ring) so screen readers can discover them, `checked` items get `role="menuitemradio"` + `aria-checked` instead of the design bundle's plain `menuitem`, dividers get `role="separator"`. 7 unit tests. Not consumed by any feature yet — P2/P3's job — previewed in `/dev/components`.
- **`Modal`** — confirmed already native `<dialog>`-based; added `.modal` class + `[data-theme="dark"] .modal` surface-lift rule (untestable until dark mode is wired, P6).
- **`AddToLibraryModal`** — migrated from a hand-rolled backdrop div (`role="dialog"`, manual Escape handler) onto `<Modal>`; native `<dialog>` now supplies focus trap / Esc / inert background.
- **`ToastPortal`** (new, `components/ui/ToastPortal.tsx`) — shared position/z-index-only portal container, no ARIA (each `Toast` carries its own `role`, avoiding a double live-region). Replaces the duplicated inline portal in `FavoriteButton`, `EpisodeTracker`, `AddToLibraryModal`. In the process, standardized a real position/z-index mismatch across the three (`AddToLibraryModal`'s copy used the wrong z-index token and no `aria-live`) onto the majority pattern.
- **`Toast`** — `role="alert"` hardcoded for every variant → `role={variant === "error" ? "alert" : "status"}`.

### Docs

- `DECISIONS.md` §P5 1.17 — new entry documenting that the Claude Design bundle is a visual/token source of truth only, not an accessibility one; the codebase intentionally carries keyboard/ARIA behavior the bundle doesn't show, and future bundle re-imports must not strip it back out.
- `BRAND.md` — corrected the `bg-surface` "where it lives" row, added a Modal dark-mode row, added Popover disabled-item/icon-slot/focus-ring spec. Bumped `v1.0 · May 2026` → `v1.1 · Aug 2026`.
- `CLAUDE.md` — one line in the UI/Design workflow section stating the same bundle-is-not-an-a11y-SoT principle.

No schema, `package.json`, or business-logic changes. Lint ✅ typecheck ✅ build ✅ 157 tests ✅ (150 baseline + 7 new). On `feature/phase5-p1-ds-chore`, PR not yet opened.

---

## [2026-08-26] docs(phase5): P0 pre-phase docs

`§P5 decisions (16)` in `DECISIONS.md` — Edit progress (absolute set, ordered status-transition rules, `completed_at` COALESCE), watchlog policy unchanged, inline warning instead of confirm modal, `total_episodes = 0` guard, "Recent activity" watch-history copy, filter/sort/search in URL `searchParams`, dark mode via cookie + SSR, AniList `coverImage.extraLarge` forward-only (sync path untouched), single Phase 5 release with no schema migration, Tabs/Filter/Sort layering, sort default relabeled "Recently active", `⋯ More` menu scope (Edit progress + Remove from library), wide-screen-only responsive scope for Phase 5.

Phase 4 as-built findings (favorite variant override, `isMovie` business-rule-over-design, watch history no provider column, branch ⑤ dead-end) moved from `PROGRESS.md` into `DECISIONS.md` §P4 as-built findings before that living-spec section gets overwritten. Superseded Phase 3/4 decisions annotated in place (not deleted). `develop` recreated from `main` for clean history (content was already identical). `PROJECT_INSTRUCTIONS.md` bumped to `2026-08-25-v1` — re-upload required for Claude Chat project.

Docs-only — no `src/`, `schema/`, or `package.json` changes.

---

## [2026-08-24] fix(phase4): Part 2b — favorite button per design

### Components

- **`FavoriteButton`** — added `variant?: "icon" | "inline"` prop. `"icon"` (default) = unchanged circular overlay button used by `MediaCard`/`LibraryView`. `"inline"` = full-width `Button variant="ghost"` with `Star`/`Sparkle` icon + "Favorite"/"Favorited" label, matching `TrackerFav` in the design bundle.
- **`EpisodeTracker`** — takes new `isFavorite` prop; renders `<FavoriteButton variant="inline">` as the last child of the `.tracker` card for both `MovieTracker` and `SeriesTracker` branches.
- **`MediaDetailView`** — removed the separate circular favorite row rendered below the tracker; passes `isFavorite` straight into `EpisodeTracker` instead.

Resolves design-vs-implementation gap #1 from the Part 2b impl prompt (previously deferred as "decision i — ห้ามแตะ FavoriteButton.tsx"; owner overrode this session: "fav เอาตาม design เลย"). Lint ✅ typecheck ✅ 150 tests ✅.

---

## [2026-08-24] feat(phase4): Part 2b — EpisodeTracker interactive component

### Domain

- **`computeStatusAfterIncrement`** — `domain/entities/UserMedia.ts`: client-side mirror of completion guard in RPC (`schema/14`). `nextEp >= total AND airing !== 'ongoing'` → `'completed'`; else → `'watching'`. Used for optimistic status in `useEpisodeTracker`. 4 unit tests (mid-series, finished-at-total, ongoing-caught-up, movie-mark).

### Hooks

- **`useEpisodeTracker`** — `hooks/useEpisodeTracker.ts`: `useOptimistic<TrackerState>` + `useTransition` + `useToast` + `useRouter`. Returns `{ episode, status, isPending, toasts, dismiss, incrementEpisode, markWatched, startRewatch, unmarkWatched }`. Stale CAS miss (reason="stale") → `router.refresh()` silently, no toast. Error → curated toast. Pattern adapted from `FavoriteButton`.

### Components

- **`EpisodeTracker`** — `components/media/EpisodeTracker.tsx`: delegates to `MovieTracker` or `SeriesTracker` based on `isMovie` prop (`!isTrackable(media)`). Confirm modal for rewatch/watch-again. Toast portal. `More` button always disabled (Phase 5).
- **`MovieTracker`** — watched = `status === "completed"`. Unwatched: "Mark as watched". Watched: "Watch again" (confirm) + "Unmark as watched".
- **`SeriesTracker`** — 5-state precedence: ① interrupted mid-way → ② completed at cap → ③ mid-way +1 → ④ ongoing caught-up → ⑤ all episodes watched (dead-end — Phase 5 dependency).
- **`MediaDetailView`** — replaced read-only tracking summary with `<EpisodeTracker>`. FavoriteButton moved below. DetailPoster dead props removed. WatchHistory movie subtext dynamic count.

### Tests

- 150 tests total (146 + 4 computeStatusAfterIncrement) — lint ✅ typecheck ✅

---

## [2026-06-19] fix(phase4): stale-path hardening — null guard + revalidate consistency

### Repository

- **`SupabaseUserMediaRepository.incrementEpisode`** — hardened null guard: `data == null || data.id == null` (ปิด all-null composite gotcha by construction — PostgREST อาจ serialize `RETURN NULL` จาก composite function เป็น `{ id: null, ... }` แทน JS `null`; `id` เป็น PK → success จริงไม่มีทาง null → ตรวจ stale ได้ทั้งสอง representation)

### Server Actions

- **`startRewatchAction`** — ย้าย `revalidatePath("/dashboard")` ขึ้นก่อน stale return (ตรงกับ `incrementEpisodeAction` pattern — client sync state เงียบเสมอแม้ stale)

### Tests

- 4 repo unit tests ใหม่ (`SupabaseUserMediaRepository.test.ts`): valid row → updated, JS null → stale, all-null composite → stale, error → throws (140 tests total)

---

## [2026-06-18] feat(phase4): Part 1 backend — schema, entities, repos, usecases, actions, tests

### Schema

- **`schema/13-phase4-alter-user-media.sql`** — `ALTER TABLE user_media ADD COLUMN IF NOT EXISTS rewatch_count integer NOT NULL DEFAULT 0` (idempotent)
- **`schema/14-increment-episode.sql`** — CAS RPC `increment_episode(p_user_media_id, p_from_episode)`: SECURITY INVOKER, atomic UPDATE + INSERT watchlog, completion guard `new_ep >= total AND airing_status <> 'ongoing'`, `RETURN NULL` on CAS miss, `GRANT TO authenticated`
- **`schema/07-user-media.sql`** — canonical schema updated with `rewatch_count`
- **`schema/README.md`** — prose updated 00→14, added "Existing Phase 3 DB" migration section

### Domain

- **`WatchLog` entity** — `src/domain/entities/WatchLog.ts`: pure interface `{ id, userId, mediaId, episodeNumber, watchedAt }`
- **`types/enums.ts`** — centralized enum exports from `Database["public"]["Enums"]`; entity imports refactored (Media, MediaProvider, SyncLog)
- **4 usecases**: `IncrementEpisode` (thin delegate to RPC), `StartRewatch` (reset pointer + rewatch_count), `UnmarkWatched` (reset to plan_to_watch), `GetLibraryItem` (single item lookup)

### Repository

- **`IWatchLogRepository`** — read-only interface (`findByUserAndMedia` with limit)
- **`SupabaseWatchLogRepository`** — implementation using server.ts client
- **`IUserMediaRepository`** — 4 new methods: `findWithMediaByUserAndMedia`, `incrementEpisode` (RPC wrapper → `IncrementEpisodeResult`), `startRewatch`, `unmarkWatched`
- **`SupabaseUserMediaRepository`** — all 4 implemented; `startRewatch` uses status guard `WHERE status IN ('completed','dropped','on_hold')`
- **mappers** — `toWatchLog`, `rewatchCount` field added to `toUserMedia`

### Server Actions

- **`incrementEpisodeAction`** — stale → `reason: "stale"` (no toast); revalidatePath always (§P4 1.1 "ปล่อย revalidate sync เงียบ")
- **`startRewatchAction`** — null guard miss → `reason: "stale"`
- **`unmarkWatchedAction`** — standard error handling
- **`UserMediaActionResult.reason`** — extended with `"stale"`

### Infrastructure

- **`lib/supabase/types.ts`** — `Functions` type changed for `.rpc()` type inference
- **`.gitignore`** — added `supabase/.temp/` (Supabase CLI local state)
- **`types/database.ts`** — regenerated via `supabase gen types`

### Tests

- 14 new tests (136 total): 4 usecase test files + 2 mapper tests + mock harness extended
- lint ✅ typecheck ✅

---

## [2026-06-15] fix: pre-Phase 4 error-handling hardening

### Client error handling (§P4 1.8 convention)

- **`FavoriteButton.handleToggle`** — added try/catch inside `startTransition`; network errors now show curated toast instead of silent optimistic revert
- **`AddToLibraryModal.handleSubmit`** — added try/catch/finally; network errors show toast with description; `setSubmitting(false)` moved to `finally` (no more stuck "Adding…" button)
- **`SearchView`** — added `isError` + retry button from `useQuery`; search errors no longer masquerade as "No results found"

### TOCTOU race fix

- **`SupabaseError`** (`lib/supabase/errors.ts`) — typed error class preserving PostgrestError `.code`; `isPgUniqueViolation` helper
- **`SupabaseUserMediaRepository.add()`** — throws `SupabaseError` instead of plain `Error` (preserves `code` for callers)
- **`addToLibraryAction`** — catch now checks `isPgUniqueViolation(error)` alongside `DuplicateLibraryEntryError` → concurrent adds correctly return `reason: "duplicate"`

### Auth refactor

- **`getAuthedUser()`** (`lib/supabase/auth.ts`) — extracts repeated `createClient → getUser → null check` boilerplate
- All 6 user media actions refactored to use helper (behavior unchanged)

---

## [2026-06-07] docs: Pre-Phase 4 decisions + conventions

### DECISIONS.md

- **§P4 section appended** — 9 sub-decisions for Phase 4 Progress Tracking:
  - §P4 1.1: +1 Episode = CAS idempotent increment via Postgres RPC (`SECURITY INVOKER`)
  - §P4 1.2: Auto-status + completion guard revised (`airing_status <> 'ongoing'` แทน `current = total`)
  - §P4 1.3: −1/correction deferred → Phase 5 "Edit progress"
  - §P4 1.4: Rewatch added to Phase 4 scope (confirm → reset pointer, rewatch_count+1)
  - §P4 1.5: movie/special toggle Watched (mark = RPC, unmark = reset pointer)
  - §P4 1.6: Schema `user_media.rewatch_count`
  - §P4 1.7: History scope = per-media only (global deferred)
  - §P4 1.8: Error-handling convention (client try/catch + toast mandatory)
  - §P4 1.9: AniList ongoing data caveat documented
- **Stale entries annotated** — "Atomic +1 Episode" section + Phase 4 roadmap bullets ชี้ §P4

### CLAUDE.md

- **Key Business Rules** — replaced `+1 Episode` line with CAS block (guard, matched/no-match, movie/special, Rewatch, −1 deferred)
- **Conventions DO block** — added error-handling rules (imperative mutation try/catch, TanStack queryFn throw)

### PROGRESS.md

- **Notes for Chat** — Phase 4 pre-implementation summary + fix round backlog + design addendum pending
- **Versions bumped** — `decisions_version: 2026-06-07-v1`, `claude_md_version: 2026-06-07-v1`

---

## [2026-06-03] Release: Phase 3 → main (PR #19)

- **Code review** (high effort, 7 parallel angles) — 10 findings surfaced, 3 correctness bugs backlogged
- **PR #19 merged** — `develop` → `main`, CI passed (guard + lint/typecheck/test + build)
- **develop recreated** from main — clean history, no divergence

---

## [2026-06-03] Code Review Fixes — 10 findings across Phase 3 codebase

### Domain

- **`DuplicateLibraryEntryError`** — typed error class ใน `AddToLibrary` usecase แทน plain `new Error()`; action ใช้ `instanceof` check แทน `.includes()` string-sniffing
- **`UserMediaActionResult`** — discriminated union with `reason` code (`"duplicate" | "unauthorized" | "invalid" | "error"`) — raw error ไม่หลุดถึง UI

### Repository

- **`findMediaIdsByUserId()`** — new lightweight query (`SELECT media_id`) on `IUserMediaRepository` + `SupabaseUserMediaRepository`; `/search` page ใช้แทน full `UserMediaWithMedia` JOIN
- **`remove()` row count check** — `.select("id")` + throw if 0 rows (เดิม silent success)
- **`UserMediaRowWithJoin` exported** — cast `as unknown as UserMediaRowWithJoin` แทน `as any`
- **`sanitizeSearchTerm` empty guard** — repos return `[]` เมื่อ sanitized term ว่าง (เดิมคืน full catalog); search query `.limit(50)` เฉพาะ search mode

### Components

- **`AddToLibraryModal`** — try/catch/finally (แทน .then/.catch) + Escape key handler + `role="dialog"` + `aria-modal` + dynamic toast description (ไม่ hardcode)
- **`FavoriteButton`** — added `typeof document` guard on `createPortal`
- **`LibraryView`** — `useMemo` on sorted/watching/favNonWatching (เดิม re-sort ทุก render)
- **`Header`** — profiles query error handling

### Hooks

- **`useToast`** — added `description?` field + `timersRef` cleanup on unmount (clearTimeout ทุก pending timer)

### Tests

- `AddToLibrary.test.ts` — updated to assert `DuplicateLibraryEntryError` class
- `mockRepositories.ts` — added `findMediaIdsByUserId` mock
- 116 tests pass, lint ✅, typecheck ✅

---

## [2026-06-01] Phase 3 Part 2a — MediaCard + FavoriteButton + domain/actions plumbing

### Domain

- **SetFavorite usecase** — `src/domain/usecases/SetFavorite.ts`: idempotent explicit setter แทน ToggleFavorite flip; เหมาะกับ optimistic UI ที่ส่ง `next` ตรงๆ ไม่ double-flip เมื่อ retry

### Components

- **Icon wrapper** — `components/ui/Icon.tsx`: `<Icon as={LucideIcon} size={16} />`, strokeWidth 1.5 ทุกตัว
- **Sparkle** — เพิ่ม `size` prop, height auto-calculated จาก ratio 1.6:1 (viewBox 100×160)
- **ProviderBadge** — `components/media/ProviderBadge.tsx`: swatch 8×8 radius-2px + plain text; no fill (BRAND §10.5)
- **MediaCard** — `components/media/MediaCard.tsx` — 2 variants:
  - `Library`: poster (next/image / fallback color tile), fav slot, StatusPill, ProgressBar (hidden plan_to_watch), ep count (watching/on_hold), dropped opacity 0.78
  - `Search`: poster, EN title overlay, type·year meta, Add button (ghost sm h-22)
  - sub-components: `StatusPill`, `ProgressBar`, `Poster` — re-exported
- **FavoriteButton** — `components/media/FavoriteButton.tsx`: `useOptimistic` + motion sparkle animation (scale 0.3→1.05→1, rotate -30→0, 1100ms, ease-out cubic-bezier) + `prefers-reduced-motion` (0–120ms fade no transform) + portal Toast on error

### Server Actions

- **`app/actions/userMedia.ts`** — ไฟล์ใหม่สำหรับ user-library mutations:
  - `toggleFavoriteAction(id, next)` — RLS-guarded, revalidatePath('/dashboard')
  - `removeFromLibraryAction(id)` — RLS-guarded, revalidatePath('/dashboard')
  - Part 2b จะ append `searchMediaAction` + `addToLibraryAction` ต่อในไฟล์เดียวกัน

### Constants & Hooks

- **`constants/userMedia.ts`** — `STATUS_LABEL: Record<WatchStatus, string>` (user-library concern แยกจาก constants/admin.ts)
- **`hooks/useToast.ts`** — self-contained toast queue + auto-dismiss, render ผ่าน portal

### Tests

- SetFavorite test: ทดสอบ explicit true/false (ไม่ใช่ flip) — 3 cases
- รวม 98 tests ผ่าน, lint clean, typecheck clean

---

## [2026-05-31] chore(rules): branch protection + UI design workflow gating

### Rules & Conventions

- **`.claude/rules/git.md`** — เพิ่ม callout ⛔ ที่หัวข้อ Branch: ห้าม PR เข้า `main` ระหว่าง phase; เพิ่มหมายเหตุเหตุการณ์จริง "เคยมี PR หลุด"
- **`.claude/rules/ui.md`** — สร้างใหม่: กฎ UI/Design workflow — fetch Claude Design handoff bundle ก่อน implement เสมอ; ห้ามประดิษฐ์ UI เอง
- **`CLAUDE.md`** — เพิ่มหัวข้อ "Git & Deploy" + "UI / Design workflow"
- **`DECISIONS.md`** — เพิ่ม 2 หัวข้อ: "Branch protection — main off-limits mid-phase" + "UI work gated on Claude Design handoff"
- **`ci.yml`** — เพิ่ม `check-branch-target` job: fail อัตโนมัติเมื่อ PR base=main และ head≠develop
- **`.github/PULL_REQUEST_TEMPLATE.md`** — สร้างใหม่: reminder verify base branch + checklist

---

## [2026-05-31] Phase 3 Foundation — User Library Domain Layer

### Domain

- **UserMedia entity** — `src/domain/entities/UserMedia.ts`: `UserMedia`, `UserMediaWithMedia`, `AddToLibraryInput`; 3 business-rule functions: `getDisplayTitle` (reuse จาก title.ts), `getEffectiveUrl(customUrl, baseUrl)`, `isDashboardItem(userMedia)`
- **URL resolution model documented** — 3 ชั้น: `providers.base_url` / `media_providers.base_url` / `user_media.custom_url`; effective URL = `custom_url ?? media_providers.base_url`; keyed by `(provider_id, audio)` → sub/dub แยกลิงก์ได้
- **4 usecases**: `AddToLibrary` (dup check → error), `ToggleFavorite` (flip), `RemoveFromLibrary`, `ListUserLibrary` (filter: all | dashboard)

### Repository

- **IUserMediaRepository** — `src/repositories/interfaces/IUserMediaRepository.ts`: 7 methods (add, findByUserId, findByUserAndMedia, updateFavorite, updateStatus, updateProvider, remove)
- **SupabaseUserMediaRepository** — nested 2-level JOIN: `media(... media_providers(provider_id, audio, base_url)), providers(name, color)`; baseUrl resolved by `(provider_id, audio)` match; uses server.ts client
- **mappers**: `toUserMedia`, `toUserMediaWithMedia`, `fromAddToLibraryInput` เพิ่มใน `mappers.ts`
- **factory wired** — `createUserMediaRepository()` ใน `repositories/index.ts`

### Testing

- **38 tests เพิ่ม** (รวม 98 tests): entity (17), mapper (14 เพิ่ม จาก 4 เดิม), usecases (13), ผ่านทั้งหมด
- **mock harness ขยาย** — `makeUserMedia`, `makeUserMediaWithMedia`, `createMockUserMediaRepository` (vi.fn() style) ใน `mockRepositories.ts`

### Decisions

- URL resolution model 3 ชั้น — ดู DECISIONS.md § "Phase 3 Foundation Decisions"

---

## [2026-05-30] Pre-Phase 3 Foundation

### Architecture

- **ESLint dependency rules** — `eslint.config.mjs` เพิ่ม `no-restricted-imports` overrides สำหรับ `domain/` และ `repositories/` — กฎ Clean Architecture บังคับ fail ที่ CI lint step อัตโนมัติ (ไม่ต้องอาศัยวินัย reviewer)
- **getDisplayTitle shared util** — ตัด logic ซ้ำออกจาก `Media.ts` + `Franchise.ts` → `domain/entities/title.ts` เป็น single implementation; ทั้งคู่ re-export ตรงๆ ไม่มี wrapper; แก้ inline ใน admin media detail page ด้วย

### Testing

- **Vitest setup** — `vitest.config.ts` + `@/` alias ตรงกับ tsconfig
- **Mock repository harness** — `src/__tests__/utils/mockRepositories.ts`: `createMockMediaRepository` + `createMockSyncLogRepository` + stub builders — Phase 3+ reuse ได้
- **60 backfill unit tests** — ครอบ bug cases ที่เคยพังจริง: `episodes null→undefined` (AniList mapper), `toSyncLog EN-first`, `RetrySync PROTECTED fields stripped`, `RetrySync fetch/update fail → write failed log + rethrow`, `validateMedia movie=1ep`, `getDisplayTitle EN>Romaji>TH`, `validateFranchise/Media at-least-one-title`

### Decisions + Conventions (Pre-Phase 3 section)

- Client data layer: Server Actions + useOptimistic; TanStack Query defer ถึง search autocomplete
- Validation SoT: Zod=shape, domain=canonical; trivial overlap documented
- Testing policy: usecase/mapper required, no % gate, RTL defer
- Dependency rule: ESLint built-in enforcement (ปฏิเสธ eslint-plugin-boundaries)
- RLS pattern: user-owned tables ใช้ session client (`server.ts`) เท่านั้น
- Atomic +1 RPC: documented exception to domain-purity (Phase 4)
- Optimistic UI: useOptimistic + error contract `{success, message, errors?}`

---

## [2026-05-30] Roadmap Revision + Phase 7 Planned

### Roadmap

- Phase 3/4 เพิ่ม Foundation tasks (domain entity → repository → usecase ก่อน UI) ให้ตรง Clean Architecture
- Phase 3 เพิ่ม task render poster จริงใน MediaCard + ระบุ search match 3 ภาษา / display EN-first
- Phase 5 reframe loading/error boundary เป็น audit (convention บังคับตั้งแต่ต้น)
- Phase 6 แก้: auto-sync cron — pg_cron เพียว ๆ เรียก AniList ไม่ได้ → Vercel Cron/Edge Function + pg_net (+ reconcile section "Supabase pg_cron Keep-alive" ให้ตรงกัน: keep-alive = standalone `SELECT 1`); แยก Category page (browse media เรา) ออกจาก Phase 7 discovery

### Decisions

- เพิ่ม Phase 7 — Discovery & Bulk Import (admin-side): forward-only discovery, lean-cache candidates (re-fetch on import), defer import_candidates schema จนถึง 7b, preview ก่อน save ยังอยู่
- ดู DECISIONS.md หัวข้อ "Phase 7 — Discovery & Bulk Import (detail) rev.3"

---

## [2026-05-29] Admin UI Fixes — Poster + Sync + Consistency (PR #6)

### Bug Fixes

- **Poster rendering** — เพิ่ม `next/image` ซ้อนบน color tile ใน media detail (110×156), ImportPanel preview (84×120), media list swatch (22×30) — แสดงเมื่อ `posterUrl` มีค่า
- **Sync now button** — เพิ่มปุ่ม Sync now ใน media detail header (เฉพาะเมื่อมี `anilistId`); `RetrySyncButton` รับ `label`/`pendingLabel` optional props
- **retrySyncAction** — เพิ่ม `revalidatePath(/admin/media/:id)` ใน success path (เดิม revalidate แค่ list + sync-logs)
- **AssignProviderForm** — success message "Provider assigned." แสดงสีเขียวแล้ว (เดิม `text-error` ตลอด); เพิ่ม `success?: boolean` ใน `AssignProviderState`
- **RetrySyncButton** — message absolute-positioned ใต้ปุ่ม ไม่ดัน button Y ขึ้น
- **RemoveProviderButton** — migrate จาก `Modal` โดยตรง → ใช้ `DeleteConfirmModal` เหมือนกับ delete dialogs อื่น; inject `mediaId` ผ่าน wrapper function
- **DeleteConfirmModal** — เพิ่ม `submitLabel?` / `submitPendingLabel?` optional props (default "Delete"/"Deleting…")
- **Modal** — เพิ่ม `text-left` บน outer div ครอบ title+body; แก้ `text-md` (invalid Tailwind) → `text-sm`

---

## [2026-05-29] Admin UI Redesign + Refactor

### UI

- **Admin Dashboard** — เปลี่ยนจาก stat cards → "Needs attention" inbox (failed syncs + retry) + all-clear state; ดึงข้อมูลจริงจาก DB
- **Providers list** — เปลี่ยนจาก table → row list พร้อม color chip 36×36 + meta row (slug · URL · hex)
- **Media list** — title EN-first multi-line + color swatch 22×30 + Season/Auto-sync columns (แทน Franchise)
- **Media detail** — color tile 110×156 แสดงเสมอ (แม้ไม่มี posterUrl) + auto-sync badge
- **Provider form** — color picker swatch 32×32 (native `<input type="color">`) แทน dot 2×2
- **Import panel** — Step 1: centered layout, Step 2: preview card, Step 3: success card + icon
- **Franchises list** — เพิ่ม sub-title row (Romaji · Thai) ใต้ primary title

### Domain

- `getDisplayTitle()` ทั้ง `Media.ts` และ `Franchise.ts` เปลี่ยน order เป็น **EN > Romaji > Thai** (เดิม Thai-first)

### Architecture

- สร้าง `src/constants/admin.ts` — รวม `MEDIA_TYPE_LABELS`, `MEDIA_STATUS_VARIANT`, `SEASON_LABELS`, `TILE_COLORS` ที่เคย define ซ้ำใน 3 ไฟล์

### Decisions Updated

- Title display order rule เปลี่ยนเป็น `title_en > title_romaji > title_th` ใน CLAUDE.md + DECISIONS.md

---

## [2026-05-28] Phase 2 Part 1–6 — Admin Panel + AniList Import

### Features

- **Provider CRUD** — name, slug, color, logo_url, base_url + Zod validation
- **Franchise CRUD** — multi-title (th/en/romaji) + at-least-one-title constraint
- **Media CRUD (manual)** — full field set + movie/special = 1 episode enforcement
- **AniList import** — 2-step flow: fetchAnilistPreviewAction (fetch + duplicate check, ไม่ save) → saveImportAction (save + sync_log) — server-side only, admin preview/edit ก่อน save
- **MediaProvider assignment** — media → provider + audio (sub/dub) + base_url; findByMediaId() JOIN providers(name, color)
- **SyncLog viewer + retry** — list + per-row retry button
- **system_settings** — auto-sync toggle (singleton row)

### Domain / Repository

- เพิ่ม entities: Provider, Franchise, Media, MediaProvider, SyncLog, SystemSettings (+ Create/Update inputs, validateMedia, isTrackable, getDisplayTitle)
- เพิ่ม usecases: Media/Franchise/Provider CRUD, ImportMedia, RetrySync, GetMedia, ListFranchises
- repositories/interfaces/ + supabase/ implementation + mappers (row ↔ entity)

### Server Actions

- Mutations ทั้งหมดผ่าน Server Actions + Zod validate + revalidatePath

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
