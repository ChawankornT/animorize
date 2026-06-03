# Phase 3 — Part 2c (v5 · 3/3) — Library / Dashboard

> **Baseline: Foundation + Part 2a + Part 2b merged บน `develop`** — `MediaCard` (library variant), `FavoriteButton` (optimistic), `app/actions/userMedia.ts` (favorite/remove/search/add/changeProvider), search→add flow
> ส่ง **หน้า Library/Dashboard** ที่ประกอบทุกอย่าง — All view (3 sections) + composite sort + Tabs + empty v2
> **v5 note:** integration contract กับ 2a/2b verify บน develop แล้ว (ดู §Verified contract); `Tabs`/`Empty` = **DS dependency ที่ design เพิ่มให้ — 2c ไม่สร้าง** (ดู §Dependency)

---

## ⛔ Branch rule — อ่านก่อนทำอะไรทั้งสิ้น

- `feature/*` / `fix/*` → เปิด PR เข้า **`develop` เท่านั้น**
- **ห้ามเปิด PR เข้า `main` เด็ดขาด** (เคยพลาด — ครั้งนี้ห้ามหลุดอีก)
- `main` update เฉพาะ release PR `develop → main` ที่เจ้าของอนุมัติเองตอนปิด phase
- **verify base branch = `develop` ก่อนเปิด PR ทุกครั้ง**; ไม่ชัด → ถาม

## ก่อนแตะ UI: fetch design ก่อนเสมอ (บังคับ)

1. ยืนยัน **Claude Design handoff URL ล่าสุด** กับเจ้าของ (export ใหม่ = ลิงก์ใหม่)
   - ล่าสุด (fetch + verify แล้ว — screen 2c ครบ): `https://api.anthropic.com/v1/design/h/5D8CVsBqRlaHcpRuEicJrw`
2. `fetch` → แตก → README → chats → source ที่ part นี้ใช้ (ดู **Design refs**)
3. recreate ตาม spec ตรง ๆ — **อย่าประดิษฐ์ UI เอง**; `BRAND.md` (repo) = token SoT
4. screen/component ที่ต้องใช้ไม่มีใน bundle → หยุด แจ้งเจ้าของ

## กฎที่ต้องถือ (CLAUDE.md + DECISIONS.md)

- Server Components default; `'use client'` เฉพาะที่ต้อง interactivity จริง (tabs/section filter, fav)
- Supabase: `createClient()` จาก `@/lib/supabase/server` (**ไม่ใช่ `createServerClient`**); **ห้าม service-role**
- **`getUser()` = แหล่งเดียวของ userId** (Server Component ที่ query user-owned table ต้อง `const { data: { user } } = await supabase.auth.getUser()` แล้วใช้ `user.id`); **ห้ามรับ userId จาก client**; ห้าม `getSession()`; **admin patterns เดิมไม่มี getUser — อย่า copy**
- client data layer: Server Actions + `useOptimistic` — **ห้าม wire TanStack Query** (QueryProvider scope แค่ `(main)/search` — dashboard ไม่แตะ)
- `getDisplayTitle` (EN > Romaji > TH) ทุกที่ที่โชว์ชื่อ
- `loading.tsx` (skeleton) + `error.tsx` route group `(main)/dashboard`
- ห้าม `any` · ห้าม `console.log` (ใช้ `console.error` ฝั่ง server) · ห้าม inline style (ยกเว้น dynamic value เช่น `background: media.color`, `width: pct%`) · ห้ามแก้ `types/database.ts` · ห้าม import Supabase ใน `domain/`
- Icon: `lucide-react` ผ่าน `Icon` wrapper (`<Icon as={X} size={n} />`, strokeWidth 1.5, ไม่มี color prop)

### ⚠️ Design-name → codebase-name bridges (design อ้างชื่อ mock — codebase ใช้ชื่อจริง)

