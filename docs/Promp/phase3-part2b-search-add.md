# Phase 3 — Part 2b (v5 · 2/3 · reconciled) — Search + Add-to-library modal

> **Baseline: Foundation + Part 2a merged บน `develop`** — `app/actions/userMedia.ts` (มี favorite/remove แล้ว, **append** ต่อ), `components/media/MediaCard.tsx` (มี `search` variant แล้ว — ใช้เลย, อย่าสร้างใหม่), `setFavorite`
> ส่ง **flow: search → add to library** (Search page + autocomplete + Add modal)
>
> **เปลี่ยนจากฉบับก่อน (post-review reconcile):** (1) sanitize search → ย้ายเป็น shared helper + เพิ่ม `_` (ILIKE single-char wildcard) + **backport ให้ franchise repo ใช้ helper เดียวกัน** (franchise เดิมไม่ sanitize) · (2) เพิ่ม **§B3-pre** setup TanStack Query + บังคับบันทึก DECISIONS/PROGRESS · (3) ระบุ factory ของ `listMediaProviders` ชัด (`createMediaProviderRepository`) · (4) design URL **ไม่ฝังในไฟล์** — ทวงถามเจ้าของตอนเริ่ม · (5) audio label แก้ความหมาย: `sub` = ต้นฉบับ (ญี่ปุ่น/อังกฤษ) + ซับไทย, `dub` = เสียงไทย (value ยัง `sub|dub`, override label hardcode ของ design)

---

## ⛔ Branch rule — อ่านก่อนทำอะไรทั้งสิ้น

- `feature/*` / `fix/*` → เปิด PR เข้า **`develop` เท่านั้น**
- **ห้ามเปิด PR เข้า `main` เด็ดขาด** (เคยพลาด — ครั้งนี้ห้ามหลุดอีก)
- `main` update เฉพาะ release PR `develop → main` ที่เจ้าของอนุมัติเองตอนปิด phase
- **verify base branch = `develop` ก่อนเปิด PR ทุกครั้ง**; ไม่ชัด → ถาม

## ก่อนแตะ UI: fetch design ก่อนเสมอ (บังคับ)

1. **Design handoff URL ไม่ฝังในไฟล์นี้โดยตั้งใจ** — export เก่าหมดอายุระหว่าง review/revise (`export ใหม่ = ลิงก์ใหม่`)
   → **ก่อนแตะ UI (B3/B4): หยุดแล้วทวงถาม Claude Design handoff URL ล่าสุดจากเจ้าของก่อน** รอจนได้ลิงก์
   → **ห้าม implement B3/B4 ด้วยลิงก์เก่า/ลิงก์ที่เดาเอง** — domain/action (B1/B2) ทำไปก่อนได้ ไม่พึ่ง design
2. ได้ URL → `fetch` → แตก bundle → README → chats → source ที่ part นี้ใช้ (ดู **Design refs**)
3. recreate ตาม spec ตรง ๆ — **อย่าประดิษฐ์ UI เอง**; `BRAND.md` (repo) = token SoT
4. screen/component ที่ต้องใช้ไม่มีใน bundle → หยุด แจ้งเจ้าของ

## กฎที่ต้องถือ (CLAUDE.md + DECISIONS.md)

