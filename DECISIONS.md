# ANIMORIZE — DECISIONS.md

> บันทึกเหตุผลการตัดสินใจทุกอย่างในโปรเจค
> อัปเดตทุกครั้งที่มีการเปลี่ยน tech, approach, หรือ scope
> อัปเดตล่าสุด: 2026-06-07

---

## Tech Stack Decisions

### Database + Auth: Supabase (แทน Firebase)

**ปฏิเสธ:** Firebase Auth + Firestore
**เหตุผล:**

- Supabase Auth ทำงานร่วมกับ Row Level Security ได้โดยตรงผ่าน `auth.uid()`
- ถ้าใช้ Firebase Auth กับ Supabase DB ต้องทำ custom JWT bridge เพิ่ม
- PostgreSQL รองรับ relational data ได้ดีกว่า Firestore สำหรับ schema นี้
- ลด external dependency (ตัดการพึ่งพา Firebase ออกทั้งหมด)

### State Management: Zustand (ไม่ใช้ Context API)

**ปฏิเสธ:** Redux, Context API
**เหตุผล:**

- เลือกอย่างเดียวเพื่อให้ codebase consistent
- Zustand เบากว่า Redux, boilerplate น้อยกว่า
- Context API เหมาะกับ static values ไม่เหมาะกับ state ที่เปลี่ยนบ่อย

### Server State: TanStack Query v5 (แทน SWR)

**ปฏิเสธ:** SWR
**เหตุผล:**

- Devtools ดีกว่า ช่วย debug cache ได้ชัดเจน
- Cache invalidation และ optimistic updates ยืดหยุ่นกว่า
- Mutation API สอดคล้องกับ Server Actions ได้ดีกว่า

### Data Import: AniList (แทน MAL)

**ปฏิเสธ:** MyAnimeList API
**เหตุผล:**

- AniList GraphQL API ฟรี ไม่ต้องขอ Client ID
- Rate limit ผ่อนปรนกว่า MAL
- MAL API ต้องขอ approval และ header authentication ทุก request

### ข้อมูล Import เก็บใน DB ของเรา (ไม่ call API ซ้ำ)

**เหตุผล:**

- ทำงานได้แม้ AniList ล่มหรือ rate limit
- Admin แก้ไข/เพิ่มเติมข้อมูลได้โดยไม่ถูก overwrite
- ลด latency ของ user

### Testing: Vitest (แทน Jest)

**ปฏิเสธ:** Jest
**เหตุผล:**

- เข้ากับ Next.js 16 และ ES modules ได้โดยไม่ต้องตั้งค่าเพิ่ม
- เร็วกว่า Jest อย่างเห็นได้ชัดใน watch mode

### Package Manager: npm (แทน pnpm)

**ปฏิเสธ:** pnpm, yarn
**เหตุผล:**

- คุ้นเคยมากกว่า ลดความซับซ้อนสำหรับ solo project
- Next.js 16 default ใช้ npm
- ไม่มี monorepo ที่ต้องการ pnpm workspace

### Logging: console.error MVP → Pino ภายหลัง

**ปฏิเสธ:** Pino/Winston ตอน MVP
**เหตุผล:**

- MVP ไม่ต้องการ structured logging
- Next.js จัดการ server log ให้อยู่แล้ว
- console.error เฉพาะ error จริงๆ ใน Server Actions
- Error/Loading states ใช้ Next.js built-in (error.tsx / loading.tsx)
- ทบทวนเมื่อ: deploy production + ต้องการ error tracking → เพิ่ม Pino + Sentry

### Git Hooks: Husky + lint-staged

**เหตุผล:**

- pre-commit: lint + typecheck เฉพาะ staged files — กัน commit code เสีย
- ไม่ใส่ pre-push test เพราะจะช้าตอน push

---

## Architecture Decisions

### Clean Architecture (แทน 3-Layer)

**ปฏิเสธ:** 3-Layer (UI → Hook → Service)
**เหตุผล:**

- ฝึกฝน Clean Architecture ให้คุ้นเคย
- Dependency rule ชัดเจน: domain ไม่รู้จัก framework/DB
- เปลี่ยน Supabase เป็น DB อื่นแก้แค่ repository implementation
- Testable: test usecases ด้วย mock repository ไม่ต้องต่อ DB จริง

**Layer structure:**

```
Domain        → entities/ + usecases/      (pure TS, ไม่ import Supabase/Next.js)
Repository    → interfaces/ + supabase/    (DB access ผ่าน interface)
Hook          → hooks/                     (orchestrate usecases → UI)
UI            → app/ + components/         (render เท่านั้น)
```

**Dependency rule:** ชั้นในห้าม import ชั้นนอก

- domain/ ห้าม import จาก repositories/, hooks/, components/, app/, lib/supabase/
- repositories/ import ได้เฉพาะ domain/entities/ (สำหรับ return types)
- hooks/ import domain/ + repositories/
- UI import hooks/ + domain/entities/ (สำหรับ types)

### Supabase 2 Projects แยก dev/prod

**เหตุผล:**

- Schema migration พังใน dev ไม่กระทบ production
- Test data ไม่ปนกับ real data
- Environment variables แยกกันชัดเจน

### Server Actions สำหรับ Mutations ทั้งหมด

**เหตุผล:**

- Type-safe end-to-end โดยไม่ต้องเขียน API route แยก
- Validation ทำได้ใน server ก่อนถึง DB
- ลด boilerplate

### Docker / Kubernetes: ยังไม่ทำ

**เหตุผล:**

- Vercel จัดการ infrastructure ให้ทั้งหมด
- Over-engineering สำหรับ MVP
- ทบทวนเมื่อ: scale เกิน Vercel, ต้องการ custom backend, หรือ self-host

### Branch protection — `main` off-limits mid-phase (incident-driven)

> บันทึก 2026-05-31 — เพิ่มหลังเกิดเหตุ PR หลุดเข้า `main` ทั้งที่กฎระบุไว้

