# Prompt สำหรับ Claude Code — Pre-Phase 3 Foundation

> Copy ทั้งหมดข้างล่างนี้ไปวางใน Claude Code

---

## Context

เราเพิ่งทำ planning review ก่อนเริ่ม Phase 3 (จาก Copilot review + การวิเคราะห์เพิ่ม) งานนี้คือ **เก็บงานพื้นฐานให้เสร็จก่อนเริ่ม Phase 3 เพื่อให้โค้ด Phase 3 เกิดมาสะอาด** ประกอบด้วย 3 อย่าง: (1) ตั้งกลไกบังคับ dependency rule ที่ CI, (2) refactor + backfill test บนโค้ดที่เขียนเสร็จแล้วและเคยมีบั๊ก, (3) บันทึก decisions + อัปเดต convention

**สำคัญ — OUT OF SCOPE (ห้ามทำในงานนี้):**
- ❌ ห้ามเริ่มงาน feature ของ Phase 3 (UserMedia entity/repo/usecases/UI, search, dashboard, MediaCard)
- ❌ ห้ามสร้าง schema/RLS ของ `user_media` / `watchlogs` (งานนี้แค่ *บันทึก* pattern ไว้ — สร้างจริงตอน Phase 3)
- ❌ ห้ามสร้าง Postgres RPC สำหรับ +1 (แค่ *บันทึก* decision ไว้ — สร้างจริงตอน Phase 4)

## Ground rules

1. อ่านก่อนเริ่ม: `CLAUDE.md`, `DECISIONS.md`, `PROGRESS.md`, `.claude/rules/` (ทุกไฟล์), `eslint.config.*`, `src/domain/entities/Media.ts`, `src/domain/entities/Franchise.ts`, `src/repositories/supabase/mappers.ts`, `src/lib/anilist/mapper.ts`, `src/domain/usecases/RetrySync.ts`
2. ทำตาม convention ใน `CLAUDE.md` + `.claude/rules/` ทุกข้อ
3. Branch + commit: ทำตาม `.claude/rules/git.md` — แนะนำ branch `chore/pre-phase3-foundation` (base = `develop`), แตกเป็น commit ย่อยตาม task (เช่น `chore(lint): enforce dependency rule`, `refactor(domain): consolidate getDisplayTitle`, `test: backfill mapper + usecase tests`, `docs: record pre-phase3 decisions`)
4. Verify ทุก task: `npm run lint` → `npm run typecheck` → `npm test` ต้องผ่านทั้งหมดก่อนปิด task
5. ปิดงาน: รัน `/sync-progress` + bump versions ที่เกี่ยวข้องใน `PROGRESS.md`
6. ห้ามใช้ `any`, ห้าม `console.log`, ห้ามแก้ `src/types/database.ts` ตรงๆ — ตามกฎเดิม

---

## Task 1 — บังคับ dependency rule ด้วย ESLint (`no-restricted-imports`)

เพิ่ม override blocks ใน flat config (`eslint.config.*`) ให้ fail ตอน lint ถ้าละเมิด Clean Architecture dependency rule **ไม่ต้องลง package ใหม่** (ใช้ built-in `no-restricted-imports`)

กฎที่ต้องบังคับ:
- `src/domain/**` — ห้าม import: `react`, `next` (และ `next/*`), `@supabase/*`, `@/repositories/*`, `@/hooks/*`, `@/components/*`, `@/app/*`, `@/lib/supabase/*`, `@/stores/*`
- `src/repositories/**` — ห้าม import: `react`, `next` (และ `next/*`), `@/hooks/*`, `@/components/*`, `@/app/*`, `@/stores/*` (อนุญาต import `@/domain/entities/*` สำหรับ return types)

ใช้ `patterns` ใน `no-restricted-imports` พร้อม `message` ที่อธิบายว่าผิด dependency rule ข้อไหน เพื่อให้ error message มีประโยชน์