- Server Components default; `'use client'` เฉพาะที่ต้อง interactivity จริง (search box, modal)
- Mutation → Server Action → `{ success, message, errors? }`; **read action (search) return ข้อมูลตรง** ไม่ใช่ mutation contract
- Supabase: `createClient()` จาก `@/lib/supabase/server` (**ไม่ใช่ `createServerClient`**) ส่งเข้า factory; **ห้าม service-role**
- **`getUser()` = แหล่งเดียวของ userId**; **ห้ามรับ userId จาก client**; ห้าม `getSession()`; อย่า copy admin action pattern (global table ไม่มี getUser)
- Zod = ตรวจ shape ที่ขอบ action; business invariant = domain (ห้าม implement rule ซ้ำ)
- client data layer: Server Actions + `useOptimistic` — **ห้าม wire TanStack Query** ยกเว้น **search autocomplete** (dedup + stale-while-revalidate); `queryFn` เรียก `searchMediaAction(q)` ตรง ๆ (Server Action เป็น async function ธรรมดา) — setup ดู **§B3-pre**
- `getDisplayTitle` (EN > Romaji > TH) ทุกที่ที่โชว์ชื่อ
- `loading.tsx` (skeleton) + `error.tsx` ทุก route group ที่เพิ่ม (เพิ่ม `(main)/search`)
- ห้าม `any` · ห้าม `console.log` (ใช้ `console.error` ฝั่ง server) · ห้าม inline style (ยกเว้น dynamic value) · ห้ามแก้ `types/database.ts` · ห้าม import Supabase ใน `domain/` · **ห้ามยิง AniList จาก client**
- Icon: `lucide-react` ผ่าน `Icon` wrapper, strokeWidth 1.5
- Naming: action camelCase + `Action`; hook `useXxx`; component `PascalCase`

## Foundation + Part 2a พร้อมใช้ (อย่าแก้)

- entity/repo/usecase ตาม Foundation (ดู Part 2a) — `addToLibrary` (dup→error), `listMediaProviders(repo, mediaId)` usecase **มีอยู่แล้ว**, `IMediaRepository` + `listMedia` usecase + `createMediaRepository`
- `IFranchiseRepository.findAll({ search? })` = pattern อ้างอิงสำหรับ §B1 — **แต่ impl เดิมยังไม่ sanitize** → §B1 จะ backport ให้
- **จาก Part 2a:** `MediaCard` (`search` variant), `app/actions/userMedia.ts` (favorite/remove — append ต่อ), `setFavorite`

---

## งาน (Part 2b)

### B1. domain — search option + thin usecase + shared sanitize (backport franchise)

**ขยาย `findAll` ด้วย `search?` (อย่าเพิ่ม method แยก — consistent กับ `IFranchiseRepository.findAll`):**

```ts
// interfaces/IMediaRepository.ts
findAll(options?: {
  franchiseId?: string;
  mediaType?: MediaType;
  airingStatus?: AiringStatus;
  search?: string;       // ← เพิ่ม
}): Promise<Media[]>;
```

**เพิ่ม `search?: string` ใน options type ของ `listMedia` usecase ด้วย** (ไม่ใช่แค่ interface) — ไม่งั้น `listMedia(repo, { search })` type error

**shared sanitize helper (define ครั้งเดียว ใช้ทั้ง media + franchise — "consistent" แบบ enforce ไม่ใช่ก็อปวาง):**

```ts
// src/lib/supabase/sanitizeSearchTerm.ts
/**
 * Strip PostgREST .or() structural chars + ILIKE wildcards from a raw user term.
 * NOT a security boundary — .or() ผูกกับ .from(table) เดียว pivot ตารางอื่นไม่ได้;
 * helper นี้แค่กัน raw input ทำ filter string พัง. คงตัวอักษรไทย/Unicode ไว้
 * (strip เฉพาะ ASCII โครงสร้าง — ห้าม harden เป็น alphanumeric-only).
 */
export function sanitizeSearchTerm(input: string): string {
  // % _ = ILIKE wildcards · , ; ( ) = .or() delimiter/grouping · * = PostgREST glob · \ = escape
  return input.replace(/[%_,;()*\\]/g, '').trim();
}
```

> ⚠️ regex รวม `_` (single-char wildcard) แล้ว — `_` เป็น ASCII literal ตัวเดียว ไม่ match Unicode range จึง **ไม่กระทบ `title_th` ภาษาไทย**

**ใน `SupabaseMediaRepository.findAll`** เมื่อมี `search` → sanitize ผ่าน helper ก่อนต่อ `.or()`:

```ts
import { sanitizeSearchTerm } from '@/lib/supabase/sanitizeSearchTerm';
// ...
if (options?.search) {
  const q = sanitizeSearchTerm(options.search);
  if (q) {
    query = query.or(
      `title_en.ilike.%${q}%,title_romaji.ilike.%${q}%,title_th.ilike.%${q}%`
    );
  }
}
```

