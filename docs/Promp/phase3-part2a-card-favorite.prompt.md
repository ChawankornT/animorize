# Phase 3 — Part 2a (v5 · 1/3) — MediaCard + Favorite (optimistic) + domain/actions plumbing

> ต่อจาก Foundation บน `develop` (PR #14/#15)
> ส่ง **MediaCard (shared, 2 variants)** + **FavoriteButton (optimistic — ตั้งมาตรฐาน pattern)** + `setFavorite` + favorite/remove actions
> Part 2b (search + add) และ 2c (library/dashboard) จะ **import ของจาก part นี้** — สร้างให้ครบ contract

---

## ⛔ Branch rule — อ่านก่อนทำอะไรทั้งสิ้น

- `feature/*` / `fix/*` → เปิด PR เข้า **`develop` เท่านั้น**
- **ห้ามเปิด PR เข้า `main` เด็ดขาด** (เคยพลาดทั้งที่กฎระบุไว้ — ครั้งนี้ห้ามหลุดอีก)
- `main` update เฉพาะ release PR `develop → main` ที่เจ้าของอนุมัติเองตอนปิด phase
- **verify base branch = `develop` ก่อนเปิด PR ทุกครั้ง**; ไม่ชัด → ถาม ไม่เดา

## ก่อนแตะ UI: fetch design ก่อนเสมอ (บังคับ)

1. ยืนยัน **Claude Design handoff URL ล่าสุด** กับเจ้าของ (export ใหม่ = ลิงก์ใหม่ — อย่าใช้ลิงก์เก่า)
   - ล่าสุด (fetch + verify แล้ว session นี้): `https://api.anthropic.com/v1/design/h/pfsybr1BWpc_2vfPNSlEuQ`
2. `fetch` → แตก bundle → อ่าน `README.md` → `chats/*.md` → source ที่ part นี้ใช้ (ดู **Design refs** ใต้แต่ละงาน)
3. recreate ตาม spec ตรง ๆ — **อย่าเดา/อย่าประดิษฐ์ UI เอง**; `BRAND.md` (repo) = source of truth ของ token/spec
4. screen/component ที่ต้องใช้ไม่มีใน bundle → **หยุด แจ้งเจ้าของ** ห้าม implement ไปก่อน

## กฎที่ต้องถือ (CLAUDE.md + DECISIONS.md)

- Server Components เป็น default; `'use client'` เฉพาะที่ต้อง interactivity จริง (fav button)
- Mutation ทุกตัวผ่าน Server Action → return `{ success: boolean, message: string, errors? }`
- Supabase: `createClient()` จาก `@/lib/supabase/server` (**ชื่อ export จริงคือ `createClient` — ไม่ใช่ `createServerClient`**) ส่งเข้า factory ได้เลย; **ห้าม service-role**
- **`getUser()` = แหล่งเดียวของ userId** (`const { data: { user } } = await supabase.auth.getUser()`); **ห้ามรับ userId จาก client**; ห้าม `getSession()`; admin actions เดิม (global table) ไม่มี getUser — **อย่า copy pattern นั้น**
- client data layer: Server Actions + `useOptimistic` — **ห้าม wire TanStack Query** ใน part นี้
- `getDisplayTitle` (EN > Romaji > TH) ทุกที่ที่โชว์ชื่อ
- ห้าม `any` · ห้าม `console.log` (ใช้ `console.error` ฝั่ง server) · ห้าม inline style **ยกเว้น dynamic value** (เช่น `background: media.color`, `width: pct%` — design ทำแบบนั้น) · ห้ามแก้ `types/database.ts` · ห้าม import Supabase ใน `domain/`
- Icon: `lucide-react` ผ่าน `Icon` wrapper ตัวเดียว (`components/ui/Icon.tsx`) — สร้างใน part นี้:
  ```ts
  import { type LucideIcon } from 'lucide-react';
  export function Icon({ as: Ico, size = 16 }: { as: LucideIcon; size?: number }) {
    return <Ico size={size} strokeWidth={1.5} />;
  }
  ```
  ใช้: `<Icon as={Star} />` / `<Icon as={Plus} size={12} />` — **ไม่มี color prop**; ใช้ CSS `color` บน parent แทน (icon inherit ผ่าน `currentColor`)
- Naming: action camelCase + `Action`; hook `useXxx`; component `PascalCase`

## Foundation พร้อมใช้ (อย่าแก้ยกเว้นจำเป็น)

- `domain/entities/UserMedia.ts` — `getEffectiveUrl(customUrl, baseUrl)`, `isDashboardItem`, `getDisplayTitle`; `AddToLibraryInput` (userId+mediaId **required**; providerId?/audio?/status?/customUrl? optional)
- `user_media` schema — status def `plan_to_watch` · audio def `sub` · is_favorite def false · current_episode def 0 · unique(user_id, media_id) · provider_id FK → **`providers`** on delete set null
- `IUserMediaRepository` — `add` · `findByUserId` · `findByUserAndMedia` · `updateFavorite(id, isFavorite)` · `updateStatus(id, status)` · `updateProvider(id, { providerId|null, audio, customUrl|null })` · `remove(id)` + `SupabaseUserMediaRepository` (server.ts client, nested JOIN media→media_providers→base_url) + factory `createUserMediaRepository(supabase)`
- usecases: `addToLibrary` (dup→error) · `removeFromLibrary` · `listUserLibrary(userId, 'all'|'dashboard')`
- ⚠️ `toggleFavorite(repo, id, currentIsFavorite)` มีอยู่ แต่ **จะถูก redefine เป็น `setFavorite` ใน §A1** (ไม่มีใครเรียกนอก test)
- RLS: `user_media` = `for all using (auth.uid() = user_id)` → session client + userId จาก `getUser()` เท่านั้น
- `constants/admin.ts`: `TILE_COLORS` ฯลฯ · next/image host `s4.anilist.co` พร้อม · `/dev/components` preview page มี · mock harness `src/__tests__/utils/mockRepositories.ts` (`makeUserMedia`, `makeUserMediaWithMedia`, `createMockUserMediaRepository`)

---

## งาน (Part 2a)

### A1. domain — redefine `toggleFavorite` → `setFavorite`

optimistic UI ส่ง **ค่าที่ต้องการ (`next`)** มาตรง ๆ → idempotent (retry ปลอดภัย ไม่ double-flip); usecase นี้ไม่มีใครเรียกนอก test → **redefine เป็น setter:**

```ts
// src/domain/usecases/SetFavorite.ts  (rename จาก ToggleFavorite.ts)
import type { IUserMediaRepository } from '@/repositories/interfaces/IUserMediaRepository';
import type { UserMedia } from '@/domain/entities/UserMedia';

/** Sets the favorite flag to an explicit value (idempotent — fits optimistic UI). */
export async function setFavorite(
  repository: IUserMediaRepository,
  id: string,
  isFavorite: boolean,
): Promise<UserMedia> {
  return repository.updateFavorite(id, isFavorite);
}
```

- แก้ unit test เดิมของ `toggleFavorite` → test `setFavorite` (เรียก `updateFavorite` ด้วยค่า explicit ทั้ง true/false)
- ไม่ต้องเก็บ `toggleFavorite` (flip) — ไม่มีใครใช้

### A2. `components/media/MediaCard.tsx` — shared card, 2 variants

**Design refs:**
- `library` variant → `screens/library-screens.jsx#LibraryCardV2` + `screens/styles.css` (`.lib-card`, `.lib-poster`, `.lib-fav`, `.lib-meta`, `.lib-bar`, `.lib-ep`) + BRAND.md §10.4 / §10.5
- `search` variant → `screens/screens.jsx#SearchResults` (card ใน `lib-grid`, บรรทัด ~398–418)

spec ทั่วไป: aspect 16:10, radius 12px, border 0.5px → hover `border-strong`; poster = `next/image` (host `s4.anilist.co`) เมื่อมี `poster_url`, ไม่มี → fallback color tile (`TILE_COLORS`) + ชื่อ EN ล่างซ้าย + gradient; title ใช้ `getDisplayTitle` (14/500, truncate)

- **`library` variant** (ใช้บน dashboard — Part 2c):
  - fav button top-right (26×26 circle `rgba(15,15,15,.55)`) สลับ **star (outline) ↔ sparkle `#D4537E`** — ตัว interactive จริง = `FavoriteButton` (§A4), MediaCard รับเป็น slot/prop
  - meta: title + `ProviderBadge` (swatch 8×8 **ไม่ fill**) + **StatusPill เมื่อ `showStatus`** + "ep X of Y" (tnum, เฉพาะ watching/on_hold) + progress bar 3px (**ซ่อนเมื่อ `plan_to_watch`**)
  - dropped → card opacity 0.78
  - **⚠️ ห้ามใส่ +1 ep pill** (`lib-plus`) — design โชว์ไว้ แต่ pill พึ่ง `incrementEpisodeAction` = **Phase 4**; เพิ่มเข้า library variant ตอน wire action จริงใน Phase 4
- **`search` variant** (ใช้ในผลค้นหา — Part 2b):
  - poster + ชื่อ EN overlay + meta: `"{type} · {year}"` + ปุ่ม **"Add"** (ghost sm, plus icon, `marginLeft: auto`; **override size** ด้วย className: `h-[22px] px-2 text-[11px]` เพราะ Button sm default = 28px แต่ design = 22px)
  - **ไม่มี** fav / progress / status pill / provider badge

**StatusPill** (สร้างเป็น sub-component, ตาม `library-screens.jsx#StatusPillV2`): `Badge` prop `dot` (ไม่ใช่ `withDot` — codebase API คือ `dot`), mapping `watching→success` · `completed→info` · `on_hold→warning` · `dropped→error` · `plan_to_watch→default`; label จาก `STATUS_LABEL` ใน `constants/userMedia.ts` (ไฟล์ใหม่ — ไม่ใช่ `constants/admin.ts` เพราะเป็น user-library concern):
```ts
// src/constants/userMedia.ts
export const STATUS_LABEL: Record<WatchStatus, string> = {
  watching:      'Watching',
  plan_to_watch: 'Plan to watch',
  on_hold:       'On hold',
  completed:     'Completed',
  dropped:       'Dropped',
};
```
ไม่ต้อง migrate — เป็นแค่ display label ไม่มีผลต่อ DB schema

**ProviderBadge** → แยกไฟล์ `components/media/ProviderBadge.tsx` (Part 2b/2c จะ reuse): รับ `name: string`, `color: string`; แสดง swatch 8×8 radius-2px + plain text; **ไม่ fill** (BRAND.md §10.5 "Provider")

- เพิ่ม MediaCard ทั้ง 2 variant เข้า `/dev/components` เพื่อ visual check (live optimistic flow จะถูก mount จริงบน dashboard ใน Part 2c)

### A3. Server Actions — สร้างไฟล์ `app/actions/userMedia.ts`

> Part 2b จะ **append** action เพิ่มในไฟล์เดียวกันนี้ — วางโครงให้ extend ง่าย

- `toggleFavoriteAction(userMediaId: string, next: boolean)` — `next` = ค่าที่ต้องการ; `createClient()` → `getUser()` (ไม่ login → `{ success: false, message: 'Unauthorized' }`) → `createUserMediaRepository(supabase)` → **`setFavorite(repo, userMediaId, next)`** (RLS กัน ownership อยู่แล้ว) → `{ success, message }`
- `removeFromLibraryAction(userMediaId: string)` — `getUser()` → `removeFromLibrary` → `revalidatePath('/dashboard')` → `{ success, message }`
- ทุก action: `getUser()` check + `console.error` ใน catch

### A4. `FavoriteButton` — `'use client'`, `components/media/` — ตั้งมาตรฐาน optimistic pattern

> **งานแรกของ optimistic (stakes ต่ำสุด ตาม DECISIONS.md)** — Phase 4 (+1 episode) จะ **reuse pattern นี้** เขียนให้ชัด/reusable

- `useOptimistic` + `toggleFavoriteAction(userMediaId, next)`; client คำนวณ `next = !isFavorite` แล้วส่งเข้า action (ไม่ต้องส่ง current ไป server); action fail → **rollback optimistic + toast error**
- visual: star (outline) ↔ sparkle `#D4537E`; fire sparkle **once/action** (scale 0.3→1.05→1, rotate -30→0, ~1100ms, BRAND.md §11); เคารพ `prefers-reduced-motion` (cut เหลือ 0–120ms fade ไม่มี transform)
- **Sparkle size**: `Sparkle.tsx` ปัจจุบันรับแค่ `className/style` — ต้องเพิ่ม `size?: number` prop → `style={{ width: size, height: size * 1.6 }}` (viewBox 100×160 → ratio 1.6:1); FavoriteButton ใช้ที่ `size={13}`
- **Star icon สีขาว**: ตั้ง `color: white` บน fav button element (`style={{ color: '#fff' }}`) → Star inherit ผ่าน `currentColor` — **ไม่ต้องเพิ่ม color prop บน Icon wrapper**

---

## เสร็จแล้ว

- unit test: `setFavorite` (true + false) — pure, mock repository
- `npm run lint` + `npm run typecheck` + `npm test` ผ่านทั้งหมด
- update `PROGRESS.md` (เช็ค Favorite + MediaCard) + `CHANGELOG.md`
- commit ตาม convention
- **เปิด PR เข้า `develop` เท่านั้น** (verify base branch ก่อนเปิด)
