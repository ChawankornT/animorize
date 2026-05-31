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
// + provider name, color สำหรับ display (join)
```

### Interface: `IMediaProviderRepository.ts`

```typescript
interface IMediaProviderRepository {
  findByMediaId(mediaId: string): Promise<MediaProvider[]>;
  create(data: CreateMediaProviderInput): Promise<MediaProvider>;
  update(id: string, data: UpdateMediaProviderInput): Promise<MediaProvider>;
  delete(id: string): Promise<void>;
}
```

### Use Cases

```
AssignProvider.ts   — validate → repository.create() (เช็ค unique constraint)
RemoveProvider.ts   — repository.delete()
UpdateProvider.ts   — repository.update()
ListMediaProviders.ts — repository.findByMediaId()
```

## 2. Server Actions

### `src/app/actions/mediaProvider.ts`

```
assignProviderAction(prevState, formData)
  → Zod validate: mediaId, providerId, audio (sub/dub), baseUrl?
  → assignProvider usecase
  → revalidatePath

removeProviderAction(formData)
  → id จาก formData
  → removeProvider usecase
  → revalidatePath
```

## 3. Media Detail Page (Admin)

### `/admin/media/[id]` — Detail page

**`src/app/admin/media/[id]/page.tsx`** (Server Component)
- ดึง media by id + media_providers (with provider info)
- แสดง:
  - Media info card (poster, titles, type badge, status badge, episodes, synopsis)
  - **Providers section:** list ของ assigned providers (provider name + color swatch + audio badge + base_url)
    - ปุ่ม "Remove" แต่ละ row (confirm ก่อน)
    - ปุ่ม "Add provider" → render `<AssignProviderForm />`
  - **Sync history section:** recent sync_logs สำหรับ media นี้
  - Actions: Edit button (ไป /admin/media/[id]/edit), Delete button

### `src/components/admin/AssignProviderForm.tsx` ('use client')

- Select: provider (dropdown จาก available providers)
- Select: audio (sub / dub)
- Input: base_url (optional)
- Submit → assignProviderAction
- เช็ค unique constraint: ถ้า provider+audio ซ้ำ → แสดง error

## 4. Sync Logs Page

### `/admin/sync-logs` — List page

**`src/app/admin/sync-logs/page.tsx`** (Server Component)
- ดึง sync_logs ทั้งหมด (ล่าสุดก่อน, limit 50)
- แสดงเป็น table:
  - Media title (display title)
  - Result badge (success = green, failed = red)
  - Error message (ถ้ามี)
  - Synced at (formatted date)
  - Action: Retry button (เฉพาะ failed rows) → retrySyncAction จาก Part 5
- **Retry ทำทีละรายการ** (ตาม admin rules — ห้าม bulk retry)
- Empty state ถ้าไม่มี logs

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
- Save button
- Success toast/message เมื่อ save สำเร็จ

## 6. อัปเดท Admin Sidebar

เพิ่ม links ที่ยังไม่มี:
- Sync logs → `/admin/sync-logs`
- Settings → `/admin/settings`
- Import → `/admin/import`

---

**หลังเสร็จ:** run `npm run typecheck` + `npm run lint` ให้ผ่าน แล้วอัปเดท PROGRESS.md

**ห้าม:**
- ห้าม bulk retry sync — ทีละรายการเท่านั้น
- ห้าม delete media-provider โดยไม่ confirm
- ห้ามลืมเช็ค unique constraint (media_id + provider_id + audio)
- ห้าม sync overwrite: title_th, synopsis, poster_url ที่ admin แก้ไว้
- ห้ามใช้ `any` type
- ห้าม business logic ใน components/actions