| design (bundle) | codebase (ใช้ตัวนี้) | หมายเหตุ |
|---|---|---|
| `SparkleMark color="#D4537E" size={14}` | `<Sparkle size={14} />` | สี `#D4537E` **baked-in ใน SVG** — ส่งแค่ `size` ไม่มี color prop |
| `STATUS_LABEL_V2` | `STATUS_LABEL` | `constants/userMedia.ts` (มีแล้วจาก 2a) |
| `STATUS_PRIORITY` (mock only) | **ต้องสร้าง** ใน `constants/userMedia.ts` | ยังไม่มีใน codebase — ดู §C1 |
| `Badge withDot` | `Badge dot` | StatusPill ใน 2a แปลแล้ว — 2c ไม่แตะ |
| `media.titles.en` | `getDisplayTitle(...)` | MediaCard ใช้ getDisplayTitle อยู่แล้ว |
| `lib-plus` (+1 ep pill) | **ตัดออก** | depends `incrementEpisodeAction` = Phase 4; MediaCard 2a ไม่มี pill นี้อยู่แล้ว |

## Verified integration contract (Part 2a/2b — ยืนยันบน `develop` แล้ว)

> import ของพวกนี้ได้เลย ชื่อ/shape ตรงตามนี้ — **อย่าเดา อย่าแก้ Foundation/2a/2b**

```ts
// MediaCard.tsx — data shape ที่ MediaCard.Library กิน
interface LibraryCardData {
  titleTh: string | null;
  titleEn: string | null;
  titleRomaji: string | null;
  posterUrl: string | null;
  tileColorIndex?: number;   // optional, default 0 — caller ต้องคำนวณ index เอง
  status: WatchStatus;
  currentEpisode: number;
  totalEpisodes: number;
  isFavorite: boolean;
  providerName: string | null;
  providerColor: string | null;
}
// ⚠️ ไม่มี id, ไม่มี displayTitle (card compute เอง), ไม่มี updatedAt

interface LibraryCardProps {
  data: LibraryCardData;
  showStatus?: boolean;      // default false
  favoriteSlot?: ReactNode;  // render ใน fav circle
}

interface FavoriteButtonProps {
  userMediaId: string;
  isFavorite: boolean;       // ค่าปัจจุบัน — compute next = !optimisticFav ข้างในเอง
}
```

- `listUserLibrary(userId, 'all')` → `UserMediaWithMedia[]` มี `status` · `isFavorite` · `updatedAt: string` (ISO timestamp จาก Supabase) ครบ
- `UserMedia.updatedAt: string` (ISO 8601) → sort comparator ใช้ `localeCompare`/string compare ได้ตรง ๆ
- `STATUS_LABEL` มีใน `constants/userMedia.ts` แล้ว · **`STATUS_PRIORITY` ยังไม่มี** → §C1 สร้าง
- `Sparkle` รับ `size` เท่านั้น (สี `#D4537E` hardcode ใน SVG path)
- `revalidatePath('/dashboard')` มีอยู่แล้วในทุก action ของ `userMedia.ts` (favorite/remove/add/changeProvider) ตรงกับ route `(main)/dashboard` — **2c ไม่ต้องแก้ action**
- การ์ด design (`LibraryCardV2`) **ไม่มี remove control** → 2c wire แค่ `FavoriteButton` (remove action มีแต่ไม่ได้อยู่บนการ์ดนี้)

## Foundation + Part 2a/2b พร้อมใช้ (อย่าแก้)

- usecase `listUserLibrary(userId, 'all'|'dashboard')` **มีอยู่แล้ว** — ใช้ `'all'` (ดู §C1) **ไม่ต้องขยาย usecase**
- **จาก Part 2a/2b:** `MediaCard` (library variant + StatusPill sub-component), `FavoriteButton` (optimistic), `ProviderBadge`, `Icon` wrapper, `Sparkle` (มี `size`), actions ครบใน `userMedia.ts`

---

## งาน (Part 2c)

### Dependency — `Tabs` + `Empty` (DS, มาจาก design — **2c ไม่สร้าง**)

> ยืนยันบน develop: ยังไม่มี `components/ui/Tabs*`/`Empty*` — **design กำลังเพิ่มเข้า DS** (spec มีใน bundle อยู่แล้ว: `ds/components.jsx#Tabs`/`#Empty` + `ds/styles.css` `.tabs*`/`.empty*` — ใช้เป็นฐานได้)
> 2c **import มาใช้เฉย ๆ** (`components/ui/Tabs`, `components/ui/Empty`) เหมือน `Button`/`Badge`
> ⚠️ ตอนเริ่ม implement ถ้าสองตัวนี้ **ยังไม่อยู่บน `develop`** → **หยุด แจ้งเจ้าของ** (ตามกฎ UI workflow) **อย่าประดิษฐ์เอง**

