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
// ใช้ GraphQL query จาก section 5
// Timeout: 10 วินาที (AbortController) — ถ้า timeout → throw descriptive error
// ถ้า AniList return errors → throw พร้อม error message จาก response
```

สร้าง `src/lib/anilist/types.ts`:
```typescript
// AnilistMediaResponse — raw GraphQL response shape
// AnilistTitle { romaji?: string; english?: string }
// AnilistDate { year?: number; month?: number; day?: number }
// AnilistCoverImage { large?: string }
// AnilistMedia — full media object ใน response
```

สร้าง `src/lib/anilist/mapper.ts`:
```typescript
// mapAnilistToMedia(response: AnilistMediaResponse): CreateMediaInput & { anilistId: number }
// ตาม fields mapping ใน DECISIONS.md:
//   title.romaji     → titleRomaji
//   title.english    → titleEn
//   coverImage.large → posterUrl
//   description      → synopsis (strip HTML tags ด้วย regex)
//   episodes         → totalEpisodes (ถ้า null → 0)
//   season           → seasonQuarter (WINTER=1, SPRING=2, SUMMER=3, FALL=4, null → undefined)
//   seasonYear       → seasonYear
//   startDate        → airDateStart (combine year/month/day → 'YYYY-MM-DD' string, ถ้า incomplete → undefined)
//   endDate          → airDateEnd
//   status           → airingStatus (RELEASING=ongoing, FINISHED=finished, NOT_YET_RELEASED=upcoming)
//   genres           → genres[]
//   id               → anilistId
//
// *** เพิ่ม 2 fields ที่ AniList ไม่มี: ***
//   mediaType: 'anime'    — AniList query ใช้ type: ANIME เสมอ
//   autoSync: true        — import ใหม่ควร sync by default
```

## 2. Domain Use Cases

### `ImportMedia.ts`

```typescript
/**
 * Import media จาก AniList (รับ mapped data เข้ามา — ไม่ fetch เอง)
 * @param mediaRepo - IMediaRepository
 * @param syncLogRepo - ISyncLogRepository  ← ต้องรับทั้ง 2 repos
 * @param input - CreateMediaInput & { anilistId: number }
 *
 * 1. เช็คว่า anilistId ซ้ำไหม (mediaRepo.findByAnilistId) — ถ้าซ้ำ throw error
 * 2. Create media (mediaRepo.create)
 * 3. Create sync_log (result: 'success', syncLogRepo.create)
 * 4. Return created media
 * 5. ถ้า error ใน step 2-3 → create sync_log (result: 'failed', error_message) แล้ว re-throw
 */
```

### `RetrySync.ts`

```typescript
/**
 * Retry sync สำหรับ media ที่ fail (รับ mapped data เข้ามา — ไม่ fetch เอง)
 *
 * ⚠️ fetch AniList อยู่ใน action layer ไม่ใช่ usecase
 * usecase นี้รับ pre-mapped update data เท่านั้น
 *
 * @param mediaRepo - IMediaRepository
 * @param syncLogRepo - ISyncLogRepository
 * @param mediaId - string
 * @param updateInput - Partial<UpdateMediaInput> (mapped data จาก AniList)
 *
 * 1. Filter out protected fields: ไม่ overwrite titleTh, synopsis, posterUrl ที่ admin แก้ไว้
 * 2. Update media (mediaRepo.update)
 * 3. Create sync_log (result: 'success')
 * 4. ถ้า error → create sync_log (result: 'failed') แล้ว re-throw
 */
```

## 3. Server Actions

### `src/app/actions/anilist.ts`

**ดู `src/app/actions/media.ts` + `franchise.ts` เป็น reference pattern**

```
'use server'
import { z } from 'zod/v4';
```

**Action State types:**
```typescript
export type AnilistPreviewState = {
  message?: string;                                    // error message
  data?: CreateMediaInput & { anilistId: number };     // มี data = success, ไม่มี = initial/fail
};

export type SaveImportState = {
  message?: string;
  savedMediaId?: string;    // Step 3 ใช้สร้าง link ไปยัง /admin/media/[id]/edit
};

export type RetrySyncState = {
  message?: string;
  success?: boolean;
};
```

**Actions:**
```
fetchAnilistPreviewAction(_prev: AnilistPreviewState, formData: FormData): Promise<AnilistPreviewState>
  → Zod validate: anilistId (z.coerce.number().int().positive())
  → เช็คว่า anilistId ซ้ำใน DB ไหม (mediaRepo.findByAnilistId)
  → ถ้าซ้ำ → return { message: 'Media with this AniList ID already exists' }
  → call fetchAnilistMedia() — server side only
  → mapAnilistToMedia()
  → return { data: mappedData }
  → ถ้า fetch error (timeout, network, AniList error) → return { message: descriptive error }
  → ไม่ redirect, ไม่ revalidate — return state เท่านั้น