**กฎ:**

- ระหว่าง phase: `feature/*` / `fix/*` → PR เข้า `develop` เท่านั้น
- `main` update เฉพาะ release PR `develop` → `main` ที่เจ้าของอนุมัติเองตอนปิด phase
- ยกเว้น: เจ้าของเปิด PR เอง และเป็น `develop` → `main` เท่านั้น — ห้ามข้าม branch
- ก่อนเปิด PR ทุกครั้ง: **verify base branch** — CI guard (`check-branch-target` job ใน ci.yml) fail อัตโนมัติถ้า base=main และ head≠develop

**เหตุผล:** เคยมี PR หลุดเข้า `main` โดยตรงทั้งที่กฎระบุชัด — กฎที่พึ่งวินัยเพียงอย่างเดียวพัง ต้องให้เครื่องบังคับ (CI guard) ควบคู่กัน

### UI work gated on Claude Design handoff

> บันทึก 2026-05-31

**กฎ:**

- ก่อน implement UI component/screen ใดๆ: ต้อง fetch Claude Design handoff bundle ล่าสุดก่อน
- verify ว่ามี screen/component ที่เกี่ยวข้องใน bundle — ถ้าไม่มี → สั่ง design ก่อน implement
- `BRAND.md` = source of truth ของ token/spec ทุกอย่าง
- ห้ามประดิษฐ์ UI เอง — recreate จาก spec เท่านั้น

**เหตุผล:**

- ป้องกัน UI drift จาก design system (เกิดเมื่อ implement โดยไม่มี spec)
- export ใหม่ = ลิงก์ใหม่เสมอ → ต้องยืนยัน URL กับเจ้าของก่อนใช้ ไม่ cache ลิงก์เก่า
- ลด rework (ทำซ้ำหลัง design เปลี่ยน)

---

## Pre-Phase 3 Foundation Decisions

> บันทึก 2026-05-30 — เคาะก่อนเริ่ม Phase 3 เพื่อให้โค้ด Phase 3 เกิดมาสะอาด

### Client Data Layer: Server Actions + useOptimistic (ไม่ wire TanStack Query ล่วงหน้า)

**ปฏิเสธ:** wire TanStack Query ตั้งแต่ต้น Phase 3
**เหตุผล:**

- Architecture เป็น Server Components (อ่าน) + Server Actions (เขียน) อยู่แล้ว → TanStack Query ส่วนใหญ่ซ้ำซ้อน
- `useOptimistic` ครอบ optimistic UX ได้ตรงๆ โดยไม่ต้องเพิ่ม abstraction
- Candidate เดียวที่ TanStack Query จะ justify ได้ตอนนี้คือ search autocomplete (dedup, stale-while-revalidate) — adopt เฉพาะตอนสร้าง search จริง ไม่ wire ล่วงหน้า
- TanStack Query ยังคง locked stack (available) — ไม่ได้ตัดออก แค่ defer จนมีเหตุผลชัดเจน

> **Update 2026-06-01 (Part 2b):** adopted สำหรับ search autocomplete ตามแผน — scoped ที่ `(main)/search/layout.tsx` เท่านั้น; mutation อื่นยังเป็น Server Actions + useOptimistic

### Validation Single Source of Truth

**กฎ:**

- Zod = ตรวจรูปแบบ/ความครบของ input ที่ขอบ Server Action (parse untrusted input → typed)
- Domain entities (`validateMedia`, `validateFranchise` ฯลฯ) = business invariant ที่เป็น canonical
- ห้าม business rule เดียวกัน implement ซ้ำทั้ง 2 ที่ — ถ้าทับซ้อนให้ domain เป็น canonical

**Overlap ที่ยอมรับ (trivial):**

- `franchiseSchema.refine(at-least-one-title)` + `validateFranchise` ทั้งคู่เช็ค at-least-one-title
- `mediaSchema.refine(at-least-one-title)` + `validateMedia` เช่นกัน
- `providerFields` Zod slug/color regex + `validateProvider` เช่นกัน
- เหตุผลที่ยอมรับ: Zod ให้ user-facing error message ที่ formatted; domain เป็น safety net ถ้า action ถูก call bypass UI — ไม่ใช่ logic ซ้อน แต่เป็น defense in depth ที่ตั้งใจ
- ถ้า rule เปลี่ยน → แก้ domain ก่อนเสมอ แล้วค่อย sync Zod message

### Testing Policy (MVP)

**กฎ:**

- ไม่ตั้ง coverage % gate — CI รัน test ทุก PR แต่ไม่ fail บน threshold
- usecase และ mapper ใหม่ทุกตัวต้องมาพร้อม unit test (pure, mock repository, ไม่ต่อ DB)
- Mock repository harness อยู่ที่ `src/__tests__/utils/mockRepositories.ts` — Phase 3+ reuse ได้
- Priority: `domain/usecases/` + mappers + Zod schema (admin input)
- RTL/component test = defer (ROI ต่ำสำหรับ solo, ทบทวน Phase 5)

### Dependency Rule Enforcement: ESLint no-restricted-imports

**ปฏิเสธ:** `eslint-plugin-boundaries` / วินัยมนุษย์เพียงอย่างเดียว
**เหตุผล:**

- กฎ architecture ที่พึ่งวินัยมนุษย์จะถูกละเมิดเงียบ → ให้เครื่องบังคับแทนการ review ด้วยตา
- `no-restricted-imports` เป็น built-in ไม่ต้องเพิ่ม dependency
- ปฏิเสธ `eslint-plugin-boundaries` เพราะเพิ่ม dependency โดยไม่จำเป็นสำหรับกฎระดับนี้

**กฎที่บังคับ (ดู `eslint.config.mjs`):**