### C1. Library / Dashboard page — `(main)/dashboard`

> **นิยามที่ปรับจากกฎเดิม (ต้องบันทึก DECISIONS.md — ดู §C3):**
> schema ตั้ง `status default 'plan_to_watch'` ทางเข้า library เดียวคือ add ผ่าน search → ทุก item ที่เพิ่ง add = `plan_to_watch` + ไม่ fav
> ถ้า fetch `'dashboard'` (= watching ∪ favorite) เป๊ะ ๆ → item ที่เพิ่ง add **ไม่โผล่ที่ไหนเลย** + plan_to_watch ไม่มีบ้านจนกว่ามี category page (Phase 6)
> **เคาะแล้ว:** หน้านี้ fetch **`'all'`** = library ทั้งหมด; "watching OR favorite" = **section ที่ highlight + sort priority** ไม่ใช่ filter ของทั้งหน้า

**Design refs:** `screens/library-screens.jsx#LibraryFull` (layout + 3 sections) · `screens/library-data.jsx` (`librarySort`, `STATUS_PRIORITY`, `STATUS_LABEL_V2`) · `screens/styles.css` (`.page-head`, `.page-actions`, `.page-title`, `.page-sub`, `.block`, `.block-head`, `.block-title`, `.block-sub`, `.lib-grid`) · `screens.jsx#Dashboard`

**C1.0 — `STATUS_PRIORITY` (append เข้า `constants/userMedia.ts`):**
```ts
export const STATUS_PRIORITY: Record<WatchStatus, number> = {
  watching: 0, plan_to_watch: 1, on_hold: 2, completed: 3, dropped: 4,
};
```

**C1.1 — Server Component (`page.tsx`):**
- `getUser()` → `userId` → fetch **`listUserLibrary(userId, 'all')`** ครั้งเดียว → ได้ `UserMediaWithMedia[]`
- ถ้า `items.length === 0` → render `DashboardEmpty` (§C2) แล้วจบ
- **counts pre-compute ที่ server:** `allCount = items.length` · `watchingCount = items.filter(i => i.status === 'watching').length` · **`favoritesCount = items.filter(i => i.isFavorite).length`** (⚠️ **all-fav** — นิยามเดียวกับ Favorites *tab* และ page-head; **ไม่ใช่** fav-not-watching)
- ส่ง `items` (entity เต็ม) + counts ลง client component

**C1.2 — Composite sort (pure helper เหนือ `UserMediaWithMedia[]` — sort ก่อน map):**

> ⚠️ **sort ที่ entity ไม่ใช่ที่ `LibraryCardData`** — `LibraryCardData` **ไม่มี `updatedAt`/`id`** ถ้า map ก่อน sort จะไม่มี field ให้ใช้ → **sort `UserMediaWithMedia[]` ก่อน แล้วค่อย map ทีละใบใน loop** (เก็บ `item.id`/`item.updatedAt` ไว้ที่ระดับ entity)
> ⚠️ mock `librarySort` ใช้ **truthy-partition** `lastWatched` (has-recency-first) เป็น proxy — **ของจริงต้อง compare `updated_at` DESC จริง**

```ts
// แยกเป็น pure helper (testable) — input/output = UserMediaWithMedia[]
export function librarySort(a: UserMediaWithMedia, b: UserMediaWithMedia): number {
  const pa = STATUS_PRIORITY[a.status] ?? 99;
  const pb = STATUS_PRIORITY[b.status] ?? 99;
  if (pa !== pb) return pa - pb;                              // 1. status priority
  if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1; // 2. fav tie-break ภายใน status (ไม่ override ทั้งหมด)
  return b.updatedAt.localeCompare(a.updatedAt);             // 3. updated_at DESC (ISO string)
}
```
- บนสุด = **fav + watching**; favorite ตั้งฉากกับ status (completed+fav **ไม่** เด้งเหนือ watching ค้าง)

