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

- Server Components เป็น default; `'use client'` เฉพาะที่ต้อง interactivity จริง (fav button, search box, modal, tabs)
- Mutation ทุกตัวผ่าน Server Actions → return `{ success: boolean, message: string, errors? }`
- **Read actions (search) return ข้อมูลโดยตรง** — `searchMediaAction` return `Media[]` ไม่ใช่ mutation contract
- Server Action ต้องเรียก `createClient()` จาก `@/lib/supabase/server` ก่อนเสมอ — **ไม่ใช่ `createServerClient()`** (ชื่อ export จริงคือ `createClient`) ส่งเข้า factory ได้เลย; **ห้าม service-role**
- **`getUser()` = แหล่งเดียวที่ปลอดภัยสำหรับ userId** — ทุก action และ Server Component ที่ query user-owned table ต้อง `const { data: { user } } = await supabase.auth.getUser()` แล้วใช้ `user.id`; ห้ามใช้ `getSession()` (stale ได้); admin actions เดิม (media/provider/franchise) ไม่มี `getUser()` เพราะ global table — อย่า copy pattern นั้นมาใช้กับ Phase 3
- Validation SoT: Zod = ตรวจ shape ที่ขอบ action; business invariant = domain (ห้าม implement rule ซ้ำ)
- Client data layer: Server Actions + `useOptimistic` — **ห้าม wire TanStack Query ทั้ง Phase**; ยกเว้น search autocomplete ใช้ได้ (dedup + stale-while-revalidate) — `queryFn` เรียก `searchMediaAction(q)` โดยตรง (Server Action เป็น async function ธรรมดา)
- `getDisplayTitle` (EN > Romaji > TH) ทุกที่ที่โชว์ชื่อ
- `loading.tsx` (skeleton) + `error.tsx` ทุก route group ที่เพิ่ม
- ห้าม `any` · ห้าม `console.log` (prod; ใช้ `console.error` ฝั่ง server) · ห้าม inline style · ห้ามแก้ `types/database.ts` · ห้าม import Supabase ใน `domain/` · ห้ามยิง AniList จาก client
- Icon: `lucide-react`, override `strokeWidth` 1.5 (default 2) ผ่าน `Icon` wrapper ตัวเดียว
- Naming: Server Action = camelCase + `Action` (`addToLibraryAction`); hook = `useXxx`; component = `PascalCase`

---

## งาน

### 0. Pre-work — ขยาย `IMediaRepository` สำหรับ search (ก่อนสร้าง action)

ขยาย `IMediaRepository.findAll` ด้วย `search?: string` option — **consistent กับ `IFranchiseRepository` ที่ใช้ pattern เดียวกัน** (อย่าเพิ่ม method แยกเพราะจะมี 2 pattern สำหรับเรื่องเดียวกัน):

```ts
// interfaces/IMediaRepository.ts — เพิ่ม search ใน options
findAll(options?: {
  franchiseId?: string;
  mediaType?: MediaType;
  airingStatus?: AiringStatus;
  search?: string;       // ← เพิ่ม
}): Promise<Media[]>;
```

ใน `SupabaseMediaRepository.findAll`: เมื่อมี `search` ให้ต่อ `.or(...)` — **sanitize `q` ก่อน interpolate** (strip `%`, `,`, `;` เพราะ PostgREST `.or()` รับ comma-delimited string และอักขระพิเศษจะทำให้ filter พัง):

```ts
if (options?.search) {
  const q = options.search.replace(/[%,;]/g, '');
  query = query.or(
    `title_en.ilike.%${q}%,title_romaji.ilike.%${q}%,title_th.ilike.%${q}%`
  );
}
```

### 1. Server Actions — `app/actions/userMedia.ts`

