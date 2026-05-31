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

deleteProviderAction(id: string, _formData: FormData) → Promise<{ error?: string }>
  → deleteProvider usecase
  → revalidatePath('/admin/providers') + redirect('/admin/providers')
  → catch FK error → return { error: 'Cannot delete: provider is assigned to media entries' }
  → ใช้กับ .bind(null, id) ใน ProviderDeleteButton (ดู pattern ด้านล่าง)
```

**Zod schemas** (import จาก `'zod/v4'` — ดู pattern ใน `src/app/(auth)/actions.ts`):
```typescript
import { z } from 'zod/v4';

const createProviderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  baseUrl: z.string().url().optional().or(z.literal('')),
});
```

**Delete + Modal pattern** (ดูหัวข้อ 3 สำหรับ component):
```typescript
// Server Action — รับ id ผ่าน .bind(), ไม่ต้องอ่านจาก formData
export async function deleteProviderAction(
  id: string,
  _formData: FormData,
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const repo = createProviderRepository(supabase);
    await deleteProvider(repo, id);
    revalidatePath('/admin/providers');
    redirect('/admin/providers');
  } catch (err) {
    if (isRedirectError(err)) throw err;         // re-throw Next.js redirect
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('foreign key') || msg.includes('violates')) {
      return { error: 'Cannot delete: provider is assigned to media entries' };
    }
    return { error: 'Failed to delete provider' };
  }
}
```

## 2. Admin Pages

### `/admin/providers` — List page

**`src/app/admin/providers/page.tsx`** (Server Component)
- ดึง providers จาก repository (ผ่าน usecase)
- แสดงเป็น table หรือ card list
- แต่ละ row: ชื่อ, slug, color swatch (8×8 ตาม BRAND.md §3.4)
- ~~จำนวน media ที่ใช้~~ — skip ไปก่อน ค่อยเพิ่มหลัง Media CRUD เสร็จ (Part 4)
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

- **ใช้ native form + `useActionState`** เหมือน pattern ใน `src/app/(auth)/actions.ts` — ไม่ใช้ React Hook Form
- Fields: name (Input), slug (Input, auto-generate จาก name ด้วย onChange ถ้า slug ว่าง), color (Input type text + swatch `<div>` ข้างขวาแสดงสี, ขนาดเล็ก), logoUrl (Input), baseUrl (Input)
- Submit ใช้ `useActionState` กับ createProviderAction / updateProviderAction
- Validation ฝั่ง server-only ผ่าน Zod — แสดง field-level errors จาก `state.errors`
- แสดง server error message จาก `state.message`
- Loading state จาก `pending` (parameter ตัวที่ 3 ของ useActionState)

### `src/components/admin/ProviderDeleteButton.tsx` ('use client')

Pattern สำหรับ delete + modal + useActionState:
```typescript
'use client';
import { useState } from 'react';
import { useActionState } from 'react';
import { deleteProviderAction } from '@/app/actions/provider';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export function ProviderDeleteButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = deleteProviderAction.bind(null, id);
  const [state, action, pending] = useActionState(boundAction, {});

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>Delete</Button>
      <DeleteConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        action={action}
        pending={pending}
        error={state.error}
        title={`Delete "${name}"?`}
        description="This action cannot be undone."
      />
    </>
  );
}
```

### `src/components/admin/DeleteConfirmModal.tsx` ('use client')

- Reusable modal สำหรับ confirm destructive actions
- Props: `open`, `onClose`, `action` (form action), `pending`, `error?`, `title`, `description`
- ภายใน: `<form action={action}>` + submit button (destructive variant) + แสดง `error` ถ้ามี
- ใช้ Modal component ที่มีอยู่แล้ว

## 4. Admin Layout — Sidebar Navigation

สร้าง `src/components/admin/AdminSidebar.tsx` **('use client')**:
- Links: Dashboard, Providers, Franchises, Media, Import, Sync logs, Settings
- Highlight active link ด้วย `usePathname()` จาก `next/navigation`
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

**อย่าลืม:**
- สร้าง `src/app/admin/providers/loading.tsx` + `src/app/admin/providers/error.tsx` (ตาม CLAUDE.md rule: ทุก route group)
- pattern เหมือน `src/app/admin/loading.tsx` + `error.tsx` ที่มีอยู่แล้ว

**ห้าม:**
- ห้าม business logic ใน action — delegate ไป usecase
- ห้ามลืม confirmation dialog ก่อน delete (ตาม admin rules)
- ห้าม pink accent สำหรับ buttons (ตาม BRAND.md)
- ห้าม console.log — ใช้ console.error เฉพาะ error
- ห้าม import `'zod'` — ใช้ `'zod/v4'` เท่านั้น (ดู auth actions)
- ห้ามใช้ React Hook Form — ใช้ native form + useActionState
- Provider color ต้องแสดงเป็น swatch เล็กเท่านั้น (max 8×8px ตาม BRAND.md §3.4)
