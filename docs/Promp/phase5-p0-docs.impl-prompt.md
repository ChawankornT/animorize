# Phase 5 — P0: Pre-phase docs update (impl prompt สำหรับ Claude Code)

> **rev 3** (2026-08-26) — §1.11 เปลี่ยนเป็น forward-only ไม่แตะ sync path (ตัด heuristic `/large/` ทิ้ง) · backlog รวมเป็น poster backfill + provenance
>
> **rev 2** — แก้ตาม code review pass บน `develop`: ordered rules §1.3 · `completed_at` COALESCE · sort label §1.14 · confirm gate §0
>
> **อ่านก่อนเริ่ม:** `PROGRESS.md` · `DECISIONS.md` · `CLAUDE.md` · `.claude/rules/*`
> **สื่อสาร:** ไทยผสม technical term อังกฤษ
> **Branch:** `feature/phase5-p0-docs` → **PR เข้า `develop` เท่านั้น** (ห้าม PR เข้า `main`)

## ⛔ Scope guard — docs-only

**ห้ามแตะ:** `src/**` · `schema/**` · `supabase/**` · `package.json` / `package-lock.json` · test files ใด ๆ · `.design-bundle/**`

**แตะได้เฉพาะ:** `DECISIONS.md` · `CLAUDE.md` · `PROGRESS.md` · `CHANGELOG.md` · `PROJECT_INSTRUCTIONS.md`

ไม่มี lint/typecheck/test ให้รัน (ไม่มี code เปลี่ยน) — แต่ต้อง `npm run format` ถ้า prettier คุม markdown อยู่

---

## 0. Git — recreate `develop` จาก `main`

