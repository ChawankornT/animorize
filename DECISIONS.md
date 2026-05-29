# ANIMORIZE — DECISIONS.md
> บันทึกเหตุผลการตัดสินใจทุกอย่างในโปรเจค
> อัปเดตทุกครั้งที่มีการเปลี่ยน tech, approach, หรือ scope
> อัปเดตล่าสุด: 2026-05

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
- ไม่กระทบ user-facing pages (Phase 3+) ซึ่งยังไม่ได้ implement — ทบทวนได้ตอนนั้น

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
- ใช้ cron เดียวกับ auto-sync ได้เลย (daily sync = keep-alive อัตโนมัติ)

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
- Search (3 ภาษา) + autocomplete suggestion
- เพิ่ม media เข้า library จาก search result
- เลือก Provider + audio + custom URL
- Favorite (star) toggle
- Dashboard: แสดงเฉพาะ watching + favorite
- Provider badge (สีตามแบรนด์)

### Phase 4 — Progress Tracking + Watchlog
- +1 Episode button
- auto status update เมื่อครบตอน
- movie/special: toggle Watched button
- Watchlog auto-record ทุกครั้งที่กด +1
- History page: รายการ watchlog ของ user

### Phase 5 — UX Polish
- Skeleton loading ทุก async component
- Error states + retry
- Empty states + illustrations
- Dark mode toggle
- Responsive (mobile hamburger menu)
- Accessibility: WCAG 2.1 AA, keyboard navigation

### Phase 6 — Extended Features
- Franchise page (รวมทุก season/movie/OVA ของ franchise)
- Category page: กรองตาม ปี / ฤดูกาล / media_type
- Auto-sync cron job (pg_cron daily)
- Basic stats (ดูไปกี่ตอน กี่เรื่อง)

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