- `searchMediaAction(query: string): Promise<Media[]>` — read operation, **return `Media[]` โดยตรง** ไม่ใช่ `{ success }` contract; `createClient()` → `createMediaRepository` → `listMedia({ search: query })`; ไม่ต้องการ auth (catalog = public)
- `addToLibraryAction(input)`: Zod parse `{ mediaId, providerId?, audio: 'sub' | 'dub', customUrl?: url }` → `getUser()` → `addToLibrary` usecase → `revalidatePath('/dashboard')`; dup → `{ success: false, message }`
- `toggleFavoriteAction(userMediaId, next: boolean)` — `next` = ค่าที่ต้องการ (ไม่ใช่ toggle blind); `getUser()` verify ownership → `toggleFavorite` usecase → return `{ success, message }`
- `removeFromLibraryAction(userMediaId)` — `getUser()` verify → `removeFromLibrary` → `revalidatePath('/dashboard')`
- `changeLibraryProviderAction(userMediaId, providerId, audio, customUrl?)` — ⚠️ **ห้ามตั้งชื่อ `updateProviderAction`** เพราะชื่อนั้นมีอยู่แล้วใน `actions/provider.ts` (admin CRUD ของ Provider entity คนละเรื่องกัน — จะสับสนเวลา grep)
- ทุก mutation action: `getUser()` check (ไม่ login → `{ success: false, message: 'Unauthorized' }`), `console.error` ใน catch

### 2. Search — `(main)/search`

- เพิ่ม `(main)/search/loading.tsx` + `(main)/search/error.tsx` ด้วย
- Server Component shell (`page.tsx`) + `'use client'` search box component
- TanStack Query (`useQuery`) สำหรับ autocomplete: `queryFn: () => searchMediaAction(q)`, debounce ~300ms, `enabled: q.length >= 2`
- **Library cross-reference แบบ efficient (ไม่ N+1):** ใน Server Component (หรือ initial load) fetch `findByUserId(userId)` 1 ครั้ง → สร้าง `Set<string>` ของ `mediaId` ที่อยู่ใน library → ส่งลง client → autocomplete/result ใช้ `inLibrarySet.has(result.id)` แยกกลุ่ม "In your library" / "Add to library"; **อย่าเรียก `findByUserAndMedia` ต่อ result**
- result grid = `MediaCard` variant `search` (ปุ่ม Add, ไม่มี progress/fav)
- ชื่อด้วย `getDisplayTitle` (EN-first)
- design ref: `SearchAutocomplete` + `SearchResults` (`screens/screens.jsx`, `styles.css`) — ⌘K, keyboard hints, filter row, grid/list toggle

### 3. Add to library — modal (provider + audio + custom URL)

- เปิดจากปุ่ม "Add to library" (search result / media detail เรื่องที่ยังไม่อยู่ใน library)
- **Provider data ต้อง pre-fetch ที่ Server Component ก่อน ไม่ใช่ fetch ใน modal:** parent (search result page หรือ media detail page) เรียก `listMediaProviders(repo, mediaId)` แล้วส่ง `providers: MediaProvider[]` เป็น prop ลง modal — ป้องกัน waterfall และ loading state ซ้อน; `listMediaProviders` usecase มีอยู่แล้ว (`domain/usecases/ListMediaProviders.ts`)
- ฟอร์ม: เลือก Provider (จาก `providers` prop), audio sub/dub (ตามที่ provider รองรับ), Custom URL (optional, validate รูปแบบ URL)
- submit → `addToLibraryAction`
- effective URL = `custom_url ?? media_providers.base_url` (keyed by `provider_id + audio`) → `getEffectiveUrl` ทำให้แล้ว
- ⚠️ **modal นี้ Claude Design ยังไม่ได้ออกแบบ** (กำลังสั่ง design แยก) — ถ้า design มาถึงแล้วให้ recreate ตาม artboard; ถ้าจำเป็นต้อง implement ก่อน design มาถึง ให้ประกอบจาก DS เท่านั้น: `Modal` (BRAND §10.10) + `Field` + `Select`/`SearchableSelect` + Custom URL `TextInput` (มี validation state) + audio toggle; voice sentence case ("Add to library")