**backport `SupabaseFranchiseRepository.findAll`** — เดิม interpolate term ตรง ๆ (ไม่ sanitize) → เปลี่ยนให้ใช้ helper ตัวเดียวกัน:

```ts
import { sanitizeSearchTerm } from '@/lib/supabase/sanitizeSearchTerm';
// ...
if (options?.search) {
  const q = sanitizeSearchTerm(options.search);
  if (q) {
    query = query.or(
      `title_th.ilike.%${q}%,title_en.ilike.%${q}%,title_romaji.ilike.%${q}%`
    );
  }
}
```

> note ใน CHANGELOG ว่า harden franchise search ด้วย (ไม่ใช่แค่เพิ่ม media)
> (optional) autocomplete อาจ `.limit(20)` กัน payload ใหญ่

**thin usecase สำหรับ change-provider** (convention action→usecase→repo; repo มี `updateProvider` แต่ยังไม่มี usecase wrap):

```ts
// src/domain/usecases/UpdateLibraryProvider.ts
import type { IUserMediaRepository, UpdateProviderInput } from '@/repositories/interfaces/IUserMediaRepository';
import type { UserMedia } from '@/domain/entities/UserMedia';

export async function updateLibraryProvider(
  repository: IUserMediaRepository,
  id: string,
  input: UpdateProviderInput,   // { providerId: string|null; audio: AudioType; customUrl: string|null }
): Promise<UserMedia> {
  return repository.updateProvider(id, input);
}
```

### B2. Server Actions — **append** ใน `app/actions/userMedia.ts`

- `searchMediaAction(query: string): Promise<Media[]>` — **read, return `Media[]` ตรง ๆ** ไม่ใช่ `{ success }`; `createClient()` (session) → `createMediaRepository` → `listMedia(repo, { search: query })`
  - **authenticated เท่านั้น** (RLS `media` = `auth.uid() is not null`); route `(main)/search` อยู่หลัง login → session client พอ; ไม่ใช่ public/anon
- `addToLibraryAction(input)`:
  - Zod parse `{ mediaId: uuid, providerId?: uuid, audio?: 'sub'|'dub', customUrl?: url }` — **ทุกตัวยกเว้น `mediaId` optional** (ตรง `AddToLibraryInput`; ไม่เลือก provider/audio → ใช้ default ฝั่ง DB)
  - `getUser()` → build `{ userId: user.id, ...parsed }` (**userId จาก session ไม่ใช่ input**) → `addToLibrary` → `revalidatePath('/dashboard')`; dup → `{ success: false, message }`
- `changeLibraryProviderAction(userMediaId, providerId, audio, customUrl?)` — **⚠️ ห้ามตั้งชื่อ `updateProviderAction`** (ชนกับ admin CRUD ใน `actions/provider.ts`); Zod `{ providerId: uuid|null, audio: 'sub'|'dub', customUrl?: url }` (**audio required ที่นี่** ตาม `UpdateProviderInput`); `getUser()` → `updateLibraryProvider` (§B1) → repo; revalidate
- ทุก action ที่เป็น mutation: `getUser()` check (ไม่ login → `{ success: false, message: 'Unauthorized' }`), `console.error` ใน catch

### B3-pre. TanStack Query — setup + บันทึก (ก่อนเขียน search box)

> ⚠️ `@tanstack/react-query@^5` **เจ้าของ install เองนอก flow แล้ว** — **อย่ารัน `npm install` ซ้ำ** แค่ตรวจว่ามีใน `package.json` ก่อนเขียน import; ถ้าไม่มี → หยุด แจ้งเจ้าของ

1. **QueryProvider** — `components/providers/QueryProvider.tsx`, `'use client'`:
   - `const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } } }))`
     (stable ข้าม render ผ่าน `useState` — **ห้าม** `new QueryClient()` ที่ module scope, จะ share ข้าม request บน server)
   - wrap `{children}` ด้วย `<QueryClientProvider client={client}>`
