# ANIMORIZE — DECISIONS.md

> บันทึกเหตุผลการตัดสินใจทุกอย่างในโปรเจค
> อัปเดตทุกครั้งที่มีการเปลี่ยน tech, approach, หรือ scope
> อัปเดตล่าสุด: 2026-08-27

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

> **Confirmed 2026-08-26 (Phase 5):** §P5 1.11 — พิจารณาเจาะข้อยกเว้นแบบมีเงื่อนไขให้ `poster_url` (upgrade เป็น AniList `extraLarge`) แล้ว **ยกเลิก** กฎนี้คงเดิมทั้งข้อไม่มีข้อยกเว้น — แก้ที่ AniList mapper แทน (`coverImage.extraLarge` มีผลกับ import ใหม่เท่านั้น, forward-only, ไม่แตะ sync path); backfill library เก่า → Backlog

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

> Future Considerations, Phase 7 detail, and User-facing AniList Import sections moved to [`docs/decisions-future.md`](docs/decisions-future.md)

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
- Dark mode toggle — cookie + Server Action → `data-theme` ตอน SSR (§P5 1.10)
- **Wide-screen scaling** (container max-width, fluid grid) — mobile/tablet responsive ย้ายไป Phase 6+ (§P5 1.16)
- Accessibility: **WCAG 2.1 AA ยกเว้น 1.4.10 Reflow** (รอ mobile/tablet ใน Phase 6+), keyboard navigation
- Admin shortcut บน MediaCard → `/admin/media/[id]` (admin role only)
- Admin media list search (ใช้ `sanitizeSearchTerm` ที่มีอยู่)
- AniList `coverImage.extraLarge` แทน `large` ใน mapper — **import ใหม่เท่านั้น (forward-only), ไม่แตะ sync path** (§P5 1.11)
- Library filter/sort/search popover (design พร้อมใน handoff) — spec เต็ม: §P5 1.13/1.14
- Motion/animation wrapper — page transition, card enter, list stagger
- "Edit progress" (set episode ตรงๆ, absolute) ใน ⋯ More menu — รับช่วง −1/correction จาก Phase 4 (§P4 1.3) → spec เต็ม: §P5 1.1–1.7, 1.15
- **ใหม่:** Back button ใน `/media/[id]` (`chevron-left` ghost ก่อน breadcrumb) — link ตรงไป `/dashboard` **ไม่ใช่** `router.back()` (เข้าจาก URL ตรง ๆ แล้ว back จะเด้งออกนอกแอป)
- **ใหม่:** DS `Popover` component (BRAND §10.11) — ยังไม่มีใน `components/ui/`

**Backlog (post-Phase 5 candidates):**

| item                                   | note                                                                                                                                                                                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wire "Switch to" (change provider)** | provider table ใน `/media/[id]` เป็น read-only ตั้งแต่ Part 2a — ยังไม่ wire → เป็นงานใหม่ทั้งก้อน (action + optimistic + confirm) ไม่ใช่แค่เพิ่ม confirm · ⚠️ ตรวจว่าซ้ำกับรายการ Phase 7 หรือไม่ก่อนจัดคิว                                                  |
| **Stale-watching nudge**               | "ไม่ได้แตะ X มา 2 เดือน — ยังดูอยู่ไหม?" → เสนอ on hold / dropped · ให้ผู้ใช้ตัดสิน ไม่ใช่ UI ซ่อนเอง (ทางแก้แทน window 1 เดือนที่ปฏิเสธไปใน §P5 1.14) → Phase 6+                                                                                             |
| **Section collapse**                   | Currently watching ยาวเกิน N ใบ → collapse + "Show all" (ไม่มีอะไรหาย แค่พับ)                                                                                                                                                                                 |
| **Advanced sort**                      | asc/desc toggle, grouping → Phase 6+                                                                                                                                                                                                                          |
| **`totalEpisodes = 0` data gap**       | AniList ไม่ส่ง episode count → `+1` ถูก block และ Edit progress disabled · ต้องมี admin surface เติม/แจ้งเตือน                                                                                                                                                |
| **`last_watched_at` column**           | ต้องมี column จริงถึงจะมี sort "Recently watched" ที่ไม่โกหกได้ (`updated_at` bump จาก fav/provider ด้วย — §P5 1.14) → phase ที่เปิด migration ได้                                                                                                            |
| **poster backfill + provenance**       | library ที่ import ก่อน Phase 5 ยังเป็น `large` และ auto-sync ยิงเฉพาะ `ongoing` → เรื่อง `finished` ไม่มีวันได้ `extraLarge` เลย · ต้องมี admin backfill action + column บอกที่มาของ poster (เลิกเดาจาก URL string — §P5 1.11) → phase ที่เปิด migration ได้ |

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
- รายละเอียด + decision เต็ม: ดู [`docs/decisions-future.md`](docs/decisions-future.md)

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

