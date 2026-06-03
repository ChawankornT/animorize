# Phase 2 — Part 6: Media-Provider Assignment + Sync Logs + Settings

อ่าน CLAUDE.md, DECISIONS.md ก่อนเริ่ม

## เป้าหมาย

1. เชื่อม media กับ provider (many-to-many ผ่าน media_providers)
2. Sync log viewer + retry
3. System settings (auto-sync toggle)

## 1. Domain + Repository

### Entity: `MediaProvider.ts`

```typescript
// Fields: id, mediaId, providerId, audio (sub/dub), baseUrl, createdAt
// + providerName, providerColor สำหรับ display (join)
```

SupabaseMediaProviderRepository.findByMediaId() ต้อง JOIN กับ providers table:
```typescript
// select('*, providers(name, color)')
// แล้ว map เป็น providerName, providerColor ใน mapper
```

### Entity extension: `SyncLog` — เพิ่ม field สำหรับ display

SyncLog entity ปัจจุบันมีแค่ `mediaId` — ต้องเพิ่ม optional fields จาก JOIN:
```typescript
// เพิ่มใน SyncLog entity:
mediaTitle?: string;  // display title จาก media (title_th > title_en > title_romaji)
```

SupabaseSyncLogRepository.findAll() ต้อง JOIN กับ media table:
```typescript
// select('*, media(title_th, title_en, title_romaji)')
// แล้ว map เป็น mediaTitle ใน mapper
```

### Interface: `IMediaProviderRepository.ts`

```typescript
interface IMediaProviderRepository {
  findByMediaId(mediaId: string): Promise<MediaProvider[]>;
  create(data: CreateMediaProviderInput): Promise<MediaProvider>;
  delete(id: string): Promise<void>;
}
```

**หมายเหตุ:** ไม่มี `update()` — UI spec มีแค่ Add + Remove (ไม่มี edit button)

### Use Cases

```
AssignProvider.ts       — validate → repository.create() (เช็ค unique constraint)
RemoveProvider.ts       — repository.delete()
ListMediaProviders.ts   — repository.findByMediaId()
ListSyncLogs.ts         — syncLogRepository.findAll() (wrapper เหมือน ListProviders/ListFranchises/ListMedia)
```

**หมายเหตุ:** ไม่มี UpdateMediaProvider usecase — ไม่มี edit UI

### Repository Factory

เพิ่มใน `src/repositories/index.ts`:
```typescript
export function createMediaProviderRepository(supabase: SupabaseDb) { ... }
```

## 2. Server Actions

### `src/app/actions/mediaProvider.ts`

```
assignProviderAction(prevState, formData)
  → Zod validate: mediaId, providerId, audio (sub/dub), baseUrl?
  → assignProvider usecase
  → revalidatePath(`/admin/media/${mediaId}`)

removeProviderAction(id: string, prevState, formData)
  → id จาก .bind(null, id)
  → mediaId จาก hidden input ใน formData (สำหรับ revalidatePath)
  → removeProvider usecase
  → revalidatePath(`/admin/media/${mediaId}`)
```

**สำคัญ:**
- `removeProviderAction` signature จริงเป็น `(id: string, prevState: ..., formData: FormData)` — **ต่างจาก** `deleteXxxAction` เดิมที่ใช้ `(id: string, _: FormData)` เพียง 2 args เพราะ `removeProviderAction` ต้องอ่าน `mediaId` จาก formData จริงๆ
- หลัง `.bind(null, id)` กลายเป็น `(prevState, formData)` ที่ useActionState ต้องการ — ไม่ต้อง cast `as unknown as`
- mediaId ส่งผ่าน hidden `<input name="mediaId" value={mediaId} />` ใน form

## 3. Media Detail Page (Admin)

### `/admin/media/[id]` — Detail page

**`src/app/admin/media/[id]/page.tsx`** (Server Component)
- ดึง media by id + media_providers (with provider info) + providers ทั้งหมด (สำหรับ dropdown)
- แสดง:
  - Media info card (poster, titles, type badge, status badge, episodes, synopsis)
  - **Providers section:** list ของ assigned providers (provider name + color swatch + audio badge + base_url)
    - ปุ่ม "Remove" แต่ละ row → `<RemoveProviderButton />` (confirm ก่อน)
    - ปุ่ม "Add provider" → render `<AssignProviderForm providers={providers} mediaId={id} />`
  - **Sync history section:** recent sync_logs สำหรับ media นี้ (limit 10)
    - แสดง: result badge (success/failed), error message, synced_at
    - ไม่มี retry จาก detail page (retry อยู่ที่ /admin/sync-logs เท่านั้น)
  - Actions: Edit button (ไป /admin/media/[id]/edit), Delete button

**`src/app/admin/media/[id]/loading.tsx`** + **`error.tsx`**
- ตาม pattern เดียวกับ route groups อื่น

### `src/components/admin/AssignProviderForm.tsx` ('use client')

