# ANIMORIZE — DECISIONS.md
> บันทึกเหตุผลการตัดสินใจทุกอย่างในโปรเจค
> อัปเดตทุกครั้งที่มีการเปลี่ยน tech, approach, หรือ scope
> อัปเดตล่าสุด: 2026-05-30

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
    title { romaji english native }
    coverImage { large }
    description
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
- auto status update เมื่อ current = total → 'completed' (อยู่ใน IncrementEpisode)
- movie/special: toggle Watched (total_episodes = 1)
- Watchlog auto-record atomic กับ +1 ทุกครั้ง
- History page: รายการ watchlog ของ user

### Phase 5 — UX Polish
- Audit loading.tsx (skeleton) + error.tsx ครบทุก route group (convention บังคับตั้งแต่ต้น — Phase 5 = ตรวจ/เก็บตก)
- Error states + retry (client) + toast
- Empty states + illustrations + action button
- Dark mode toggle (เพิ่ม dark tokens ใน tokens.css ถ้ายังไม่มี)
- Responsive (mobile hamburger menu)
- Accessibility: WCAG 2.1 AA, keyboard navigation

### Phase 6 — Extended Features
- Franchise page (รวมทุก season/movie/OVA ของ franchise)
- Category page: user browse media ของเรา กรองตาม ปี / ฤดูกาล / media_type
  (คนละเรื่องกับ Phase 7 discovery ซึ่ง browse AniList)
- Auto-sync job: รัน sync logic (system_settings.enabled AND media.auto_sync AND airing_status='ongoing') ตามรอบ
  ⚠️ pg_cron เพียว ๆ เรียก AniList ไม่ได้ (เป็น SQL) → ต้องใช้ Vercel Cron → API route หรือ Supabase Edge Function + pg_net — เคาะ mechanism ตอนเริ่ม
- Basic stats (ดูไปกี่ตอน กี่เรื่อง)
- (manual "Sync now" — done แล้วใน PR #6 (merged) ไม่ต้องทำซ้ำ)

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

| วันที่ | Package | Version | เหตุผล |
|--------|---------|---------|--------|
| 2025-05 | next | 16.0.5 | Framework หลัก |
| 2025-05 | react, react-dom | 19.2.0 | React runtime |
| 2025-05 | typescript | ^5 | Type safety |
| 2025-05 | tailwindcss, @tailwindcss/postcss | ^4 | Styling |
| 2025-05 | eslint, eslint-config-next | ^9 / 16.0.5 | Linting |
| 2026-05 | tsc-files | ^1.1.4 | Type-check staged files only ใน lint-staged (ไม่ต้อง run tsc ทั้ง project ทุก commit) |
| 2026-05-30 | lucide-react | ^1.17.0 | Icon library สำหรับ UI (Phase 3+: MediaCard, Provider badge, nav) — tree-shakeable, ไม่มี runtime dependency |
