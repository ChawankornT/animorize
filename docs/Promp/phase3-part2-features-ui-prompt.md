# Phase 3 — Features/UI prompt (Claude Code)

> ต่อจาก Foundation บน `develop` (PR #15)
> Search + Add-to-library + Favorite (optimistic) + Dashboard + MediaCard

---

## ⛔ Branch rule — อ่านก่อนทำอะไรทั้งสิ้น

- `feature/*` และ `fix/*` → เปิด PR เข้า **`develop` เท่านั้น**
- **ห้ามเปิด PR เข้า `main` เด็ดขาดระหว่าง phase** (เคยพลาดมาแล้วทั้งที่กฎระบุไว้ — ครั้งนี้ต้องไม่หลุดอีก)
- `main` จะ update เฉพาะตอนปิด phase ผ่าน **release PR `develop` → `main`** ที่เจ้าของรีวิว/อนุมัติเองเท่านั้น
- ก่อนเปิด PR ทุกครั้ง: **verify base branch** ว่าเป็น `develop` ไม่ใช่ `main`
- ไม่แน่ใจปลายทาง PR → ถาม ไม่เดา

---

## ก่อนแตะ UI: fetch design ก่อนเสมอ (บังคับ)

ก่อนสร้าง/แก้ component ที่มี UI ใด ๆ:

1. ขอ/ยืนยัน **Claude Design handoff URL ล่าสุด** กับเจ้าของ (export ใหม่ = ลิงก์ใหม่; อย่าใช้ลิงก์เก่าโดยไม่ถาม)
   - ลิงก์อ้างอิงล่าสุดที่ใช้ตอนเขียน prompt นี้: `https://api.anthropic.com/v1/design/h/ekeDkJFAe_lho_QBMo7AGg`
2. `fetch` bundle → แตกไฟล์ → อ่าน `README.md` → `chats/*.md` → source ใน `project/screens/` (`screens.jsx`, `styles.css`) และ `project/ds/` (`components.jsx`, `tokens.css`)
3. recreate ตาม spec ที่อยู่ใน source โดยตรง — **อย่าเดา/อย่าประดิษฐ์ UI เอง**; `BRAND.md` ใน repo = source of truth ของ token/spec
4. ถ้า screen/component ที่ต้องใช้ **ยังไม่มีใน bundle → หยุด แล้วแจ้งเจ้าของให้สั่ง design ก่อน** (ห้าม implement ไปก่อน)

สถานะ bundle ปัจจุบัน (ยืนยันแล้ว):
- ✅ มีแล้ว: Dashboard (+ empty), MediaCard/LibraryCard, Search (autocomplete + results grid), favorite states, media detail + provider table
- ⚠️ ยังไม่มี: **Add-to-library modal** (provider + audio + custom URL) — กำลังสั่ง design แยก ดูข้อ 3

---

## Context — Foundation พร้อมใช้แล้ว (อย่าแก้ยกเว้นจำเป็น)

- `domain/entities/UserMedia.ts` — `getEffectiveUrl(customUrl, baseUrl)`, `isDashboardItem(um)`, `getDisplayTitle` (reuse `title.ts`)
- repositories: `IUserMediaRepository` (`add` / `findByUserId` / `findByUserAndMedia` / `updateFavorite` / `updateStatus` / `updateProvider` / `remove`)
  - `SupabaseUserMediaRepository` (nested JOIN `media → media_providers → base_url`, ใช้ `server.ts` client) + factory `createUserMediaRepository(supabase)`
- usecases: `addToLibrary` (dup → error), `toggleFavorite`, `removeFromLibrary`, `listUserLibrary(userId, 'all' | 'dashboard')`
- mock harness + 98 tests ผ่าน

งานรอบนี้ = ต่อ **Server Actions + UI** ทับ Foundation

---

## กฎที่ต้องถือ (CLAUDE.md + DECISIONS.md)

- Server Components เป็น default; `'use client'` เฉพาะที่ต้อง interactivity จริง (fav button, +1, search box, modal)
- Mutation ทุกตัวผ่าน Server Actions เท่านั้น → return `{ success, message, errors? }`
- Server Action ต้อง `createServerClient()` (`server.ts`) ก่อนส่งเข้า `createUserMediaRepository()` — RLS ใช้ session client เท่านั้น **ห้าม service-role**
- Validation SoT: Zod = ตรวจ shape ที่ขอบ action; business invariant = domain (ห้าม implement rule ซ้ำ)
- Client data layer: Server Actions + `useOptimistic` — **ห้าม wire TanStack Query ทั้ง Phase**; ยกเว้น search autocomplete adopt ได้ (dedup + stale-while-revalidate) ตอนสร้าง search จริงเท่านั้น
- `getDisplayTitle` (EN > Romaji > TH) ทุกที่ที่โชว์ชื่อ
- `loading.tsx` (skeleton) + `error.tsx` ทุก route group ที่เพิ่ม
- ห้าม `any` · ห้าม `console.log` (prod; ใช้ `console.error` ฝั่ง server) · ห้าม inline style · ห้ามแก้ `types/database.ts` · ห้าม import Supabase ใน `domain/` · ห้ามยิง AniList จาก client
- Icon: `lucide-react`, override `strokeWidth` 1.5 (default 2) ผ่าน `Icon` wrapper ตัวเดียว
- Naming: Server Action = camelCase + `Action` (`addToLibraryAction`); hook = `useXxx`; component = `PascalCase`

---

## งาน

### 0. ก่อนแตะ UI → fetch design bundle (ดูหัวข้อด้านบน)

### 1. Server Actions — `app/actions/userMedia.ts`
- `addToLibraryAction(input)`: Zod parse `{ mediaId, providerId, audio: 'sub' | 'dub', customUrl?: url }` → `createServerClient` → `addToLibrary` usecase → `revalidatePath(dashboard)`; dup → `{ success: false, message }`
- `toggleFavoriteAction(userMediaId, next)`
- `removeFromLibraryAction(userMediaId)`
- (optional) `updateProviderAction(userMediaId, providerId, audio, customUrl?)`
- ทุกตัว: auth check (ไม่ login → error), return contract เดียวกัน, `console.error` ใน catch

### 2. Search — `(main)/search` (catalog search → add to library)
- Server Component shell + `'use client'` search box
- match ข้าม `title_th` / `title_en` / `title_romaji` (ilike OR) ผ่าน repository/Server Action — **ห้ามยิง AniList จาก client**
- autocomplete: debounce + แยกกลุ่ม "matches in your library" (เทียบ `findByUserAndMedia`) / "add to library"; TanStack Query ใช้ที่นี่ได้
- result grid = `MediaCard` variant `search` (ปุ่ม Add, ไม่มี progress/fav)
- ชื่อด้วย `getDisplayTitle` (EN-first)
- design ref: `SearchAutocomplete` + `SearchResults` (`screens/screens.jsx`, `styles.css`) — ⌘K, keyboard hints, filter row, grid/list toggle

### 3. Add to library — modal (provider + audio + custom URL)
- เปิดจากปุ่ม "Add to library" (search result / media detail เรื่องที่ยังไม่อยู่ใน library)
- ฟอร์ม: เลือก Provider (จาก `media_providers` ของเรื่องนั้น), audio sub/dub (ตามที่ provider รองรับ), Custom URL (optional, validate รูปแบบ URL)
- submit → `addToLibraryAction`
- effective URL = `custom_url ?? media_providers.base_url` (keyed by `provider_id + audio`) → `getEffectiveUrl` ทำให้แล้ว
- ⚠️ **modal นี้ Claude Design ยังไม่ได้ออกแบบ** (กำลังสั่ง design แยก) — ถ้า design มาถึงแล้วให้ recreate ตาม artboard; ถ้าจำเป็นต้อง implement ก่อน design มาถึง ให้ประกอบจาก DS เท่านั้น: `Modal` (BRAND §10.10) + `Field` + `Select`/`SearchableSelect` + Custom URL `TextInput` (มี validation state) + audio toggle; voice sentence case ("Add to library")

### 4. Favorite toggle + optimistic — ตั้งมาตรฐาน optimistic pattern (งานแรก stakes ต่ำสุด)
- `'use client'` `FavoriteButton` → `useOptimistic` + `toggleFavoriteAction`; fail → rollback + toast error
- visual: star (outline) ↔ sparkle `#D4537E`; fire sparkle once/action (scale 0.3→1.05→1, rotate -30→0, ~1100ms), เคารพ `prefers-reduced-motion`
- pattern นี้ reuse กับ +1 episode (Phase 4)

### 5. Dashboard — `(main)/dashboard`
- Server Component: `listUserLibrary(userId, 'dashboard')` = `status='watching' OR is_favorite=true`
- layout: page-head (h1 "Library" + counts), Tabs All/Watching/Favorites (count), section "Currently watching" + "Favorites" (มี sparkle), `lib-grid` 4 cols
- design ref: `Dashboard` + `DashboardEmpty`
- **empty state:** primary "Add your first title" → `/search` (ปุ่มเดียว)
  - ✅ เคาะแล้ว: Phase 3 user เพิ่มเรื่องจาก catalog ผ่าน search เท่านั้น
  - ❌ **ห้ามใส่ปุ่ม "Import from AniList" ฝั่ง user** — import = admin-only ในโมเดลปัจจุบัน; user-facing AniList import = deferred (คิดอีกทีหลัง Phase 7) อย่าเอาปุ่มจากม็อคมาใส่
  - ภายหลังค่อยพิจารณาเพิ่ม "Browse catalog" เมื่อมี category page (Phase 6)

### 6. MediaCard — `components/media/MediaCard.tsx`
- poster: `next/image` (host `s4.anilist.co` config แล้ว) เมื่อมี `poster_url`; ไม่มี → fallback color tile (`TILE_COLORS` ใน `constants/admin.ts`) + ชื่อ EN ล่างซ้าย + gradient
- aspect 16:10, radius 12px, border 0.5px → hover `border-strong`
- fav button (top-right 26×26 circle `rgba(15,15,15,.55)`) สลับ sparkle/star
- +1 ep pill (bottom-right `rgba(255,255,255,.95)`) เฉพาะ in-library
- meta: title (`getDisplayTitle` 14/500 truncate), provider badge (swatch 8×8 **ไม่ fill**), "ep X of Y" (tnum), progress 3px
- spec ตรง BRAND.md §10.4 + `.lib-card` ใน `screens/styles.css`
- variants: `library` (fav + progress + +1) / `search` (ปุ่ม Add, ไม่มี progress/fav)

---

## เสร็จแล้ว
- unit test usecase/mapper ใหม่ (ถ้ามี); `npm run lint` + `npm run typecheck` + `npm test` ผ่านทั้งหมด
- update `PROGRESS.md` (Phase 3 Features checklist) + `CHANGELOG.md`
- commit ตาม convention
- **เปิด PR เข้า `develop` เท่านั้น** (verify base branch ก่อนเปิด)