### 4. Favorite toggle + optimistic — ตั้งมาตรฐาน optimistic pattern (งานแรก stakes ต่ำสุด)

- `'use client'` `FavoriteButton` → `useOptimistic` + `toggleFavoriteAction`; fail → rollback + toast error
- visual: star (outline) ↔ sparkle `#D4537E`; fire sparkle once/action (scale 0.3→1.05→1, rotate -30→0, ~1100ms), เคารพ `prefers-reduced-motion`
- pattern นี้ reuse กับ +1 episode (Phase 4)

### 5. Dashboard — `(main)/dashboard`

- **Server Component ต้องเรียก `getUser()` เพื่อเอา `userId`** ก่อนเรียก `listUserLibrary` (admin patterns เดิมไม่มี getUser — อย่า copy)
- `listUserLibrary(userId, 'dashboard')` = `status='watching' OR is_favorite=true` — ยังถูกต้อง
- **Tabs (All/Watching/Favorites) เป็น client-side filter:** Server Component pre-compute counts (`watchingCount`, `favoritesCount`) แล้วส่ง `items` + counts ลง `DashboardTabs` client component; Tabs filter ใน client: All = items ทั้งหมด; Watching = `items.filter(i => i.status === 'watching')`; Favorites = `items.filter(i => i.isFavorite)` — **ไม่ต้องขยาย listUserLibrary usecase**
- layout: page-head (h1 "Library" + counts), section "Currently watching" + "Favorites" (มี sparkle), `lib-grid` 4 cols
- design ref: `Dashboard` + `DashboardEmpty`
- **empty state:** primary "Add your first title" → `/search` (ปุ่มเดียว)
  - ✅ เคาะแล้ว: Phase 3 user เพิ่มเรื่องจาก catalog ผ่าน search เท่านั้น
  - ❌ **ห้ามใส่ปุ่ม "Import from AniList" ฝั่ง user** — import = admin-only ในโมเดลปัจจุบัน; user-facing AniList import = deferred (คิดอีกทีหลัง Phase 7) อย่าเอาปุ่มจากม็อคมาใส่
  - ภายหลังค่อยพิจารณาเพิ่ม "Browse catalog" เมื่อมี category page (Phase 6)

### 6. MediaCard — `components/media/MediaCard.tsx`

- poster: `next/image` (host `s4.anilist.co` config แล้ว) เมื่อมี `poster_url`; ไม่มี → fallback color tile (`TILE_COLORS` ใน `constants/admin.ts`) + ชื่อ EN ล่างซ้าย + gradient
- aspect 16:10, radius 12px, border 0.5px → hover `border-strong`
- fav button (top-right 26×26 circle `rgba(15,15,15,.55)`) สลับ sparkle/star
- meta: title (`getDisplayTitle` 14/500 truncate), provider badge (swatch 8×8 **ไม่ fill**), "ep X of Y" (tnum), progress 3px
- spec ตรง BRAND.md §10.4 + `.lib-card` ใน `screens/styles.css`
- variants: `library` (fav + progress) / `search` (ปุ่ม Add, ไม่มี progress/fav)
- ⚠️ **ไม่มี +1 ep pill ใน Phase 3** — pill เป็น Phase 4 dependency (`incrementEpisodeAction` ยังไม่มี); เพิ่มเข้า `library` variant ตอน wire action จริงใน Phase 4

---

## เสร็จแล้ว

- unit test usecase/mapper ใหม่ (ถ้ามี); `npm run lint` + `npm run typecheck` + `npm test` ผ่านทั้งหมด
- update `PROGRESS.md` (Phase 3 Features checklist) + `CHANGELOG.md`
- commit ตาม convention
- **เปิด PR เข้า `develop` เท่านั้น** (verify base branch ก่อนเปิด)
