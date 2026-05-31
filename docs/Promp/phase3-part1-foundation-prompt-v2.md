# Prompt สำหรับ Claude Code — Phase 3 Foundation (User Library)

> Copy ทั้งหมดข้างล่างนี้ไปวางใน Claude Code (session ใหม่)
> ก่อนเริ่ม: upload `PROGRESS.md` + `PROJECT_INSTRUCTIONS.md` ล่าสุดในแชต

---

## Context

Phase 3 = User Library & Dashboard. Pre-Phase 3 foundation merged to main แล้ว (ESLint dependency rules active, `getDisplayTitle` ที่ `domain/entities/title.ts`, vitest + mock harness ที่ `src/__tests__/utils/mockRepositories.ts`, 7 decisions)

prompt นี้ทำ **Foundation เท่านั้น** (domain → repository → usecases + tests + RLS) ตาม Clean Architecture "domain ก่อน UI" — UI/Features เป็น prompt ถัดไปหลัง Foundation merge

Data layer เคาะแล้ว (Pre-Phase 3): **Server Actions + useOptimistic** เป็น default; TanStack Query defer ถึง search autocomplete — Foundation ยังไม่แตะ UI เลยเป็นแค่ note ต่อเนื่อง

**OUT OF SCOPE (ห้ามทำใน prompt นี้):**
- ❌ UI ทุกชนิด — search page, dashboard page, library page, MediaCard, ProviderBadge
- ❌ Server Actions (เป็น UI-layer → Features prompt) และ hooks
- ❌ Watchlog entity/repo + `+1 episode` (Phase 4)
- ❌ Provider selection UI

## Ground rules

1. อ่านก่อนเริ่ม: `CLAUDE.md`, `DECISIONS.md` (โดยเฉพาะ Pre-Phase 3 section + Phase 3 roadmap), `PROGRESS.md`, `.claude/rules/` ทุกไฟล์ (**โดยเฉพาะ `git.md` ที่อัปเดตใหม่**), `schema/07-user-media.sql`, `schema/06-media-providers.sql`, `schema/04-providers.sql`, `schema/11-rls.sql`, `schema/01-enums.sql`, `src/types/database.ts`, `src/domain/entities/Media.ts` + `title.ts`, `src/domain/entities/Franchise.ts` + `MediaProvider.ts`, repository interface + Supabase implementation + **factory** ที่มีอยู่ (ดู pattern Phase 2), `src/__tests__/utils/mockRepositories.ts`, `src/repositories/supabase/mappers.ts` (ดู `toMediaProvider`)
2. ทำตาม `CLAUDE.md` + `.claude/rules/` ทุกข้อ
3. **Git** — ทำตาม `.claude/rules/git.md` ฉบับล่าสุด: branch `feat/user-library` (base `develop`); Conventional Commits; ห้าม `--no-verify`; **`develop` เป็น long-lived branch — merge `develop → main` ห้าม `--delete-branch`**; หลัง merge feature → develop ให้ลบ feature branch + `git fetch --prune` + เช็ค `[gone]` (ลบได้) vs no-tracking (ห้ามลบ)
4. **ESLint dependency rules active** — `domain/` ต้อง pure (ห้าม import react/next/supabase/repositories-impl/hooks/components/app/stores; import `@/repositories/interfaces/*` ได้); `repositories/` ห้าม import react/next/hooks/components/app/stores. โค้ดใหม่ต้องผ่าน `npm run lint`
5. แตกเป็น commit ย่อยตาม task (เช่น `feat(domain): UserMedia entity`, `feat(repository): user_media repo + factory`, `feat(domain): library usecases`, `test: user library coverage`)
6. Verify ทุก task: `npm run lint` → `npm run typecheck` → `npm test` ผ่านทั้งหมด
7. ปิดงาน: `/sync-progress` + bump versions ที่เกี่ยวข้อง
8. ห้าม `any`, ห้าม `console.log`, ห้ามแก้ `src/types/database.ts` ตรงๆ

---

## Task 1 — ยืนยัน RLS (คาดว่าครบแล้ว — confirm แล้วไป Task 2 ได้เลย)

RLS ของ `user_media` + `watchlogs` ทำไว้แล้วใน `11-rls.sql` — task นี้แค่ **ยืนยัน ไม่ต้องเขียนเพิ่ม** (เว้นแต่ตรวจแล้วพบว่าขาดจริง)

- เปิด `schema/11-rls.sql` ยืนยัน:
  - `user_media` — `enable row level security` + policy `for all` ด้วย `auth.uid() = user_id` (ครอบ SELECT/INSERT/UPDATE/DELETE ในตัว) ✅
  - `watchlogs` — `enable row level security` + policy **SELECT + INSERT เท่านั้น** ด้วย `auth.uid() = user_id`. **watchlogs เป็น immutable by design — ไม่มี UPDATE/DELETE policy โดยเจตนา** (history แก้/ลบไม่ได้ ดู DECISIONS.md) → **ห้ามเพิ่ม UPDATE/DELETE**
