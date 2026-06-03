# Phase 2 — Part 5: AniList Import + Preview

อ่าน CLAUDE.md, DECISIONS.md (Sync Strategy Detail + Fields Mapping), skill: anilist-import ก่อนเริ่ม

## เป้าหมาย

สร้าง AniList import flow: ใส่ ID → fetch → preview → admin แก้ไข → save
**ห้าม call AniList จาก client side**

## 1. AniList API Client

สร้าง `src/lib/anilist/api.ts`:

```typescript
// fetchAnilistMedia(id: number): Promise<AnilistMediaResponse>
// POST to https://graphql.anilist.co
// ใช้ GraphQL query จาก DECISIONS.md
```

สร้าง `src/lib/anilist/types.ts`:
```typescript
// AniList GraphQL response types
// AnilistMediaResponse — raw response
```

สร้าง `src/lib/anilist/mapper.ts`:
```typescript
// mapAnilistToMedia(response: AnilistMediaResponse): CreateMediaInput
// ตาม fields mapping ใน DECISIONS.md:
//   title.romaji     → titleRomaji
//   title.english    → titleEn
//   coverImage.large → posterUrl
//   description      → synopsis (strip HTML tags)
//   episodes         → totalEpisodes
//   season           → seasonQuarter (WINTER=1, SPRING=2, SUMMER=3, FALL=4)
//   seasonYear       → seasonYear
//   startDate        → airDateStart (combine year/month/day → Date)
//   endDate          → airDateEnd
//   status           → airingStatus (RELEASING=ongoing, FINISHED=finished, NOT_YET=upcoming)
//   genres           → genres[]
```

## 2. Domain Use Cases

### `ImportMedia.ts`

```typescript
/**
 * Import media จาก AniList
 * 1. เช็คว่า anilistId ซ้ำไหม (ถ้าซ้ำ return error)
 * 2. Validate mapped data
 * 3. Create media
 * 4. Create sync_log (result: success)
 * 5. ถ้า error → create sync_log (result: failed, error_message)
 */
```

### `RetrySync.ts`

```typescript
/**
 * Retry sync สำหรับ media ที่ fail
 * 1. ดึง media by id → เอา anilistId
 * 2. Fetch AniList ใหม่
 * 3. Update media (ไม่ overwrite: titleTh, synopsis, posterUrl ที่ admin แก้ไว้)
 * 4. Create sync_log
 */
```

## 3. Server Actions

### `src/app/actions/anilist.ts`

```
'use server'
import { z } from 'zod/v4';

fetchAnilistPreviewAction(prevState, formData)
  → Zod validate: anilistId (number, > 0)
  → เช็คว่า anilistId ซ้ำใน DB ไหม
  → call fetchAnilistMedia() — server side
  → mapAnilistToMedia()
  → return { success: true, data: previewData }
  → ถ้า error → return { success: false, message }

saveImportAction(prevState, formData)
  → Zod validate ทุก field (เหมือน mediaSchema + anilistId + franchiseId)
  → admin อาจแก้ไข title_th, synopsis ก่อน save
  → importMedia usecase → repository.create() + syncLog.create()
  → revalidatePath('/admin/media')
  → return { success, data }

retrySyncAction(formData)
  → mediaId จาก formData
  → retrySync usecase
  → revalidatePath('/admin/sync-logs')
```

## 4. Admin Pages

### `/admin/import` — Import page

**`src/app/admin/import/page.tsx`** (Server Component wrapper)
- Breadcrumb: Admin > Import
- render `<ImportPanel />`

### `src/components/admin/ImportPanel.tsx` ('use client')

**Step 1: ใส่ AniList ID**
- Input field สำหรับ AniList ID (number)
- "Fetch" button → call fetchAnilistPreviewAction
- Loading state ขณะ fetch
- Error message ถ้า fetch fail หรือ ID ซ้ำ

**Step 2: Preview + Edit**
- แสดง preview data ที่ map มาแล้ว:
  - poster_url (ถ้ามี) แสดงเป็น thumbnail
  - title_romaji, title_en (read-only แสดงเป็น text)
  - title_th (Input — editable, ให้ admin ใส่เอง)
  - synopsis (Textarea — editable)
  - media_type, total_episodes, season, airing_status, genres (แสดงเป็น text หรือ badge)
  - franchise (Select dropdown — ให้ admin เลือก franchise ที่จะผูก)
- "Save" button → call saveImportAction
- "Cancel" button → reset กลับ Step 1

**Step 3: Success**
- แสดง success message + link ไปหน้า media ที่สร้าง

## 5. AniList GraphQL Query

```graphql
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english }
    coverImage { large }
    description(asHtml: false)
    genres
    episodes
    season
    seasonYear
    startDate { year month day }
    endDate { year month day }
    status
  }
}
```

---

**หลังเสร็จ:** run `npm run typecheck` + `npm run lint` ให้ผ่าน แล้วอัปเดท PROGRESS.md

**อย่าลืม:**
- สร้าง `src/app/admin/import/loading.tsx` + `error.tsx`

**ห้าม:**
- ห้าม call AniList จาก client — ต้องผ่าน Server Action เท่านั้น
- ห้าม auto-save โดยไม่ preview
- ห้าม overwrite title_th, synopsis, poster_url ที่ admin แก้ไว้แล้ว (ใน retry sync)
- ห้ามลืม sync_log ทุกครั้งที่ import/retry
- ห้าม import ซ้ำ anilistId เดียวกัน (เช็คก่อน)
- ห้าม import `'zod'` — ใช้ `'zod/v4'` เท่านั้น