**C1.3 — map `UserMediaWithMedia` → `LibraryCardData`:**
- map ตรง field per Code-verified: `titleEn/titleRomaji/titleTh`, `posterUrl`, `status`, `currentEpisode`, `totalEpisodes`, `isFavorite`, `providerName`, `providerColor` align กับ entity ได้เลย
- `tileColorIndex` — ใช้ **pattern เดิมที่มีอยู่ใน project แล้ว** (consistent กับ `AddToLibraryModal.tsx:136` + `admin/media/[id]/page.tsx:57` — ไม่มี shared helper แต่เป็น pattern เดียวกัน): `media.id.charCodeAt(0) % TILE_COLORS.length` — **อย่าคิด hash ใหม่**; default 0
- **อย่า** ใส่ `id`/`updatedAt` ลง `LibraryCardData` (ไม่มีใน shape) — ใช้ `item.id` (entity) เป็น React `key` + ส่งเข้า `favoriteSlot`

**C1.4 — Client component (`'use client'`) — Tabs + sections filter จาก `items` ที่ sort แล้ว:**
- เรียง `const sorted = [...items].sort(librarySort)` ครั้งเดียว แล้ว derive ทุกอย่างจาก `sorted`
- **Tabs (DS — `components/ui/Tabs`):** 3 tab พร้อม count
  - **All** (count `allCount`) → render **3 sections** (C1.5)
  - **Watching** (count `watchingCount`) → flat `lib-grid` เดียวจาก `sorted.filter(i => i.status === 'watching')`, card **`showStatus={false}`** (status implied)
  - **Favorites** (count `favoritesCount`) → flat `lib-grid` เดียวจาก `sorted.filter(i => i.isFavorite)` (**ALL favorites รวม watching** — ตรงกับ count), card **`showStatus`**
  - ⚠️ **Favorites tab ≠ Favorites section** — tab = ทุก favorite; section (ใน All) = `isFavorite && status !== 'watching'` **อย่า copy filter ผิดข้าม** (ดู C1.5)
- การ์ดทุกใบ: `<MediaCard.Library data={mapped} showStatus={...} favoriteSlot={<FavoriteButton userMediaId={item.id} isFavorite={item.isFavorite} />} key={item.id} />`

**C1.5 — Sections (default / All view) — 3 blocks ตาม `LibraryFull`:**
1. **"Currently watching"** = `sorted.filter(i => i.status === 'watching')`, card `showStatus={false}`, block-sub "Sorted by last watched"
2. **"Favorites"** = `sorted.filter(i => i.isFavorite && i.status !== 'watching')` (ไม่ซ้ำ Currently watching), heading นำด้วย `<Sparkle size={14} />`, block-sub `{count} titles`, card `showStatus` · **ซ่อน section ทั้งบล็อกเมื่อ list ว่าง** (`length > 0 &&` ตาม mock)
3. **"All titles"** = `sorted` ทั้งหมด, block-sub `{allCount} titles`, card `showStatus` ทุกใบ
- หมายเหตุ: item ที่ทั้ง watching + favorite อยู่ใน Currently watching เท่านั้น (Favorites section = status≠watching) — ตั้งใจ

**C1.6 — layout + top-bar:**
- page-head: h1 **"Library"** + sub `${watchingCount} watching · ${favoritesCount} favorites · ${allCount} total`; `lib-grid` 4 cols
- **top-bar (เคาะแล้ว — option 1):** มีแค่ **"Add media" (primary, plus icon) → route `/search`**
  - **ตัด markup ของ "Search library…" / "Filter" / "Recently watched" (sort) ออก** — ยังไม่ wire Phase 3, เก็บไว้ Phase 5 (popover design มีใน bundle `library-screens.jsx#FilterPopoverDemo`/`#SortPopoverDemo` พร้อมตอนนั้น); **ไม่ render ปุ่มตาย**
- เพิ่ม `(main)/dashboard/loading.tsx` (skeleton) + `(main)/dashboard/error.tsx`

> หมายเหตุ revalidate: toggle favorite ยิง `revalidatePath('/dashboard')` → Server Component refetch → sort ใหม่ → item อาจย้าย section (เช่น fav เรื่อง completed → โผล่ Favorites section) **เป็นพฤติกรรมที่ตั้งใจ** (optimistic flip ทันที + revalidate reconcile)

### C2. Empty state — `DashboardEmpty` (ตาม `library-screens.jsx#EmptyStateV2`)