> **Superseded 2026-08-26 (Phase 5):** §P5 1.14 — retire จากการเป็น global sort, เหลือใช้จัดลำดับ **ภายใน section** เท่านั้น (global default sort ใหม่ = `updated_at DESC` ล้วน label "Recently active")

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

> **Superseded 2026-08-26 (Phase 5):** §P5 1.1–1.4 — "Edit progress" รับช่วงแล้ว (absolute set, ไม่ใช่ CAS/RPC)

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

### §P4 — as-built findings (บันทึก 2026-08-26 — ย้ายจาก PROGRESS.md "Notes for Chat" ก่อนถูกเขียนทับตอน Phase 5)

1. **Favorite variant** — owner override "decision i" (ห้ามแตะ `FavoriteButton.tsx`, ระบุใน Part 2b impl prompt) ถูก override 2026-08-24 โดยเจ้าของ ("fav เอาตาม design เลย") → `FavoriteButton` มี `variant?: "icon" | "inline"`; `icon` (default) = circular overlay เดิม (`MediaCard`/`LibraryView`), `inline` = full-width ghost + label (`EpisodeTracker`)
2. **`isMovie` = `!isTrackable(media)`** (movie/special เท่านั้น) — design เขียน `type === "movie" || total === 1` แต่ **business rule ชนะ design**: anime ที่มี 1 ตอนยัง trackable ปกติ ไม่ special-case เป็น movie
3. **Watch history ไม่มี provider column** — design โชว์ `ProviderPill` แบบ 3 คอลัมน์ แต่ §P4 1.7 ระบุไม่มี provider column → **business rule ชนะ design** (คง 2 คอลัมน์)
4. **Branch ⑤ dead-end** (`SeriesTracker` 5-state precedence) — ongoing series ที่ `airing_status` flip เป็น finished ตอน user อยู่ที่ ep cap พร้อม `status = 'watching'` → `canIncrement = false`, `canRewatch = false` → ไม่มีทางออก · **ปิดโดย §P5 1.15 (Edit progress)** — เป็น acceptance criterion ของ Phase 5 Part P2

---

## §P5 — Phase 5 — UX Polish (pre-implementation, 2026-08-25)

> เคาะ 2026-08-25 — planning session ก่อนเปิด Phase 5

### §P5 1.1 — Edit progress = absolute set — ไม่ใช้ CAS ไม่ใช้ RPC

CAS (§P4 1.1) มีไว้แก้ปัญหาของ **relative** increment (`from → from+1` แข่งกัน) — absolute set idempotent อยู่แล้ว ไม่มี lost-update ที่ต้องกัน

แตะตารางเดียว (`user_media`) ไม่ต้อง atomic ข้าม table → **plain UPDATE ผ่าน repository พอ ไม่ต้อง RPC ไม่ต้อง migration** (RLS บน `user_media` เป็น `ALL command` — ยืนยันแล้วว่า direct UPDATE ผ่าน policy)

guard: `user_id = auth.uid()` + `0 <= n <= total_episodes` · **ไม่มี reason `stale`** (ไม่มี CAS ก็ไม่มี stale path)

