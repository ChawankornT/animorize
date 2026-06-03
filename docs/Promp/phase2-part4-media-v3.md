# Phase 2 — Part 4: Media CRUD (Admin, Manual)

อ่าน CLAUDE.md, DECISIONS.md ก่อนเริ่ม

## เป้าหมาย

สร้าง Media CRUD สำหรับ admin จัดการด้วยมือ (ไม่รวม AniList import)
ต้องรองรับ business rules: movie/special = 1 episode, title priority, franchise assignment

## 1. Server Actions

สร้าง `src/app/actions/media.ts`:

**ดู `src/app/actions/franchise.ts` + `provider.ts` เป็น reference pattern ทั้งหมด**
(redirect + isRedirectError, parseResult helper, ActionState type, DeleteActionState)

```
createMediaAction(prevState, formData)
  → Zod validate ทุก field
  → แปลง: franchiseId '' → null, genres comma-split → array, totalEpisodes undefined → 0
  → createMedia usecase (usecase จัดการ movie/special = 1 episode เอง)
  → revalidatePath('/admin/media')
  → redirect('/admin/media')

updateMediaAction(prevState, formData)
  → ใช้ updateMediaSchema (extend mediaSchema + id field)
  → revalidatePath + redirect เหมือน create

deleteMediaAction(id: string, _: FormData): Promise<DeleteActionState>
  → ใช้ .bind(null, id) pattern เหมือน deleteFranchiseAction
  → catch FK constraint error (มี user_media อ้างอิง) → return user-friendly message
```

**สำคัญ:** try/catch ต้อง re-throw `isRedirectError` — ดู franchise.ts เป็นตัวอย่าง

**Zod schema** (import จาก `'zod/v4'`):
```typescript
import { z } from 'zod/v4';

const mediaSchema = z.object({
  franchiseId: z.string().uuid().optional().or(z.literal('')),
  mediaType: z.enum(['anime', 'series', 'movie', 'ova', 'special']),
  titleTh: z.string().optional().or(z.literal('')),
  titleEn: z.string().optional().or(z.literal('')),
  titleRomaji: z.string().optional().or(z.literal('')),
  synopsis: z.string().optional().or(z.literal('')),
  posterUrl: z.string().refine((v) => v === '' || isValidUrl(v), 'Must be a valid URL'),
  genres: z.string().optional(),           // comma-separated → action แปลงเป็น array
  totalEpisodes: z.coerce.number().int().min(0).optional(),
  seasonQuarter: z.coerce.number().int().min(1).max(4).optional(),
  seasonYear: z.coerce.number().int().min(1900).max(2100).optional(),
  airDateStart: z.string().optional().or(z.literal('')),   // date string
  airDateEnd: z.string().optional().or(z.literal('')),
  airingStatus: z.enum(['ongoing', 'finished', 'upcoming']).default('upcoming'),
  autoSync: z.coerce.boolean(),  // checkbox: "on" → true, absent → false
  sortOrder: z.coerce.number().int().default(0),
}).refine(
  (data) => data.titleTh || data.titleEn || data.titleRomaji,
  { message: 'At least one title is required' }
);

// update ต้อง extend เพิ่ม id (ดู franchise.ts)
const updateMediaSchema = mediaSchema.extend({ id: z.string().min(1) });
```

**Action State type — ต้องรองรับ rootError จาก refine:**
```typescript
export type MediaActionState = {
  message?: string;       // server/general errors
  rootError?: string;     // จาก refine (at least one title) — path = undefined
  errors?: {
    franchiseId?: string[];
    mediaType?: string[];
    titleTh?: string[];
    titleEn?: string[];
    titleRomaji?: string[];
    synopsis?: string[];
    posterUrl?: string[];
    genres?: string[];
    totalEpisodes?: string[];
    seasonQuarter?: string[];
    seasonYear?: string[];
    airDateStart?: string[];
    airDateEnd?: string[];
    airingStatus?: string[];
  };
};
```

**Data transforms ใน action (ก่อนส่ง usecase):**
```typescript
// franchiseId: '' → null (DB คาด uuid | null)
franchiseId: parsed.data.franchiseId || null,

// genres: comma-separated string → array
genres: parsed.data.genres?.split(',').map(s => s.trim()).filter(Boolean) ?? [],

// totalEpisodes: undefined → 0 (entity ต้องการ number, usecase จะ normalize movie/special → 1)
totalEpisodes: parsed.data.totalEpisodes ?? 0,
```

## 2. Admin Pages

### `/admin/media` — List page

