# Phase 4 — Part 2a (v2) — Media detail page + read-only surfaces

> **Actor: Claude Code.** Phase 4 UI implementation, รอบแรกของ Part 2 (read-only + page shell)
> ต่อจาก Phase 4 **Part 1 backend** ที่ merged เข้า `develop` แล้ว (140 tests) — usecases/actions/repo พร้อมใช้
> **Part 2b** (interactive `EpisodeTracker` + hook + confirm modal + movie toggle) จะต่อจาก part นี้ — สร้าง contract ให้ครบ
>
> **v2 changes** (หลัง Code verify contracts กับ `develop`): pin usecase/factory จริงทั้งหมด (เลิกเป็น question list) · fix audio labels = `original · sub` / `thai · dub` · fix current-provider marker = match `(providerId, audio)` · `WatchLog.findByUserAndMedia` `limit` = required · DoD count

---

## ⛔ Branch rule — อ่านก่อนทำอะไรทั้งสิ้น

- `feature/*` / `fix/*` → เปิด PR เข้า **`develop` เท่านั้น**
- **ห้ามเปิด PR เข้า `main` เด็ดขาด** (เคยพลาดทั้งที่กฎระบุ — ครั้งนี้ห้ามหลุดอีก)
- `main` update เฉพาะ release PR `develop → main` ที่เจ้าของอนุมัติตอนปิด phase
- **verify base branch = `develop` ก่อนเปิด PR ทุกครั้ง**; ไม่ชัด → ถาม ไม่เดา
- branch แนะนำ: `feature/phase4-part2a-detail-page`

## กฎที่ต้องถือ (CLAUDE.md + DECISIONS.md)

- Server Components เป็น default; `'use client'` เฉพาะที่ต้อง interactivity จริง — **part นี้แทบทั้งหมดเป็น Server Component** (read-only)
- Supabase: `createClient()` จาก `@/lib/supabase/server` (**export จริงชื่อ `createClient` ไม่ใช่ `createServerClient`**); **ห้าม service-role**
- **`getUser()` = แหล่งเดียวของ userId** (`const { data: { user } } = await supabase.auth.getUser()`); **ห้ามรับ userId จาก client**; ห้าม `getSession()`
- `getDisplayTitle` (EN > Romaji > TH) ทุกที่ที่โชว์ชื่อ **บรรทัดเดียว** (card); **detail page โชว์ครบ 3 บรรทัด** (en/romaji/th แยก) → ไม่ใช้ getDisplayTitle ตรงนั้น แต่ render field ตรง ๆ + handle null
- ห้าม `any` · ห้าม `console.log` (server ใช้ `console.error`) · **ห้าม inline static style** ยกเว้น dynamic value (เช่น `background: media.color`, `width: ${pct}%`) · ห้ามแก้ `types/database.ts` · ห้าม import Supabase ใน `domain/`
- Icon ผ่าน `<Icon as={LucideIcon} size={15} />` wrapper เดียว (`components/ui/Icon.tsx`) — **ไม่มี color prop**, ใช้ CSS `color` บน parent (icon inherit currentColor)
- Naming: route param camelCase; component PascalCase; ห้าม `_V2` suffix
- ทุก route group ต้องมี `loading.tsx` (skeleton, ห้าม spinner เดี่ยว — BRAND §10.14) + `error.tsx`
- **ห้าม install package ใหม่** โดยไม่บันทึก DECISIONS.md (part นี้ไม่ต้องเพิ่ม package)

## Design reference (optional, read-only)

- **prompt นี้ + `BRAND.md` (repo) = authoritative.** Design bundle ที่ Chat verify แล้ว = `screens/screens.jsx` → `MediaDetail`
- ถ้ามี connector ใน env: project URL = `https://claude.ai/design/p/33a82807-b0b0-42a2-bb95-2c53feda3033` ใช้ดู artboard ประกอบเวลา spacing กำกวมได้ **แต่ห้าม re-derive scope/component จาก prototype** — prototype เป็น mock JSX (mock data, name-based icon, inline style, `onhold`/`plan` mock enum) ไม่ใช่ production
- artboard ที่ตรงกับ part นี้: detail · watching (Frieren) · detail · completed (Vinland) — ส่วน **read-only layout** (poster, titles, meta, synopsis, provider table, watch history); **action buttons ของ tracker = Part 2b** (part นี้ทำแค่ tracking summary read-only)

---

## Confirmed contracts (verified against `develop` — ใช้ตรงตามนี้ ไม่ต้อง re-verify)

ทุก factory จาก `src/repositories/index.ts`. ถ้าตอน implement พบว่า contract จริงต่างจากนี้ → **หยุด แจ้งเจ้าของ** ไม่เดา

