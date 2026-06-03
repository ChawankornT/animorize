# Phase 2 — Part 3: Franchise CRUD (Admin)

อ่าน CLAUDE.md, DECISIONS.md ก่อนเริ่ม

## เป้าหมาย

สร้าง Franchise CRUD ครบ flow เหมือน Provider
ใช้ domain/usecases + repository ที่สร้างไว้ใน Part 1

## 1. Server Actions

สร้าง `src/app/actions/franchise.ts`:

**ดู `src/app/actions/provider.ts` เป็น reference pattern ทั้งหมด**

```
createFranchiseAction(prevState, formData)
  → Zod validate (titleTh?, titleEn?, titleRomaji?, posterUrl?, synopsis?)
  → ต้องมีอย่างน้อย 1 title (refine validation)
  → createFranchise usecase
  → revalidatePath('/admin/franchises')

updateFranchiseAction(prevState, formData)
  → ใช้ updateFranchiseSchema (extend franchiseSchema + id field)

deleteFranchiseAction(id: string, _: FormData): Promise<DeleteActionState>
  → ใช้ .bind(null, id) pattern เหมือน deleteProviderAction (ดู provider.ts:138)
  → catch FK constraint error → return user-friendly message
```

**Zod schema** (import จาก `'zod/v4'`):
```typescript
import { z } from 'zod/v4';

const franchiseSchema = z.object({
  titleTh: z.string().optional().or(z.literal('')),
  titleEn: z.string().optional().or(z.literal('')),
  titleRomaji: z.string().optional().or(z.literal('')),
  posterUrl: z.string().refine((v) => v === '' || isValidUrl(v), 'Must be a valid URL'),
  synopsis: z.string().optional().or(z.literal('')),
}).refine(
  (data) => data.titleTh || data.titleEn || data.titleRomaji,
  { message: 'At least one title is required' }
);

// update ต้อง extend เพิ่ม id (ดู provider.ts:44)
const updateFranchiseSchema = franchiseSchema.extend({ id: z.string().min(1) });
```

**Action State type — ต้องรองรับ rootError จาก refine:**
```typescript
export type FranchiseActionState = {
  message?: string;       // server/general errors
  rootError?: string;     // จาก refine (at least one title) — path = undefined
  errors?: {
    titleTh?: string[];
    titleEn?: string[];
    titleRomaji?: string[];
    posterUrl?: string[];
    synopsis?: string[];
  };
};
```
- refine error ไม่มี path → map เข้า `rootError`
- FranchiseForm แสดง `state.rootError` เป็น form-level alert (แยกจาก `state.message`)

## 2. Admin Pages

### `/admin/franchises` — List page

**`src/app/admin/franchises/page.tsx`** (Server Component)
- ดึง franchises จาก repository
- แสดงเป็น table: display title (ใช้ getDisplayTitle), created date
- ~~จำนวน media ภายใต้ franchise~~ — skip ไปก่อน ค่อยเพิ่มหลัง Media CRUD เสร็จ (Part 4)
- Search box (optional — ถ้าทำได้ใน scope นี้ ดี, ถ้าไม่ก็ข้าม)
- Actions: Edit, Delete
- "Add franchise" button
- Empty state

### `/admin/franchises/new` — Create page

- Breadcrumb: Admin > Franchises > New
- render `<FranchiseForm />`

### `/admin/franchises/[id]/edit` — Edit page

- ดึง franchise by id, notFound() ถ้าไม่เจอ
- Breadcrumb: Admin > Franchises > {displayTitle} > Edit
- render `<FranchiseForm franchise={data} />`

## 3. Components

### `src/components/admin/FranchiseForm.tsx` ('use client')

- **ใช้ native form + `useActionState`** (ไม่ใช้ RHF — เหมือน pattern Provider)
- Fields:
  - title_th (Input) — label "Title (Thai)"
  - title_en (Input) — label "Title (English)"
  - title_romaji (Input) — label "Title (Romaji)"
  - poster_url (Input) — label "Poster URL"
  - synopsis (Textarea)
- Form-level error: แสดง `state.rootError` เป็น alert ด้านบน form (แยกจาก `state.message`)
- Submit → createFranchiseAction / updateFranchiseAction
- Loading state ขณะ submit

### `src/components/admin/FranchiseDeleteButton.tsx` ('use client')

- **Pattern เดียวกับ `ProviderDeleteButton.tsx`** (ดู src/components/admin/ProviderDeleteButton.tsx)
- `useState` สำหรับ modal open/close
- `useActionState` กับ `deleteFranchiseAction.bind(null, id)`
- Wrap `DeleteConfirmModal` (reuse จาก Part 2)

---

**หลังเสร็จ:** run `npm run typecheck` + `npm run lint` ให้ผ่าน แล้วอัปเดท PROGRESS.md

**อย่าลืม:**
- สร้าง `src/app/admin/franchises/loading.tsx` + `error.tsx`
- `deleteFranchiseAction` ต้อง catch FK constraint error (franchise มี media อยู่) → return `{ error: 'Cannot delete: this franchise has media entries' }` (ใช้ `DeleteActionState` ไม่ใช่ `FranchiseActionState`)

**ห้าม:**
- ห้าม business logic ใน action
- ห้าม delete โดยไม่ confirm
- ห้ามบังคับ title ทุกภาษา — ต้องมีอย่างน้อย 1
- ห้ามใช้ `any` type
- ห้าม import `'zod'` — ใช้ `'zod/v4'` เท่านั้น
- ห้ามใช้ React Hook Form — ใช้ native form + useActionState
