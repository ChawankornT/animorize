# Phase 2 — Part 4: Media CRUD (Admin, Manual)

อ่าน CLAUDE.md, DECISIONS.md ก่อนเริ่ม

## เป้าหมาย

สร้าง Media CRUD สำหรับ admin จัดการด้วยมือ (ไม่รวม AniList import)
ต้องรองรับ business rules: movie/special = 1 episode, title priority, franchise assignment

## 1. Server Actions

สร้าง `src/app/actions/media.ts`:

```
createMediaAction(prevState, formData)
  → Zod validate ทุก field
  → enforce: movie/special → totalEpisodes = 1
  → createMedia usecase
  → revalidatePath('/admin/media')

updateMediaAction(prevState, formData)
deleteMediaAction(formData)
```

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
  posterUrl: z.string().url().optional().or(z.literal('')),
  genres: z.string().optional(),           // comma-separated, parse เป็น array
  totalEpisodes: z.coerce.number().int().min(1).optional(),
  seasonQuarter: z.coerce.number().int().min(1).max(4).optional(),
  seasonYear: z.coerce.number().int().min(1900).max(2100).optional(),
  airDateStart: z.string().optional().or(z.literal('')),   // date string
  airDateEnd: z.string().optional().or(z.literal('')),
  airingStatus: z.enum(['ongoing', 'finished', 'upcoming']).default('upcoming'),
  autoSync: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
}).refine(
  (data) => data.titleTh || data.titleEn || data.titleRomaji,
  { message: 'At least one title is required' }
);
```

## 2. Admin Pages

### `/admin/media` — List page

**`src/app/admin/media/page.tsx`** (Server Component)
- ดึง media ทั้งหมดจาก repository
- แสดงเป็น table: display title, media_type badge, airing_status badge, total_episodes, franchise name (ถ้ามี)
- Filter bar (optional): media_type dropdown, airing_status dropdown
- Actions: Edit, Delete
- "Add media" button
- Empty state

### `/admin/media/new` — Create page

- Breadcrumb: Admin > Media > New
- render `<MediaForm franchises={franchises} />`
- ดึง franchises list สำหรับ dropdown

### `/admin/media/[id]/edit` — Edit page

- ดึง media by id, notFound() ถ้าไม่เจอ
- ดึง franchises list สำหรับ dropdown
- Breadcrumb: Admin > Media > {displayTitle} > Edit
- render `<MediaForm media={data} franchises={franchises} />`

## 3. Components

### `src/components/admin/MediaForm.tsx` ('use client')

- **ใช้ native form + `useActionState`** (ไม่ใช้ RHF)
- **ยกเว้น:** media_type → totalEpisodes dynamic behavior ใช้ `useState` + `onChange` จัดการ client-side
- Fields:
  - franchise (Select — dropdown จาก franchises list, option "None")
  - media_type (Select — enum values)
  - title_th, title_en, title_romaji (Inputs)
  - synopsis (Textarea)
  - poster_url (Input)
  - genres (Input — comma-separated, hint: "Separate with commas")
  - total_episodes (Input type number) — **disabled + set 1 ถ้า media_type = movie/special**
  - season_quarter (Select — 1-4 หรือ empty)
  - season_year (Input type number)
  - air_date_start, air_date_end (Input type date)
  - airing_status (Select)
  - auto_sync (checkbox)
  - sort_order (Input type number)
- Dynamic behavior:
  - เมื่อเปลี่ยน media_type เป็น movie/special → set totalEpisodes=1 + disable field
  - เมื่อเปลี่ยนกลับ → enable field
- Form-level error ถ้าไม่มี title สักอัน
- Loading state ขณะ submit

---

**หลังเสร็จ:** run `npm run typecheck` + `npm run lint` ให้ผ่าน แล้วอัปเดท PROGRESS.md

**อย่าลืม:**
- สร้าง `src/app/admin/media/loading.tsx` + `error.tsx`
- `deleteMediaAction` ต้อง catch FK constraint error → return user-friendly message

**ห้าม:**
- ห้าม movie/special มี total_episodes ≠ 1
- ห้าม business logic ใน form/action — delegate ไป usecase + entity validation
- ห้าม delete โดยไม่ confirm
- ห้ามใช้ `any` type
- ห้าม import `'zod'` — ใช้ `'zod/v4'` เท่านั้น
- ห้ามใช้ React Hook Form — ใช้ native form + useActionState
- ห้ามลืม revalidatePath หลัง mutation
