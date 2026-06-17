# Animorize — Phase 4 Part 1 · **CODE** (Claude Code)

> **Actor: Claude Code.** Scope = server-side code slice เท่านั้น (domain → repo → usecase → server action → tests) + **author** SQL migration files
> **ไม่ใช่งานนี้:** apply SQL / regen types / smoke test → **dev-manual file** · UI/component/hook → **Part 2** (gated หลัง design addendum)
> Authoritative: `DECISIONS.md §P4 1.1–1.9` · `CLAUDE.md` business rules · ground truth `PROGRESS.md`

---

## 0 — Baseline & guardrails

**Branch:** `feature/phase4-backend` จาก `develop` · **PR base `develop` เท่านั้น**

> ⛔ ห้าม PR เข้า `main` — เคยหลุด → **verify base ก่อนเปิด PR เสมอ** (CLAUDE.md “Git & Deploy”)

**Conventions (บังคับ):** domain purity (ห้าม import Supabase/Next/React ใน `domain/` — ยกเว้น +1 ที่ logic อยู่ใน RPC, documented exception §P4 1.1) · repo ใช้ `server.ts` client · DB ผ่าน interface · ห้าม `any` · server errors `console.error` · curated message (ห้าม raw `err.message` ถึง return) · usecase+mapper ใหม่ **ต้องมี unit test** (mock repo) · ไม่เพิ่ม package · **ห้ามทำ UI**

**Auth helper:** action ใหม่ทุกตัว reuse `getAuthedUser()` (`lib/supabase/auth.ts`) — คืน `{ supabase, user } | null`; pattern: `const a = await getAuthedUser(); if (!a) return { success:false, message, reason:"unauthorized" }; const { supabase, user } = a;` — ห้าม inline `createClient`/`getUser` (ตาม 6 actions เดิมในไฟล์)

**Union extend (1 จุด):** ใน `app/actions/userMedia.ts` เพิ่ม `"stale"` เข้า `UserMediaActionResult.reason`:
`"duplicate" | "unauthorized" | "invalid" | "error" | "stale"`

**Types: regenerated + committed ✅** — `src/types/database.ts` บน branch มี `rewatch_count` (user_media Row/Insert/Update) + `increment_episode` (Functions, `isSetofReturn:false`) + `watch_status` 5 values แล้ว → **implement against real types, ไม่ต้อง cast/TODO ใดๆ** (`supabase.rpc("increment_episode", …)`, `row.rewatch_count` ใน mapper, `.update({ rewatch_count })` ใช้ generated types ได้ตรง)

---

## 1 — Author migration SQL files (เขียนไฟล์ · **apply = dev**)

> Docker ติด → dev รันใน SQL Editor (ดู dev-manual). Code = เขียน idempotent files + ปรับ canonical schema. **ลำดับ ALTER ก่อน FUNCTION** (return type ผูก shape ปัจจุบัน)
> SoT = DECISIONS §P4 1.2 · SQL ในไฟล์นี้ + dev-manual + `schema/` ต้องตรงกัน

**1a.** `schema/` ไฟล์ idempotent (เลข/หัวไฟล์ตาม convention — ดู `schema/README.md`) + อัปเดต canonical `schema/07-user-media.sql`:

```sql
ALTER TABLE public.user_media ADD COLUMN IF NOT EXISTS rewatch_count integer NOT NULL DEFAULT 0;
```

**1b.** `schema/` ไฟล์ RPC ใหม่ (`CREATE OR REPLACE`, `SECURITY INVOKER`):

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
    RETURN NULL;  -- stale / cap / ไม่ใช่เจ้าของ → no-op (ไม่ insert watchlog)
  END IF;

  INSERT INTO public.watchlogs (user_id, media_id, episode_number)
  VALUES (v_row.user_id, v_row.media_id, p_from_episode + 1);

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_episode(uuid, int) TO authenticated;
```

> design: RETURN composite `user_media` → matched=row / no-match=`NULL` (repo แยก updated/stale) · completion `>= total AND airing_status <> 'ongoing'` ครอบ movie default `'upcoming'` + กัน false-complete ongoing total=1 (§P4 1.2/1.9, **ไม่ special-case media_type**) · grant pattern ให้ตรง function เดิมใน schema/ (checklist §V-5)

---

## 2 — `WatchLog` entity (`src/domain/entities/WatchLog.ts`)

pure TS, ไม่มี business-rule function (read-only display):

```ts
export interface WatchLog {
  id: string;
  userId: string;
  mediaId: string;
  episodeNumber: number;
  watchedAt: string;
}
```

---

## 3 — WatchLog repository (**read-only**) + mapper + factory + tests

`watchlogs` RLS = SELECT+INSERT only · INSERT อยู่ใน RPC (Task 1) → repo นี้ **read อย่างเดียว** (ห้ามมี create/update/delete)

- **`src/repositories/interfaces/IWatchLogRepository.ts`:**
  ```ts
  export interface IWatchLogRepository {
    findByUserAndMedia(userId: string, mediaId: string, limit: number): Promise<WatchLog[]>;
  }
  ```
  order `watched_at DESC` (rewatch ล่าสุดก่อน §P4 1.4/1.7) · `limit` จาก caller
  > ⚠️ ชื่อ `findByUserAndMedia` ซ้ำกับ `IUserMediaRepository.findByUserAndMedia(userId, mediaId)` — **คนละ interface ไม่ชน runtime** แต่ version นี้รับ `limit` เพิ่ม (อ่าน code อย่าสับสน)
- **`src/repositories/supabase/SupabaseWatchLogRepository.ts`:** `server.ts` client · `.from("watchlogs").select(...).eq("user_id",userId).eq("media_id",mediaId).order("watched_at",{ascending:false}).limit(limit)` · index `idx_watchlogs_media(user_id,media_id)` มีแล้ว (Phase 2) · error → throw
- **Mapper** `toWatchLog(row)` ใน `mappers.ts` (append)
- **Factory** `createWatchLogRepository(supabase)` ใน `repositories/index.ts` (pattern `createUserMediaRepository`)
- **Tests:** mapper row→entity + `createMockWatchLogRepository` + `makeWatchLog` stub ใน `__tests__/utils/mockRepositories.ts`

---

## 4 — `IUserMediaRepository` — เพิ่ม methods (append, ไม่แตะ 8 เดิม)

**4a. `incrementEpisode` (RPC wrap)**

```ts
export type IncrementEpisodeResult =
  | { status: "updated"; userMedia: UserMedia }
  | { status: "stale" };
