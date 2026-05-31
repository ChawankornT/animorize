# Phase 2 — Part 0: Schema Migration + Types

อ่าน CLAUDE.md, DECISIONS.md, schema.sql ก่อนเริ่ม

## เป้าหมาย

สร้าง Phase 2 schema ทั้งหมด (tables, enums, triggers, RLS, indexes) แล้วอัปเดต types ให้ตรงกับ DB

## ก่อนเริ่ม — จัดโครงสร้าง schema

ย้ายจาก `schema.sql` ไฟล์เดียว → folder `schema/` เรียงตามลำดับ:

```
schema/
├── 00-extensions.sql        # pg_cron (comment ไว้ reference)
├── 01-enums.sql             # ทุก enum types
├── 02-profiles.sql          # profiles + auth trigger (Phase 1 — ย้ายจาก schema.sql เดิม)
├── 03-franchises.sql        # franchises table
├── 04-providers.sql         # providers table
├── 05-media.sql             # media table
├── 06-media-providers.sql   # media_providers junction table
├── 07-user-media.sql        # user_media (Phase 3 — สร้าง table ไว้ก่อนแต่ยังไม่ใช้)
├── 08-watchlogs.sql         # watchlogs (Phase 4 — สร้างไว้ก่อน)
├── 09-sync-logs.sql         # sync_logs
├── 10-system-settings.sql   # system_settings singleton
├── 11-rls.sql               # RLS policies ทุก table รวมกัน
├── 12-indexes.sql           # Performance indexes
└── README.md                # อธิบายลำดับ + วิธีรัน
```

ลบ `schema.sql` ที่ root แล้วแทนด้วย `schema/` folder

## 1. Enums (01-enums.sql)

เพิ่ม enums ที่ Phase 1 ยังไม่มี:

```
media_type:     anime, series, movie, ova, special, documentary
watch_status:   watching, completed, on_hold, dropped, plan_to_watch
airing_status:  ongoing, finished, upcoming
audio_type:     sub, dub
sync_result:    success, failed
```

> `user_role` มีอยู่แล้วใน Phase 1 — ย้ายมารวมในไฟล์นี้

## 2. Tables

### franchises (03-franchises.sql)

```
id              UUID PK default gen_random_uuid()
title_th        TEXT nullable
title_en        TEXT nullable
title_romaji    TEXT nullable
poster_url      TEXT nullable
synopsis        TEXT nullable
created_at      TIMESTAMPTZ default now()
updated_at      TIMESTAMPTZ default now()

CONSTRAINT: at_least_one_title — title_th OR title_en OR title_romaji ต้องมีอย่างน้อย 1
TRIGGER: updated_at auto-update
```

### providers (04-providers.sql)

```
id              UUID PK default gen_random_uuid()
name            TEXT NOT NULL UNIQUE
slug            TEXT NOT NULL UNIQUE
color           TEXT NOT NULL           -- hex color สำหรับ badge (#F47521)
logo_url        TEXT nullable
base_url        TEXT nullable           -- URL template
created_at      TIMESTAMPTZ default now()
updated_at      TIMESTAMPTZ default now()

TRIGGER: updated_at auto-update
```

### media (05-media.sql)

```
id              UUID PK default gen_random_uuid()
franchise_id    UUID FK → franchises(id) ON DELETE SET NULL
anilist_id      INTEGER UNIQUE nullable
media_type      media_type NOT NULL
title_th        TEXT nullable
title_en        TEXT nullable
title_romaji    TEXT nullable
synopsis        TEXT nullable
poster_url      TEXT nullable
genres          TEXT[] default '{}'
total_episodes  INTEGER default 1
season_quarter  INTEGER CHECK 1-4 nullable
season_year     INTEGER nullable
air_date_start  DATE nullable
air_date_end    DATE nullable
airing_status   airing_status default 'upcoming'
auto_sync       BOOLEAN default true
sort_order      INTEGER default 0
created_at      TIMESTAMPTZ default now()
updated_at      TIMESTAMPTZ default now()

CONSTRAINT: at_least_one_title
TRIGGER: updated_at auto-update
```

### media_providers (06-media-providers.sql)

```
id              UUID PK default gen_random_uuid()
media_id        UUID NOT NULL FK → media(id) ON DELETE CASCADE
provider_id     UUID NOT NULL FK → providers(id) ON DELETE CASCADE
audio           audio_type default 'sub'
base_url        TEXT nullable
created_at      TIMESTAMPTZ default now()

UNIQUE(media_id, provider_id, audio)
```

### user_media (07-user-media.sql) — สร้างไว้ Phase 3 ใช้

