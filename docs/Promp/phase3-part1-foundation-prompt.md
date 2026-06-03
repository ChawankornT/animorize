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

1. อ่านก่อนเริ่ม: `CLAUDE.md`, `DECISIONS.md` (โดยเฉพาะ Pre-Phase 3 section + Phase 3 roadmap), `PROGRESS.md`, `.claude/rules/` ทุกไฟล์ (**โดยเฉพาะ `git.md` ที่อัปเดตใหม่**), `schema/07-user-media.sql`, `schema/11-rls.sql`, `schema/01-enums.sql`, `src/types/database.ts`, `src/domain/entities/Media.ts` + `title.ts`, `src/domain/entities/Franchise.ts`, repository interface + Supabase implementation + **factory** ที่มีอยู่ (ดู pattern Phase 2), `src/__tests__/utils/mockRepositories.ts`, `src/repositories/supabase/mappers.ts`
2. ทำตาม `CLAUDE.md` + `.claude/rules/` ทุกข้อ
3. **Git** — ทำตาม `.claude/rules/git.md` ฉบับล่าสุด: branch `feat/user-library` (base `develop`); Conventional Commits; ห้าม `--no-verify`; **`develop` เป็น long-lived branch — merge `develop → main` ห้าม `--delete-branch`**; หลัง merge feature → develop ให้ลบ feature branch + `git fetch --prune` + เช็ค `[gone]` (ลบได้) vs no-tracking (ห้ามลบ)
4. **ESLint dependency rules active** — `domain/` ต้อง pure (ห้าม import react/next/supabase/repositories-impl/hooks/components/app/stores; import `@/repositories/interfaces/*` ได้); `repositories/` ห้าม import react/next/hooks/components/app/stores. โค้ดใหม่ต้องผ่าน `npm run lint`
5. แตกเป็น commit ย่อยตาม task (เช่น `feat(domain): UserMedia entity`, `feat(repository): user_media repo + factory`, `feat(domain): library usecases`, `test: user library coverage`)
6. Verify ทุก task: `npm run lint` → `npm run typecheck` → `npm test` ผ่านทั้งหมด
7. ปิดงาน: `/sync-progress` + bump versions ที่เกี่ยวข้อง
8. ห้าม `any`, ห้าม `console.log`, ห้ามแก้ `src/types/database.ts` ตรงๆ

---

## Task 1 — Verify + เพิ่ม RLS ของ `user_media` (ทำก่อนอย่างอื่น)

`07-user-media.sql` ปัจจุบันมีแค่ table + trigger — **ตรวจว่ามี RLS policy หรือยัง** (อาจอยู่ใน `11-rls.sql` หรืออาจยังไม่มี)

- เปิด `schema/07-user-media.sql` + `schema/11-rls.sql` ตรวจว่า `user_media` มี: `enable row level security` + policy `auth.uid() = user_id` ครบทั้ง **SELECT / INSERT / UPDATE / DELETE**
- ถ้า**ขาด** → เพิ่มให้ครบ วางในไฟล์ที่ consistent กับโครงสร้างเดิม (ถ้า table อื่น RLS อยู่ใน `11-rls.sql` ก็ไว้ที่นั่น; ถ้า pattern คือ RLS อยู่ในไฟล์ table ก็ไว้ใน `07`) — ทำตาม pattern ที่ profiles/Phase 2 ใช้
- เช็ค `watchlogs` (`08-watchlogs.sql`) ด้วย: ถ้ายังไม่มี RLS ให้เพิ่ม `auth.uid() = user_id` ครบ 4 op เลย (ใช้ใน Phase 4 แต่ทำตามกฎ "RLS ตั้งแต่ไฟล์ schema แรก")
- ⚠️ **ถ้าแก้/เพิ่ม SQL** — แจ้งชัดท้าย task ว่า user ต้องรัน SQL นี้ใน **Supabase SQL Editor (dev)** เอง (Claude Code apply ให้ไม่ได้) ระบุชื่อไฟล์ + ส่วนที่ต้องรัน
- ยืนยันว่า repository (Task 3) จะใช้ `server.ts` (session client) เท่านั้น ห้าม service-role

---

