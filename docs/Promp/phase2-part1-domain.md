# Phase 2 — Part 1: Domain Entities + Repository Interfaces

อ่าน CLAUDE.md, DECISIONS.md, schema/ folder ก่อนเริ่ม

## เป้าหมาย

สร้าง domain layer (entities + usecases) และ repository layer (interfaces + Supabase implementation) สำหรับ Provider, Franchise, Media, SyncLog, SystemSettings

## 1. Domain Entities

สร้างใน `src/domain/entities/` — pure TypeScript types + business validation functions
**ห้าม import Supabase, Next.js, React**

### `Provider.ts`

```typescript
// Type สำหรับ Provider entity
// Fields: id, name, slug, color, logoUrl, baseUrl, createdAt, updatedAt
// Validation function: validateProvider(data) → ตรวจ name ไม่ว่าง, color เป็น hex format
```

### `Franchise.ts`

```typescript
// Fields: id, titleTh, titleEn, titleRomaji, posterUrl, synopsis, createdAt, updatedAt
// Validation: ต้องมีอย่างน้อย 1 title (th/en/romaji)
// Helper: getDisplayTitle(franchise) → title_th > title_en > title_romaji
```

### `Media.ts`

```typescript
// Fields: ตาม schema — id, franchiseId, anilistId, mediaType, titles(th/en/romaji),
//         synopsis, posterUrl, genres[], totalEpisodes, seasonQuarter, seasonYear,
//         airDateStart, airDateEnd, airingStatus, autoSync, sortOrder, createdAt, updatedAt
// Types: MediaType enum, AiringStatus enum
// Validation: ต้องมีอย่างน้อย 1 title, movie/special → totalEpisodes = 1
// Helper: getDisplayTitle(media), isTrackable(media) → movie/special ไม่ track episodes
```

### `SyncLog.ts`

```typescript
// Fields: id, mediaId, result (success/failed), errorMessage, syncedAt
// Type: SyncResult enum
```

### `SystemSettings.ts`

```typescript
// Fields: autoSyncEnabled, updatedAt
```

> ใช้ camelCase ใน entities (ไม่ใช่ snake_case ของ DB) — repository ทำ mapping

## 2. Domain Use Cases

สร้างใน `src/domain/usecases/` — pure functions ที่รับ repository interface เป็น parameter

### Provider usecases

```
CreateProvider.ts   — validate input → repository.create()
UpdateProvider.ts   — validate input → repository.update()
DeleteProvider.ts   — repository.delete()
ListProviders.ts    — repository.findAll()
GetProvider.ts      — repository.findById()
```

### Franchise usecases

```
CreateFranchise.ts  — validate (ต้องมีอย่างน้อย 1 title) → repository.create()
UpdateFranchise.ts  — validate → repository.update()
DeleteFranchise.ts  — repository.delete()
ListFranchises.ts   — repository.findAll() (optional: search by title)
GetFranchise.ts     — repository.findById()
```

### Media usecases

```
CreateMedia.ts      — validate (title, movie/special=1ep) → repository.create()
UpdateMedia.ts      — validate → repository.update()
DeleteMedia.ts      — repository.delete()
ListMedia.ts        — repository.findAll() (filter: franchiseId, mediaType, airingStatus)
GetMedia.ts         — repository.findById()
```

### System Settings usecases

```
GetSystemSettings.ts    — repository.get()
UpdateSystemSettings.ts — repository.update()
```

**ทุก usecase ต้องมี JSDoc อธิบาย input/output/business rule**

## 3. Repository Interfaces

สร้างใน `src/repositories/interfaces/` — TypeScript interfaces กำหนด contract

### `IProviderRepository.ts`

```typescript
interface IProviderRepository {
  findAll(): Promise<Provider[]>;
  findById(id: string): Promise<Provider | null>;
  findBySlug(slug: string): Promise<Provider | null>;
  create(data: CreateProviderInput): Promise<Provider>;
  update(id: string, data: UpdateProviderInput): Promise<Provider>;
  delete(id: string): Promise<void>;
}
```