- `src/domain/**` — ห้าม import: react, next, @supabase/_, @/lib/supabase/_, @/repositories/supabase/_ (implementations), @/hooks/_, @/components/_, @/app/_, @/stores/\*
- `src/repositories/**` — ห้าม import: react, next, @/hooks/_, @/components/_, @/app/_, @/stores/_
- **อนุญาต:** `@/repositories/interfaces/*` ใน domain (dependency inversion — usecase import interface type ได้)

### RLS Pattern สำหรับ User-owned Tables (เตรียม Phase 3/4 — ยังไม่ implement)

**กฎ:**

- `user_media` / `watchlogs` = per-user data ตัวแรกของโปรเจกต์
- Policy ครบ 4 operation: `auth.uid() = user_id` สำหรับ SELECT/INSERT/UPDATE/DELETE
- เขียน RLS ตั้งแต่ไฟล์ schema แรก ห้าม migrate table แล้วค่อย add policy ทีหลัง
- Repository ที่ query user data ต้องใช้ `server.ts` (session-scoped client) เท่านั้น — ห้าม service-role (bypass RLS)
- Admin content (providers/franchises/media) ใช้ `is_admin()` ตามเดิม

**เหตุผล:** จุดที่ prod หลุดบ่อยคือ client ผิดตัว (service-role bypass) ไม่ใช่ policy ผิด

### Atomic +1 Episode ผ่าน Postgres RPC (Phase 4) — Documented Exception

**กฎ:**

- Phase 4: increment episode + insert watchlog + auto-complete (`current = total → status='completed'`) รวมใน Postgres function (RPC) เดียว เรียกผ่าน repository ↳ 2026-06-07: completion revised → "new_ep >= total AND airing_status <> 'ongoing'"; increment เป็น CAS (from_episode). ดู §P4 1.1–1.2
- usecase `IncrementEpisode` ยัง orchestrate (เรียก repo method ที่ wrap RPC) แต่ atomic step อยู่ DB
- นี่คือ **ข้อยกเว้นที่ตั้งใจของกฎ "business logic ใน domain/usecases เท่านั้น"**

**เหตุผล:** read-modify-write 2 ตารางแยกใน Server Action มี race condition (double-click / หลาย tab → episode นับซ้อน / watchlog ซ้ำ) — atomicity สำคัญกว่าความบริสุทธิ์ของ layer ในเคสนี้
**ปฏิเสธ:** ยอม non-atomic + unique constraint กัน watchlog ซ้ำ

### Optimistic UI Pattern: useOptimistic + Server Action

**กฎ:**

- ตั้งมาตรฐานด้วย favorite toggle (Phase 3 งานแรก — stakes ต่ำสุด)
- Pattern: `useOptimistic` + Server Action ที่ return `{ success, message, errors? }`
- action fail → rollback optimistic state + toast error
- reuse pattern เดียวกันกับ +1 episode (Phase 4) และ operation อื่นที่ต้องการ optimistic UX

---

## Data Model Decisions

### Title Display Order: English > Romaji > Thai (เปลี่ยนจาก Thai-first)

**ปฏิเสธ:** Thai > English > Romaji (เดิม)
**เหตุผล:**

- Admin panel ใช้งานกับชื่อ English เป็นหลัก — ค้นหา/จดจำง่ายกว่า
- Breadcrumb, heading, dropdown ที่แสดง Thai-first อ่านยากเมื่อ media มีแต่ชื่อ Romaji
- `getDisplayTitle()` ใน `Media.ts` และ `Franchise.ts` ทั้งคู่ใช้ order เดียวกัน
- User-facing pages (Phase 3+) ใช้ getDisplayTitle() ตัวเดียวกับ admin (EN-first) — ยืนยัน 2026-05-29 ว่าไม่แบ่งภาษา ไม่เพิ่ม per-language variant

### `src/constants/admin.ts` — shared display constants สำหรับ admin

**เหตุผล:**

- `MEDIA_TYPE_LABELS`, `MEDIA_STATUS_VARIANT`, `SEASON_LABELS`, `TILE_COLORS` ถูกใช้ซ้ำใน 3 ไฟล์
- รวมไว้ที่เดียวเพื่อให้ Phase อื่นที่ต้องการ admin display constants ดึงใช้ได้โดยไม่ต้องนิยามซ้ำ
- วางใน `constants/` (ไม่ใช่ `domain/`) เพราะเป็น UI display mapping ไม่ใช่ business logic

### Franchise → Media (แยก 2 ระดับ)

**เหตุผล:**

- Kimetsu no Yaiba มีหลาย season, movie, OVA ภายใต้ franchise เดียว
- ค้นหาจาก franchise แล้ว drill down ไปยัง season ที่ต้องการได้
- รองรับการจัดกลุ่มใน Franchise page

### Movie/Special = 1 Episode เสมอ

**เหตุผล:**

- Movie ไม่มี episode counter ที่มีความหมาย
- UX ง่ายกว่า — แค่ toggle "Watched" / "Not watched"
- total_episodes = 1 ทำให้ใช้ logic เดิมได้โดยไม่ต้องแยก code path

### OVA ใช้ Episode Tracking ปกติ

**เหตุผล:**

- บาง OVA มีมากกว่า 1 ตอน (เช่น Hellsing Ultimate มี 10 ตอน)
- ไม่ควรสมมติว่า OVA = 1 ตอนเสมอ

### แยก `anime` กับ `series`

**เหตุผล:**

- Anime = animated (ญี่ปุ่นเป็นหลัก)
- Series = live action
- ต่างกันในการจัดกลุ่ม, filter, และ import source (AniList รองรับ anime เป็นหลัก)
- ตัด `live_action` ออก เพราะ `series` ครอบคลุมอยู่แล้ว

### Auto-sync 2 ระดับ (System + Per-media)

**เหตุผล:**

- System level: ปิด sync ทั้งหมดได้ทีเดียวตอน maintenance
- Per-media: เรื่องที่ฉายจบแล้ว (finished) ปิด sync ได้ ไม่เปลือง API calls
- Sync เฉพาะ `airing_status = 'ongoing'` เพื่อประหยัด quota