**Verify + จัดการ violation:** รัน `npm run lint`
- ถ้าเจอ violation ในโค้ดปัจจุบัน → **อย่า suppress** ให้ list ออกมาทั้งหมด แล้วประเมินทีละตัว: ถ้าเป็น architecture leak จริง → แก้ที่โค้ด (ย้าย import ให้ถูก layer); ถ้าเป็น false positive จากรูปแบบ config → ปรับ pattern ให้แม่นขึ้น สรุปท้าย task ว่าเจอ leak จริงกี่ตัว แก้ยังไง

---

## Task 2 — Refactor `getDisplayTitle` เป็น pure function เดียว

ตอนนี้ logic `title_en > title_romaji > title_th` ถูก implement ซ้ำใน `Media.ts` และ `Franchise.ts`

- สร้าง pure function กลางตัวเดียว (รับ object ที่มี `titleEn` / `titleRomaji` / `titleTh` แล้วคืน display title ตาม order EN > Romaji > TH) วางในตำแหน่งที่เหมาะใน `src/domain/` (เช่น `src/domain/entities/title.ts` หรือไฟล์ shared util ใน domain — ต้องเป็น pure TS, ไม่ import framework/DB)
- ให้ `Media.getDisplayTitle()` และ `Franchise.getDisplayTitle()` เรียกใช้ตัวกลางนี้ ไม่ duplicate logic
- พฤติกรรมต้องเหมือนเดิมเป๊ะ (EN-first) — ฝั่ง user-facing Phase 3 จะ reuse ตัวเดียวกันนี้

**Verify:** `npm run typecheck` + `npm test` ผ่าน

---

## Task 3 — Test harness + backfill tests

วาง infrastructure การเทสต์ + เขียน unit test ครอบโค้ดที่เคยมีบั๊ก (ตาม bug history ใน PROGRESS.md)

**3a. Mock repository harness (reusable)**
- สร้าง util สำหรับ in-memory mock ของ repository interfaces (implement `I*Repository` แบบเก็บใน array/Map) วางใน test utils folder ที่เหมาะสม — เพื่อให้ usecase ทดสอบได้โดยไม่ต่อ DB จริง และ Phase 3 usecases (AddToLibrary, ToggleFavorite ฯลฯ) reuse ได้

**3b. Backfill tests — ครอบเคสที่เคยพังจริง:**
- `src/lib/anilist/mapper.ts` — `episodes = null` ต้อง map เป็น `undefined` (ไม่ใช่ `0`) เพื่อให้ `?? 1` ทำงาน (เคยทำ `total_episodes=0`)
- `src/repositories/supabase/mappers.ts` — `toSyncLog()` ใช้ EN-first (เคยเป็น Thai-first); + row↔entity mappers ตัวอื่นๆ ที่มีอยู่
- `src/domain/usecases/RetrySync.ts` — signature ใหม่ `(mediaRepo, syncLogRepo, mediaId, fetchUpdate)`: เคส fetch สำเร็จ → update + success log; เคส fetch fail → เขียน failed sync_log (ทดสอบว่า fetch ที่ throw ก็ยังบันทึก failed log)
- `src/domain/entities/` — `validateMedia` (รวม movie/special = 1 episode enforcement), `isTrackable`, `getDisplayTitle` (order EN > Romaji > TH, + เคสที่ field บางตัวว่าง), Franchise at-least-one-title constraint
- usecase business rule อื่นที่มีอยู่แล้วใน `src/domain/usecases/` (ครอบเฉพาะที่มี logic จริง)

**Verify:** `npm test` ผ่านทั้งหมด — ทุกเทสต์ที่เขียนต้อง pass

---

## Task 4 — บันทึก decisions ลง `DECISIONS.md`

เพิ่ม entries ต่อไปนี้ (ปรับ format ให้เข้ากับสไตล์ไฟล์เดิม — section + เหตุผล) **บันทึกใจความตามนี้:**