2. **mount แบบ scoped (ตาม decision "lean — เฉพาะ search"):** สร้าง `app/(main)/search/layout.tsx` (Server Component) wrap `{children}` ด้วย `<QueryProvider>` — boundary อยู่แค่ search subtree
   - **ห้าม** mount ที่ root `app/layout.tsx` หรือ `(main)/layout.tsx` — กว้างเกิน decision; search เป็น consumer เดียวใน Phase 3
3. **บันทึก DECISIONS.md (บังคับ — กฎ "ห้าม install ใหม่โดยไม่บันทึก"):**
   - **Package Change Log** (ตาราง ท้ายไฟล์) เพิ่ม row:
     `| 2026-06-01 | @tanstack/react-query | ^5 | Server state เฉพาะ search autocomplete (dedup + stale-while-revalidate); adopt ตามที่ §"Client Data Layer" predict ไว้ — ยังไม่ wire ที่อื่น |`
   - **§"Client Data Layer: Server Actions + useOptimistic"** (Pre-Phase 3 Foundation) — append บรรทัด update ใต้ section (อย่าลบของเดิม):
     `> **Update 2026-06-01 (Part 2b):** adopted สำหรับ search autocomplete ตามแผน — scoped ที่ (main)/search/layout.tsx เท่านั้น; mutation อื่นยังเป็น Server Actions + useOptimistic`
4. **PROGRESS.md** — ใน Recent Changes ของ entry Part 2b ระบุ "+ @tanstack/react-query (search only)"

### B3. Search — `(main)/search`

- Server Component shell (`page.tsx`) + `'use client'` search box component
- autocomplete via TanStack Query (`useQuery`): `queryFn: () => searchMediaAction(q)`, debounce ~300ms, `enabled: q.length >= 2`
- **Library cross-reference แบบ efficient (ไม่ N+1):** ใน Server Component fetch `findByUserId(userId)` **1 ครั้ง** → สร้าง `Set<string>` ของ `mediaId` ใน library → ส่งลง client → ใช้ `inLibrarySet.has(result.id)` แยกกลุ่ม "In your library" / "Add to library"; **อย่าเรียก `findByUserAndMedia` ต่อ result**
- result grid = `MediaCard` **`search` variant** (จาก Part 2a) — ปุ่ม Add เปิด modal (§B4); ชื่อด้วย `getDisplayTitle`
- เพิ่ม `(main)/search/loading.tsx` (skeleton) + `(main)/search/error.tsx`
- **Design refs:** `screens/screens.jsx#SearchAutocomplete` + `#SearchResults` + `screens/styles.css` (`.search-bar-row`, `.search-meta`, ⌘K, keyboard hints)
- **⚠️ scope (consistent กับ decision option-1 — keep Phase 3 lean):** ผลค้นหามี search input → autocomplete → result grid → Add เท่านั้น; **ตัด/ยังไม่ wire**: filter chips บน search bar ("All types / Any year / Status / Genre") + grid/list toggle (default = grid) → defer Phase 5/6 (catalog browse). ไม่ render เป็นปุ่มตาย. ถ้าเจ้าของอยากได้ตัวไหนใน Phase 3 → ทักก่อน

### B4. Add to library — modal (`screens/modal.jsx`)

recreate ตาม `screens/modal.jsx` (+ `uploads/add-to-library-modal.design-prompt.md` ใน bundle) — states: **default / url-invalid / submitting / dup-toast × light·dark**

- เปิดจากปุ่ม "Add to library" (search result เรื่องที่ยังไม่อยู่ใน library)
- **Provider data pre-fetch ที่ Server Component ไม่ใช่ใน modal:** parent (search page) เรียก `listMediaProviders(repo, mediaId)` → ส่ง `providers` เป็น prop ลง modal (กัน waterfall); usecase มีอยู่แล้ว
  - **⚠️ repo ที่ส่งเข้า `listMediaProviders` คือ `createMediaProviderRepository(supabase)`** (usecase ใช้ `IMediaProviderRepository`) — **ไม่ใช่** `createMediaRepository`