### Sync Fields ที่ไม่ Override

**Fields ที่ auto-sync ไม่แตะ:** `title_th`, `synopsis`, `poster_url`
**เหตุผล:**

- Admin อาจแก้ไขชื่อภาษาไทยเองหรือเพิ่ม synopsis ไทย
- การ sync ไม่ควร overwrite งานที่ admin ทำไว้

### Supabase pg_cron Keep-alive

**เหตุผล:**

- Supabase Free tier จะ pause project หลัง inactive 7 วัน
- pg_cron `SELECT 1` ทุก 3 วัน ทำงานได้ในระดับ DB ไม่ต้อง external service
- keep-alive เป็น pg_cron `SELECT 1` standalone (applied แล้ว Phase 1) — คนละกลไกกับ auto-sync: auto-sync เรียก AniList external API จึงรันผ่าน Vercel Cron/Edge Function (ดู Phase 6) ไม่ใช่ pg_cron เดียวกัน แต่ daily sync ที่ touch DB ก็ช่วย keep-alive ไปในตัว

### Provider URL Resolution

```
URL ที่ใช้จริง = user.custom_url ?? admin.base_url
```

**เหตุผล:**

- Admin ตั้ง base_url กลางไว้ก่อน (เช่น bilibili.com/anime/kimetsu)
- User ที่ดูจาก URL เฉพาะ (เช่น episode ที่ bookmarked) ใส่ custom URL ได้

---

## Sync Strategy Detail

### Import Flow

```
1. Admin ใส่ AniList ID ใน Admin Panel
2. Server Action call AniList GraphQL (server side เท่านั้น)
3. Parse response → map ไปยัง schema ของเรา
4. Admin preview + แก้ไขได้ก่อน save
5. INSERT ลง DB + INSERT sync_log (result: success/failed)
```

### AniList GraphQL Query

```graphql
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    title {
      romaji
      english
      native
    }
    coverImage {
      large
    }
    description
    genres
    episodes
    season
    seasonYear
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    status
  }
}
```

### Failure Handling

```
ไม่ update ข้อมูลถ้า call ไม่ผ่าน
บันทึก sync_logs.error_message
Admin เห็น "Sync Failed" badge ใน Admin Panel
Admin กด Retry ได้ทีละรายการ
```

### Fields Mapping (AniList → DB)

```
title.romaji     → title_romaji
title.english    → title_en
title.native     → (ไม่เก็บ — ภาษาญี่ปุ่น kanji ไม่ได้ใช้)
coverImage.large → poster_url
description      → synopsis
episodes         → total_episodes
season           → season_quarter (WINTER=1, SPRING=2, SUMMER=3, FALL=4)
seasonYear       → season_year
startDate        → air_date_start
endDate          → air_date_end
status           → airing_status (RELEASING=ongoing, FINISHED=finished, NOT_YET=upcoming)
genres           → genres[]
```

---

## Future Considerations (ยังไม่ทำใน MVP)

### Calendar Feature

มี 2 แบบที่วางไว้:

- Airing Calendar — แสดงวันออกอากาศของแต่ละ media
- User Viewing Calendar — user วางแผนว่าจะดูวันไหน
  Schema ปัจจุบันรองรับได้ด้วย `air_date_start` และ `season_quarter`

### Episodes Table

รองรับในอนาคตสำหรับ episode-level metadata (ชื่อตอน, thumbnail, aired date)
ตอนนี้ track แค่ episode_number เพียงพอสำหรับ MVP

### Backend แยก (Custom API)

ถ้าวันนึงต้องการ:

- Public API สำหรับ third-party
- Self-host หรือเปลี่ยน DB
- Performance tuning เกินที่ Supabase รองรับ

แนวทาง: เพิ่ม repository implementation ใหม่ — domain layer ไม่ต้องแตะ

### Animation/Live Action Movie แยก

ปัจจุบันใช้ `movie` รวม animated + live action
ถ้าอนาคตต้องการแยก ค่อยเพิ่ม `animated_movie` ใน enum

### Logging + Error Tracking

- เพิ่ม Pino สำหรับ structured logging
- เพิ่ม Sentry สำหรับ error tracking บน production
- ทบทวนเมื่อ deploy production จริง

---

## MVP Roadmap (รายละเอียด)

### Phase 1 — Foundation & Auth

- Supabase project setup (dev + prod แยกกัน)
- Schema migration ทั้งหมด + RLS policies
- pg_cron keep-alive (ป้องกัน free tier pause)
- Supabase Auth: Google OAuth + Email/Password
- Auto-create profile trigger เมื่อ signup
- Header (logged out / logged in state), Footer
- Protected routes + Next.js middleware
- GitHub repo + branch protection rules
- GitHub Actions CI (lint + typecheck + test on PR)
- Husky + lint-staged setup

### Phase 2 — Admin Panel + Import

- Provider CRUD (ชื่อ, สี, logo, URL)
- Franchise CRUD
- Media CRUD (manual)
- AniList import by ID + preview before save
- Media Provider assignment (media → provider + audio + base_url)
- Sync log viewer + retry button
- system_settings: auto-sync toggle

### Phase 3 — User Library & Dashboard

#### Foundation (domain → repo ก่อน UI ตาม Clean Architecture)

- UserMedia entity (+ Create/Update inputs + business rules) ใน domain/entities/
- IUserMediaRepository interface + SupabaseUserMediaRepository + factory
- usecases: AddToLibrary, ToggleFavorite, RemoveFromLibrary, ListUserLibrary

#### Features