- **Route**: ไม่มี user-facing media detail route (มีแค่ `/admin/media/[id]`) → สร้าง `src/app/(main)/media/[id]/` (lowercase `[id]`; param = media id; RLS `media` ให้ authenticated SELECT — `schema/11-rls.sql`)
- **Media display** → `getMedia(mediaRepo, id)` (`src/domain/usecases/GetMedia.ts`, wrap `findById`) → `Media` entity ให้ครบ: titles, synopsis, genres, posterUrl, totalEpisodes, mediaType, seasonQuarter/Year, airingStatus · factory `createMediaRepository(supabase)` · `null` → `notFound()`
- **Tracking** → `getLibraryItem(userMediaRepo, userId, id)` (`src/domain/usecases/GetLibraryItem.ts`, wrap `findWithMediaByUserAndMedia`) → `UserMediaWithMedia | null` · **`null` → `notFound()`** (in-library only; not-in-library = deferred) · ใช้ subset: `status, currentEpisode, isFavorite, id (= userMediaId), providerId, audio` (media fields ใช้จาก `getMedia` แทน — overlap harmless)
- **Provider table** → `listMediaProviders(mediaProviderRepo, id)` (`src/domain/usecases/ListMediaProviders.ts`, wrap `findByMediaId`) → `MediaProvider[]` = `{ id, mediaId, providerId, audio, baseUrl, createdAt, providerName, providerColor }` (ครบทุก field ที่ table ต้องการ) · factory `createMediaProviderRepository(supabase)`
- **Watch history** → `watchLogRepo.findByUserAndMedia(userId, mediaId, limit)` — **`limit` เป็น required** (ส่ง `5`) · factory `createWatchLogRepository(supabase)` · `WatchLog` = `{ id, userId, mediaId, episodeNumber, watchedAt }` — **ไม่มี provider field** (settled decision DECISIONS.md §P4: history = `ep N · timestamp`, ไม่มี provider column; per-episode URL = post-MVP) → design ที่โชว้ provider ต่อ entry เป็น first-pass เก่า **ignore column นั้น ไม่ใช่ discrepancy**
- **`isTrackable(media)`** มีใน `domain/entities/Media.ts` → `isMovie = !isTrackable(media)`

> contracts เหล่านี้มีอยู่จริงทั้งหมด (usecase + JSDoc + test + mock) → **ไม่ต้องเพิ่ม usecase/repo/test ใหม่** เว้นแต่เพิ่ม util format ใหม่ (เช่น timestamp formatter ถ้ายังไม่มี)

---

## Scope ของ part นี้

✅ **อยู่ใน 2a**: detail route (in-library) + data composition + read-only UI (breadcrumb, poster, titles×3, meta, synopsis, provider table, tracking summary read-only, watch history) + empty states + card→detail link + loading/error

❌ **ไม่อยู่ใน 2a** (→ Part 2b): action buttons ใด ๆ ของ tracker (`+1`, Rewatch, Mark/Watch again/Unmark), `useEpisodeTracker`, confirm Modal, optimistic wiring
❌ **deferred (note ไว้ ไม่ต้องทำ)**: not-in-library detail (Kimetsu "Add to library" artboard — discover path, post-Phase) → ถ้า user เปิด detail ของ media ที่ไม่มีใน library ให้ `notFound()` ไปก่อน · provider "Switch to" wiring (render read-only เฉย ๆ) · `⋯ More` contents

---

## Task 1 — Detail route + Server Component (data composition)

**`src/app/(main)/media/[id]/page.tsx`** (Server Component)

- `params: { id }` (Next 16 — `params` เป็น Promise, `await` ก่อนใช้); **route param `id` = media id** (ตรง `/admin/media/[id]`) → ส่ง `id` เป็น `mediaId` arg ของ fetch ด้านล่าง
- `createClient()` → `getUser()`; ไม่ login → redirect `/login` (ตาม middleware/pattern เดิมของ `(main)`)
- compose fetch (ใช้ usecase ตาม "Confirmed contracts" — fetch ขนานได้ด้วย `Promise.all` หลัง gate):
  1. **`getLibraryItem(userMediaRepo, userId, id)`** → `null` (ไม่อยู่ใน library) → `notFound()` (gate; not-in-library = deferred) · ใช้ subset tracking: `status, currentEpisode, isFavorite, id (=userMediaId), providerId, audio`
  2. **`getMedia(mediaRepo, id)`** → media display fields (titles, synopsis, genres, posterUrl, totalEpisodes, mediaType, season, airing) · `null` → `notFound()`
  3. **`listMediaProviders(mediaProviderRepo, id)`** → `MediaProvider[]` (provider table)
  4. **`watchLogRepo.findByUserAndMedia(userId, id, 5)`** → `WatchLog[]` (history, `limit` required = 5)