**`src/app/admin/media/page.tsx`** (Server Component)
- รับ `searchParams` สำหรับ filter
- ดึง media ทั้งหมดจาก repository (filter ฝั่ง DB ถ้า searchParams มีค่า, ไม่มีก็ดึงทั้งหมด)
- แสดงเป็น table: display title, media_type badge, airing_status badge, total_episodes, franchise name (ถ้ามี)
- Filter bar: media_type dropdown + airing_status dropdown → ใช้ URL searchParams (`?type=anime&status=ongoing`) เพื่อให้เป็น Server Component ได้ (ไม่ต้อง client-side filter)
- Actions: Edit, Delete (ใช้ MediaDeleteButton)
- "Add media" button → link to `/admin/media/new`
- Empty state

### `/admin/media/new` — Create page

- Breadcrumb: Admin > Media > New
- ดึง franchises list สำหรับ dropdown
- render `<MediaForm franchises={franchises} />`

### `/admin/media/[id]/edit` — Edit page

- ดึง media by id, notFound() ถ้าไม่เจอ
- ดึง franchises list สำหรับ dropdown
- Breadcrumb: Admin > Media > {displayTitle} > Edit
- render `<MediaForm media={data} franchises={franchises} />`

## 3. Components

### `src/components/admin/MediaForm.tsx` ('use client')

- **ใช้ native form + `useActionState`** (ไม่ใช้ RHF — เหมือน pattern Franchise)
- **ยกเว้น:** media_type → totalEpisodes dynamic behavior ใช้ `useState` + `onChange` จัดการ client-side
- Fields:
  - franchise (Select — dropdown จาก franchises list, option "None")
  - media_type (Select — enum values)
  - title_th, title_en, title_romaji (Inputs)
  - synopsis (Textarea)
  - poster_url (Input)
  - genres (Input — comma-separated, hint: "Separate with commas"; edit mode: `defaultValue={media?.genres.join(', ') ?? ''}`)
  - total_episodes (Input type number) — **disabled + set 1 ถ้า media_type = movie/special**
  - season_quarter (Select — 1-4 หรือ empty)
  - season_year (Input type number)
  - air_date_start, air_date_end (Input type date)
  - airing_status (Select)
  - auto_sync (checkbox)
  - sort_order (Input type number)
- Dynamic behavior:
  - เมื่อเปลี่ยน media_type เป็น movie/special → set totalEpisodes=1 + disable field
  - เมื่อเปลี่ยนกลับ → enable field + restore ค่าเดิม (ถ้ามี)
- Form-level error: แสดง `state.rootError` เป็น alert ด้านบน form (แยกจาก `state.message`)
- Loading state ขณะ submit

### `src/components/admin/MediaDeleteButton.tsx` ('use client')

- **Pattern เดียวกับ `FranchiseDeleteButton.tsx`** (ดู src/components/admin/FranchiseDeleteButton.tsx)
- `useState` สำหรับ modal open/close
- `useActionState` กับ `deleteMediaAction.bind(null, id)`
- Wrap `DeleteConfirmModal` (reuse จาก Part 2)

### Filter bar component (optional)

- ถ้าแยก component: `MediaFilterBar.tsx` — เป็น form ที่ submit ไป URL searchParams
- หรือ inline ใน page ก็ได้ ขึ้นอยู่กับความซับซ้อน

---

**หลังเสร็จ:** run `npm run typecheck` + `npm run lint` ให้ผ่าน แล้วอัปเดท PROGRESS.md

**อย่าลืม:**
- สร้าง `src/app/admin/media/loading.tsx` + `error.tsx`
- `deleteMediaAction` ต้อง catch FK constraint error (media มี user_media อ้างอิง) → return `{ error: 'Cannot delete: this media has user entries' }` (ใช้ `DeleteActionState`)
- ใช้ `parseResult` helper เหมือน franchise.ts / provider.ts

**ห้าม:**
- ห้าม movie/special มี total_episodes ≠ 1 (enforce ใน usecase ไม่ใช่ action)
- ห้าม business logic ใน form/action — delegate ไป usecase + entity validation
- ห้าม delete โดยไม่ confirm (ใช้ MediaDeleteButton + DeleteConfirmModal)
- ห้ามใช้ `any` type
- ห้าม import `'zod'` — ใช้ `'zod/v4'` เท่านั้น
- ห้ามใช้ React Hook Form — ใช้ native form + useActionState
- ห้ามลืม revalidatePath + redirect หลัง create/update
- ห้ามลืม isRedirectError re-throw ใน catch block