- **layout (ตาม modal.jsx):**
  - `Modal` — radius 16px, backdrop `bg-overlay` (**no blur**), width `min(420px, calc(100% - 32px))`, BRAND §10.10
  - header: poster swatch (`media.color`) + EN title + meta `romaji · type · year` + TH title
  - `Field "Provider"` → `Select` (`SearchableSelect` ถ้า provider เยอะ); options = provider ของเรื่องนี้; **default = provider ตัวแรก** (pre-selected, ไม่ใช่ "เลือกก่อน")
  - `Field "Audio"` → segmented control (`AudioSegmented`) แสดง **เฉพาะ audio ที่ provider ที่เลือกรองรับ**; แต่ละปุ่มมี `Badge`. **value ยัง `sub | dub` ตาม `AudioType` (2 ค่า — ไม่แตะ schema)** แต่ความหมาย/label คือ:
    - `sub` = **เสียงต้นฉบับ (ญี่ปุ่น/อังกฤษ) + ซับไทย** → label **"original · thai sub"**
    - `dub` = **เสียงไทย** → label **"thai · dub"**
    - **⚠️ override label mapping ของ design** — `modal.jsx#audioOptsFromProvider` hardcode `sub → "japanese · sub"` ไว้ (mock เป็น anime ล้วน) **อย่าก็อปตามตรง**; เรื่อง non-anime (series/movie/documentary) ต้นฉบับอาจเป็นอังกฤษ จึงใช้ "original" แทนการ fix เป็น "japanese"
    - **ไม่มี field ภาษาต้นฉบับต่อเรื่อง** ใน `media` (มีแค่ `titles {en,romaji,th}` ตาม AniList contract) → label เลือก jp vs en รายเรื่องไม่ได้ จึงใช้ "original" ครอบทั้งคู่ (ถ้าจะให้ระบุภาษาจริงต่อเรื่อง = เพิ่มคอลัมน์ + migration → คนละ scope, defer)
    - **note:** `add-to-library-modal.design-prompt.md` (เก่า) เขียน 3 ปุ่ม (japanese·sub / english·sub / thai·dub) — ทิ้ง, ยึด 2 ค่าตามนี้
  - `Field "Custom URL"` → `TextInput` placeholder `https://...`, hint **"leave empty to use the provider's default link"**, error state = `alert-circle` icon + **"That doesn't look like a valid URL."**
  - actions: `Button secondary "Cancel"` + `Button primary "Add to library"` (**primary = ink ห้าม pink**); submitting → spinner + "Adding…" + disable ทุก field
- **provider/audio optional ที่ data layer** ตาม `AddToLibraryInput` — แต่ UI default ให้ provider ตัวแรกเสมอ; provider ว่างจริง (admin ยังไม่ assign media_providers) → ส่ง `providerId: null`
- submit → `addToLibraryAction` → **dup → Toast** (ไม่ใช่ inline): `Toast variant="error"` title **"Couldn't add to library"** desc **"Already in your library."**
- effective URL = `custom_url ?? media_providers.base_url` (keyed by `provider_id + audio`) → `getEffectiveUrl` ทำให้แล้ว
- voice: sentence case, **ไม่มี `!` ไม่มี emoji**; **อย่าแก้ DS หรือ screens 1–4 เดิม**

---

## เสร็จแล้ว

- unit test: `listMedia` search option (mapper/usecase ส่ง `search` ถึง repo) + `updateLibraryProvider` — pure, mock repository
  - (sanitize เป็น Supabase-layer helper — ไม่อยู่ใน pure domain test; backport franchise ไม่เพิ่ม test ใหม่ แค่ note CHANGELOG)
- `npm run lint` + `npm run typecheck` + `npm test` ผ่านทั้งหมด
- update `PROGRESS.md` (เช็ค Search + Add-to-library, + `@tanstack/react-query` search-only) + `CHANGELOG.md` (รวม franchise sanitize backport) + `DECISIONS.md` (§B3-pre ข้อ 3)
- commit ตาม convention
- **เปิด PR เข้า `develop` เท่านั้น** (verify base branch ก่อนเปิด)