- Search — match ข้าม title_th / title_en / title_romaji + autocomplete (display ผ่าน getDisplayTitle = EN-first)
- เพิ่ม media เข้า library จาก search result
- เลือก Provider + audio + custom URL (custom_url ?? base_url)
- Favorite (star) toggle
- Dashboard: แสดงเฉพาะ status='watching' OR is_favorite=true
- MediaCard: render poster จริง (next/image — AniList host config มาแล้วจาก PR #6 poster fix) + fallback color tile เมื่อไม่มี poster + Provider badge (swatch ตาม BRAND 10.4/10.5)

#### Decision (เคาะตอนเริ่ม Phase 3)

- Client data layer: TanStack Query (server state user_media) + useOptimistic/Server Actions สำหรับ favorite toggle — หรือเริ่ม Server Actions + useOptimistic ก่อนแล้วค่อยเพิ่ม TanStack Query (stack ล็อกไว้แต่ยังไม่เคยใช้) → เคาะก่อนสร้าง hook แรก

### Phase 4 — Progress Tracking + Watchlog

#### Foundation

- WatchLog entity + IWatchLogRepository + SupabaseWatchLogRepository + factory
- usecases: IncrementEpisode, ToggleWatched — business rule อยู่ใน usecase ไม่ใช่ UI

#### Features

- +1 Episode (EpisodeTracker → useEpisodeTracker → IncrementEpisode) + optimistic update
- auto status update เมื่อ current = total → 'completed' (อยู่ใน IncrementEpisode) (superseded — ดู §P4 1.2)
- movie/special: toggle Watched (total_episodes = 1)
- Watchlog auto-record atomic กับ +1 ทุกครั้ง
- History page: รายการ watchlog ของ user (Phase 4 = per-media บน detail เท่านั้น; global page deferred — ดู §P4 1.7)
- Rewatch (completed/dropped/on_hold → restart from ep 1) — ดู §P4 1.4
- −1/correction → deferred to Phase 5 "Edit progress" (ดู §P4 1.3)

### Phase 5 — UX Polish

- Audit loading.tsx (skeleton) + error.tsx ครบทุก route group (convention บังคับตั้งแต่ต้น — Phase 5 = ตรวจ/เก็บตก)
- Error states + retry (client) + toast
- Empty states + illustrations + action button
- Dark mode toggle (เพิ่ม dark tokens ใน tokens.css ถ้ายังไม่มี)
- Responsive (mobile hamburger menu)
- Accessibility: WCAG 2.1 AA, keyboard navigation
- Admin shortcut บน MediaCard → `/admin/media/[id]` (admin role only)
- Admin media list search (ใช้ `sanitizeSearchTerm` ที่มีอยู่)
- AniList `coverImage.extraLarge` แทน `large` — poster resolution ดีขึ้น
- Library filter/sort/search popover (design พร้อมใน handoff)
- Motion/animation wrapper — page transition, card enter, list stagger
- "Edit progress" (set episode ตรงๆ) ใน ⋯ More menu — รับช่วง −1/correction จาก Phase 4 (§P4 1.3)

### Phase 6 — Extended Features

- Franchise page (รวมทุก season/movie/OVA ของ franchise)
- Category page: user browse media ของเรา กรองตาม ปี / ฤดูกาล / media_type
  (คนละเรื่องกับ Phase 7 discovery ซึ่ง browse AniList)
- Auto-sync job: รัน sync logic (system_settings.enabled AND media.auto_sync AND airing_status='ongoing') ตามรอบ
  ⚠️ pg_cron เพียว ๆ เรียก AniList ไม่ได้ (เป็น SQL) → ต้องใช้ Vercel Cron → API route หรือ Supabase Edge Function + pg_net — เคาะ mechanism ตอนเริ่ม
- Basic stats (ดูไปกี่ตอน กี่เรื่อง)
- (manual "Sync now" — done แล้วใน PR #6 (merged) ไม่ต้องทำซ้ำ)
- Admin pagination — media list + franchise + sync logs

### Phase 7 — Discovery & Bulk Import (admin-side) [planned]

- Discovery forward-only: default ซีซั่นปัจจุบัน + กำลังจะมา (AniList Page query)
- ย้อนหลัง = manual filter (season + year)
- 7a: live discovery + select-import (ยังไม่มี table — diff กับ media สด)
- 7b: import_candidates table (lean cache) + notification (count 'new') + dismiss
- 7c: cron auto-refresh candidates (ใช้ cron infra ร่วมกับ Phase 6)
- รายละเอียด + decision เต็ม: ดูหัวข้อ "Phase 7 — Discovery & Bulk Import (detail)" ด้านล่าง

---

## Phase 7 — Discovery & Bulk Import (detail) [DRAFT 2026-05-30 rev.3]

**สถานะ:** ร่าง — เคาะ scope + schema + data model แล้ว รอเริ่มจริง
**ลำดับ:** admin-side ไม่ block Phase 3-6 → ทำหลัง Phase 3 ได้

### ปัญหาที่แก้

- import ได้ทีละเรื่อง + admin ต้องรู้ AniList ID เอง → ไม่รู้ว่าซีซั่นข้างหน้ามีอะไรเข้า

### Scope ที่ทำ

- Discovery = forward-only — default ซีซั่นปัจจุบัน + กำลังจะมา (RELEASING / NOT_YET_RELEASED)
- ย้อนหลัง = manual filter (season + year) เท่านั้น ไม่ดึงย้อนอัตโนมัติ
- Notification: เจอเรื่องใหม่ → ขึ้นจำนวน (candidates status='new') ไม่ import เอง
- Admin เลือก import: list + checkbox → import เฉพาะที่เลือก
- เรื่องที่ไม่เลือก: Dismiss → เก็บไว้ browse/import ภายหลัง ไม่เตือนซ้ำ
- หน่วย import = ซีซั่น — ไม่ทำ full-catalog dump ผ่านเว็บ

### Scope ที่ไม่ทำ (ตั้งใจ)

- ❌ Full-catalog dump (หมื่นเรื่อง) ผ่าน Server Action — เกิน serverless timeout + ขัด curate model
- ❌ ดึงย้อนหลังอัตโนมัติ

### Data model — candidates เก็บ LEAN (เคาะ 2026-05-30)

- เก็บแค่ field สำหรับ "แสดง list + อ้างอิงตอน import":
  anilist_id (unique), title_romaji, title_en, poster_url, media_type,
  season_quarter, season_year, airing_status, status (new|dismissed|imported), discovered_at
- ไม่เก็บ synopsis / genres / episodes / air dates — เพราะ discovery มองเรื่องที่ยังไม่ฉาย
  ข้อมูลพวกนี้เปลี่ยนบ่อยก่อนฉาย → cache แล้ว stale
- ตอน admin กด import → re-fetch ตัวเต็มสด ๆ จาก AniList ด้วย anilist_id แล้วสร้าง media
  (candidates ไม่เป็น source of truth ซ้อนกับ media, ไม่ drift จาก schema)

### Schema — DEFER (เคาะ 2026-05-30)

- import_candidates table ยังไม่ migrate ตอนนี้ → สร้างตอนเริ่ม 7b
- เริ่มที่ 7a (live discovery, ไม่มี table) ก่อน
- ตอนทำ 7b: เพิ่ม schema file ใหม่ + regenerate types/database.ts (auto-gen — ห้ามแก้มือ) + RLS (admin-only)

### กฎที่ต้อง preserve / แก้

- ✅ Preview ก่อน save ยังอยู่ — admin เลือกเอง = preview
- ✅ ห้าม auto-save (สร้าง media อัตโนมัติ) ยังอยู่ — cache candidates ≠ save
- 🔧 .claude/rules/admin.md:
  - เพิ่ม: "cache discovery candidates ไม่ถือเป็น save — ห้ามสร้าง media อัตโนมัติ"
  - แก้: bulk import แบบ select-list อนุญาต; bulk retry ยังห้าม (ทีละรายการ)
- Dedup ด้วย anilist_id (unique ทั้ง media + candidates) — ข้ามที่มีแล้ว ไม่ overwrite
- sync_log ต่อเรื่องตอน import — 1 เรื่อง fail ไม่ล้มทั้ง batch

### Architecture (Clean Architecture เดิม)

- lib/anilist/ — Page query (browse by season/year/status) + list mapper
- domain/entities/ — ImportCandidate (7b)
- domain/usecases/ — DiscoverUpcoming, BulkImportSelected, DismissCandidate (7b)
- repositories/ — IImportCandidateRepository + Supabase impl (7b)
- actions/ — refreshDiscoveryAction / bulkImportAction / dismissCandidateAction
- rate limit: sleep ระหว่าง request, เคารพ ~30-90 req/min (Page ดึงทีละ ~50 ประหยัด quota)

### ⚠️ ต้อง confirm ตอนเริ่ม

1. notification ขึ้นที่ไหน — admin dashboard "Needs attention" inbox (มีอยู่แล้ว) เพิ่ม section?
2. cron mechanism (7c) ใช้ตัวเดียวกับ auto-sync Phase 6

---

## User-facing AniList Import — Deferred (post-Phase 7)

> บันทึก 2026-05-31

**สถานะ:** ยังไม่ทำ — Phase 3 user เพิ่มเรื่องจาก catalog (search) เท่านั้น
**ทบทวนเมื่อ:** จบ Phase 7 (discovery/candidates พร้อม)

### ไอเดียที่ลอยไว้

- user ส่ง "request" เรื่องที่อยากได้ (อาจมาจาก AniList list ของตัวเอง) → เข้า queue
- admin review/approve → import เข้า catalog → ค่อย add เข้า library ของ user
- ต่อกับ Phase 7 candidates ได้ (request ที่ match anilist_id เดิม = dedup; ที่ยังไม่มีใน catalog = candidate ใหม่)
- รักษา boundary เดิม: ยิง AniList = ฝั่ง server/admin เท่านั้น ห้าม client

### ⚠️ ต้องเคาะตอนเริ่ม

- schema ของ request queue
- จุดที่ admin เห็น (inbox "Needs attention"?)
- ความสัมพันธ์กับ import_candidates ของ Phase 7

---

## Phase 3 Foundation Decisions

> บันทึก 2026-05-31 — เคาะระหว่างสร้าง UserMedia entity + repository

### URL Resolution Model — 3 ชั้น (เคาะ 2026-05-31)

```
providers.base_url       — หน้าแรกของ provider (e.g. bilibili.com)
media_providers.base_url — ลิงก์เรื่องนี้บน provider (admin-managed; อาจมาจาก AniList import)
user_media.custom_url    — user override (e.g. ชี้ไป /play หรือ episode ที่ bookmark ไว้)

Effective URL = custom_url ?? media_providers.base_url
```

**keyed by `(media_id, provider_id, audio)` unique** → sub/dub แยกลิงก์ได้ในเรื่องเดียวกัน

**ปฏิเสธ:** ใช้ `providers.base_url` โดยตรง — เป็น provider homepage ไม่ใช่ลิงก์เรื่อง

**Per-episode URL = future/post-MVP** (ต้องการ table ใหม่ key `media+episode`; `watchlogs` ปัจจุบันเก็บแค่ `episode_number`, ไม่มี URL)

**Implementation:** `getEffectiveUrl(customUrl, baseUrl)` ใน `domain/entities/UserMedia.ts`; `baseUrl` ดึงจาก nested JOIN `media.media_providers.base_url` match `(provider_id, audio)` ใน `toUserMediaWithMedia` mapper

### `/dashboard` = full library (tab All) — Dashboard rule = highlight + sort ไม่ใช่ page filter

> บันทึก 2026-06-02 — ปลดล็อกตอนเริ่ม Phase 3 Library/Dashboard (หลัง design Library view)

**เดิม (business rule):** "Dashboard filter: status='watching' OR is_favorite=true"
**ปรับเป็น:** `/dashboard` fetch `listUserLibrary(userId, 'all')` = library ทั้งหมด; "watching OR favorite" = นิยามของ **section ที่ highlight** (Currently watching / Favorites) + **sort priority** ไม่ใช่ filter ของทั้งหน้า

**เหตุผล:** ทางเข้า library เดียวคือ add ผ่าน search → ทุก item ที่เพิ่ง add = `plan_to_watch` (schema default) + ไม่ fav; ถ้า filter ทั้งหน้าด้วย watching∪favorite เป๊ะ → เรื่องที่เพิ่ง add ไม่โผล่ที่ไหนเลย + plan_to_watch ไม่มีบ้านจนกว่ามี category page (Phase 6); onboarding "Add your first title" วนกลับหน้าว่าง

**Composite sort (locked):** (1) status `watching→plan_to_watch→on_hold→completed→dropped` (2) favorite tie-break ภายใน status (ไม่ override ทั้งหมด) (3) recency `updated_at` DESC. บนสุด = fav+watching. Favorites section = favorite ที่ status≠watching (ไม่ซ้ำ Currently watching); Favorites **tab** = ทุก favorite (รวม watching)

**Counts:** page-head + Favorites tab = all-fav (`items.filter(isFavorite)`); Favorites section sub = fav-not-watching (คนละเลข ตั้งใจ)

**Top-bar (Phase 3):** มีแค่ "Add media → /search"; Filter/Sort/Library-search popover defer → Phase 5 (design พร้อมใน handoff)

---

## §P4 — Phase 4 — Progress Tracking (pre-implementation, 2026-06-07)

> บันทึก 2026-06-07 — เคาะก่อนเริ่ม Phase 4

### §P4 1.1 — +1 Episode = CAS idempotent increment (RPC)

- RPC `increment_episode(p_user_media_id uuid, p_from_episode int)` — **`SECURITY INVOKER`** (RLS ทำงานปกติ — ต่างจาก `is_admin()` ที่เป็น DEFINER โดยเจตนา)
- Atomic transaction เดียว: `UPDATE user_media` + `INSERT watchlogs` — **documented exception** ต่อกฎ domain-purity (atomicity ข้าม 2 ตารางต้องอยู่ DB) — refine ของ decision "Atomic +1 Episode" เดิม
- **CAS guard** (เงื่อนไข UPDATE): `user_id = auth.uid() AND current_episode = p_from_episode AND p_from_episode + 1 <= media.total_episodes`
  - matched → update + INSERT watchlog(`episode_number = p_from_episode + 1`) · no match → **no-op ทั้งคู่** (watchlog ไม่ insert)
- เหตุผล: relative `current++` แยกไม่ออกว่า request ซ้ำ = duplicate (กดย้ำ / retry หลัง timeout / race ข้าม tab–อุปกรณ์) หรือตั้งใจ +2 — CAS ตัดที่ต้นเหตุ; สอดคล้อง precedent `SetFavorite` (idempotent setter แทน blind toggle)
- Action result เพิ่ม reason **`'stale'`** — no match ไม่ใช่ error (intent สำเร็จจาก request ก่อน) → ไม่ toast, ปล่อย revalidate sync เงียบ
- Client: `disabled={isPending}` + `useOptimistic`; `from` = ค่า confirmed ล่าสุด

### §P4 1.2 — Auto-status + completion guard (revise กฎเดิม)

- increment สำเร็จ → `started_at = COALESCE(started_at, now())`
- **completion: `new_episode >= total_episodes AND media.airing_status <> 'ongoing'`** → `status='completed'` + `completed_at=now()`; ไม่งั้น → `status='watching'`
- **เปลี่ยนจากกฎเดิม `current = total → 'completed'`** (ไม่มี guard) เพราะ:
  - ongoing ที่ตามทันตอนล่าสุด ≠ ดูจบ ("up to date" ≠ done)
  - `<> 'ongoing'` ครอบ movie/special (default `airing_status = 'upcoming'`) ให้ complete ถูก **โดยไม่ต้อง special-case media_type**
  - กัน **false-complete** ของ ongoing ที่ `total_episodes` ถูก map ผิดเป็น 1 จาก AniList null (ดู §P4 1.9)
- เลือก `<> 'ongoing'` แทน `='finished' OR total=1` เพราะ robust กว่าทั้ง 3 เคส ('ongoing' = enum เดียวที่มี semantics "ตอนยังมาเพิ่ม")
- status path plan→watching→completed = derive จาก episode count (`watching` = auto-start จาก plan / auto-resume จาก on_hold, dropped); `on_hold`/`dropped` ตั้ง manual (⋯ More — Phase 5)

> SQL completion (อ้างอิงตอน implement — ตัว function จริงเขียนใน Phase 4 prompt):
>
> ```sql
> status = CASE WHEN p_from_episode + 1 >= m.total_episodes AND m.airing_status <> 'ongoing'
>               THEN 'completed'::watch_status ELSE 'watching'::watch_status END,
> completed_at = CASE WHEN p_from_episode + 1 >= m.total_episodes AND m.airing_status <> 'ongoing'
>                     THEN now() ELSE NULL END
> ```

### §P4 1.3 — −1 / correction — deferred (Option A)

- **ไม่ทำใน Phase 4** — CAS (§P4 1.1) ตัด root cause (accidental multi-increment) แล้ว
- Phase 5: ⋯ More menu ใส่ **"Edit progress"** (set episode เป็นเลขใดก็ได้) — general กว่า −1 ครอบทุกเคส
- residual ยอมรับชั่วคราว: misclick เดี่ยวแก้ไม่ได้จน Phase 5 (รวม edge: กดพลาดที่ ep total−1 → premature auto-complete)
- `watchlogs` คง **immutable** (SELECT+INSERT only) — ไม่เพิ่ม UPDATE/DELETE policy

### §P4 1.4 — Rewatch — เพิ่มเข้า Phase 4 scope

- สำหรับ `completed` / `dropped` / `on_hold`: ปุ่ม Rewatch (icon `RotateCcw` — sanctioned set) + **confirm dialog** ("Start over from episode 1?")
- Effect: `current_episode = 0, status = 'watching', started_at = now(), completed_at = null, rewatch_count + 1`
- **Update guard `WHERE status IN ('completed','dropped','on_hold')`** — เป็นทั้ง valid-source check และ **กัน double-fire** (หลังรอบแรก status='watching' → call ซ้ำเร็วๆ = no-op) → ไม่ต้อง CAS แม้ `rewatch_count` เป็น non-transactional counter
- Single-table update → **usecase ปกติ ไม่ใช้ RPC** (ตาม domain rule)
- ไม่แตะ watchlog เดิม — รอบใหม่ insert ทับ episode เดิมด้วย timestamp ใหม่ (จึง**ห้ามมี** unique constraint บน (user, media, episode) — ปัจจุบันไม่มี ✓); history sort `watched_at DESC` โชว์รอบใหม่ก่อน
- `dropped`/`on_hold` มี 2 ทาง: **+1 = ดูต่อจากที่ค้าง** (RPC ย้าย → watching) / **Rewatch = เริ่มใหม่**
- UI ยังไม่อยู่ใน design bundle → **design addendum ก่อนทำ UI**; backend เริ่มก่อนได้

### §P4 1.5 — movie / special — toggle Watched (2 ทิศ)

- mark = RPC `increment_episode` ตัวเดิม (0→1; total=1, `airing_status <> 'ongoing'` → complete ผ่าน guard §P4 1.2 ปกติ — **ไม่ต้อง special-case**)
- unmark = reset-pointer usecase (`current = 0, status = 'plan_to_watch', started_at = null, completed_at = null`) — **ไม่ลบ watchlog** (log การดูครั้งก่อนคือเรื่องจริง)
- **verify path นี้ explicit**: movie total=1 + default `airing_status='upcoming'` → mark → `current=1 >= 1 AND 'upcoming' <> 'ongoing'` → completed ✓

### §P4 1.6 — Schema: `user_media.rewatch_count`

- `ALTER TABLE public.user_media ADD COLUMN IF NOT EXISTS rewatch_count integer NOT NULL DEFAULT 0`
- เหตุผล: reset pointer แล้วไม่เสีย information "เคยดูจบ" (ไม่งั้น library มองเรื่องที่ rewatch เป็นเพิ่งเริ่มดู); badge UI ("2nd watch") ยังไม่ทำ — เก็บ data ก่อน
- Migration ทั้งรอบ (column + RPC): **manual ผ่าน Supabase SQL Editor** (Docker ยังติด) + save เป็น idempotent SQL files ใน `schema/` + อัปเดต canonical `schema/07-user-media.sql` ให้มี column + **regenerate `types/database.ts` หลัง apply** (ห้ามแก้มือ; ใช้ `supabase gen types` แบบ remote/`--project-id` — ไม่ต้องใช้ Docker)

### §P4 1.7 — History scope (Phase 4) — per-media เท่านั้น

- "Watch history" บน media detail: **5 entries ล่าสุด**, รูปแบบ `ep N · timestamp`, **ไม่มี provider column** (`watchlogs` คง shape `{episode_number, watched_at}`)
- Global history page → **deferred** (future phase)

### §P4 1.8 — Error-handling convention (client) — บังคับตั้งแต่ fix round + Phase 4

- **Imperative mutation handlers** (onClick / `startTransition` ที่ await server action): **try/catch + toast เสมอ** — thrown error (network ฯลฯ) ห้ามเงียบ
- **TanStack `queryFn`**: **ห้าม try/catch กลืน error** — ปล่อย throw, consumer จัดการผ่าน `isError`
- Server actions: คงเดิม — try/catch + `console.error` + curated message (ห้าม raw `err.message` ถึง toast) + reason codes
- ปุ่ม Phase 4 ทุกตัว (+1 card/detail, toggle Watched, Rewatch) ต้องมีครบตั้งแต่ commit แรก

### §P4 1.9 — Known data caveat — AniList ongoing → total_episodes = 1

- Import เรื่อง ongoing ที่ AniList ส่ง `episodes = null` → map เป็น total 1 → +1 ติด cap ทันที
- เป็น **data issue** ไม่ใช่ logic; guard §P4 1.2 (`<> 'ongoing'`) กัน false-complete ไว้แล้ว
- Fix path: **auto-sync อัปเดต total เมื่อ AniList มีข้อมูล (Phase 6)**; ระหว่างนั้น admin แก้ `total_episodes` เอง

---

## Performance Targets

```
Lighthouse Score    >  90
FCP                 <  1.5s
TTI                 <  3.5s
Bundle (first load) <  200KB
```

---

## Package Change Log

> บันทึกทุกครั้งที่ install package ใหม่

| วันที่     | Package                           | Version     | เหตุผล                                                                                                                                       |
| ---------- | --------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 2025-05    | next                              | 16.0.5      | Framework หลัก                                                                                                                               |
| 2025-05    | react, react-dom                  | 19.2.0      | React runtime                                                                                                                                |
| 2025-05    | typescript                        | ^5          | Type safety                                                                                                                                  |
| 2025-05    | tailwindcss, @tailwindcss/postcss | ^4          | Styling                                                                                                                                      |
| 2025-05    | eslint, eslint-config-next        | ^9 / 16.0.5 | Linting                                                                                                                                      |
| 2026-05    | tsc-files                         | ^1.1.4      | Type-check staged files only ใน lint-staged (ไม่ต้อง run tsc ทั้ง project ทุก commit)                                                        |
| 2026-05-30 | lucide-react                      | ^1.17.0     | Icon library สำหรับ UI (Phase 3+: MediaCard, Provider badge, nav) — tree-shakeable, ไม่มี runtime dependency                                 |
| 2026-06-01 | @tanstack/react-query             | ^5.100.14   | Server state เฉพาะ search autocomplete (dedup + stale-while-revalidate); adopt ตามที่ §"Client Data Layer" predict ไว้ — ยังไม่ wire ที่อื่น |