Phase 4 released แล้ว (PR #28, merge commit `099dd1e`) — ทำเหมือนตอนปิด Phase 3 เพื่อให้ history สะอาด

**Verify ก่อนทำ (ห้ามข้าม):**

```bash
git fetch --all --prune
git diff main develop --stat        # ต้องว่าง = content เท่ากัน
git log --oneline main..develop      # ต้องว่าง = ไม่มี commit ค้างบน develop
git branch -a                        # ยืนยันไม่มี feature branch ค้าง
```

- **ถ้า `git diff` หรือ `main..develop` ไม่ว่าง → หยุด รายงาน owner ทันที ห้าม recreate**
- **ถ้า `develop` มี branch protection แล้ว force-delete ไม่ผ่าน → หยุด รายงาน owner** (owner ต้องปลด protection ชั่วคราวเอง)

**เมื่อ verify ผ่าน — ⛔ ต้องขอ confirm จาก owner ก่อนรัน `git push origin --delete develop` เสมอ** (force-delete branch ที่แชร์กับ remote ห้ามทำอัตโนมัติ แม้ prompt จะสั่งไว้)

```bash
git checkout main && git pull
git push origin --delete develop   # ← หยุดตรงนี้ ขอ confirm ก่อน
git branch -D develop
git checkout -b develop main
git push -u origin develop
```

**บริบทที่ควรบอก owner ตอนขอ confirm:** ตอนนี้ content ของสอง branch เท่ากันแล้ว ขั้นตอนนี้จึง **ไม่เปลี่ยนไฟล์อะไรเลย** — ได้แค่ ref history ที่สะอาด (ไม่มี merge commit เก่าค้าง) ถ้า owner เห็นว่าไม่คุ้มกับความเสี่ยง **ข้ามได้ ไม่กระทบงานที่เหลือใน P0**

จากนั้นค่อยแตก `feature/phase5-p0-docs` จาก `develop` ใหม่

---

## 1. `DECISIONS.md` — append section `§P5`

เพิ่ม section ใหม่ใต้ Phase 4 (ตาม numbering style เดิม `§P4 1.x`) — **append เท่านั้น ห้ามแก้ entry เก่าใน section นี้**

> เคาะ 2026-08-25 — planning session ก่อนเปิด Phase 5

### 1.1 Edit progress = absolute set — ไม่ใช้ CAS ไม่ใช้ RPC

CAS (§P4 1.1) มีไว้แก้ปัญหาของ **relative** increment (`from → from+1` แข่งกัน) — absolute set idempotent อยู่แล้ว ไม่มี lost-update ที่ต้องกัน

แตะตารางเดียว (`user_media`) ไม่ต้อง atomic ข้าม table → **plain UPDATE ผ่าน repository พอ ไม่ต้อง RPC ไม่ต้อง migration** (RLS บน `user_media` เป็น `ALL command` — ยืนยันแล้วว่า direct UPDATE ผ่าน policy)

guard: `user_id = auth.uid()` + `0 <= n <= total_episodes` · **ไม่มี reason `stale`** (ไม่มี CAS ก็ไม่มี stale path)

### 1.2 watchlog policy = ไม่แตะเลย

Edit progress **ไม่เขียน ไม่ลบ ไม่ backfill** `watchlogs` ทุกกรณี

**เหตุผล:** สอดคล้อง `unmarkWatched` ที่ "ไม่ลบ watchlog" อยู่แล้ว · `watchlogs` = **log ของการกระทำ** (ผู้ใช้เคยกด +1 ตอนไหน) ไม่ใช่ mirror ของ pointer

**Cost ที่ยอมรับ:** ปรับ 5 → 8 แล้ว history ไม่มี ep 6–8 → copy ต้องไม่โกหก (ดู §P5 1.7)

### 1.3 Status transition rules — **เรียงลำดับ เช็คบนลงล่าง เจอข้อแรกที่ match แล้วหยุด**

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

### 1.4 ไม่มี confirm modal — inline warning แทน

Edit progress มี **explicit input + Save** = confirmation ในตัวอยู่แล้ว (ต่างจาก Rewatch ที่กดปุ่มเดียวแล้ว reset ทันที ซึ่งจำเป็นต้อง confirm)

**inline warning เฉพาะเคสเดียว:** `completed → non-completed` เพราะทำลาย `completed_at` ถาวร → warning 13px `status-warning` ใต้ input

หลังแก้ §P5 1.3 (`COALESCE`) แล้ว **นี่คือ path เดียวที่ `completed_at` หายได้** — ผู้ใช้จะได้รับการเตือนทุกครั้งที่ข้อมูลจะหายจริง ไม่มี silent destruction เหลืออยู่

### 1.5 `⋯ More` enabled เสมอ — disable item ข้างในแทน

ห้าม disable ปุ่ม `⋯` ตัวเอง (มีปุ่มแต่กดไม่ได้ = สับสน) · disabled item ต้องมี **reason text** ไม่ใช่เทาเฉย ๆ

### 1.6 `total_episodes = 0` → Edit progress item disabled

reason: "Episode count not set" — **ห้าม bypass range guard** (ไม่งั้นได้ `current_episode > total_episodes`)

เป็น data gap คนละเรื่อง (AniList ไม่ส่ง episode count) — admin เติมที่ `/admin/media/[id]`

### 1.7 Watch history = activity log ไม่ใช่ mirror ของ pointer

copy เดิม `last {n} episodes` โกหกทันทีที่ §P5 1.2 มีผล → เปลี่ยนเป็น heading **"Recent activity"** + sub `{n} recent entries`

movie/series ใช้ copy เดียวกัน — ปิดหนี้ F4 hardcode (`"1 watch"`) ไปด้วย

### 1.8 Filter active → All view ยุบเป็น flat grid

3 sections (Currently watching / Favorites / All titles) เป็น affordance ของ **unfiltered overview** — พอ filter แล้วซอยต่อจะนับซ้ำและสับสน → flat grid + active filter chips + "Clear"

### 1.9 Filter / sort / search state เก็บใน URL `searchParams`

ไม่ใช่ client state — shareable link, back button ทำงาน, Server Component อ่านได้

### 1.10 Dark mode = cookie + Server Action → `data-theme` ตอน SSR

**ไม่ใช้ localStorage** เพราะ Next.js App Router SSR → localStorage อ่านได้หลัง hydrate → FOUC → ต้องยัด inline blocking script ใน `<head>`

cookie อ่านได้ที่ Server Component → set `data-theme` ตอน SSR เลย → **ไม่มี flash** และ mutation ผ่าน Server Action ตรง convention

### 1.11 `coverImage.extraLarge` — forward-only ที่ import · ไม่แตะ sync path

**ทำใน P4:** `lib/anilist/mapper.ts:40` เปลี่ยน `coverImage.large` → `coverImage.extraLarge` · มีผลกับ **import ใหม่เท่านั้น** · ไม่มีเงื่อนไข ไม่มี heuristic ไม่มีความเสี่ยง

**กฎ "Sync ไม่ overwrite `poster_url`" คงเดิมทั้งข้อ — ไม่เจาะข้อยกเว้น** (ยกเลิกแนวทางเดิมที่จะผ่อนกฎแบบมีเงื่อนไข)

**เหตุผลที่ไม่แตะ sync path:**

1. **Auto-sync ยิงเฉพาะ `airing_status = 'ongoing'`** (`system_settings.enabled AND media.auto_sync AND ongoing`) → เรื่อง `finished` ซึ่งเป็นส่วนใหญ่ของ library **ไม่มีวันถูก sync** → กลไกใน sync path จะช่วยได้แค่เศษเสี้ยวของปัญหาที่ตั้งใจแก้
2. library เก่าต้องมี **backfill** อยู่ดี → การมี special case ใน sync ที่แก้ได้ ~10% แล้วยังต้อง backfill อีก 90% = **โค้ดสองทางแก้เรื่องเดียวกัน** สู้ทำทางเดียวให้จบทีเดียว
3. ตัดทิ้งแล้ว **known coupling กับ CDN path convention ของ AniList หายไปเลย** — ไม่มี business logic ผูกกับ URL string

**ถ้าอนาคตจะทำ upgrade ตอน sync จริง ๆ:** ห้ามใช้ substring `/large/` (admin วาง URL ที่มีคำนี้ก็โดนทับ) — ให้เทียบตรงกับ response ที่มีอยู่ในมือแล้ว และต้องยอมรับทั้งสองค่า เพราะหลัง P4 row ใหม่จะเก็บ `extraLarge` มาแต่แรก:

```
poster_url === response.coverImage.large      → row เก่า ยังไม่เคยถูกแก้ → upgrade ได้
poster_url === response.coverImage.extraLarge → row ใหม่ ถูกต้องแล้ว   → no-op
ไม่ตรงทั้งคู่                                  → admin แก้ / AniList เปลี่ยนรูป → ไม่แตะ (fail-closed)
```

**หลัก fail-closed:** พิสูจน์ไม่ได้ว่า URL มาจาก sync → ถือว่าเป็นของ admin → ไม่แตะ · ราคาของความผิดพลาดไม่เท่ากัน — ทับของ admin = ทำลายการตัดสินใจของคน กู้ไม่ได้ · ไม่ upgrade = รูปละเอียดต่ำกว่าที่ควร ใช้งานได้ปกติ แก้ทีหลังได้

**Backfill library เก่า → Backlog §4** (ต้องมี admin action หรือ provenance column)

### 1.12 Phase 5 = single release · ไม่มี schema migration

merge `develop → main` ครั้งเดียวตอนปิด phase (owner: "ไม่รีบ")

**ยืนยันแล้วว่าไม่มี migration ทั้ง phase** — 1.1 ไม่ต้อง RPC · 1.15 ตัด Rewatch ออกจาก More จึงไม่ต้องแตะ `startRewatch` guard → `schema_version` ไม่ต้อง bump · `src/types/database.ts` ไม่แตะ

**ผลข้างเคียงที่ต้องคุม:** release PR จะใหญ่ → `develop` ต้อง deployable ทุก PR (verify บน staging `dev.animorize.com` รายรอบ) · ห้ามทิ้ง feature ค้างครึ่ง ๆ ข้าม PR

### 1.13 Tabs × Filter × Sort — สามชั้น ไม่ทับกัน

- **Tabs = ขอบเขต** (`All` / `Watching` / `Favorites`) — คงเดิมทั้ง 3 ตัว
- **Filter = กรอง status ภายในขอบเขตปัจจุบัน** — **ซ่อนปุ่ม Filter ตอนอยู่ tab `Watching`** (tab นั้น lock status แล้ว → กันเคส tab Watching + filter Completed = จอว่าง) · tab `Favorites` ยังกรอง status ได้ปกติ
- **Sort = ลำดับ**

**ที่พิจารณาแล้วไม่เอา:** ยุบ tab `Watching` เข้า Filter — จะทำให้ watching กลายเป็น 2 คลิกและถูกซ่อน ขัดกับ requirement ว่า watching/favorite ต้องเข้าถึงง่ายโดยไม่ต้องตั้งค่า

### 1.14 Sort = 3 ตัวเลือก · default = `updated_at DESC` · **label = "Recently active" ไม่ใช่ "Recently watched"**

`Recently active` (default, = `updated_at DESC` ล้วน) · `Recently added` · `Title A–Z`

⚠️ **เบี่ยงจาก design copy 1 คำ โดยตั้งใจ** — `user_media_updated_at` เป็น generic `BEFORE UPDATE` trigger ครอบทุก column (`schema/07-user-media.sql:23-25`) → กด favorite เฉย ๆ หรือเปลี่ยน provider ก็ bump `updated_at` ด้วย

ถ้าติดป้าย "Recently watched" ทับ = **โกหกแบบเดียวกับที่ §P5 1.7 เพิ่งแก้ให้ watch history** ("Recent activity") · "Recently active" ตรงกับสิ่งที่ column เก็บจริง = ทุก user action บนรายการนั้น (และ `updated_at` bump จาก user action เท่านั้น — auto-sync แตะตาราง `media` ไม่ใช่ `user_media`)

**semantics "Recently watched" จริง ๆ ต้องมี column `last_watched_at`** → รอ phase ที่มี migration ได้ (Backlog §4) · **ห้าม** ทำเป็น aggregate join บน `watchlogs` ใน P3 — `unmarkWatched` ไม่ลบ watchlog (§P4) ทำให้ movie ที่ unmark แล้วยังมี "watch activity" ค้าง = สร้างการโกหกอันใหม่แทน

**Composite sort (§Phase 3) retire จากการเป็น global sort** — `librarySort` + `STATUS_PRIORITY` เหลือใช้แค่จัดลำดับ **ภายใน section**

**เหตุผล:** ทุก view มี priority จากที่อื่นอยู่แล้ว — All tab มี 3 sections · Watching/Favorites tab กรองให้แล้ว · Filter active คือคำสั่ง priority เอง → composite เป็น global sort จึงซ้ำซ้อน และป้าย "Recently watched" ที่วางทับ composite ก็โกหกผู้ใช้

**ที่พิจารณาแล้วไม่เอา:** จำกัด Currently watching เป็น window 1 เดือน — คนที่ดูช้า (เดือนละตอน) หรือ series ที่ break กลางคอร์จะหายจาก highlight เงียบ ๆ ทั้งที่ยังดูอยู่จริง · UI ที่เปลี่ยนเองตามเวลาโดยผู้ใช้ไม่ได้ทำอะไร = หาของไม่เจอ (ทางแก้ที่รับไว้แทน → Backlog §4)

**advanced sort** (asc/desc, grouping) → Phase 6+ · Phase 5 คงไว้ 3 ตัวเลือกตลอด

### 1.15 `⋯ More` menu — 2 items

```
Edit progress          (edit)   — disable เมื่อ total_episodes = 0
─────────────────
Remove from library    (trash)  — destructive
```

- **Rewatch ไม่เข้า More** — `startRewatch` guard = `status IN (completed, dropped, on_hold)` ถ้าใส่แล้ว user ที่ `watching` กด → RPC no-op เงียบ (reason `stale`) = ปุ่มตายที่มองไม่เห็น · ผ่อน guard ได้แต่ต้องแตะ SQL = ขัด §P5 1.12 → **รอ demand จริงค่อยกลับมาแก้** (owner: เคยตัดสินใจแนวนี้มาแล้ว)
- **Change provider ไม่เข้า More** — provider table มีปุ่ม "Switch to" อยู่แล้ว (ดู Backlog §4)
- **Remove from library เข้า More อันเดียวกัน** ไม่แยกเป็น `⋯` ที่สอง — DS รองรับ pattern นี้แล้ว (`.popover-divider` + `.popover-item--destructive`) และ divider ทำหน้าที่แยก scope ให้สายตาอยู่แล้ว · สอง `⋯` ในหน้าเดียวสับสนกว่า · ถ้าอนาคตมี page-scope action เพิ่มค่อยแยกทีหลัง
- `removeFromLibraryAction` **มีอยู่แล้วแต่ยังไม่ถูกใช้ที่ไหน** → More menu = consumer แรก

**ผลพลอยได้:** branch ⑤ dead-end (§P4 findings) ถูกปิดด้วย Edit progress

### 1.16 Responsive — แยก wide-screen ออกจาก mobile

- **P7a wide-screen (ทำใน Phase 5):** container max-width · `lib-grid` เปลี่ยนเป็น `auto-fill / minmax` แทน 4 คอลัมน์ตายตัว (จอ 2K 27" ได้ 6–7 ใบขนาดเท่าเดิม แทนที่จะยืดใหญ่และโล่ง) · detail page คุม prose column
- **P7b mobile/tablet → เลื่อนไป Phase 6+** — รอ feature นิ่งก่อน (อาจมี feature เพิ่ม/ลดอีก) และต้องมี design จริง (bundle ปัจจุบัน **ไม่มี `@media` แม้แต่บรรทัดเดียว**)

⚠️ **ผลต่อ a11y scope:** WCAG 2.1 AA มีข้อ **1.4.10 Reflow** (ใช้งานได้ที่ 320px) → P8 เคลม "AA เต็ม" ไม่ได้ ต้องเขียนตรงว่า **"WCAG 2.1 AA ยกเว้น 1.4.10 Reflow — รอ P7b"**

---

## 2. `DECISIONS.md` — annotate entry เดิมที่ superseded

**ห้ามลบของเก่า** — เติม pointer ต่อท้าย entry เดิม (ตาม pattern ที่ใช้กับ `/dashboard` decision ใน Phase 3)

| entry เดิม                                                            | annotation ที่ต้องเติม                                                                         |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| §P4 1.3 (`−1`/correction → deferred to Phase 5)                       | superseded by §P5 1.1–1.4 — Edit progress รับช่วงแล้ว                                          |
| "decision i" — ห้ามแตะ `FavoriteButton.tsx` (ใน Part 2b impl prompt)  | **overridden 2026-08-24** โดย owner ("fav เอาตาม design เลย") → `variant?: "icon" \| "inline"` |
| Phase 3 — composite sort "locked" (ใต้ `/dashboard` = full library)   | superseded by §P5 1.14 — retire จาก global sort, เหลือใช้ใน section                            |
| Business Rules — "Sync ไม่ overwrite: title_th, synopsis, poster_url" | **ไม่ต้องแก้** — §P5 1.11 ยืนยันกฎนี้คงเดิมทั้งข้อ (เคยพิจารณาเจาะข้อยกเว้นแล้วยกเลิก)         |

---

## 3. `DECISIONS.md` — ย้าย Phase 4 findings จาก PROGRESS เข้า log ถาวร

⚠️ **สำคัญเรื่อง timing:** `PROGRESS.md` → "Notes for Chat" เป็น **living spec** จะถูกเขียนทับตอน Phase 5 แต่ตอนนี้มัน hold decision ถาวร 4 ข้อที่ยังไม่มีใน `DECISIONS.md` → **ย้ายก่อนที่หลักฐานจะหาย**

เพิ่มเป็น sub-section ใต้ Phase 4 (`§P4 — as-built findings`):

1. **Favorite variant** — owner override "decision i"; `FavoriteButton` มี `variant?: "icon" | "inline"`; `icon` = circular overlay เดิม (`MediaCard`/`LibraryView`), `inline` = full-width ghost + label (`EpisodeTracker`)
2. **`isMovie` = `!isTrackable(media)`** (movie/special เท่านั้น) — design เขียน `type === "movie" || total === 1` แต่ **business rule ชนะ design**: anime 1 ตอนยัง trackable ปกติ
3. **Watch history ไม่มี provider column** — design โชว์ `ProviderPill` 3 คอลัมน์ แต่ §P4 1.7 ระบุไม่มี → **business rule ชนะ design** (2 คอลัมน์)
4. **Branch ⑤ dead-end** — ongoing series → `airing_status` flip เป็น finished ตอน user อยู่ที่ ep cap + `status = 'watching'` → `canIncrement = false`, `canRewatch = false` → ไม่มีทางออก · **ปิดโดย §P5 1.15 (Edit progress)** — เป็น acceptance criterion ของ P2

---

## 4. `DECISIONS.md` — Phase 5 roadmap reword + Backlog

**Reword roadmap Phase 5 เดิม:**

- `Responsive (mobile hamburger)` → **`Wide-screen scaling (container max-width, fluid grid)`** + หมายเหตุว่า mobile/tablet ย้ายไป Phase 6+ (§P5 1.16)
- `Accessibility: WCAG 2.1 AA` → **`WCAG 2.1 AA ยกเว้น 1.4.10 Reflow`**
- `Library filter/sort/search popover` → เติม pointer ไป §P5 1.13/1.14
- `"Edit progress" ใน ⋯ More menu` → เติม pointer ไป §P5 1.1–1.7, 1.15
- **เพิ่มรายการใหม่:** Back button ใน `/media/[id]` (`chevron-left` ghost ก่อน breadcrumb, **link ตรงไป `/dashboard` ไม่ใช่ `router.back()`** — เข้าจาก URL ตรง ๆ แล้ว back จะเด้งออกนอกแอป)
- **เพิ่มรายการใหม่:** DS `Popover` component (BRAND §10.11) — ยังไม่มีใน `components/ui/`

**เพิ่ม Backlog entries:**

| item                                   | note                                                                                                                                                                                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Wire "Switch to" (change provider)** | provider table ใน `/media/[id]` เป็น read-only ตั้งแต่ Part 2a — **ยังไม่ wire** → เป็นงานใหม่ทั้งก้อน (action + optimistic + confirm) ไม่ใช่แค่เพิ่ม confirm · ⚠️ ตรวจว่าซ้ำกับรายการ Phase 7 หรือไม่ก่อนจัดคิว                                             |
| **Stale-watching nudge**               | "ไม่ได้แตะ X มา 2 เดือน — ยังดูอยู่ไหม?" → เสนอ on hold / dropped · ให้ผู้ใช้ตัดสิน ไม่ใช่ UI ซ่อนเอง (ทางแก้แทน window 1 เดือนที่ปฏิเสธไปใน §P5 1.14) → Phase 6+                                                                                            |
| **Section collapse**                   | Currently watching ยาวเกิน N ใบ → collapse + "Show all" (ไม่มีอะไรหาย แค่พับ)                                                                                                                                                                                |
| **Advanced sort**                      | asc/desc toggle, grouping → Phase 6+                                                                                                                                                                                                                         |
| **`totalEpisodes = 0` data gap**       | AniList ไม่ส่ง episode count → `+1` ถูก block และ Edit progress disabled · ต้องมี admin surface เติม/แจ้งเตือน                                                                                                                                               |
| **`last_watched_at` column**           | ต้องมี column จริงถึงจะมี sort "Recently watched" ที่ไม่โกหกได้ (`updated_at` bump จาก fav/provider ด้วย — §P5 1.14) → phase ที่เปิด migration ได้                                                                                                           |
| **poster backfill + provenance**       | library ที่ import ก่อน P4 ยังเป็น `large` และ **auto-sync ยิงเฉพาะ `ongoing`** → เรื่อง `finished` ไม่มีวันได้ `extraLarge` เลย · ต้องมี admin backfill action + column บอกที่มาของ poster (เลิกเดาจาก URL string — §P5 1.11) → phase ที่เปิด migration ได้ |

---

## 5. `CLAUDE.md` — sync business rules

เพิ่ม/แก้ block ใน Business Rules:

```
Edit progress (⋯ More): set episode ตรงๆ (absolute) — ไม่ใช่ CAS, ไม่ใช่ RPC, ไม่มี migration
  guard: user_id = auth.uid() AND 0 <= n <= total_episodes (ต้อง total > 0)
  ordered rules — เช็คบนลงล่าง เจอข้อแรกที่ match แล้วหยุด (ห้ามอ่านเป็น match-any):
    1. status ∈ {dropped, on_hold}       → คง status เดิม แก้แค่ pointer, ไม่แตะ timestamp
    2. n = 0                             → เหมือน unmark (current=0, plan_to_watch, completed_at=null)
    3. n >= total AND airing ≠ 'ongoing' → completed, completed_at = COALESCE(completed_at, now())
    4. n >= total AND airing = 'ongoing' → watching (caught-up), started_at = COALESCE(...), completed_at = null
    5. 0 < n < total                     → watching, started_at = COALESCE(started_at, now()), completed_at = null
  completed_at ต้อง COALESCE — กัน save ซ้ำตอน completed แล้วทับวันที่ดูจบจริง
  ไม่แตะ watchlogs และ rewatch_count ทุกกรณี

⋯ More menu: Edit progress + divider + Remove from library (destructive) — enabled เสมอ, disable item ข้างใน

Library view:  Tabs = ขอบเขต (All/Watching/Favorites) · Filter = กรอง status ภายในขอบเขต (ซ่อนใน tab Watching) · Sort = ลำดับ
Library sort:  default = updated_at DESC · เลือกได้ 3 แบบ: Recently active / Recently added / Title A–Z
               label "Recently active" ไม่ใช่ "Recently watched" — updated_at bump จาก user action ทุกชนิด (fav, provider) ไม่ใช่การดูอย่างเดียว
               composite sort เหลือใช้ภายใน section เท่านั้น (ไม่ใช่ global sort แล้ว)
Filter active: All view ยุบ 3 sections → flat grid
Filter/sort/search state: URL searchParams

Dark mode: cookie + Server Action → data-theme ที่ <html> ตอน SSR (ห้ามใช้ localStorage — FOUC)

Sync ไม่ overwrite: title_th, synopsis, poster_url  (ไม่มีข้อยกเว้น)
AniList mapper ใช้ coverImage.extraLarge — มีผลกับ import ใหม่เท่านั้น (forward-only)
  library เก่ายังเป็น large · auto-sync ยิงเฉพาะ ongoing → finished ไม่มีวันได้ extraLarge จนกว่าจะมี backfill (Backlog)
```

แก้บรรทัด Dashboard เดิมให้ชี้ไป §P5 1.13/1.14 ด้วย

---

## 6. `PROJECT_INSTRUCTIONS.md` — bump

- เพิ่ม business rule block เดียวกับ §5 (ย่อได้ แต่ต้องมี Edit progress + Tabs/Filter/Sort + dark mode)
- แก้ Phase 5 line ให้ตรงกับ roadmap ใหม่
- **bump `instructions_version`: `2026-06-18-v1` → `2026-08-25-v1`**
- ⚠️ ใน "เสร็จแล้ว" ต้องแจ้ง owner ว่า **ต้อง re-upload PROJECT_INSTRUCTIONS เข้า Claude Chat project** ไม่งั้น Chat จะถือ version เก่า

---

## 7. `PROGRESS.md`

- ปิด Phase 4 ให้เรียบร้อย (ถ้ายังมีบรรทัดค้าง) + บันทึก develop recreate
- **เพิ่ม section Phase 5** พร้อม task list 9 parts:

| Part | ขอบเขต                                                                                                                          | สถานะ                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| P0   | Pre-phase docs (อันนี้)                                                                                                         | in progress                     |
| P1   | DS chore — `Popover` component ใหม่ · `Modal` → native `<dialog>` · shared `ToastPortal` (ยุบ 3 duplicate)                      | blocked by P0                   |
| P2   | Edit progress + `⋯ More` menu + Back button                                                                                     | blocked by P1 + design addendum |
| P3   | Filter / Sort / Library search (design พร้อมใน bundle แล้ว)                                                                     | blocked by P1                   |
| P4   | Admin เก็บตก — MediaCard admin shortcut · media list search · mapper → `coverImage.extraLarge` (forward-only, ไม่แตะ sync path) | —                               |
| P5   | loading / error / empty audit + retry · `sanitizeSearchTerm` escape แทน strip                                                   | —                               |
| P6   | Dark mode (cookie + SSR)                                                                                                        | —                               |
| P7a  | Wide-screen scaling                                                                                                             | —                               |
| P8   | a11y WCAG 2.1 AA (ยกเว้น 1.4.10)                                                                                                | —                               |
| P9   | Motion wrapper — page transition, card enter, list stagger, `prefers-reduced-motion`                                            | —                               |

จบ P9 → **release PR `develop → main`** (single release, §P5 1.12)

- **เคลียร์ "Notes for Chat" ของ Phase 4** — เนื้อถาวรถูกย้ายเข้า DECISIONS แล้ว (§3) เหลือ pointer สั้น ๆ ว่า "Phase 4 as-built findings → DECISIONS §P4"
- Notes for Chat ใหม่ = สถานะ P0 + สิ่งที่ยัง block

**Guardrail ที่ต้องเขียนใน PROGRESS:** P2/P3 ต้องเขียน UI ใหม่ให้ได้ a11y baseline (keyboard + aria + focus) **ตั้งแต่แรก** — P8 = audit ทั้ง codebase ไม่ใช่ retrofit ของที่เพิ่งสร้างเอง

---

## 8. `CHANGELOG.md`

entry เดียว ตาม convention เดิม — `docs(phase5): P0 pre-phase docs — §P5 decisions (16), Phase 4 findings → DECISIONS, roadmap reword, develop recreated from main`

---

## 9. เสร็จแล้ว

- [ ] `develop` recreate จาก `main` สำเร็จ (หรือรายงาน owner ถ้าติด protection)
- [ ] `DECISIONS.md` — §P5 1.1–1.16 ครบ 16 ข้อ
- [ ] `DECISIONS.md` — annotate 4 entries เดิม (§2) · ย้าย Phase 4 findings 4 ข้อ (§3) · roadmap reword + Backlog 7 items (§4)
- [ ] `CLAUDE.md` sync
- [ ] `PROJECT_INSTRUCTIONS.md` bump → `2026-08-25-v1`
- [ ] `PROGRESS.md` — Phase 5 section + task list + Notes เคลียร์
- [ ] `CHANGELOG.md`
- [ ] `npm run format` (ถ้า prettier คุม markdown)
- [ ] **ยืนยันว่าไม่มีไฟล์ใน `src/` `schema/` `package.json` ถูกแตะ** — `git diff --name-only develop` ต้องมีแต่ 5 ไฟล์ docs
- [ ] **เปิด PR เข้า `develop` เท่านั้น** (verify base branch ก่อนกด)

**รายงานกลับ owner:** PR number · ยืนยัน develop recreate · **เตือนให้ re-upload `PROJECT_INSTRUCTIONS.md`** เข้า Chat project

---

## หมายเหตุสำหรับ session ถัดไป (ไม่ต้องทำใน P0)

**Design addendum ที่ต้องสั่ง Claude Design ก่อนเริ่ม P2:**

1. **`⋯ More` popover** — 2 items ตาม §P5 1.15 + **disabled item state พร้อม reason text** (DS ปัจจุบันมีแค่ default / hover / `--destructive` — ไม่มี disabled)
2. **Edit progress inline mode** — tracker card เข้า edit mode แทนปุ่ม `+1`: number input + `/ {total}` + Save (primary sm) / Cancel (ghost sm) · Enter = save, Esc = cancel · inline warning state (§P5 1.4)

**P3 ไม่ต้องรอ design** — `library-screens.jsx#FilterPopoverDemo` / `#SortPopoverDemo` + `PopoverMenu` + `.popover*` CSS + `SearchInput` มีครบใน bundle แล้ว (verified 2026-08-25)
