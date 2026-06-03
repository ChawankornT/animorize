# Phase 2 — Part 3: Franchise CRUD (Admin)

อ่าน CLAUDE.md, DECISIONS.md ก่อนเริ่ม

## เป้าหมาย

สร้าง Franchise CRUD ครบ flow เหมือน Provider
ใช้ domain/usecases + repository ที่สร้างไว้ใน Part 1

## 1. Server Actions

สร้าง `src/app/actions/franchise.ts`:

```
createFranchiseAction(prevState, formData)
  → Zod validate (titleTh?, titleEn?, titleRomaji?, posterUrl?, synopsis?)
  → ต้องมีอย่างน้อย 1 title (refine validation)
  → createFranchise usecase
  → revalidatePath('/admin/franchises')

updateFranchiseAction(prevState, formData)
deleteFranchiseAction(formData)
```

**Zod schema:**
```typescript
const franchiseSchema = z.object({
  titleTh: z.string().optional().or(z.literal('')),
  titleEn: z.string().optional().or(z.literal('')),
  titleRomaji: z.string().optional().or(z.literal('')),
  posterUrl: z.string().url().optional().or(z.literal('')),
  synopsis: z.string().optional().or(z.literal('')),
}).refine(
  (data) => data.titleTh || data.titleEn || data.titleRomaji,
  { message: 'At least one title is required' }
);
```

## 2. Admin Pages

### `/admin/franchises` — List page

**`src/app/admin/franchises/page.tsx`** (Server Component)
- ดึง franchises จาก repository
- แสดงเป็น table: display title (ใช้ getDisplayTitle), จำนวน media ภายใต้ franchise, created date
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

- React Hook Form + Zod resolver
- Fields:
  - title_th (Input) — label "Title (Thai)"
  - title_en (Input) — label "Title (English)"
  - title_romaji (Input) — label "Title (Romaji)"
  - poster_url (Input) — label "Poster URL"
  - synopsis (Textarea)
- Form-level error ถ้าไม่มี title สักอัน
- Submit → createFranchiseAction / updateFranchiseAction
- Loading state ขณะ submit

### Reuse `DeleteConfirmModal` จาก Part 2

---

**หลังเสร็จ:** run `npm run typecheck` + `npm run lint` ให้ผ่าน แล้วอัปเดท PROGRESS.md

**ห้าม:**
- ห้าม business logic ใน action
- ห้าม delete โดยไม่ confirm
- ห้ามบังคับ title ทุกภาษา — ต้องมีอย่างน้อย 1
- ห้ามใช้ `any` type
