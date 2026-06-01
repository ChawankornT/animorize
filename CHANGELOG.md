# ANIMORIZE — CHANGELOG.md

> บันทึกทุกการเปลี่ยนแปลงสำคัญ เรียงจากใหม่ไปเก่า
> อัปเดทโดย Claude Code ทุกครั้งที่มีการเปลี่ยนแปลง decisions, architecture, หรือ scope

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