- **Props:** `providers: Provider[]`, `mediaId: string`
- ใช้ `<Select>` จาก `@/components/ui/Select` (มี label + error built-in)
- ใช้ `<Input>` จาก `@/components/ui/Input` (มี label + hint + error built-in)
- Fields:
  - `<Select label="Provider" name="providerId" error={...}>` — dropdown จาก props.providers
  - `<Select label="Audio" name="audio" defaultValue="sub">` — sub / dub
  - `<Input label="Base URL" type="url" name="baseUrl" hint="Optional" error={...} />`
- `<input type="hidden" name="mediaId" value={mediaId} />` — ส่ง mediaId ให้ action
- Submit ใช้ `useActionState` กับ `assignProviderAction`
- เช็ค unique constraint: ถ้า provider+audio ซ้ำ → แสดง error จาก server action state

### `src/components/admin/RemoveProviderButton.tsx` ('use client')

- Props: `id: string`, `mediaId: string`, `providerName: string`
- ใช้ `useActionState` กับ `removeProviderAction.bind(null, id)`
- **ใช้ `<Modal>` โดยตรง — ไม่ใช้ `DeleteConfirmModal`** เพราะต้องการ hidden `<input name="mediaId" value={mediaId} />` ใน form ซึ่ง `DeleteConfirmModal` ไม่รองรับ
- Form ภายใน Modal มี:
  - `<input type="hidden" name="mediaId" value={mediaId} />`
  - Cancel button + Remove (submit) button

### อัปเดท `/admin/media/page.tsx` (list)

เปลี่ยน action cell ของแต่ละ row:
- "Edit" link (`/admin/media/${id}/edit`) → **"View" link (`/admin/media/${id}`)** เพื่อให้ไป detail page ก่อน
- ปุ่ม Edit จะอยู่ใน detail page แทน

## 4. Sync Logs Page

### `/admin/sync-logs` — List page

**`src/app/admin/sync-logs/page.tsx`** (Server Component)
- ดึง sync_logs ผ่าน `listSyncLogs` usecase (ล่าสุดก่อน, limit 50)
- **ต้อง JOIN กับ media table** เพื่อได้ media title (ใช้ SyncLog.mediaTitle)
- แสดงเป็น table:
  - Media title (display title — จาก mediaTitle field)
  - Result badge (success = green, failed = red)
  - Error message (ถ้ามี)
  - Synced at (formatted date)
  - Action: `<RetrySyncButton />` (เฉพาะ failed rows) → retrySyncAction จาก Part 5
- **Retry ทำทีละรายการ** (ตาม admin rules — ห้าม bulk retry)
- Empty state ถ้าไม่มี logs

### `src/components/admin/RetrySyncButton.tsx` ('use client')

- Props: `mediaId: string`, `mediaTitle: string`
- ใช้ `useActionState` กับ `retrySyncAction` โดยตรง (ไม่ใช้ .bind — เพราะ retrySyncAction จาก Part 5 รับ mediaId ผ่าน formData)
- ส่ง mediaId ผ่าน hidden `<input name="mediaId" value={mediaId} />`
- แสดง loading state ขณะ retry (pending จาก useActionState)
- แสดง success/error message หลัง retry จาก state

## 5. System Settings Page

### `/admin/settings` — Settings page

**`src/app/admin/settings/page.tsx`** (Server Component wrapper)
- ดึง system_settings
- render `<SystemSettingsForm settings={data} />`

### Server Action: `src/app/actions/systemSettings.ts`

```
updateSystemSettingsAction(prevState, formData)
  → Zod validate: autoSyncEnabled (boolean)
  → updateSystemSettings usecase
  → revalidatePath('/admin/settings')
```

### `src/components/admin/SystemSettingsForm.tsx` ('use client')

- Toggle/checkbox: "Auto-sync enabled"
  - Description: "When enabled, ongoing media will be synced with AniList daily"
  - ใช้ raw `<input type="checkbox">` — ไม่มี Checkbox UI component ในระบบ (Input component ออกแบบสำหรับ text เท่านั้น)
- Save button
- ใช้ `useActionState` กับ `updateSystemSettingsAction`
- Success/error message เมื่อ save

---

**หลังเสร็จ:** run `npm run typecheck` + `npm run lint` ให้ผ่าน แล้วอัปเดท PROGRESS.md

**อย่าลืม:**
- สร้าง loading.tsx + error.tsx สำหรับ: `/admin/media/[id]/`, `/admin/sync-logs/`, `/admin/settings/`
- เพิ่ม `createMediaProviderRepository` ใน `src/repositories/index.ts`
- อัปเดท `/admin/media/page.tsx` — เปลี่ยน row link เป็น "View" → `/admin/media/${id}`

**ห้าม:**
- ห้าม bulk retry sync — ทีละรายการเท่านั้น
- ห้าม delete media-provider โดยไม่ confirm
- ห้ามลืมเช็ค unique constraint (media_id + provider_id + audio)
- ห้าม sync overwrite: title_th, synopsis, poster_url ที่ admin แก้ไว้
- ห้ามใช้ `any` type
- ห้าม business logic ใน components/actions
- ห้าม import `'zod'` — ใช้ `'zod/v4'` เท่านั้น
- ห้ามใช้ React Hook Form — ใช้ native form + useActionState