- ใช้ `Empty` + `Tabs` (DS — import จาก `components/ui/`); `Empty` ใช้ library illustration (default)
- page-head sub ตอนว่าง: **"Nothing here yet — add your first title."**
- `Empty` title **"Your library is empty"**, body **"Search for an anime, series, or movie to add it."** (⚠️ **ตัด AniList — ห้ามก็อป mock เก่า `screens.jsx#DashboardEmpty` ที่ body พูดถึง AniList**), action = ปุ่มเดียว **"Add your first title" → `/search`**
- ❌ **ห้ามปุ่ม "Import from AniList"** — import = admin-only; user-facing AniList import = deferred (หลัง Phase 7)

### C3. บันทึก DECISIONS.md + sync CLAUDE.md

เพิ่ม entry นี้ใน `DECISIONS.md` (ใต้ section Phase 3 — ยืนยันแล้วว่ายังไม่มี entry นี้):

```md
### `/dashboard` = full library (tab All) — Dashboard rule = highlight + sort ไม่ใช่ page filter
> บันทึก 2026-06-01 — ปลดล็อกตอนเริ่ม Phase 3 Library/Dashboard (หลัง design Library view)

**เดิม (business rule):** "Dashboard filter: status='watching' OR is_favorite=true"
**ปรับเป็น:** `/dashboard` fetch `listUserLibrary(userId, 'all')` = library ทั้งหมด; "watching OR favorite" = นิยามของ **section ที่ highlight** (Currently watching / Favorites) + **sort priority** ไม่ใช่ filter ของทั้งหน้า

**เหตุผล:** ทางเข้า library เดียวคือ add ผ่าน search → ทุก item ที่เพิ่ง add = `plan_to_watch` (schema default) + ไม่ fav; ถ้า filter ทั้งหน้าด้วย watching∪favorite เป๊ะ → เรื่องที่เพิ่ง add ไม่โผล่ที่ไหนเลย + plan_to_watch ไม่มีบ้านจนกว่ามี category page (Phase 6); onboarding "Add your first title" วนกลับหน้าว่าง

**Composite sort (locked):** (1) status `watching→plan_to_watch→on_hold→completed→dropped` (2) favorite tie-break ภายใน status (ไม่ override ทั้งหมด) (3) recency `updated_at` DESC. บนสุด = fav+watching. Favorites section = favorite ที่ status≠watching (ไม่ซ้ำ Currently watching); Favorites **tab** = ทุก favorite (รวม watching)

**Counts:** page-head + Favorites tab = all-fav (`items.filter(isFavorite)`); Favorites section sub = fav-not-watching (คนละเลข ตั้งใจ)

**Top-bar (Phase 3):** มีแค่ "Add media → /search"; Filter/Sort/Library-search popover defer → Phase 5 (design พร้อมใน handoff)
```

- sync `CLAUDE.md` — บรรทัดจริง (line 62) คือ:
  ```
  - Dashboard: status='watching' OR is_favorite=true
  ```
  reword เป็น:
  ```
  - Dashboard (/dashboard) = full library (tab All); 'watching' OR favorite = highlight sections + sort priority ไม่ใช่ filter ของทั้งหน้า — ดู DECISIONS.md
  ```
- (option) DECISIONS.md บรรทัดกฎเดิมใน Features list ("Dashboard: แสดงเฉพาะ status='watching' OR is_favorite=true") — ใส่ pointer ว่า superseded by entry ข้างบน
- (option, doc-only) `domain/entities/UserMedia.ts` — JSDoc ของ `isDashboardItem` ยังเขียนกฎเดิม ("Dashboard rule: status='watching' OR is_favorite=true") → update ให้สอดคล้อง decision ใหม่ **แก้เฉพาะ comment ห้ามแตะ logic/signature** (2c ไม่เรียก function นี้ — ใช้ `'all'` — เป็นแค่ความ consistent ของ codebase)

---

## เสร็จแล้ว

- `npm run lint` + `npm run typecheck` + `npm test` ผ่านทั้งหมด
- **unit test composite sort** (`librarySort` เป็น pure helper เหนือ `UserMediaWithMedia[]`): cover status priority, favorite tie-break ภายใน status เดียวกัน, `updated_at` DESC, mixed
- update `PROGRESS.md` (เช็ค Dashboard ครบ — ปิด Phase 3 Features; bump version ถ้าแก้ DECISIONS/CLAUDE) + `CHANGELOG.md` + `DECISIONS.md` (§C3) + `CLAUDE.md` reword
- commit ตาม convention
- **เปิด PR เข้า `develop` เท่านั้น** (verify base branch ก่อนเปิด)
