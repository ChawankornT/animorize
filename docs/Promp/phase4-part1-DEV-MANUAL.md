# Animorize — Phase 4 Part 1 · **DEV MANUAL** (เจ้าของทำเอง)

> **Actor: เจ้าของ (manual).** สิ่งที่ Claude Code ทำไม่ได้/ไม่ควรทำ → ทำมือ
> Docker WSL2 ติด → migration ผ่าน Supabase SQL Editor (ตามที่ทำมาตลอด)
> SoT = DECISIONS §P4 1.2 · SQL ที่นี่ต้องตรงกับ `schema/` ที่ Code เขียน

---

## ลำดับแนะนำ

- **Step 1–2 ทำ “ก่อน” Code เขียนเสร็จได้** → ถ้า `types/database.ts` มี RPC + `rewatch_count` ก่อน Code implement, Code จะ implement clean ไม่ต้อง cast/TODO
- ถ้าทำหลัง: Code จะ cast + ใส่ `// TODO` ไว้ → หลัง Step 2 commit types แล้ว ให้ Code (รอบถัดไป) ตัด cast ออก

---

## Step 1 — Apply migration (Supabase SQL Editor · project `animorize-dev`)

รัน **ตามลำดับ** (ALTER ก่อน FUNCTION — return type ผูก shape ปัจจุบัน):

**1a. Column**

```sql
ALTER TABLE public.user_media ADD COLUMN IF NOT EXISTS rewatch_count integer NOT NULL DEFAULT 0;
```

**1b. RPC** — paste จากไฟล์ `schema/` ที่ Code เขียน (เนื้อหาตรงกับ DECISIONS §P4 1.2):

```sql
CREATE OR REPLACE FUNCTION public.increment_episode(
  p_user_media_id uuid,
  p_from_episode  int
)
RETURNS public.user_media
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_row public.user_media;
BEGIN
  UPDATE public.user_media AS um
  SET
    current_episode = p_from_episode + 1,
    started_at      = COALESCE(um.started_at, now()),
    status = CASE
      WHEN p_from_episode + 1 >= m.total_episodes AND m.airing_status <> 'ongoing'
        THEN 'completed'::public.watch_status
      ELSE 'watching'::public.watch_status
    END,
    completed_at = CASE
      WHEN p_from_episode + 1 >= m.total_episodes AND m.airing_status <> 'ongoing'
        THEN now()
      ELSE NULL
    END
  FROM public.media AS m
  WHERE um.id = p_user_media_id
    AND um.media_id = m.id
    AND um.user_id = auth.uid()
    AND um.current_episode = p_from_episode
    AND p_from_episode + 1 <= m.total_episodes
  RETURNING um.* INTO v_row;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.watchlogs (user_id, media_id, episode_number)
  VALUES (v_row.user_id, v_row.media_id, p_from_episode + 1);

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_episode(uuid, int) TO authenticated;
```

---

## Step 2 — Regen `types/database.ts` (remote, ไม่ต้อง Docker)

> ⚠️ `gen types` **print ออก stdout ไม่เขียนไฟล์เอง** → ต้อง **redirect เข้าไฟล์** ไม่งั้น `database.ts` ไม่อัปเดต (`.temp/linked-project.json` ที่ขึ้นมาเป็นแค่ไฟล์ link ไม่ใช่ types)

**cmd** (CLI cache แล้วหลังกด y รอบแรก → ไม่ prompt → ไฟล์สะอาด):

```cmd
npx supabase gen types typescript --project-id <DEV_PROJECT_ID> --schema public > src/types/database.ts
```

- **cmd `>` เขียน UTF-8 ปกติ** (UTF-16 เป็นปัญหาเฉพาะ PowerShell)
- **PowerShell** ใช้แทน: `... --schema public | Out-File -Encoding utf8 src/types/database.ts`

เช็คไฟล์มี `rewatch_count` (ใน `user_media`) + `increment_episode` (ใน `Functions`) แล้ว commit เข้า branch `feature/phase4-backend` (checkpoint ก่อน runtime/Part 2)

---

## Step 3 — Smoke test (SQL Editor หลัง apply)

> ⚠️ **SQL Editor รันเป็น role `postgres` ไม่มี JWT → `auth.uid()` = NULL** → guard `um.user_id = auth.uid()` ไม่ match → คืน NULL (function ไม่ได้พัง)
> ต้อง fake `sub` claim ก่อนเรียก RPC ทุกครั้ง

```sql
-- 0) หา row ทดสอบ (เอา id + media context — ใช้ id ตัวเดียวพอ, sub/from ดึงอัตโนมัติ)
SELECT um.id, um.user_id, um.current_episode, m.total_episodes, m.airing_status
FROM user_media um JOIN media m ON m.id = um.media_id
ORDER BY m.airing_status, m.total_episodes
LIMIT 15;

-- 1) เช็ค claim ติดก่อน — ต้องเห็น auth.uid() เป็น uuid (null = ไม่ติด → fallback)
BEGIN;
SELECT set_config('request.jwt.claims',
  (SELECT json_build_object('sub', user_id)::text FROM user_media WHERE id = '<USER_MEDIA_ID>'),
  true);
SELECT auth.uid();
COMMIT;

-- 2) รัน RPC — sub + from ดึงจากแถวอัตโนมัติ (แทนแค่ <USER_MEDIA_ID> ที่เดียว = กัน mismatch)
BEGIN;
SELECT set_config('request.jwt.claims',
  (SELECT json_build_object('sub', user_id)::text FROM user_media WHERE id = '<USER_MEDIA_ID>'),
  true);
SELECT * FROM public.increment_episode(
  '<USER_MEDIA_ID>',
  (SELECT current_episode FROM user_media WHERE id = '<USER_MEDIA_ID>')
);
COMMIT;
```

