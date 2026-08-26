# ANIMORIZE

แอปติดตามสื่อ (Anime, Series, Movie, OVA) แทน Excel
Admin จัดการเนื้อหา + import จาก AniList / User ติดตาม progress

## Architecture — Clean Architecture

```
Domain      → domain/entities/ + usecases/     (pure logic, ห้าม import Supabase/React)
Repository  → repositories/interfaces/ + supabase/   (DB access ผ่าน interface)
Hook        → hooks/                            (orchestrate usecases → UI)
UI          → app/ + components/                (render เท่านั้น)
```

Dependency rule: ชั้นในห้าม import ชั้นนอก — **บังคับโดย ESLint** (`no-restricted-imports` ใน `eslint.config.mjs`)

## Supabase

- client.ts → createBrowserClient() ('use client')
- server.ts → createServerClient() (Server Components + Actions)
- middleware.ts → refresh session — RLS ทุก table ผ่าน auth.uid()

## Conventions

**DO:** Server Components default / Mutations ผ่าน Server Actions / Zod validate ทุก form /
loading.tsx + error.tsx ทุก route group / logic ใน domain/usecases/ / DB ผ่าน repository interface /
usecase + mapper ใหม่ทุกตัวต้องมาพร้อม unit test / user-owned table ใช้ RLS `auth.uid()=user_id` + `server.ts` client เท่านั้น /
imperative client mutation (onClick/startTransition ที่ await action) → try/catch + toast เสมอ /
TanStack queryFn → throw ไม่ swallow; consumer ใช้ isError (ห้าม try/catch กลืนใน queryFn)

**DON'T:** ❌ `any` / ❌ `console.log` prod / ❌ AniList จาก client / ❌ inline style /
❌ install package ไม่บันทึก DECISIONS.md / ❌ แก้ types/database.ts / ❌ import Supabase ใน domain/
❌ service-role client สำหรับ user-owned table (bypass RLS)

**Client boundary:** pure utility functions (ไม่ใช้ React hooks / browser API) ต้องอยู่ในไฟล์แยกที่ไม่มี `'use client'`
เพื่อให้ Server Components import ได้ — ดูตัวอย่าง `components/ui/button-variants.ts`

## Naming

Components: PascalCase `MediaCard.tsx` / Hooks: `useWatchlog.ts` / Entities: `Media.ts`
UseCases: `IncrementEpisode.ts` / Repos: `IMediaRepository.ts` / Actions: `updateProfileAction.ts`

## Key Business Rules

- movie/special → total_episodes=1, toggle "Watched" / ova → episode tracking ปกติ
- +1 Episode (CAS — Phase 4): client ส่ง from_episode → RPC increment_episode (SECURITY INVOKER, atomic)
  guard: user_id=auth.uid() AND current_episode=from AND from+1 <= total_episodes
  matched → current=from+1 → INSERT watchlog → status: (from+1 >= total AND airing_status<>'ongoing') ? 'completed'(+completed_at) : 'watching' (started_at=COALESCE(started_at,now()))
  no match → no-op ทั้ง update และ watchlog (reason 'stale' — ไม่ใช่ error ไม่ toast)
- movie/special: mark = RPC เดิม (0→1) · unmark = reset pointer (current=0, plan_to_watch, ไม่ลบ watchlog)
- Rewatch (completed/dropped/on_hold): confirm → current=0, watching, started_at=now(), completed_at=null, rewatch_count+1 (guard status IN source set); ไม่แตะ watchlog เดิม
- Edit progress (⋯ More, Phase 5): set episode ตรงๆ (absolute) — ไม่ใช่ CAS, ไม่ใช่ RPC, ไม่มี migration
  guard: user_id=auth.uid() AND 0<=n<=total_episodes (ต้อง total>0)
  ordered rules (เช็คบนลงล่าง เจอข้อแรกที่ match แล้วหยุด — ห้ามอ่านเป็น match-any):
  1. status ∈ {dropped, on_hold} → คง status เดิม แก้แค่ pointer, ไม่แตะ timestamp
  2. n=0 → เหมือน unmark (current=0, plan_to_watch, completed_at=null)
  3. n>=total AND airing_status<>'ongoing' → completed, completed_at=COALESCE(completed_at, now())
  4. n>=total AND airing_status='ongoing' → watching (caught-up), started_at=COALESCE(started_at,now()), completed_at=null
  5. 0<n<total → watching, started_at=COALESCE(started_at,now()), completed_at=null
     ไม่แตะ watchlogs และ rewatch_count ทุกกรณี