- ส่ง props ลง read-only UI component(s) ใน Task 2
- **business logic อยู่ใน usecase/entity เท่านั้น** — page = fetch + compose + render; `isMovie = !isTrackable(media)` (`domain/entities/Media.ts`)

**`src/app/(main)/media/[id]/loading.tsx`** — skeleton ตาม layout (poster block + meta lines + section blocks); ใช้ `Skeleton` variants (BRAND §10.14) ห้าม spinner เดี่ยว
**`src/app/(main)/media/[id]/error.tsx`** — `'use client'`, error boundary ตาม pattern route group เดิม

> หมายเหตุ revalidate: actions ของ Part 1 revalidate `/dashboard`. detail page นี้จะ sync ตอน 2b ผ่าน `router.refresh()` หลัง mutation (2b จัดการ) — part นี้ไม่ต้องแตะ action

---

## Task 2 — Read-only detail UI (per design `MediaDetail`)

วาง component ใหม่ใน `src/components/media/` (เช่น `MediaDetailView.tsx` — Server Component ได้, ไม่มี interactivity). ประกอบจาก primitive เดิมล้วน; voice sentence case ไม่มี `!` ไม่มี emoji:

**2.1 Breadcrumb** — `Library` (link `/dashboard`) → `{displayTitle}` (current); ใช้ `Breadcrumb` ถ้ามีใน DS (BRAND §10.8) ไม่งั้นประกอบตาม spec (chevron-right 12px, current weight 500)

**2.2 Poster (aside left)** — poster tile (`next/image` ถ้ามี posterUrl, ไม่งั้น fallback color tile pattern เดิม จาก MediaCard `Poster`/`TILE_COLORS`); favorite indicator (sparkle `#D4537E`) ถ้า `isFavorite`; gradient overlay (BRAND §8.4 ข้อยกเว้นเดียว)

**2.3 Tracking summary (aside, in-library, read-only)** — **เฉพาะ read-only ส่วนของ tracker** เพื่อให้หน้าไม่โหว่ก่อน 2b:

- `StatusPill status={status}` (import จาก `@/components/media/MediaCard`)
- **multi-ep**: `ProgressBar value={currentEpisode} total={totalEpisodes}` (import จาก MediaCard) + "ep `{currentEpisode}` of `{totalEpisodes}`"
- **movie** (`isMovie`): ถ้า `status === 'completed'` โชว์ "✓ Watched" (`<Icon as={CheckCircle2} size={15} />` filled — completed checkmark state ตาม BRAND §9) ไม่งั้นไม่โชว์ progress
- **ยังไม่มีปุ่ม action** — เพิ่ม comment `{/* Part 2b: EpisodeTracker action buttons + interactivity */}` ตรงนี้
- Favorite: render `FavoriteButton` เดิม (`@/components/media/FavoriteButton`, interactive อยู่แล้วจาก Phase 3 — ใช้ได้เลย ไม่ใช่ของใหม่)

**2.4 Titles + meta (right)**

- titles: `titleEn` (h1) / `titleRomaji` / `titleTh` — render ครบ 3 บรรทัดแยก, ข้ามบรรทัดที่ null
- meta badges (`Badge` จาก `@/components/ui/Badge`): `mediaType` · `season {quarter} {year}` (format ตาม util เดิมถ้ามี) · **episodes badge ซ่อนถ้า `isMovie`** (`{totalEpisodes} episodes` เฉพาะ non-movie) · airing status (`airingStatus === 'ongoing'` → "Airing now" variant success + dot / ไม่งั้น "Finished airing" default) · genres map เป็น badges

**2.5 Synopsis** — `synopsis` (handle null → ซ่อน section หรือ "No synopsis available.")

**2.6 Provider table (read-only)** — section "Where to watch" + sub "{n} providers · sub & dub support varies":