- ถ้าครบตามนี้ → ไม่ต้องแก้อะไร ไป Task 2 ได้เลย
- ถ้า**พบขาดจริงเท่านั้น**ถึงเพิ่ม (consistent กับโครงสร้าง `11-rls.sql`) แล้ว ⚠️ แจ้งท้าย task ว่า user ต้อง apply SQL ใน **Supabase SQL Editor (dev)** เอง (Claude Code apply ให้ไม่ได้)
- ยืนยันว่า repository (Task 3) จะใช้ `server.ts` (session client) เท่านั้น ห้าม service-role

---

## Task 2 — UserMedia entity (`src/domain/entities/UserMedia.ts`)

Pure TS ตาม schema (อ่าน `user_media` ใน `src/types/database.ts` + `01-enums.sql` ยืนยัน field/enum)

**Columns (snake → camelCase):** `id, userId, mediaId, providerId (nullable), audio (AudioType: 'sub'|'dub'), status (WatchStatus: 'watching'|'completed'|'on_hold'|'dropped'|'plan_to_watch'), currentEpisode (default 0), isFavorite (default false), customUrl (nullable), startedAt (nullable), completedAt (nullable), createdAt, updatedAt`

**ต้องมี:**
- type `UserMedia` (fields ข้างบน)
- type `UserMediaWithMedia` — `UserMedia` + joined fields ที่ UI ต้องใช้:
  - จาก media: `titleTh / titleEn / titleRomaji, posterUrl, totalEpisodes, mediaType`
  - จาก `providers` (FK `provider_id`): `providerName, providerColor` — ดู pattern `toMediaProvider` ของ Phase 2
  - `baseUrl` — **มาจาก `media_providers.base_url` (ลิงก์ดูเรื่องนี้บน provider นั้น) ไม่ใช่ `providers.base_url`** (`providers.base_url` = หน้าแรกของ provider, คนละความหมาย). `user_media` ไม่มี FK ตรงไป `media_providers` → ดึงผ่าน nested embed ทาง media แล้ว match `(provider_id, audio)` ใน mapper (ดู Task 3)
- input type `AddToLibraryInput` = `{ userId, mediaId, providerId?, audio?, status?, customUrl? }` (currentEpisode → 0, isFavorite → false เป็น default)
- **business rules แบบ pure function (testable):**
  - `getDisplayTitle` — reuse จาก `domain/entities/title.ts` (ห้าม inline)
  - `getEffectiveUrl(customUrl, baseUrl)` → `custom_url ?? base_url` (Provider URL rule; `baseUrl` คือ `media_providers.base_url` — ฟังก์ชันรับเป็น argument, เทสต์ด้วยค่าตรงๆ ได้, ที่มาดู Task 3). **ใส่ JSDoc อธิบาย URL model 3 ชั้น:** `providers.base_url`=หน้าแรก provider / `media_providers.base_url`=ลิงก์เรื่องบน provider (admin ตั้ง) / `user_media.custom_url`=user override (เช่นชี้ `/play` แทน `/profile`)
  - `isDashboardItem(userMedia)` → `status === 'watching' || isFavorite` (Dashboard filter rule)
- unit tests ครอบทั้ง 3 function (รวม edge: customUrl null → baseUrl, status อื่นแต่ favorite=true → true)

---

## Task 3 — Repository

**`src/repositories/interfaces/IUserMediaRepository.ts`** (contract, return domain types):
- `add(input: AddToLibraryInput): Promise<UserMedia>`
- `findByUserId(userId): Promise<UserMediaWithMedia[]>` (JOIN media + provider)
- `findByUserAndMedia(userId, mediaId): Promise<UserMedia | null>` (dup check ตาม unique `(user_id, media_id)`)
- `updateFavorite(id, isFavorite): Promise<UserMedia>`
- `updateStatus(id, status): Promise<UserMedia>`
- `updateProvider(id, { providerId, audio, customUrl }): Promise<UserMedia>` — type: `{ providerId: string | null; audio: AudioType; customUrl: string | null }` (`provider_id` เป็น `on delete set null` → ต้องรองรับการ clear provider เป็น null ได้)
- `remove(id): Promise<void>`

**`src/repositories/supabase/SupabaseUserMediaRepository.ts`:**
- ใช้ `server.ts` client เท่านั้น
- mapper row↔entity (`toUserMedia`, `toUserMediaWithMedia`):
  - JOIN: `select('*, media(title_th, title_en, title_romaji, poster_url, total_episodes, media_type, media_providers(provider_id, audio, base_url)), providers(name, color)')`
  - `providerName` / `providerColor` ← จาก embedded `providers` (FK `provider_id`)
  - `baseUrl` ← ใน mapper หา entry ใน `media.media_providers` ที่ `provider_id === row.provider_id && audio === row.audio` (unique key คือ `(media_id, provider_id, audio)`) แล้วเอา `.base_url`; ถ้าไม่เจอ หรือ `provider_id` เป็น null → `baseUrl = null`
  - handle null: `providerId, customUrl, startedAt, completedAt, baseUrl`