## Task 2 — UserMedia entity (`src/domain/entities/UserMedia.ts`)

Pure TS ตาม schema (อ่าน `user_media` ใน `src/types/database.ts` + `01-enums.sql` ยืนยัน field/enum)

**Columns (snake → camelCase):** `id, userId, mediaId, providerId (nullable), audio (AudioType: 'sub'|'dub'), status (WatchStatus: 'watching'|'completed'|'on_hold'|'dropped'|'plan_to_watch'), currentEpisode (default 0), isFavorite (default false), customUrl (nullable), startedAt (nullable), completedAt (nullable), createdAt, updatedAt`

**ต้องมี:**
- type `UserMedia` (fields ข้างบน)
- type `UserMediaWithMedia` — `UserMedia` + joined fields ที่ UI ต้องใช้: จาก media (`titleTh/En/Romaji, posterUrl, totalEpisodes, mediaType`) + จาก provider (`providerName, providerColor, baseUrl`) — ดู pattern `MediaProvider` JOIN ของ Phase 2 (`findByMediaId` → `providerName/providerColor`)
- input type `AddToLibraryInput` = `{ userId, mediaId, providerId?, audio?, status?, customUrl? }` (currentEpisode → 0, isFavorite → false เป็น default)
- **business rules แบบ pure function (testable):**
  - `getDisplayTitle` — reuse จาก `domain/entities/title.ts` (ห้าม inline)
  - `getEffectiveUrl(customUrl, baseUrl)` → `custom_url ?? base_url` (Provider URL rule)
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
- `updateProvider(id, { providerId, audio, customUrl }): Promise<UserMedia>`
- `remove(id): Promise<void>`

**`src/repositories/supabase/SupabaseUserMediaRepository.ts`:**
- ใช้ `server.ts` client เท่านั้น
- mapper row↔entity (`toUserMedia`, `toUserMediaWithMedia`) — JOIN ด้วย `select('*, media(...), providers(name, color, ...)')` ตาม pattern Phase 2; handle null (providerId, customUrl, startedAt, completedAt)
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

- ขยาย `src/__tests__/utils/mockRepositories.ts` → เพิ่ม `createMockUserMediaRepository` (in-memory, เคารพ unique `user+media`)
- Entity tests (Task 2) + Usecase tests: `AddToLibrary` (dup rejection + default), `ToggleFavorite` (flip), `RemoveFromLibrary`, `ListUserLibrary` (+ dashboard filter) + mapper tests (Task 3)
- `npm test` ผ่านทั้งหมด

---

## Task 6 — PROGRESS + CHANGELOG + versions

- `PROGRESS.md` — Phase 3 Progress: check Foundation items; Recent Changes; Notes for Chat (สรุป entity/repo/usecase signature ที่สร้าง — Features prompt จะใช้อ้าง; + ถ้าเพิ่ม RLS SQL ให้ flag ว่าต้อง apply ใน dev Supabase)
- `CHANGELOG.md` — entry Phase 3 Foundation
- bump version ที่แตะ (`schema_version` ถ้าแก้ schema)
- `/sync-progress`

---

## Acceptance checklist

- [ ] `user_media` (+ `watchlogs`) RLS ครบ 4 op `auth.uid() = user_id` — verify/เพิ่มแล้ว, flag การ apply SQL ถ้าจำเป็น
- [ ] `UserMedia` + `UserMediaWithMedia` + inputs + 3 business-rule functions, pure TS, ผ่าน ESLint dependency rule
- [ ] `IUserMediaRepository` + `SupabaseUserMediaRepository` (server client) + mapper + factory wired
- [ ] 4 usecases — business logic ใน domain, orchestrate ผ่าน interface
- [ ] mock harness ขยายแล้ว + tests ครอบ entity/usecase/mapper, `npm test` ผ่าน
- [ ] `npm run lint` + `npm run typecheck` ผ่าน
- [ ] ไม่มี UI / Server Action / hook / watchlog ถูกสร้างใน prompt นี้
- [ ] Commit ตาม git convention, branch `feat/user-library`, พร้อม PR เข้า develop
- [ ] PROGRESS + CHANGELOG + versions + `/sync-progress` เรียบร้อย