- แต่ละ row: swatch (provider color) + provider name · audio badge (`sub` → **"original · sub"** / `dub` → **"thai · dub"** — convention จริงจาก Phase 3 `AddToLibraryModal.tsx`, **ไม่ใช่** "japanese · sub" ที่เป็น mock เก่า) · base_url (`<Icon as={ExternalLink} size={14} />` + url) · current marker
- **current marker = match ทั้ง `(providerId, audio)`**: `row.providerId === userMedia.providerId && row.audio === userMedia.audio` → `<Badge variant="success" dot>Tracking on this</Badge>` (match แค่ `providerId` จะ highlight ทั้ง sub+dub row เพราะ `media_providers` key = `(media_id, provider_id, audio)`) · ถ้า `userMedia.providerId == null` → ไม่มี current marker เลย
- row อื่น → **"Switch to" render read-only** (ปุ่ม ghost sm ไม่ wire action — provider switching = deferred; ใส่ comment) เพื่อคง layout
- URL ที่โชว้ = `getEffectiveUrl(customUrl, baseUrl)` rule (`custom_url ?? base_url`) — แต่ table นี้โชว์ base_url ของแต่ละ provider row (media_providers.base_url)

**2.7 Watch history** — section "Watch history" + sub (เปลี่ยนตาม type) · **format ตาม DECISIONS.md §P4: `ep N · timestamp`, ไม่มี provider column** (`watchlogs` shape คง `{episode_number, watched_at}`):

- **multi-ep**: sub "last 5 episodes"; list row = "ep `{episodeNumber}`" + `{watchedAt}` (format timestamp ตาม util เดิมถ้ามี เช่น relative time)
- **movie + watched**: sub "1 watch"; row = "Full film" + `{watchedAt}` (movie ใช้ label "Full film" แทน "ep 1" — display choice จาก verified design)
- **history ว่าง** (movie ยังไม่ watched หรือ ep 0): empty state "No watches logged yet." (BRAND empty pattern, ไม่มี `!`)

---

## Task 3 — Card → detail link

- ทำให้ library card คลิกไป detail: wrap `MediaCard.Library` (หรือเพิ่ม `href`) ไป `/media/${item.mediaId}` ผ่าน `next/link` (ค่า = `item.mediaId` จาก `UserMediaWithMedia`; route folder = `[id]`)
- **อย่าให้ FavoriteButton (อยู่ใน card) trigger navigation** — fav button มี `stopPropagation`/ซ้อนนอก Link หรือ structure ให้ fav slot ไม่อยู่ใน `<a>` (ปัจจุบัน fav slot absolute ใน card — ระวัง nested interactive ใน `<a>`; แยก Link ครอบ content เว้น fav slot, หรือใช้ overlay-link pattern)
- ตรวจ a11y: ไม่มี interactive ซ้อน interactive ที่ผิด HTML (button ใน a)
- ไม่ต้องแตะ Search card (not-in-library flow = เดิม)

---

## เสร็จแล้ว (Definition of done)

- `npm run lint` + `npm run typecheck` + `npm test` ผ่านทั้งหมด — UI read-only ส่วนใหญ่ไม่ต้อง unit test หนัก; **usecase ที่ใช้มีครบแล้ว (getMedia/getLibraryItem/listMediaProviders/WatchLog) ไม่ต้องเพิ่มใหม่** เว้นแต่เพิ่ม util ใหม่ (เช่น timestamp formatter ถ้ายังไม่มี) → ต้องมี unit test
- update **`PROGRESS.md`** (เช็ค Part 2 items ที่ทำ: detail page, watch history display) + **`CHANGELOG.md`** (entry ตาม convention)
- commit ตาม convention · **เปิด PR เข้า `develop` เท่านั้น** (verify base ก่อนเปิด)
- ใน PR description: ระบุ usecase/method ที่ใช้ + flag ของที่ deferred (not-in-library → `notFound`, provider "Switch to" read-only) + ถ้าเจอ contract จริงต่างจาก "Confirmed contracts" ให้ note

## ห้าม (สรุป)

- ❌ ทำ action buttons ของ tracker / optimistic / confirm modal (→ Part 2b)
- ❌ implement not-in-library detail (→ `notFound()` ไปก่อน)
- ❌ wire provider "Switch to" (render read-only)
- ❌ `any` · `console.log` · inline static style · แก้ `types/database.ts` · import Supabase ใน `domain/`
- ❌ เพิ่ม package โดยไม่บันทึก DECISIONS.md
- ❌ เปิด PR เข้า `main`

---

## Hand-off ไป Part 2b (สิ่งที่ part นี้ต้องเหลือไว้ให้ต่อ)

- `MediaDetailView` มี slot/comment ชัดเจนตรง tracking summary สำหรับวาง `EpisodeTracker`
- props ที่ 2b ต้องใช้ (`userMediaId` = user_media.id, `currentEpisode`, `totalEpisodes`, `status`, `mediaType`/`isMovie`, `mediaId`) ส่งถึง component ที่จะกลายเป็น interactive แล้ว — จัด data flow ให้ 2b เปลี่ยน read-only summary → `EpisodeTracker` ได้โดยไม่ rework page fetch
