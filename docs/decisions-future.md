# ANIMORIZE — Future Decisions (migrated from DECISIONS.md)

> Sections below were moved out of DECISIONS.md to reduce always-loaded context.
> They cover future phases not yet in progress. Refer back to DECISIONS.md for active decisions.

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