### §P5 1.2 — watchlog policy = ไม่แตะเลย

Edit progress **ไม่เขียน ไม่ลบ ไม่ backfill** `watchlogs` ทุกกรณี

**เหตุผล:** สอดคล้อง `unmarkWatched` ที่ "ไม่ลบ watchlog" อยู่แล้ว · `watchlogs` = **log ของการกระทำ** (ผู้ใช้เคยกด +1 ตอนไหน) ไม่ใช่ mirror ของ pointer

**Cost ที่ยอมรับ:** ปรับ 5 → 8 แล้ว history ไม่มี ep 6–8 → copy ต้องไม่โกหก (ดู §P5 1.7)

### §P5 1.3 — Status transition rules — **เรียงลำดับ เช็คบนลงล่าง เจอข้อแรกที่ match แล้วหยุด**

> ⚠️ นี่คือ **ordered rules ไม่ใช่ match-any** — ข้อ 1 ต้องชนะทุกกรณีเสมอ (เช่น `status = dropped` + `n = 0` → **คง `dropped`** ไม่ใช่ `plan_to_watch`) implementation ต้องเป็น if/else chain ไม่ใช่เงื่อนไขคู่ขนาน

1. **`status ∈ {dropped, on_hold}`** → คง status เดิม แก้แค่ `current_episode` · ไม่แตะ timestamp ใด ๆ
2. **`n = 0`** → semantics เดียวกับ `unmarkWatched`: `plan_to_watch`, `completed_at = null`
3. **`n >= total AND airing_status <> 'ongoing'`** → `completed`, `completed_at = COALESCE(completed_at, now())`
4. **`n >= total AND airing_status = 'ongoing'`** → `watching` (caught-up), `started_at = COALESCE(started_at, now())`, `completed_at = null`
5. **`0 < n < total`** → `watching`, `started_at = COALESCE(started_at, now())`, `completed_at = null`

ไม่แตะ `rewatch_count` ทุกกรณี

**`completed_at` ต้องเป็น `COALESCE` ไม่ใช่ `now()` ตรง ๆ** — ถ้า set `now()` ทุกครั้ง แล้ว user ที่ `completed` อยู่แล้วเปิด Edit progress แล้ว save ค่าเดิมซ้ำ (หรือลดลงแล้วเพิ่มกลับมาที่ `total`) → **วันที่ดูจบจริงถูกทับเงียบ ๆ**

เคสนี้ไม่เคยเกิดกับ RPC เดิมเพราะ `+1` ทำให้ completed ได้ครั้งเดียวต่อรอบ (Rewatch reset `completed_at = null` ก่อนเสมอ) — **Edit progress เป็นตัวเปิดช่องนี้ขึ้นมาใหม่** และถ้าปล่อยไว้จะขัดกับ §P5 1.4 ที่อุตส่าห์เตือนผู้ใช้เรื่อง `completed_at` หายอยู่แล้ว (เตือน path หนึ่ง แต่ทำลายอีก path เงียบ ๆ)

**เหตุผลที่ `dropped`/`on_hold` คง status:** Edit progress = **correction** (แก้ตัวเลขที่จำผิด) ไม่ใช่ state change · อยากกลับมาดูมี `+1` / Rewatch อยู่แล้ว · กัน `dropped` เด้งขึ้นบน dashboard แบบไม่ได้ตั้งใจ

### §P5 1.4 — ไม่มี confirm modal — inline warning แทน

Edit progress มี **explicit input + Save** = confirmation ในตัวอยู่แล้ว (ต่างจาก Rewatch ที่กดปุ่มเดียวแล้ว reset ทันที ซึ่งจำเป็นต้อง confirm)

**inline warning เฉพาะเคสเดียว:** `completed → non-completed` เพราะทำลาย `completed_at` ถาวร → warning 13px `status-warning` ใต้ input

