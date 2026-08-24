# Pre-Phase 4 — Docs update: decisions + conventions (v2)

> สำหรับ Claude Code · **docs เท่านั้น ห้ามแตะ code / SQL / package**
> Branch: `docs/pre-phase4-decisions` จาก `develop` ล่าสุด → **PR เข้า `develop` เท่านั้น** (verify base ก่อนเปิด)
> อ่านไฟล์จริงก่อนแก้ทุกไฟล์

## ⚠️ กฎการแก้ไฟล์ — 2 ประเภท ต่างกัน

- **DECISIONS.md = decision LOG** → **append** section ใหม่ + **annotate** entry เก่าที่ถูก revise (ใส่ note ชี้ `§P4`) — **ห้ามลบ/แก้เนื้อ entry เดิม** (รักษา history)
- **CLAUDE.md / PROGRESS.md = living SPEC** → **replace** บรรทัด/บล็อกที่ระบุได้เลย (สะท้อนสถานะปัจจุบัน ไม่ใช่ log)

---

## 1 · DECISIONS.md — append section ใหม่ "§P4 · Phase 4 — Progress Tracking (pre-implementation, 2026-06-07)"

> ใส่ anchor ที่อ้างถึงได้: heading ขึ้นต้น `## §P4 — ...` และ sub-decision เลข `§P4 1.x`

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
- **verify path นี้ explicit**: movie total=1 + default `airing_status='upcoming'` → mark → `current=1 >= 1 AND 'upcoming' <> 'ongoing'` → completed ✓ (เคสที่กฎเดิมพัง)

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

## 2 · DECISIONS.md — annotate stale entries (อย่าลบ ใส่ note ชี้ §P4)

1. section **"Atomic +1 Episode ผ่าน Postgres RPC (Phase 4)"** — bullet auto-complete `current = total → status='completed'`: **ต่อท้าย** บรรทัด note →
   `↳ 2026-06-07: completion revised → "new_ep >= total AND airing_status <> 'ongoing'"; increment เป็น CAS (from_episode). ดู §P4 1.1–1.2`
2. **Phase 4 roadmap → Features:**
   - `auto status update เมื่อ current = total → 'completed'` → ต่อท้าย ` (superseded — ดู §P4 1.2)`
   - `History page: รายการ watchlog ของ user` → ต่อท้าย ` (Phase 4 = per-media บน detail เท่านั้น; global page deferred — ดู §P4 1.7)`
   - **เพิ่ม** bullet ใต้ Features: `Rewatch (completed/dropped/on_hold → restart from ep 1) — ดู §P4 1.4`
   - **เพิ่ม** note: `−1/correction → deferred to Phase 5 "Edit progress" (ดู §P4 1.3)`
3. **Phase 5 roadmap** — เพิ่ม bullet: `"Edit progress" (set episode ตรงๆ) ใน ⋯ More menu — รับช่วง −1/correction จาก Phase 4 (§P4 1.3)`

---

## 3 · CLAUDE.md (living spec — **replace** บรรทัดที่ระบุ)

**3a · Key Business Rules** — replace บรรทัด `+1 Episode: current_episode++ → INSERT watchlog → ถ้า current=total → status='completed'` ด้วย:

```
- +1 Episode (CAS — Phase 4): client ส่ง from_episode → RPC increment_episode (SECURITY INVOKER, atomic)
    guard: user_id=auth.uid() AND current_episode=from AND from+1 <= total_episodes
    matched  → current=from+1 → INSERT watchlog → status: (from+1 >= total AND airing_status<>'ongoing') ? 'completed'(+completed_at) : 'watching' (started_at=COALESCE(started_at,now()))
    no match → no-op ทั้ง update และ watchlog (reason 'stale' — ไม่ใช่ error ไม่ toast)
- movie/special: mark = RPC เดิม (0→1) · unmark = reset pointer (current=0, plan_to_watch, ไม่ลบ watchlog)
- Rewatch (completed/dropped/on_hold): confirm → current=0, watching, started_at=now(), completed_at=null, rewatch_count+1 (guard status IN source set); ไม่แตะ watchlog เดิม
- −1/แก้ตอน: deferred → Phase 5 "Edit progress" (⋯ More menu)
```

> หมายเหตุ: บรรทัด `movie/special → total_episodes=1, toggle "Watched"` เดิม **คงไว้** (ยังถูก) — เพิ่มรายละเอียด mark/unmark ในบล็อกใหม่

**3b · Conventions → DO block** (CLAUDE.md **ไม่มี** section "Error Handling Strategy" — ใส่ใน Conventions) — เพิ่ม 2 บรรทัด:

```
- imperative client mutation (onClick/startTransition ที่ await action) → try/catch + toast เสมอ
- TanStack queryFn → throw ไม่ swallow; consumer ใช้ isError (ห้าม try/catch กลืนใน queryFn)
```

---

## 4 · PROGRESS.md (living spec)

- **Notes for Chat** update: pre-Phase 4 decisions locked (ชี้ DECISIONS §P4) · fix round 5 จุดตามมา (branch `fix/pre-phase4-hardening`) · Phase 4 scope = +1 CAS RPC + Rewatch + per-media history · design addendum (Rewatch UI) pending · −1 deferred → Phase 5
- **bump versions** (กฎ Session Sync): `decisions_version` + `claude_md_version` → `2026-06-07`
- **reminder**: `PROJECT_INSTRUCTIONS.md` (ฝั่ง Chat) ต้องอัปเดตโดยเจ้าของ — (ก) +1 business rule (CAS) ให้ตรง CLAUDE.md, (ข) cross-ref "ดู DECISIONS §C3" → ชี้ heading จริง `/dashboard = full library` (repo ไม่ได้ใช้ anchor §C3)

---

## เสร็จแล้ว

- เปลี่ยนเฉพาะ `DECISIONS.md`, `CLAUDE.md`, `PROGRESS.md`, `CHANGELOG.md` — **ไม่มี code/SQL/package**
- `CHANGELOG.md` เพิ่ม entry docs update
- Commit ตาม convention → **PR เข้า `develop`** (verify base ก่อนเปิด)