- `BEGIN; ... COMMIT;` = บังคับ transaction เดียว → `set_config(...,true)` ค้างถึงตอนเรียก RPC
- **Fallback** ถ้า auth.uid() ยัง null แม้ใน BEGIN/COMMIT (editor ไม่ honor transaction): เปลี่ยน arg สุดท้าย `true` → `false` (session-local)
- 2 สาเหตุที่คืน NULL: (1) claim ไม่ค้าง = transaction → BEGIN/COMMIT หรือ `false` · (2) `from ≠ current_episode` / `sub ≠ user_id` → auto-derive ข้างบนแก้แล้ว

| เคส (เลือก row ให้ตรงเงื่อนไข)                      | คาดหวัง (§P4)                                                              |
| --------------------------------------------------- | -------------------------------------------------------------------------- |
| movie: total=1, airing `'upcoming'`, current=0      | `current=1, status='completed', completed_at` set · watchlog +1 (1.5)      |
| ongoing: total=12, current=3                        | `current=4, status='watching'` (ไม่ complete) (1.2)                        |
| stale: รัน RPC ซ้ำ (current ขยับแล้ว → from ไม่ตรง) | คืน **NULL**, watchlog ไม่เพิ่ม (1.1) — จาก guard `current_episode = from` |
| finished: total=12, current=11                      | `current=12, status='completed'` (1.2)                                     |

> ตรวจ watchlog: `SELECT * FROM watchlogs WHERE media_id='<MEDIA_ID>' ORDER BY watched_at DESC;`

### ‼️ assert null contract (RPC ตัวแรกของโปรเจค — repo อาศัย `data == null` = stale)

ต้องเช็ค **ทั้ง 2 ทิศ explicitly** ก่อนถือว่า RPC พร้อมให้ repo ใช้ — block นี้ใช้ `ROLLBACK` → ไม่ mutate, รันซ้ำได้:

```sql
BEGIN;
SELECT set_config('request.jwt.claims',
  (SELECT json_build_object('sub', user_id)::text FROM user_media WHERE id='<USER_MEDIA_ID>'), true);
-- เช็ค 2 ทิศใน SELECT เดียว (editor โชว์ครบทั้ง 2 column)
SELECT
  public.increment_episode('<USER_MEDIA_ID>', 999) IS NULL AS stale_must_be_true,
  public.increment_episode('<USER_MEDIA_ID>',
    (SELECT current_episode FROM user_media WHERE id='<USER_MEDIA_ID>')) IS NULL AS success_must_be_false;
ROLLBACK;
```

- ใช้ `SELECT func(...) IS NULL` (ไม่ใช่ `SELECT * FROM func(...)` — null composite จะโผล่เป็น row คอลัมน์ null ทั้งแถว = เข้าใจผิด)
- map กับ supabase-js: scalar composite (`SetofOptions.isSetofReturn:false`) → `.rpc()` คืน **object | null** → ถ้า `stale_must_be_true=true` + `success_must_be_false=false` = contract ตรง repo

---

## Step 4 — Patch `PROJECT_INSTRUCTIONS.md` (chat-side TODO 2 จุด)

ไฟล์ Chat-side ที่ต้อง re-upload ทุก session — ปรับให้ตรง CLAUDE.md ปัจจุบัน

**(ก) Business Rules → +1 Episode** — แทนบล็อกเดิม:

```
+1 Episode:
  current_episode++  →  INSERT watchlog  →  ถ้า current = total → status = 'completed'
```

ด้วย (ตรง CLAUDE.md บรรทัด 68 / DECISIONS §P4 1.1–1.2):

```
+1 Episode (CAS): client ส่ง from_episode → RPC increment_episode (SECURITY INVOKER, atomic)
  guard: user_id = auth.uid() AND current_episode = from AND from+1 <= total_episodes
  matched → current = from+1 → INSERT watchlog → status: (from+1 >= total AND airing_status ≠ 'ongoing') ? 'completed' : 'watching' (started_at = COALESCE(started_at, now()))
  no match → no-op ทั้ง update และ watchlog (reason 'stale' — ไม่ใช่ error)
movie/special: mark = RPC เดิม (0→1) · unmark = reset pointer (current=0, plan_to_watch, ไม่ลบ watchlog)
Rewatch (completed/dropped/on_hold): confirm → current=0, watching, started_at=now(), completed_at=null, rewatch_count+1 (guard status IN source set)
−1/แก้ตอน: deferred → Phase 5 "Edit progress" (⋯ More)
```

**(ข) Business Rules → Dashboard cross-ref** — แก้ anchor ที่ไม่มีจริง:

- เดิม: `... ไม่ใช่ page filter (ดู DECISIONS §C3)`
- เป็น: `... ไม่ใช่ page filter (ดู DECISIONS.md heading "`/dashboard` = full library (tab All)")`
  > (repo ไม่ได้ใช้ anchor `§C3`; heading จริงอยู่ DECISIONS.md บรรทัด 677)

---

## Step 5 — หลัง Code push

- รัน checklist §V ของ Code ไม่ใช่หน้าที่ dev (Code ทำเอง) — dev แค่ review PR + ยืนยัน base = `develop`
- ถ้าทำ Step 1–2 ทีหลัง: ให้ Code รอบถัดไปตัด `// TODO` cast หลัง commit types แล้ว