หลังแก้ §P5 1.3 (`COALESCE`) แล้ว **นี่คือ path เดียวที่ `completed_at` หายได้** — ผู้ใช้จะได้รับการเตือนทุกครั้งที่ข้อมูลจะหายจริง ไม่มี silent destruction เหลืออยู่

### §P5 1.5 — `⋯ More` enabled เสมอ — disable item ข้างในแทน

ห้าม disable ปุ่ม `⋯` ตัวเอง (มีปุ่มแต่กดไม่ได้ = สับสน) · disabled item ต้องมี **reason text** ไม่ใช่เทาเฉย ๆ

### §P5 1.6 — `total_episodes = 0` → Edit progress item disabled

reason: "Episode count not set" — **ห้าม bypass range guard** (ไม่งั้นได้ `current_episode > total_episodes`)

เป็น data gap คนละเรื่อง (AniList ไม่ส่ง episode count) — admin เติมที่ `/admin/media/[id]`

### §P5 1.7 — Watch history = activity log ไม่ใช่ mirror ของ pointer

copy เดิม `last {n} episodes` โกหกทันทีที่ §P5 1.2 มีผล → เปลี่ยนเป็น heading **"Recent activity"** + sub `{n} recent entries`

movie/series ใช้ copy เดียวกัน — ปิดหนี้ Phase 4 hardcode (`"1 watch"`) ไปด้วย

### §P5 1.8 — Filter active → All view ยุบเป็น flat grid

3 sections (Currently watching / Favorites / All titles) เป็น affordance ของ **unfiltered overview** — พอ filter แล้วซอยต่อจะนับซ้ำและสับสน → flat grid + active filter chips + "Clear"

### §P5 1.9 — Filter / sort / search state เก็บใน URL `searchParams`

ไม่ใช่ client state — shareable link, back button ทำงาน, Server Component อ่านได้

### §P5 1.10 — Dark mode = cookie + Server Action → `data-theme` ตอน SSR

**ไม่ใช้ localStorage** เพราะ Next.js App Router SSR → localStorage อ่านได้หลัง hydrate → FOUC → ต้องยัด inline blocking script ใน `<head>`

cookie อ่านได้ที่ Server Component → set `data-theme` ตอน SSR เลย → **ไม่มี flash** และ mutation ผ่าน Server Action ตรง convention

### §P5 1.11 — `coverImage.extraLarge` — forward-only ที่ import · ไม่แตะ sync path

**ทำใน Phase 5 Part P4 (admin เก็บตก):** `lib/anilist/mapper.ts:40` เปลี่ยน `coverImage.large` → `coverImage.extraLarge` · มีผลกับ **import ใหม่เท่านั้น** · ไม่มีเงื่อนไข ไม่มี heuristic ไม่มีความเสี่ยง

**กฎ "Sync ไม่ overwrite `poster_url`" คงเดิมทั้งข้อ — ไม่เจาะข้อยกเว้น** (ยกเลิกแนวทางเดิมที่จะผ่อนกฎแบบมีเงื่อนไข)

**เหตุผลที่ไม่แตะ sync path:**

1. **Auto-sync ยิงเฉพาะ `airing_status = 'ongoing'`** (`system_settings.enabled AND media.auto_sync AND ongoing`) → เรื่อง `finished` ซึ่งเป็นส่วนใหญ่ของ library **ไม่มีวันถูก sync** → กลไกใน sync path จะช่วยได้แค่เศษเสี้ยวของปัญหาที่ตั้งใจแก้
2. library เก่าต้องมี **backfill** อยู่ดี → การมี special case ใน sync ที่แก้ได้ ~10% แล้วยังต้อง backfill อีก 90% = **โค้ดสองทางแก้เรื่องเดียวกัน** สู้ทำทางเดียวให้จบทีเดียว
3. ตัดทิ้งแล้ว **known coupling กับ CDN path convention ของ AniList หายไปเลย** — ไม่มี business logic ผูกกับ URL string

