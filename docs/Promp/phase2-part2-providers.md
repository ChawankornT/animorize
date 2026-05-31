# Phase 2 — Part 2: Provider CRUD (Admin)

อ่าน CLAUDE.md, DECISIONS.md, BRAND.md (§3.4 Provider colors) ก่อนเริ่ม

## เป้าหมาย

สร้าง Provider CRUD ครบ flow: Server Actions → Admin UI pages
ใช้ domain/usecases + repository ที่สร้างไว้ใน Part 1

## 1. Server Actions

สร้าง `src/app/actions/provider.ts`:

```
'use server'

createProviderAction(prevState, formData)
  → Zod validate (name, slug, color, logoUrl?, baseUrl?)
  → createProvider usecase → repository.create()
  → revalidatePath('/admin/providers')
  → return { success, data?, message?, errors? }

updateProviderAction(prevState, formData)
  → Zod validate + id จาก formData
  → updateProvider usecase
  → revalidatePath + return

deleteProviderAction(formData)
  → id จาก formData
  → deleteProvider usecase
  → revalidatePath + redirect('/admin/providers')
```

**Zod schemas:**
```typescript
const createProviderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  baseUrl: z.string().url().optional().or(z.literal('')),
});
```

## 2. Admin Pages

### `/admin/providers` — List page

**`src/app/admin/providers/page.tsx`** (Server Component)
- ดึง providers จาก repository (ผ่าน usecase)
- แสดงเป็น table หรือ card list
- แต่ละ row: ชื่อ, slug, color swatch (8×8 ตาม BRAND.md §3.4), จำนวน media ที่ใช้
- Actions: Edit button, Delete button
- "Add provider" button link ไป `/admin/providers/new`
- Empty state ถ้าไม่มี providers

### `/admin/providers/new` — Create page

**`src/app/admin/providers/new/page.tsx`** (Server Component wrapper)
- Breadcrumb: Admin > Providers > New
- render `<ProviderForm />`

### `/admin/providers/[id]/edit` — Edit page

**`src/app/admin/providers/[id]/edit/page.tsx`** (Server Component)
- ดึง provider by id
- ถ้าไม่เจอ → notFound()
- Breadcrumb: Admin > Providers > {name} > Edit
- render `<ProviderForm provider={data} />`

## 3. Components

### `src/components/admin/ProviderForm.tsx` ('use client')

- React Hook Form + Zod resolver
- Fields: name (Input), slug (Input, auto-generate จาก name ถ้าว่าง), color (Input type text พร้อม color preview), logoUrl (Input), baseUrl (Input)
- Submit ใช้ `useActionState` กับ createProviderAction / updateProviderAction
- แสดง field-level errors จาก Zod
- แสดง server error message
- Loading state ขณะ submit

### `src/components/admin/DeleteConfirmModal.tsx` ('use client')

- Reusable modal สำหรับ confirm destructive actions
- Props: open, onClose, onConfirm, title, description
- ใช้ Modal component ที่มีอยู่แล้ว
- Confirm button เป็น destructive variant

## 4. Admin Layout — Sidebar Navigation

สร้าง `src/components/admin/AdminSidebar.tsx` (Server Component):
- Links: Dashboard, Providers, Franchises, Media, Sync logs, Settings
- Highlight active link
- ใช้ใน `src/app/admin/layout.tsx`

อัปเดท `src/app/admin/layout.tsx`:
- เพิ่ม sidebar (desktop) / hamburger (mobile — ทำแค่ responsive layout, hamburger interaction ทีหลัง Phase 5)
- Main content area ด้านขวา

## 5. Admin Dashboard placeholder

สร้าง `src/app/admin/page.tsx`:
- แสดง welcome message + stats cards (placeholder ค่า 0)
- Cards: Total providers, Total franchises, Total media, Recent syncs

---

**หลังเสร็จ:** run `npm run typecheck` + `npm run lint` ให้ผ่าน แล้วอัปเดท PROGRESS.md

**ห้าม:**
- ห้าม business logic ใน action — delegate ไป usecase
- ห้ามลืม confirmation dialog ก่อน delete (ตาม admin rules)
- ห้าม pink accent สำหรับ buttons (ตาม BRAND.md)
- ห้าม console.log — ใช้ console.error เฉพาะ error
- Provider color ต้องแสดงเป็น swatch เล็กเท่านั้น (max 8×8px ตาม BRAND.md §3.4)