```
id              UUID PK default gen_random_uuid()
user_id         UUID NOT NULL FK → profiles(id) ON DELETE CASCADE
media_id        UUID NOT NULL FK → media(id) ON DELETE CASCADE
provider_id     UUID FK → providers(id) ON DELETE SET NULL nullable
audio           audio_type default 'sub'
status          watch_status default 'plan_to_watch'
current_episode INTEGER default 0
is_favorite     BOOLEAN default false
custom_url      TEXT nullable
started_at      TIMESTAMPTZ nullable
completed_at    TIMESTAMPTZ nullable
created_at      TIMESTAMPTZ default now()
updated_at      TIMESTAMPTZ default now()

UNIQUE(user_id, media_id)
TRIGGER: updated_at auto-update
```

### watchlogs (08-watchlogs.sql) — สร้างไว้ Phase 4 ใช้

```
id              UUID PK default gen_random_uuid()
user_id         UUID NOT NULL FK → profiles(id) ON DELETE CASCADE
media_id        UUID NOT NULL FK → media(id) ON DELETE CASCADE
episode_number  INTEGER NOT NULL
watched_at      TIMESTAMPTZ default now()
```

### sync_logs (09-sync-logs.sql)

```
id              UUID PK default gen_random_uuid()
media_id        UUID NOT NULL FK → media(id) ON DELETE CASCADE
result          sync_result NOT NULL
error_message   TEXT nullable
synced_at       TIMESTAMPTZ default now()
```

### system_settings (10-system-settings.sql)

```
id                  INTEGER PK default 1 CHECK (id = 1)    -- singleton
auto_sync_enabled   BOOLEAN default true
updated_at          TIMESTAMPTZ default now()

INSERT default row (1, true)
TRIGGER: updated_at auto-update
```

## 3. RLS Policies (11-rls.sql)

สร้าง `is_admin()` helper function:
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

**Policies:**
- `profiles` — เก็บ policy เดิมจาก Phase 1 (select/update own + restrictive role check) + เพิ่ม admin can view all
- `franchises, providers, media, media_providers` — authenticated SELECT (anyone), INSERT/UPDATE/DELETE (admin only via `is_admin()`)
- `user_media` — CRUD เฉพาะ `auth.uid() = user_id`
- `watchlogs` — SELECT + INSERT เฉพาะ `auth.uid() = user_id`
- `sync_logs` — SELECT + INSERT admin only
- `system_settings` — SELECT + UPDATE admin only

## 4. Indexes (12-indexes.sql)

```
idx_media_franchise     ON media(franchise_id)
idx_media_anilist       ON media(anilist_id)
idx_media_type          ON media(media_type)
idx_media_airing        ON media(airing_status)
idx_user_media_user     ON user_media(user_id)
idx_user_media_status   ON user_media(user_id, status)
idx_watchlogs_user      ON watchlogs(user_id)
idx_watchlogs_media     ON watchlogs(user_id, media_id)
idx_sync_logs_media     ON sync_logs(media_id)
```

## 5. อัปเดต types/database.ts

เขียน types ด้วยมือให้ตรงกับ schema ใหม่ (เพิ่มทุก table + enum types):
- เพิ่ม `Franchises`, `Providers`, `Media`, `MediaProviders`, `UserMedia`, `Watchlogs`, `SyncLogs`, `SystemSettings` tables
- เพิ่ม enum types: `MediaType`, `WatchStatus`, `AiringStatus`, `AudioType`, `SyncResult`

> หมายเหตุ: ปกติจะ gen จาก Supabase CLI แต่ตอนนี้เขียนด้วยมือก่อนเพื่อให้ typecheck ผ่าน — gen ทับทีหลังได้

## 6. อัปเดต schema/README.md

อธิบาย:
- วิธีรันแต่ละไฟล์ (ลำดับสำคัญเพราะ FK)
- ว่า Phase 1 tables (profiles) ที่ apply ไปแล้วไม่ต้องรันซ้ำ
- Phase 2 migration: รันเฉพาะ 01 (enums ใหม่) + 03-12

---

**หลังเสร็จ:** run `npm run typecheck` ให้ผ่าน แล้วอัปเดท PROGRESS.md

**ห้าม:**
- ห้ามแก้ logic ของ profiles table / auth trigger ที่ใช้งานอยู่แล้ว
- ห้ามเพิ่ม column ที่ไม่ได้อยู่ใน DECISIONS.md โดยไม่ถาม
- ห้ามลืม `updated_at` trigger สำหรับทุก table ที่มี updated_at column