**ถ้าอนาคตจะทำ upgrade ตอน sync จริง ๆ:** ห้ามใช้ substring `/large/` (admin วาง URL ที่มีคำนี้ก็โดนทับ) — ให้เทียบตรงกับ response ที่มีอยู่ในมือแล้ว และต้องยอมรับทั้งสองค่า เพราะหลัง Phase 5 row ใหม่จะเก็บ `extraLarge` มาแต่แรก:

```
poster_url === response.coverImage.large      → row เก่า ยังไม่เคยถูกแก้ → upgrade ได้
poster_url === response.coverImage.extraLarge → row ใหม่ ถูกต้องแล้ว   → no-op
ไม่ตรงทั้งคู่                                  → admin แก้ / AniList เปลี่ยนรูป → ไม่แตะ (fail-closed)
```

**หลัก fail-closed:** พิสูจน์ไม่ได้ว่า URL มาจาก sync → ถือว่าเป็นของ admin → ไม่แตะ · ราคาของความผิดพลาดไม่เท่ากัน — ทับของ admin = ทำลายการตัดสินใจของคน กู้ไม่ได้ · ไม่ upgrade = รูปละเอียดต่ำกว่าที่ควร ใช้งานได้ปกติ แก้ทีหลังได้

**Backfill library เก่า → Backlog** (ต้องมี admin action หรือ provenance column)

### §P5 1.12 — Phase 5 = single release · ไม่มี schema migration

merge `develop → main` ครั้งเดียวตอนปิด phase (owner: "ไม่รีบ")

**ยืนยันแล้วว่าไม่มี migration ทั้ง phase** — 1.1 ไม่ต้อง RPC · 1.15 ตัด Rewatch ออกจาก More จึงไม่ต้องแตะ `startRewatch` guard → `schema_version` ไม่ต้อง bump · `src/types/database.ts` ไม่แตะ

**ผลข้างเคียงที่ต้องคุม:** release PR จะใหญ่ → `develop` ต้อง deployable ทุก PR (verify บน staging `dev.animorize.com` รายรอบ) · ห้ามทิ้ง feature ค้างครึ่ง ๆ ข้าม PR

### §P5 1.13 — Tabs × Filter × Sort — สามชั้น ไม่ทับกัน

- **Tabs = ขอบเขต** (`All` / `Watching` / `Favorites`) — คงเดิมทั้ง 3 ตัว
- **Filter = กรอง status ภายในขอบเขตปัจจุบัน** — **ซ่อนปุ่ม Filter ตอนอยู่ tab `Watching`** (tab นั้น lock status แล้ว → กันเคส tab Watching + filter Completed = จอว่าง) · tab `Favorites` ยังกรอง status ได้ปกติ
- **Sort = ลำดับ**

**ที่พิจารณาแล้วไม่เอา:** ยุบ tab `Watching` เข้า Filter — จะทำให้ watching กลายเป็น 2 คลิกและถูกซ่อน ขัดกับ requirement ว่า watching/favorite ต้องเข้าถึงง่ายโดยไม่ต้องตั้งค่า

### §P5 1.14 — Sort = 3 ตัวเลือกตาม design · default = pure recency · **label = "Recently active" ไม่ใช่ "Recently watched"**

`Recently active` (default, = `updated_at DESC` ล้วน) · `Recently added` · `Title A–Z`

⚠️ **เบี่ยงจาก design copy 1 คำ โดยตั้งใจ** — `user_media_updated_at` เป็น generic `BEFORE UPDATE` trigger ครอบทุก column (`schema/07-user-media.sql:23-25`) → กด favorite เฉย ๆ หรือเปลี่ยน provider ก็ bump `updated_at` ด้วย ถ้าติดป้าย "Recently watched" ทับ = **โกหกแบบเดียวกับที่ §P5 1.7 เพิ่งแก้ให้ watch history** ("Recent activity") · "Recently active" ตรงกับสิ่งที่ column เก็บจริง = ทุก user action บนรายการนั้น (และ `updated_at` bump จาก user action เท่านั้น — auto-sync แตะตาราง `media` ไม่ใช่ `user_media`)