// incrementEpisode(userMediaId: string, fromEpisode: number): Promise<IncrementEpisodeResult>
```

impl: `supabase.rpc("increment_episode", { p_user_media_id, p_from_episode })` → data ไม่ null → `{status:"updated", userMedia: toUserMedia(data)}` · data null → `{status:"stale"}` · error → throw

> **null contract (RPC ตัวแรกของโปรเจค):** `RETURNS user_media` (scalar composite; generated `SetofOptions.isSetofReturn:false, isOneToOne:true`) → `.rpc()` คืน **row object | null** (ไม่ใช่ array / ไม่ใช่ all-null object) → `data == null` = stale ถูกต้อง · dev-manual smoke assert ทั้ง 2 ทิศ (updated→object, stale→`IS NULL` true)

**4b. `startRewatch` (single-table, usecase ปกติ — §P4 1.4)**

- `startRewatch(userMediaId: string): Promise<UserMedia | null>` (`null` = guard miss / double-fire)
- **ไม่ใช้ RPC** · Supabase JS ทำ `col = col + 1` ตรงๆ ไม่ได้ → read-modify-write:
  1. อ่าน row (`rewatch_count` + `status`); `status ∉ {completed,dropped,on_hold}` → `null`
  2. `UPDATE SET current_episode=0, status='watching', started_at=now(), completed_at=null, rewatch_count=<อ่านได้>+1 WHERE id=? AND status IN ('completed','dropped','on_hold') RETURNING *`
  3. 0 rows → `null` · row → `toUserMedia(row)`
- WHERE guard = valid-source + กัน double-fire (รอบสองเจอ 'watching' → no-op) → counter best-effort ตามที่ §P4 1.4 ยอมรับ · ไม่แตะ watchlog เดิม

**4c. `unmarkWatched` (movie/special unmark — §P4 1.5)**

- `unmarkWatched(userMediaId: string): Promise<UserMedia>`
- `UPDATE SET current_episode=0, status='plan_to_watch', started_at=null, completed_at=null WHERE id=? RETURNING *` (RLS คุม ownership) · **ไม่ลบ watchlog**

**4d. Entity + mapper: `rewatchCount`**

- เพิ่ม `rewatchCount: number` ใน `UserMedia` entity + `toUserMedia` (`rewatch_count: row.rewatch_count`) + stub `makeUserMedia` (`rewatchCount: 0`) — เก็บ data ก่อน, badge Part 2 (§P4 1.6)

**4e. `findWithMediaByUserAndMedia` (detail read — ✅ Part 1)**

- `findWithMediaByUserAndMedia(userId: string, mediaId: string): Promise<UserMediaWithMedia | null>` — reuse `USER_MEDIA_WITH_MEDIA_SELECT` + `.eq("user_id",userId).eq("media_id",mediaId).maybeSingle()`
- เหตุผล: Part 2 detail page โหลด 1 รายการพร้อม media+provider (ปุ่ม +1/Rewatch/Watched + progress); `findByUserAndMedia` คืน bare `UserMedia` ไม่พอ render → read นี้อยู่ Part 1 (foundation-first; Part 2 = pure UI) · shape ปรับได้ใน Part 2 ถ้าจำเป็น
- history read แยกผ่าน `IWatchLogRepository` (Task 3) — Part 2 ประกอบเอง

---

## 5 — Usecases (`src/domain/usecases/`)

JSDoc ทุกตัว (style `AddToLibrary.ts`/`UpdateMedia.ts`) · orchestrate ผ่าน interface · ห้าม import Supabase

- **`IncrementEpisode.ts`** — `incrementEpisode(repo, userMediaId, fromEpisode)` → delegate `repo.incrementEpisode` (atomic อยู่ DB; usecase บางโดยเจตนา §P4 1.1)
- **`StartRewatch.ts`** — `startRewatch(repo, userMediaId)` → delegate
- **`UnmarkWatched.ts`** — `unmarkWatched(repo, userMediaId)` → delegate
- **`GetLibraryItem.ts`** — `getLibraryItem(repo, userId, mediaId)` → delegate `repo.findWithMediaByUserAndMedia` (สมมาตรกับ `ListUserLibrary`)

> naming: handoff = “ToggleWatched” แต่ **mark = `IncrementEpisode`(from=current)** (movie 0→1 complete ผ่าน guard) · **unmark = `UnmarkWatched`** — ไม่รวมเป็น usecase เดียวเพราะ mark วิ่งผ่าน CAS RPC (ต้อง `from_episode`) unmark เป็น single-table reset

---

## 6 — Server Actions (`app/actions/userMedia.ts`, append)

ทุก action: `getAuthedUser()` → try/catch + `console.error` + curated message + reason · `revalidatePath("/dashboard")` (detail-path revalidation = Part 2)

- **`incrementEpisodeAction(userMediaId, fromEpisode)`** — `updated` → `{success:true, message}` · `stale` → `{success:false, message, reason:"stale"}` · catch → `reason:"error"`
- **`startRewatchAction(userMediaId)`** — `UserMedia` → success · `null` → `{reason:"stale"}` (semantics เดียวกับ increment)
- **`unmarkWatchedAction(userMediaId)`** — success / `error`
- ไม่ต้องมี Zod สำหรับ id/number args (ตาม `removeFromLibraryAction`/`toggleFavoriteAction`)

---

## 7 — Unit tests (Vitest, mock repo)

ขยาย `createMockUserMediaRepository` ให้มี `incrementEpisode`/`startRewatch`/`unmarkWatched`/`findWithMediaByUserAndMedia` + WatchLog mock/stub

- IncrementEpisode usecase: updated + stale path
- StartRewatch usecase: success + no-op(`null`)
- UnmarkWatched usecase: reset fields
- GetLibraryItem usecase: found + null
- WatchLog mapper: row→entity + edge
- `npm run lint && typecheck && test` ผ่าน (baseline 122)
  > RPC SQL ไม่ unit-test (DB-side) → smoke = dev-manual

---

## §Contract notes สำหรับ Part 2 (ℹ️ ไม่ใช่งาน Part 1 — เขียนไว้ให้ contract ชัด)

- `stale`: client เช็ค `reason === "stale"` → **ไม่ toast**, ปล่อย revalidate sync เงียบ (§P4 1.1)
- +1 ปุ่ม: `useOptimistic` + `disabled={isPending}` · `from` = current confirmed ล่าสุด
- Watch history: caller ส่ง `limit = 5` (§P4 1.7)
- Part 2 เพิ่ม detail-path เข้า `revalidatePath` ตอน route มีจริง

---

## §V — Verify-against-source (ทำบน live `develop` ก่อน implement)

> review/regen ยืนยันหลายจุดแล้ว (✅ = ใช้ได้เลย); ที่เหลือ Code ยืนยันก่อน implement

1. ✅ `getAuthedUser()` — confirmed คืน `{ supabase, user } | null` (review-verified) → ใช้ pattern ใน Task 0
2. `lib/supabase/errors.ts` — `SupabaseError`, `isPgUniqueViolation` (รู้ไว้, Part 1 อาจไม่ใช้)
3. `SupabaseDb` import path (`@/lib/supabase/types`) ตรงกับ repo เดิม
4. `repositories/index.ts` factory pattern → `createWatchLogRepository` ให้ match
5. `schema/` files — RPC ไฟล์ใหม่ทำตาม convention (enums `01-enums.sql` · rls `11-rls.sql` · indexes `12-indexes.sql`) + grant pattern เทียบ `is_admin`
6. ✅ **enum** — `watch_status` = `plan_to_watch, watching, on_hold, completed, dropped` confirmed ใน regenerated `database.ts` (+ RPC สร้างสำเร็จ = cast valid) → ตรงกับ RPC cast + rewatch guard `status IN ('completed','dropped','on_hold')`
7. ✅ `watchlogs` — columns / RLS (SELECT+INSERT only) / index `idx_watchlogs_media` confirmed (`11-rls.sql` + `12-indexes.sql`, review-verified)

---

## ปิดงาน

`/sync-progress` → `PROGRESS.md` (Phase 4 Part 1 backend ✅ + as-built + test count) · ไม่มี package ใหม่ (ไม่แตะ Package Change Log) · §P4 ครบแล้ว (เบี่ยงจาก §P4 → note ใน PR + ถาม) · PR base `develop` (**verify base**) · **ห้ามแตะ UI**