**Client data layer**
> Default = Server Actions + `useOptimistic` (mutations: favorite toggle, +1 episode); `revalidatePath` จัดการ cache invalidation. TanStack Query หยิบเฉพาะ client-cached read ที่ต้องการ dedup/stale-while-revalidate — candidate เดียวตอนนี้คือ search autocomplete; adopt ตอนสร้าง search เท่านั้น ไม่ wire ล่วงหน้า. ยังคงอยู่ใน locked stack ในฐานะ "available". เหตุผล: architecture เป็น Server Components (อ่าน) + Server Actions (เขียน) อยู่แล้ว → TanStack Query ส่วนใหญ่ซ้ำซ้อน, useOptimistic ครอบ optimistic UX ได้ตรงๆ

**Validation single source of truth**
> Zod = ตรวจรูปแบบ/ความครบของ input ที่ขอบ Server Action (parse untrusted → typed). Domain entities (`validateMedia`, at-least-one-title ฯลฯ) = business invariant. ห้าม business rule เดียวกัน implement ซ้ำทั้ง 2 ที่ — Zod ตรวจ shape, domain ตรวจ rule; ถ้าทับซ้อนให้ domain เป็น canonical

**Testing policy (MVP)**
> ไม่ตั้ง coverage % gate. Convention = usecase และ mapper ใหม่ทุกตัวต้องมาพร้อม unit test (pure, mock repository, ไม่ต่อ DB). Priority: domain/usecases + mappers + Zod schema (admin input). RTL/component test = defer (ROI ต่ำสำหรับ solo, ทบทวน Phase 5). CI รัน test ทุก PR แต่ไม่ fail บน threshold

**Dependency rule enforcement**
> บังคับด้วย ESLint `no-restricted-imports` (ไม่เพิ่ม dependency) — domain/ และ repositories/ มี import restriction ตาม layer, fail ที่ CI lint step. เหตุผล: กฎ architecture ที่พึ่งวินัยมนุษย์จะถูกละเมิดเงียบ → ให้เครื่องบังคับแทนการ review ด้วยตา. ปฏิเสธ `eslint-plugin-boundaries` เพราะเพิ่ม dependency โดยไม่จำเป็นสำหรับกฎระดับนี้

**RLS pattern สำหรับ user-owned tables (เตรียม Phase 3/4 — ยังไม่ implement)**
> `user_media` / `watchlogs` = per-user data ตัวแรกของโปรเจกต์. Policy: `auth.uid() = user_id` ครบทั้ง SELECT/INSERT/UPDATE/DELETE เขียนตั้งแต่ไฟล์ schema แรกของแต่ละ table. Repository path ของ user data ต้องใช้ `server.ts` (session-scoped client) เท่านั้น — ห้าม service-role (จะ bypass RLS). Admin content (providers/franchises/media) ใช้ `is_admin()` ตามเดิม. เหตุผล: จุดที่ prod หลุดบ่อยคือ client ผิดตัว (service-role bypass) ไม่ใช่ policy ผิด

**Atomic +1 episode ผ่าน Postgres RPC (เตรียม Phase 4 — ยังไม่ implement) — DOCUMENTED EXCEPTION**
> Phase 4: increment episode + insert watchlog + auto-complete (`current = total → status='completed'`) จะทำใน Postgres function (RPC) เดียว เรียกผ่าน repository เพื่อ atomicity. ผลคือ completion rule อยู่ใน SQL = **ข้อยกเว้นที่ตั้งใจของกฎ "business logic ใน domain/usecases เท่านั้น"**. usecase `IncrementEpisode` ยัง orchestrate (เรียก repo method ที่ wrap RPC) แต่ atomic step อยู่ DB. เหตุผล: read-modify-write 2 ตารางแยกใน Server Action มี race condition (double-click / หลาย tab → episode นับซ้อน / watchlog ซ้ำ); atomicity สำคัญกว่าความบริสุทธิ์ของ layer ในเคสนี้. ปฏิเสธ: ยอม non-atomic + unique constraint กัน watchlog ซ้ำ

**Optimistic UI pattern**
> ตั้งมาตรฐานด้วย favorite toggle (Phase 3, stakes ต่ำสุด): `useOptimistic` + Server Action ที่ return `{success, message, errors?}` (ตาม error contract เดิม). action fail → rollback optimistic state + toast error. reuse pattern เดียวกันกับ +1 episode (Phase 4)