**semantics "Recently watched" จริง ๆ ต้องมี column `last_watched_at`** → รอ phase ที่มี migration ได้ (Backlog) · **ห้าม** ทำเป็น aggregate join บน `watchlogs` ใน Phase 5 — `unmarkWatched` ไม่ลบ watchlog (§P4) ทำให้ movie ที่ unmark แล้วยังมี "watch activity" ค้าง = สร้างการโกหกอันใหม่แทน

**Composite sort (§Phase 3) retire จากการเป็น global sort** — `librarySort` + `STATUS_PRIORITY` เหลือใช้แค่จัดลำดับ **ภายใน section**

**เหตุผล:** ทุก view มี priority จากที่อื่นอยู่แล้ว — All tab มี 3 sections · Watching/Favorites tab กรองให้แล้ว · Filter active คือคำสั่ง priority เอง → composite เป็น global sort จึงซ้ำซ้อน และป้าย "Recently watched" ที่วางทับ composite ก็โกหกผู้ใช้

**ที่พิจารณาแล้วไม่เอา:** จำกัด Currently watching เป็น window 1 เดือน — คนที่ดูช้า (เดือนละตอน) หรือ series ที่ break กลางคอร์จะหายจาก highlight เงียบ ๆ ทั้งที่ยังดูอยู่จริง · UI ที่เปลี่ยนเองตามเวลาโดยผู้ใช้ไม่ได้ทำอะไร = หาของไม่เจอ (ทางแก้ที่รับไว้แทน → Backlog)

**advanced sort** (asc/desc, grouping) → Phase 6+ · Phase 5 คงไว้ 3 ตัวเลือกตลอด

### §P5 1.15 — `⋯ More` menu — 2 items

```
Edit progress          (edit)   — disable เมื่อ total_episodes = 0
─────────────────
Remove from library    (trash)  — destructive
```

- **Rewatch ไม่เข้า More** — `startRewatch` guard = `status IN (completed, dropped, on_hold)` ถ้าใส่แล้ว user ที่ `watching` กด → RPC no-op เงียบ (reason `stale`) = ปุ่มตายที่มองไม่เห็น · ผ่อน guard ได้แต่ต้องแตะ SQL = ขัด §P5 1.12 → **รอ demand จริงค่อยกลับมาแก้** (owner: เคยตัดสินใจแนวนี้มาแล้ว)
- **Change provider ไม่เข้า More** — provider table มีปุ่ม "Switch to" อยู่แล้ว (ดู Backlog)
- **Remove from library เข้า More อันเดียวกัน** ไม่แยกเป็น `⋯` ที่สอง — DS รองรับ pattern นี้แล้ว (`.popover-divider` + `.popover-item--destructive`) และ divider ทำหน้าที่แยก scope ให้สายตาอยู่แล้ว · สอง `⋯` ในหน้าเดียวสับสนกว่า · ถ้าอนาคตมี page-scope action เพิ่มค่อยแยกทีหลัง
- `removeFromLibraryAction` **มีอยู่แล้วแต่ยังไม่ถูกใช้ที่ไหน** → More menu = consumer แรก

**ผลพลอยได้:** branch ⑤ dead-end (§P4 as-built findings) ถูกปิดด้วย Edit progress

### §P5 1.16 — Responsive — แยก wide-screen ออกจาก mobile