saveImportAction(_prev: SaveImportState, formData: FormData): Promise<SaveImportState>
  → Zod validate ทุก field:
    - anilistId (number, required)
    - franchiseId (uuid, optional)
    - titleTh, synopsis (editable fields จาก form)
    - + hidden fields: titleRomaji, titleEn, posterUrl, totalEpisodes, airingStatus, genres,
      seasonQuarter, seasonYear, airDateStart, airDateEnd, mediaType, autoSync
  → importMedia usecase (mediaRepo + syncLogRepo)
  → revalidatePath('/admin/media')
  → *** ไม่ redirect *** — return { savedMediaId: media.id } เพื่อให้ component แสดง Step 3
  → ถ้า error → return { message }

retrySyncAction(_prev: RetrySyncState, formData: FormData): Promise<RetrySyncState>
  → Zod validate: mediaId (z.string().uuid())
  → mediaRepo.findById(mediaId) → เอา anilistId
  → ถ้าไม่มี anilistId → return { message: 'No AniList ID linked' }
  → fetchAnilistMedia(anilistId)        ← fetch อยู่ที่ action layer (ไม่ใช่ usecase)
  → mapAnilistToMedia(response)
  → retrySync usecase(mediaRepo, syncLogRepo, mediaId, mappedUpdateInput)
  → revalidatePath('/admin/media')
  → return { success: true, message: 'Sync completed' }
  → ถ้า error → return { message }
  → *** ไม่ redirect, ไม่ต้อง handle isRedirectError ***
```

## 4. Admin Pages

### `/admin/import` — Import page

**`src/app/admin/import/page.tsx`** (Server Component wrapper)
- Breadcrumb: Admin > Import
- Fetch franchise list (franchiseRepo.findAll) → pass เป็น prop ให้ ImportPanel
- render `<ImportPanel franchises={franchises} />`

**`src/app/admin/import/loading.tsx`** — Skeleton
**`src/app/admin/import/error.tsx`** — Error boundary

### `src/components/admin/ImportPanel.tsx` ('use client')

**ใช้ native form + `useActionState`** (ไม่ใช้ RHF — เหมือน pattern MediaForm)

**Props:**
```typescript
type ImportPanelProps = {
  franchises: Franchise[];   // สำหรับ franchise dropdown ใน Step 2
};
```

**Step 1: ใส่ AniList ID**
- `useActionState` กับ `fetchAnilistPreviewAction`
- Input field สำหรับ AniList ID (type number)
- "Fetch" button → submit form → action จะ return preview data ใน state
- Loading state จาก `pending` (parameter ตัวที่ 3 ของ useActionState)
- Error message จาก `state.message`
- ถ้า `state.data` มีค่า → แสดง Step 2

**Step 2: Preview + Edit**
- *** ใช้ form ใหม่ *** กับ `useActionState` + `saveImportAction`
- แสดง preview data:
  - poster_url (ถ้ามี) แสดงเป็น `<img>` thumbnail
  - title_romaji, title_en (read-only แสดงเป็น text + **`<input type="hidden">`**)
  - title_th (Input — editable, ให้ admin ใส่เอง)
  - synopsis (Textarea — editable, pre-filled จาก AniList)
  - media_type, total_episodes, season, airing_status, genres (แสดงเป็น text/badge + **`<input type="hidden">`**)
  - franchise (Select dropdown จาก `props.franchises` — ให้ admin เลือก)
- **Hidden inputs สำหรับ read-only data ที่ต้องส่งกลับ server:**
  `anilistId, titleRomaji, titleEn, posterUrl, totalEpisodes, airingStatus, genres, seasonQuarter, seasonYear, airDateStart, airDateEnd, mediaType, autoSync`
- "Save" button → submit form
- "Cancel" button → reset state กลับ Step 1 (clear preview data)

**Step 3: Success**
- แสดงเมื่อ saveImportState.savedMediaId มีค่า
- Success message + link ไปหน้า `/admin/media/[savedMediaId]/edit`
- "Import Another" button → reset ทั้งหมดกลับ Step 1

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

**ห้าม:**
- ห้าม call AniList จาก client — ต้องผ่าน Server Action เท่านั้น
- ห้าม auto-save โดยไม่ preview
- ห้าม overwrite title_th, synopsis, poster_url ที่ admin แก้ไว้แล้ว (ใน retry sync)
- ห้ามลืม sync_log ทุกครั้งที่ import/retry
- ห้าม import ซ้ำ anilistId เดียวกัน (เช็คก่อน)
- ห้าม import `'zod'` — ใช้ `'zod/v4'` เท่านั้น
- ห้ามมี side effects (fetch, DB call) ใน domain/usecases/ — fetch AniList ทำใน action layer เท่านั้น
- ห้าม redirect ใน saveImportAction / retrySyncAction — return state เท่านั้น