---

## Task 5 — อัปเดต `CLAUDE.md` + `.claude/rules/`

**`CLAUDE.md`** — เพิ่ม/ปรับใน section ที่เกี่ยวข้อง:
- Conventions: dependency rule บังคับด้วย ESLint (อ้าง Task 1); usecase/mapper ใหม่ต้องมา with test; user-owned table ใช้ RLS `auth.uid() = user_id` + session client เท่านั้น
- Business Rules: ระบุว่า `getDisplayTitle` เป็น shared util ตัวเดียว (หลัง refactor)

**`.claude/rules/`** — ปรับไฟล์ที่ตรง topic:
- `testing.md` — testing policy ใหม่ (priority domain/usecases + mappers + Zod; mock repo harness; RTL defer; ไม่มี % gate)
- `domain.md` — เพิ่มว่า dependency rule ถูกบังคับโดย ESLint แล้ว (ไม่ใช่แค่ convention); note documented exception เรื่อง +1 RPC ที่จะมาใน Phase 4
- `repositories.md` — user-owned table path ใช้ session client (`server.ts`) เท่านั้น, ห้าม service-role
- `actions.md` — optimistic pattern + error contract `{success, message, errors?}` (ถ้ายังไม่มี)

---

## Task 6 — Validation SoT audit

หลังบันทึก decision (Task 4) แล้ว:
- Audit โค้ด admin form ปัจจุบัน (Provider/Franchise/Media CRUD) ว่ามี business rule ตัวไหน implement ซ้ำทั้งใน Zod schema และ domain (`validateMedia` ฯลฯ) ไหม
- ถ้าเจอซ้ำ → list ออกมา; แก้เฉพาะที่ trivial/ชัดเจน (ให้ domain เป็น canonical, Zod ตรวจแค่ shape) ถ้าซับซ้อน → บันทึกเป็น note ไว้ทำทีหลัง อย่าขยาย scope ไปรื้อ validation ทั้งระบบในงานนี้

---

## Task 7 — อัปเดต PROGRESS + CHANGELOG + versions

- `PROGRESS.md` — bump `decisions_version` + `claude_md_version` (และ version อื่นที่แตะ); เพิ่มใน Recent Changes; เขียน Notes for Chat
- `CHANGELOG.md` — เพิ่ม entry สรุปงานนี้
- **PROJECT_INSTRUCTIONS.md** — แตะให้น้อยสุด (detail อยู่ใน DECISIONS/CLAUDE/rules แล้ว) ถ้า*ไม่จำเป็น*ต้องแก้ ก็อย่าแก้ ถ้าแก้ → bump `instructions_version` + เตือนใน Notes for Chat ว่าต้อง re-upload
- รัน `/sync-progress`

---

## Acceptance checklist (เช็คก่อนปิดงาน)

- [ ] ESLint boundary rule ทำงาน — `npm run lint` ผ่าน, violation (ถ้ามี) ถูกแก้/อธิบายครบ
- [ ] `getDisplayTitle` เหลือ implementation เดียว, ทั้ง 2 entity เรียกใช้, พฤติกรรมเดิม
- [ ] Mock repo harness พร้อม reuse + backfill tests ครอบเคสบั๊กที่ระบุ, `npm test` ผ่าน
- [ ] `npm run typecheck` ผ่าน
- [ ] DECISIONS.md มีครบ 7 entries ตาม Task 4
- [ ] CLAUDE.md + .claude/rules/ อัปเดตตาม Task 5
- [ ] Validation SoT audit เสร็จ (แก้ trivial / note ที่เหลือ)
- [ ] PROGRESS + CHANGELOG + versions อัปเดต, `/sync-progress` รันแล้ว
- [ ] ไม่มีงาน Phase 3 feature / schema RLS / RPC ถูกสร้างในงานนี้
- [ ] Commit ย่อยตาม git convention, branch ถูกต้อง, พร้อมเปิด PR เข้า develop