- mapper tests (row→entity, JOIN→WithMedia, null handling)

**Factory** — wire `SupabaseUserMediaRepository` เข้า factory ที่มีอยู่ ตาม pattern เดิม

---

## Task 4 — Usecases (`src/domain/usecases/`)

business logic อยู่ใน usecase, orchestrate ผ่าน `IUserMediaRepository`:
- `AddToLibrary(repo, input)` — เช็ค dup ด้วย `findByUserAndMedia` ก่อน → ถ้ามีแล้ว return/throw error ที่สื่อความ → ไม่งั้น `add`. ใส่ default status ถ้าไม่ระบุ
- `ToggleFavorite(repo, id, currentIsFavorite)` → `updateFavorite(id, !current)`
- `RemoveFromLibrary(repo, id)` → `remove`
- `ListUserLibrary(repo, userId)` → `findByUserId`; รองรับ dashboard filter ผ่าน `isDashboardItem` (pure predicate จาก entity — เลือก design ที่ consistent กับ usecase เดิม: filter ใน usecase หรือคืนทั้งหมดให้ caller filter ก็ได้ แต่ business rule ต้องอยู่ใน domain ไม่ใช่ UI)

ทุก usecase + mapper ใหม่ → unit test (testing policy)

---

## Task 5 — Tests

- ขยาย `src/__tests__/utils/mockRepositories.ts` → เพิ่ม `createMockUserMediaRepository` **สไตล์เดียวกับ harness เดิม (`vi.fn()`)** ตาม `createMockMediaRepository` / `createMockSyncLogRepository` ที่มีอยู่ (ไม่ต้อง in-memory); เทสต์ dup-check ของ `AddToLibrary` ใช้ `mockResolvedValueOnce` คุมค่า `findByUserAndMedia` (มีอยู่แล้ว vs null) แทน state จริง
- Entity tests (Task 2) + Usecase tests: `AddToLibrary` (dup rejection + default), `ToggleFavorite` (flip), `RemoveFromLibrary`, `ListUserLibrary` (+ dashboard filter) + mapper tests (Task 3)
- `npm test` ผ่านทั้งหมด

---

## Task 6 — PROGRESS + CHANGELOG + versions

- `PROGRESS.md` — Phase 3 Progress: check Foundation items; Recent Changes; Notes for Chat (สรุป entity/repo/usecase signature ที่สร้าง — Features prompt จะใช้อ้าง; + ถ้าเพิ่ม RLS SQL ให้ flag ว่าต้อง apply ใน dev Supabase)
- `DECISIONS.md` — บันทึก **URL resolution model**: 3 ชั้น (`providers.base_url`=provider homepage / `media_providers.base_url`=show-on-provider link, admin-managed อาจมาจาก import / `user_media.custom_url`=user override), `getEffectiveUrl = custom_url ?? media_providers.base_url`, match `(provider_id, audio)` → sub/dub แยกลิงก์ได้. **หมายเหตุ:** per-episode URL = future/post-MVP optional (ต้องมี table ใหม่ key `media+episode` — ยังไม่ทำ; `watchlogs` ปัจจุบันเก็บแค่ `episode_number`)
- `CHANGELOG.md` — entry Phase 3 Foundation
- bump version ที่แตะ (`schema_version` ถ้าแก้ schema)
- `/sync-progress`

---

## Acceptance checklist

- [ ] RLS ยืนยันแล้ว — `user_media` `for all` (ครอบ 4 ops), `watchlogs` SELECT+INSERT only (immutable by design, **ไม่เพิ่ม** UPDATE/DELETE)
- [ ] `UserMedia` + `UserMediaWithMedia` + inputs + 3 business-rule functions, pure TS, ผ่าน ESLint dependency rule
- [ ] `IUserMediaRepository` + `SupabaseUserMediaRepository` (server client) + mapper + factory wired
- [ ] 4 usecases — business logic ใน domain, orchestrate ผ่าน interface
- [ ] mock harness ขยายแล้ว + tests ครอบ entity/usecase/mapper, `npm test` ผ่าน
- [ ] `npm run lint` + `npm run typecheck` ผ่าน
- [ ] ไม่มี UI / Server Action / hook / watchlog ถูกสร้างใน prompt นี้
- [ ] Commit ตาม git convention, branch `feat/user-library`, พร้อม PR เข้า develop
- [ ] PROGRESS + CHANGELOG + versions + `/sync-progress` เรียบร้อย