- ⋯ More menu: Edit progress + divider + Remove from library (destructive) — enabled เสมอ, disable item ข้างในแทน (พร้อม reason text)
- Title: title_en > title_romaji > title_th — impl เดียวที่ `domain/entities/title.ts#getDisplayTitle`, re-exported จาก Media + Franchise
- Dashboard (/dashboard) = full library (tab All); 'watching' OR favorite = highlight sections + sort priority ไม่ใช่ filter ของทั้งหน้า — ดู DECISIONS.md §P5 1.13/1.14
- Library view (Phase 5): Tabs=ขอบเขต (All/Watching/Favorites) · Filter=กรอง status ภายในขอบเขต (ซ่อนใน tab Watching) · Sort=ลำดับ
  default sort = updated_at DESC, label "Recently active" (ไม่ใช่ "Recently watched" — updated_at bump จาก user action ทุกชนิด ไม่ใช่การดูอย่างเดียว) · อีก 2 แบบ: Recently added / Title A–Z
  composite sort (STATUS_PRIORITY) เหลือใช้จัดลำดับภายใน section เท่านั้น ไม่ใช่ global sort แล้ว
  filter active → All view ยุบ 3 sections เป็น flat grid · filter/sort/search state เก็บใน URL searchParams
- Dark mode (Phase 5): cookie + Server Action → data-theme ที่ `<html>` ตอน SSR (ห้ามใช้ localStorage — FOUC)
- Provider URL: custom_url ?? base_url
- Auto-sync: system enabled AND media.auto_sync AND airing_status='ongoing'
- Sync ไม่ overwrite: title_th, synopsis, poster_url (ไม่มีข้อยกเว้น) — AniList mapper ใช้ `coverImage.extraLarge` มีผลกับ import ใหม่เท่านั้น (forward-only, ไม่แตะ sync path/library เก่า)

## Git & Deploy

> ⛔ **ระหว่าง phase: ห้ามเปิด PR เข้า `main` เด็ดขาด**
> `feature/*` / `fix/*` → **PR เข้า `develop` เท่านั้น**
> `main` update เฉพาะ **release PR `develop` → `main`** ที่เจ้าของอนุมัติเองตอนปิด phase
> ยกเว้น: เจ้าของเปิด PR เอง และเป็น `develop` → `main` เท่านั้น — ห้ามข้าม branch ใดๆ
> ⚠️ **เคยมี PR หลุดเข้า `main` ทั้งที่กฎระบุไว้ → verify base branch ก่อนเปิด PR ทุกครั้งเสมอ**

กฎเพิ่มเติม: ดู `.claude/rules/git.md`

## UI / Design workflow

> ⛔ **ห้ามประดิษฐ์ UI เอง** — ก่อน implement UI ทุกครั้ง ต้องมี Claude Design handoff bundle ก่อน

1. ขอ/ใช้ Claude Design handoff URL ล่าสุดจากเจ้าของ (อย่าใช้ลิงก์เก่าโดยไม่ยืนยัน)
2. `fetch` bundle → อ่าน README + screens → verify ว่ามี screen/component ที่เกี่ยวข้อง
3. ถ้ายังไม่มี → สั่ง design ก่อน แล้วค่อย implement
4. `BRAND.md` = source of truth ของ token/spec

Design bundle = **visual/token SoT เท่านั้น ไม่ใช่ a11y SoT** · การ import bundle ใหม่ห้ามถอด ARIA/keyboard behaviour ที่โค้ดมีอยู่ ดู `DECISIONS.md` §P5 (entry deviation)

กฎเพิ่มเติม: ดู `.claude/rules/ui.md`

## Session Sync

- จบทุก session → รัน `/sync-progress` เพื่ออัปเดท PROGRESS.md
- ถ้าแก้ DECISIONS.md / CLAUDE.md / schema/ → bump version ใน PROGRESS.md
- ถ้าแก้ PROJECT_INSTRUCTIONS.md → เตือนใน PROGRESS.md ว่า Chat ต้องอัปเดท

## References

- @DECISIONS.md
- @schema/ (see schema/README.md for structure and migration order)
- @PROGRESS.md