### `IFranchiseRepository.ts`

```typescript
interface IFranchiseRepository {
  findAll(options?: { search?: string }): Promise<Franchise[]>;
  findById(id: string): Promise<Franchise | null>;
  create(data: CreateFranchiseInput): Promise<Franchise>;
  update(id: string, data: UpdateFranchiseInput): Promise<Franchise>;
  delete(id: string): Promise<void>;
}
```

### `IMediaRepository.ts`

```typescript
interface IMediaRepository {
  findAll(options?: { franchiseId?: string; mediaType?: MediaType; airingStatus?: AiringStatus }): Promise<Media[]>;
  findById(id: string): Promise<Media | null>;
  findByAnilistId(anilistId: number): Promise<Media | null>;
  create(data: CreateMediaInput): Promise<Media>;
  update(id: string, data: UpdateMediaInput): Promise<Media>;
  delete(id: string): Promise<void>;
}
```

### `ISyncLogRepository.ts`

```typescript
interface ISyncLogRepository {
  findAll(options?: { mediaId?: string; limit?: number }): Promise<SyncLog[]>;
  create(data: CreateSyncLogInput): Promise<SyncLog>;
}
```

### `ISystemSettingsRepository.ts`

```typescript
interface ISystemSettingsRepository {
  get(): Promise<SystemSettings>;
  update(data: UpdateSystemSettingsInput): Promise<SystemSettings>;
}
```

## 4. Supabase Repository Implementations

สร้างใน `src/repositories/supabase/` — implement interfaces ด้วย Supabase client

### ทุก repository ต้อง:
- รับ `SupabaseDb` (จาก `@/lib/supabase/types`) ใน constructor — ไม่ใช้ `SupabaseClient<Database>` โดยตรง เพราะ `Database` type ของเราขาด `Relationships` / `Views` / `Functions` ที่ postgrest-js `GenericSchema` require ทำให้ Schema resolve เป็น `never`
- Map snake_case (DB) ↔ camelCase (entity) ทั้ง input และ output
- `try/catch` ทุก method + throw descriptive error
- Return domain entity type (ไม่ return raw Supabase response)

### ไฟล์:
```
SupabaseProviderRepository.ts
SupabaseFranchiseRepository.ts
SupabaseMediaRepository.ts
SupabaseSyncLogRepository.ts
SupabaseSystemSettingsRepository.ts
```

### Helper: `src/repositories/supabase/mappers.ts`
- `toProvider(row): Provider`
- `toFranchise(row): Franchise`
- `toMedia(row): Media`
- `toSyncLog(row): SyncLog`
- `toSystemSettings(row): SystemSettings`
- และ reverse mappers สำหรับ create/update input

## 5. Repository Factory

สร้าง `src/repositories/index.ts`:
```typescript
// Factory functions ที่รับ SupabaseDb แล้ว return repository instance
// ใช้ใน Server Actions / Server Components
export function createProviderRepository(supabase: SupabaseDb) { ... }
export function createFranchiseRepository(supabase: SupabaseDb) { ... }
// ...
```

> **หมายเหตุ:** ก่อน implement ต้องสร้าง `src/lib/supabase/types.ts` ก่อน:
> ```typescript
> // CompatDatabase เพิ่ม Relationships/Views/Functions ที่ GenericSchema require
> // โดยไม่แตะ types/database.ts และไม่เปลี่ยน Row/Insert/Update types
> export type CompatDatabase = { ... }
> export type SupabaseDb = SupabaseClient<CompatDatabase>
> ```
> แล้วเปลี่ยน `server.ts` และ `client.ts` ให้ใช้ `CompatDatabase` แทน `Database`

---

**หลังเสร็จ:** run `npm run typecheck` + `npm run lint` ให้ผ่าน แล้วอัปเดท PROGRESS.md

**ห้าม:**
- ห้าม import Supabase/Next.js/React ใน `domain/`
- ห้าม business logic ใน repository — logic อยู่ใน usecases เท่านั้น
- ห้ามใช้ `any` type
- ห้าม return raw Supabase response จาก repository