- **P7a wide-screen (ทำใน Phase 5):** container max-width · `lib-grid` เปลี่ยนเป็น `auto-fill / minmax` แทน 4 คอลัมน์ตายตัว (จอ 2K 27" ได้ 6–7 ใบขนาดเท่าเดิม แทนที่จะยืดใหญ่และโล่ง) · detail page คุม prose column
- **P7b mobile/tablet → เลื่อนไป Phase 6+** — รอ feature นิ่งก่อน (อาจมี feature เพิ่ม/ลดอีก) และต้องมี design จริง (bundle ปัจจุบัน **ไม่มี `@media` แม้แต่บรรทัดเดียว**)

⚠️ **ผลต่อ a11y scope:** WCAG 2.1 AA มีข้อ **1.4.10 Reflow** (ใช้งานได้ที่ 320px) → P8 เคลม "AA เต็ม" ไม่ได้ ต้องเขียนตรงว่า **"WCAG 2.1 AA ยกเว้น 1.4.10 Reflow — รอ P7b"**

### §P5 1.17 — Design bundle = visual/token SoT เท่านั้น ไม่ใช่ a11y SoT (P1)

> บันทึก 2026-08-27 — ระหว่าง implement P1 (`Popover`)

**หลักการ:** `.design-bundle/` (รวม `PopoverMenu` ใน `ds/components.jsx`) คือ prototype ของ **หน้าตาและ token** เท่านั้น ไม่ใช่ reference ของ keyboard/ARIA behavior โค้ดจริงตั้งใจมี semantics ที่ prototype ไม่มี เพราะ prototype เขียนด้วยสมมติฐานที่ผิด (ดูเหตุผลข้อ 1 ด้านล่าง) — **การ import bundle รอบใหม่ในอนาคตอัปเดตได้เฉพาะ visual/token ห้ามถอด ARIA หรือ keyboard behavior ที่โค้ดมีอยู่ออก**

**deviation ที่ครอบ (ณ P1 — entry นี้ครอบของที่ P2/P3 เพิ่มทีหลังด้วย ไม่ต้องเปิด entry ใหม่ทุกครั้งที่เติม ARIA ให้ต่อท้ายตารางนี้แทน):**

| #   | โค้ดทำ                                                                        | bundle เป็นยังไง                                                                              |
| --- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1   | disabled item **focusable** (`tabindex="-1"`, roving แวะ) + **มี focus ring** | `<div>` ไม่มี `tabindex` · comment เขียนว่า _"arrow-key roving skips them, so no focus ring"_ |
| 2   | `checked` → `role="menuitemradio"` + `aria-checked`                           | `role="menuitem"` ทุก item — check เป็น visual ล้วน                                           |
| 3   | divider → `role="separator"`                                                  | ไม่มี role                                                                                    |
| 4   | panel มี `aria-label`                                                         | ไม่มี                                                                                         |

**เหตุผลของข้อ 1** (ข้ออื่นเป็น addition ตรงไปตรงมา ไม่ต้องอธิบายเพิ่ม): `role="menu"` ทำให้ screen reader (NVDA/JAWS) สลับเข้า focus mode อัตโนมัติ — ใน mode นั้น arrow key ถูกส่งให้ app จัดการเอง ไม่ใช่ browse cursor ของ SR ดังนั้น `<div>` ที่ไม่มี `tabindex` จะไม่ถูกแตะเลยระหว่าง roving → SR user ไม่รู้ด้วยซ้ำว่ามี item นี้อยู่ ไม่ต้องพูดถึง reason text ข้างใน → §P5 1.5 ("`⋯ More` enabled เสมอ — disable item ข้างในแทน พร้อม reason text") **ไม่ถูก implement ครบ** ถ้าตามสมมติฐานของ bundle ตรงๆ ARIA Authoring Practices Guide (APG) แนะนำให้ disabled menu item ยังคง focusable ด้วยเหตุผล discoverability เดียวกันนี้

**บรรทัดที่ห้ามขาด — เขียนพูดกับ session อนาคตโดยตรง:**

> ห้าม revert ข้อใดข้อหนึ่งในตารางนี้ด้วยเหตุผลว่า "ไม่ตรง design bundle" · ถ้า bundle รอบใหม่ที่ import เข้ามายังเป็นแบบเดิม (ไม่มี `tabindex`/role ที่ถูกต้อง) **นั่นคือสิ่งที่คาดไว้แล้ว ไม่ใช่ regression ที่ต้อง sync กลับ**

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
