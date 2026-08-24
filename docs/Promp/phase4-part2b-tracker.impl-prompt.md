# Phase 4 — Part 2b: Interactive EpisodeTracker (impl prompt สำหรับ Claude Code)

> อ่านก่อนเริ่ม: **CLAUDE.md** (dependency rule + coding conventions) · **DECISIONS.md §P4 1.1–1.5** (CAS increment, completion guard, rewatch, movie mark/unmark) · **BRAND.md §9** (iconography — filled check = completed) + **§10.10** (Modal)
> **สื่อสาร:** ไทยผสม technical term อังกฤษ
> **Branch:** `feature/phase4-part2b-tracker` → PR เข้า **`develop` เท่านั้น** (ห้าม PR เข้า `main`)

---

## 0. Gate + context (ทำแล้ว ไม่ต้อง re-verify)

- **Part 1 backend** merged → develop (**PR #24**): `increment_episode` CAS RPC + 3 server actions + `UserMediaActionResult`
- **Part 2a detail page** merged → develop (**PR #26**): `MediaDetailView.tsx` (read-only) + route `app/(main)/media/[id]/` + `formatTimestamp`
- 2b = interactive tracker ที่ **แทน read-only tracking summary** ของ 2a — เป็น Part สุดท้ายของ Phase 4

> **Design source (provenance) — ⚠️ ต้อง sync ก่อน Code เริ่ม:** UI specs ในนี้ derive จาก tracker design ที่ owner vet แล้ว — `tracker-states.jsx` (confirm dialog) + `Tracker` ใน `screens.jsx` + `.tracker-*` CSS ใน **`Animorize-handoff.zip`** (owner upload session นี้; handoff เดิม list ว่า vetted — 13 artboards). **ไม่ใช่ invented UI.** bundle นี้ **ใหม่กว่า** `.design-bundle` ใน repo (2026-06-02) ที่ยังไม่มี tracker → **owner action:** (1) sync tracker bundle เข้า repo ให้ Code cross-reference ได้ (2) check PROGRESS Part 2b #1 "Design addendum for Rewatch UI" (ปัจจุบัน uncheck). prompt encode spec ครบแล้ว Code ไม่จำเป็นต้องเปิด bundle เพื่อ implement — แต่ต้องปิด process gate + provenance ก่อน

**Contracts ยืนยันจาก source จริงบน develop แล้ว (ใช้ได้เลย ไม่ต้องเปิดไฟล์ verify ซ้ำ):**

```ts
// app/actions/userMedia.ts — positional args, ทุกตัว revalidatePath("/dashboard") เท่านั้น (ก่อน stale return)
incrementEpisodeAction(userMediaId: string, fromEpisode: number): Promise<UserMediaActionResult>
startRewatchAction(userMediaId: string): Promise<UserMediaActionResult>
unmarkWatchedAction(userMediaId: string): Promise<UserMediaActionResult>

type UserMediaActionResult =
  | { success: true; message: string }
  | { success: false; message: string; reason: "duplicate"|"unauthorized"|"invalid"|"error"|"stale" }
```

```ts
// DS APIs (as-built)
<Modal open onClose title? actions?>{children}</Modal>          // @/components/ui/Modal · native <dialog>, actions = footer slot
<Button variant size {...buttonHTMLAttributes}>{children}</Button> // @/components/ui/Button · icon = FIRST child (ไม่มี iconLeft) · disabled built-in
buttonVariants({ variant, size })                                 // @/components/ui/button-variants · สำหรับ raw <button>
<Icon as={LucideIcon} size={n} />                                 // @/components/ui/Icon · ไม่มี color prop
<StatusPill status={...} />  <ProgressBar value={n} total={n} />  // @/components/media/MediaCard (re-exported)
useToast() → { toasts, show, dismiss }                            // @/hooks/useToast · component-local, render portal เอง
<Toast variant title description? onClose className? />           // @/components/ui/Toast
// enums: AiringStatus = "ongoing"|"finished"|"upcoming" · WatchStatus = "watching"|"plan_to_watch"|"on_hold"|"completed"|"dropped"
```

**ไม่มี Spinner component ใน DS** — confirm modal ใช้ pattern ตาม §3 ด้านล่าง (ไม่ต้องสร้าง spinner)

---

## 1. Domain helper — `computeStatusAfterIncrement` (pure, + unit test)

**ไฟล์:** เพิ่มใน `src/domain/entities/UserMedia.ts` (import `AiringStatus` จาก `./Media` — same layer, ถูกตาม dependency rule)

```ts
/**
 * Client-side mirror ของ completion guard ใน increment_episode RPC (schema/14 — SQL = source of truth).
 * ใช้คำนวณ optimistic status ตอน +1 / mark watched. ต้องตรงกับ SQL:
 *   status = new_ep >= total AND airing_status <> 'ongoing' ? 'completed' : 'watching'
 * ⚠️ ถ้าแก้ guard ใน SQL ต้องแก้ที่นี่ด้วย.
 */
export function computeStatusAfterIncrement(
  nextEpisode: number,
  totalEpisodes: number,
  airingStatus: AiringStatus,
): WatchStatus {
  if (nextEpisode >= totalEpisodes && airingStatus !== "ongoing") return "completed";
  return "watching";
}
```

**Test** (`src/domain/entities/UserMedia.test.ts` — เพิ่ม describe block; ถ้าไฟล์ยังไม่มีให้สร้าง):

- `(5, 12, "finished")` → `"watching"` (ยังไม่ถึง total)
- `(12, 12, "finished")` → `"completed"` (ถึง total, ฉายจบ)
- **`(12, 12, "ongoing")` → `"watching"`** ⬅ critical: ดูครบ aired แต่ยังฉายอยู่ ไม่ complete
- `(1, 1, "upcoming")` → `"completed"` (movie mark 0→1; movie default `airing='upcoming'`)

> **ไม่ test `next > total`** — increment guard = `from+1 <= total` → helper รับ `next <= total` เสมอ (call sites: `incrementEpisode` ปุ่มโชว์เฉพาะ `episode < total`, `markWatched` = 1 บน total 1). `>=` ในสูตรไว้ **mirror SQL เป๊ะ** (schema/14 ใช้ `>=`) ไม่ใช่เพราะ next เกิน total ได้

---

## 2. Hook — `useEpisodeTracker` (optimistic + transition + 3 actions)

**ไฟล์ใหม่:** `src/hooks/useEpisodeTracker.ts` (ไม่ต้องใส่ `"use client"` — boundary มาจาก EpisodeTracker; hook มี **no JSX** ตาม CLAUDE.md)

Model ตาม `FavoriteButton` pattern (`useOptimistic` + `useTransition` + `useToast`) แต่ adapt 3 จุด: **stale-silent + stale-refresh + success-refresh**

```ts
"use client"; // (optional — คงไว้ได้ถ้า lint ต้องการ)
import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { computeStatusAfterIncrement } from "@/domain/entities/UserMedia";
import {
  incrementEpisodeAction,
  startRewatchAction,
  unmarkWatchedAction,
  type UserMediaActionResult,
} from "@/app/actions/userMedia";
import type { WatchStatus } from "@/domain/entities/UserMedia";
import type { AiringStatus } from "@/domain/entities/Media"; // AiringStatus = Media concern (UserMedia ไม่ re-export — canonical @/types/enums)

interface Params {
  userMediaId: string;
  currentEpisode: number;
  totalEpisodes: number;
  status: WatchStatus;
  airingStatus: AiringStatus;
}
interface TrackerState {
  episode: number;
  status: WatchStatus;
}

export function useEpisodeTracker({
  userMediaId,
  currentEpisode,
  totalEpisodes,
  status,
  airingStatus,
}: Params) {
  const [state, setState] = useOptimistic<TrackerState>({ episode: currentEpisode, status });
  const [isPending, startTransition] = useTransition();
  const { toasts, show, dismiss } = useToast();
  const router = useRouter();

  function run(action: () => Promise<UserMediaActionResult>, optimisticNext: TrackerState) {
    startTransition(async () => {
      setState(optimisticNext);
      try {
        const result = await action();
        if (result.success) {
          router.refresh(); // sync detail SC (watch history, ฯลฯ)
        } else if (result.reason === "stale") {
          router.refresh(); // F1: stale ก็ต้อง refresh — กัน optimistic revert→loop
        } else {
          show(result.message, "error"); // error จริงเท่านั้น toast
        }
      } catch {
        show("Failed to update", "error"); // §P4 1.8: network throw → curated toast; optimistic revert เอง
      }
    });
  }

  return {
    episode: state.episode,
    status: state.status,
    isPending,
    toasts,
    dismiss,
    incrementEpisode() {
      const from = state.episode; // == currentEpisode ตอน idle (ปุ่ม disabled ระหว่าง pending)
      const next = from + 1;
      run(() => incrementEpisodeAction(userMediaId, from), {
        episode: next,
        status: computeStatusAfterIncrement(next, totalEpisodes, airingStatus),
      });
    },
    markWatched() {
      // movie 0→1
      run(() => incrementEpisodeAction(userMediaId, 0), {
        episode: 1,
        status: computeStatusAfterIncrement(1, totalEpisodes, airingStatus),
      });
    },
    startRewatch() {
      run(() => startRewatchAction(userMediaId), { episode: 0, status: "watching" });
    },
    unmarkWatched() {
      // movie → plan_to_watch, current=0
      run(() => unmarkWatchedAction(userMediaId), { episode: 0, status: "plan_to_watch" });
    },
  };
}
```

**เหตุผล adaptation (สำคัญ อย่าตัดออก):**

- **F1** — actions revalidate แค่ `/dashboard`; detail page `/media/[id]` ไม่ sync เอง → ต้อง `router.refresh()` ฝั่ง client. **ทั้ง success และ stale** ต้อง refresh: ถ้า stale ไม่ refresh → optimistic revert กลับค่าเก่าที่ผิด → user กด +1 อีก → stale อีก → **infinite loop**
- **stale-silent** — copy `FavoriteButton` ตรง ๆ (`if (!result.success) show(...)`) จะ toast ตอน stale ด้วย ซึ่งผิด policy (stale = ไม่ใช่ error, เงียบ). แยก branch: stale → refresh เงียบ, error → toast

---

## 3. Component — `EpisodeTracker` (state-aware, `'use client'`)

**ไฟล์ใหม่:** `src/components/media/EpisodeTracker.tsx`

**Props** (ทุกตัว serializable — server→client ได้; **ไม่มี `mediaId`** เพราะทุก action ใช้ `userMediaId` — F6):

```ts
interface EpisodeTrackerProps {
  userMediaId: string;
  currentEpisode: number;
  totalEpisodes: number;
  status: WatchStatus;
  isMovie: boolean;
  airingStatus: AiringStatus;
}
```

**Imports:** `useEpisodeTracker` · `StatusPill`, `ProgressBar` (จาก MediaCard) · `Button`, `buttonVariants` · `Icon` · `Modal` · `Toast` · `createPortal` (react-dom) · lucide `RotateCcw, CheckCircle2, Check, MoreHorizontal` · `cn` · `useState`

### 3.1 Container + local state

```tsx
const t = useEpisodeTracker({ userMediaId, currentEpisode, totalEpisodes, status, airingStatus });
const [confirmOpen, setConfirmOpen] = useState(false);
```

Container = design `.tracker` (bordered card — 2a เป็น flat div, 2b เปลี่ยนเป็น card ตาม design):

```tsx
<div className="flex flex-col gap-3 p-3 border-[0.5px] border-default rounded-card bg-page">
```

**`More` placeholder** (disabled ทุก state — Phase 5 "Edit progress"; icon-only ใน Button text-padded ยอมรับได้เพราะ disabled placeholder):

```tsx
const More = (
  <Button variant="ghost" size="md" disabled aria-label="More options">
    <Icon as={MoreHorizontal} size={16} />
  </Button>
);
```

### 3.2 Movie / special branch (`isMovie === true`)

`const watched = t.status === "completed";` — **ใช้ status เท่านั้น** (ไม่ใช่ `ep >= 1`): กัน movie ที่หลุด `airing='ongoing'` โชว์ watched ทั้งที่ backend ยังไม่ complete (2a ทำถูกแล้ว carry ต่อ)

```
row:  <div className="flex items-center justify-between">
        <StatusPill status={t.status} />
        {watched && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary tabular-nums">
            <Icon as={CheckCircle2} size={15} /> Watched
          </span>
        )}
      </div>

watched === true:
  <div className="flex gap-1.5">
    <Button variant="secondary" size="md" className="flex-1" disabled={t.isPending}
            onClick={() => setConfirmOpen(true)}>
      <Icon as={RotateCcw} size={15} /> Watch again
    </Button>
    {More}
  </div>
  <button className="self-start text-xs text-tertiary hover:text-secondary transition-colors pt-0.5"
          disabled={t.isPending} onClick={t.unmarkWatched}>
    Unmark as watched
  </button>

watched === false:
  <div className="flex gap-1.5">
    <Button variant="primary" size="md" className="flex-1" disabled={t.isPending}
            onClick={t.markWatched}>
      <Icon as={Check} size={15} /> Mark as watched
    </Button>
    {More}
  </div>
```

> ✓Watched = `text-primary` ตาม design `.tracker-watched` + BRAND (status-success สงวนให้ badge/toast; StatusPill แบก color อยู่แล้ว) — **เปลี่ยนจาก 2a ที่ใช้ `text-success`**

### 3.3 Series branch (multi-episode, `isMovie === false`)

Derived flags:

```ts
const isCompleted = t.status === "completed";
const isInterrupted = t.status === "dropped" || t.status === "on_hold";
const canIncrement = t.episode < totalEpisodes; // backend: from+1 <= total
const canRewatch = isCompleted || isInterrupted; // backend guard: status IN set
const isCaughtUp =
  totalEpisodes > 0 &&
  t.episode >= totalEpisodes && // ongoing series ดูครบ aired
  airingStatus === "ongoing" &&
  t.status === "watching";
```

Layout (branch ด้วย **status ไม่ใช่ `ep>=total`** — เคารพ completion guard `airing≠ongoing`):

```
row:  <div className="flex items-center justify-between">
        <StatusPill status={t.status} />
        <span className="text-sm text-secondary tabular-nums">
          ep <b className="text-primary font-medium">{t.episode}</b> of {totalEpisodes}
        </span>
      </div>
bar:  <ProgressBar value={t.episode} total={totalEpisodes} />

action region — precedence (บนลงล่าง, เจอ true ตัวแรกใช้เลย):

① canRewatch && canIncrement   → interrupted mid-way (dropped/on_hold, ep<total): stack
     <div className="flex flex-col gap-1.5">
       <div className="flex gap-1.5">
         <Button variant="primary" size="md" className="flex-1" disabled={t.isPending} onClick={t.incrementEpisode}>+1 episode</Button>
         {More}
       </div>
       <Button variant="secondary" size="md" className="w-full" disabled={t.isPending} onClick={() => setConfirmOpen(true)}>
         <Icon as={RotateCcw} size={15} /> Rewatch
       </Button>
     </div>

② canRewatch                   → completed (หรือ dropped/on_hold ที่ ep>=total): Rewatch only
     <div className="flex gap-1.5">
       <Button variant="secondary" size="md" className="flex-1" disabled={t.isPending} onClick={() => setConfirmOpen(true)}>
         <Icon as={RotateCcw} size={15} /> Rewatch
       </Button>
       {More}
     </div>

③ canIncrement                 → watching / plan_to_watch mid-way: +1 only
     <div className="flex gap-1.5">
       <Button variant="primary" size="md" className="flex-1" disabled={t.isPending} onClick={t.incrementEpisode}>+1 episode</Button>
       {More}
     </div>

④ isCaughtUp                   → ongoing ดูครบ aired: hint (C1=b, C2 airing-specific)
     <div className="flex items-center justify-between">
       <span className="text-sm text-tertiary">Caught up — waiting for new episodes</span>
       {More}     {/* C3=i: เก็บ More disabled ไว้ */}
     </div>

⑤ else                         → defensive (finished+watching inconsistent, ไม่ควรเกิด): render {More} เดี่ยว ๆ ในแถว justify-end
     <div className="flex justify-end">{More}</div>
```

### 3.4 Confirm modal (Rewatch series / Watch again movie) — **immediate close on confirm**

Copy ตาม design `tracker-states.jsx` (verified):

```ts
const rewatchCopy = isMovie
  ? { title: "Watch again?", body: "Logs another watch. Your history stays.", cta: "Watch again" }
  : {
      title: "Start over from episode 1?",
      body: "Your watch history stays — progress resets to the start.",
      cta: "Rewatch",
    };
```

```tsx
<Modal
  open={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title={rewatchCopy.title}
  actions={
    <>
      <Button variant="ghost" size="md" onClick={() => setConfirmOpen(false)}>
        Cancel
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={() => {
          setConfirmOpen(false);
          t.startRewatch();
        }}
      >
        <Icon as={RotateCcw} size={15} /> {rewatchCopy.cta}
      </Button>
    </>
  }
>
  {rewatchCopy.body}
</Modal>
```

> **Pattern: ปิด modal ทันทีตอน confirm + ยิง optimistic action** (ไม่ค้าง modal โชว์ loading). เพราะ optimistic บน tracker (F3=A) sync `episode+status` ทันที → Rewatch button หายทันที, tracker reflect ทันที → modal ไม่มีเหตุค้างโชว์ spinner. **ไม่ใช้ loading state ใน modal** (design มี loading artboard แต่มาจากก่อนตัดสิน optimistic — optimistic เหนือกว่า). double-click กัน by backend guard (`status IN` fail → stale silent). Cancel = ghost, confirm primary + RotateCcw ทั้ง 2 kind (ตาม design).

### 3.5 Toast portal (component render — hook คืน `toasts`+`dismiss`)

Copy pattern จาก `FavoriteButton` เป๊ะ:

```tsx
{
  typeof document !== "undefined" &&
    t.toasts.length > 0 &&
    createPortal(
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-90 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {t.toasts.map(toast => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            title={toast.title}
            onClose={() => t.dismiss(toast.id)}
            className="pointer-events-auto"
          />
        ))}
      </div>,
      document.body,
    );
}
```

### 3.6 Structure สรุป

```
<>
  <div className="tracker card">   // §3.1
    {isMovie ? <movie §3.2/> : <series §3.3/>}
  </div>
  <Modal confirm §3.4/>
  {toast portal §3.5}
</>
```

> **หมายเหตุ disabled ระหว่าง pending:** ปุ่ม action ทุกตัว `disabled={t.isPending}` — กัน +1 ยิงซ้อนกันแล้ว race กันที่ DB (CAS ทำให้ปลอดภัยแต่ +1 อาจหายถ้ามาไม่เรียง). ดูครบ 12 ตอน = คลิก-รอสั้น ๆ-คลิก (optimistic ให้ feedback ทันทีระหว่างรอ). correctness > binge speed.

---

## 4. แก้ `MediaDetailView.tsx`

### 4.1 สลับ tracking summary → EpisodeTracker + ย้าย favorite ลงล่าง

**ลบ** block `{/* 2.3 Tracking summary (read-only) */}` ทั้งอัน (StatusPill + movie ✓Watched / ProgressBar+ep count + FavoriteButton row + comment slot) แล้ววางใหม่:

```tsx
<div className="shrink-0 w-64 flex flex-col gap-4">
  <DetailPoster
    posterUrl={media.posterUrl}
    titleEn={media.titleEn}
    tileColorIndex={tileColorIndex}
  />

  <EpisodeTracker
    userMediaId={userMedia.id}
    currentEpisode={userMedia.currentEpisode}
    totalEpisodes={media.totalEpisodes}
    status={userMedia.status}
    isMovie={isMovie}
    airingStatus={media.airingStatus}
  />

  {/* Favorite — as-built circle 26×26 (design intends full-width ghost; drift = backlog, decision i) */}
  <div className="flex items-center gap-2">
    <div className="w-6.5 h-6.5 rounded-pill flex items-center justify-center bg-black/55">
      <FavoriteButton userMediaId={userMedia.id} isFavorite={userMedia.isFavorite} />
    </div>
    <span className="text-xs text-tertiary">
      {userMedia.isFavorite ? "Favorited" : "Add to favorites"}
    </span>
  </div>
</div>
```

- **favorite row เก็บ markup เดิมของ 2a เป๊ะ** (decision i — ไม่แตะ FavoriteButton) แค่ย้ายมาไว้ **หลัง** EpisodeTracker (design วาง favorite ล่างสุด stack)
- **ลบ import ที่ไม่ใช้แล้ว** จาก MediaDetailView: `StatusPill`, `ProgressBar` (จาก MediaCard), `CheckCircle2` (lucide). **คง** `Icon` (breadcrumb + provider table ใช้), `FavoriteButton`, `isTrackable`, ฯลฯ
- **เพิ่ม import:** `EpisodeTracker` จาก `@/components/media/EpisodeTracker`

### 4.2 F5 — ลบ dead props ของ `DetailPoster`

Caller (ด้านบน) ตัด `isFavorite` + `userMediaId` ออกแล้ว (§4.1) — แก้ interface ให้ตรง:

```ts
interface DetailPosterProps {
  posterUrl: string | null;
  titleEn: string | null;
  tileColorIndex: number;
  // ลบ isFavorite, userMediaId (function ไม่เคย destructure ใช้)
}
```

Function body ไม่ต้องแก้ (destructure `{ posterUrl, titleEn, tileColorIndex }` อยู่แล้ว)

### 4.3 F4 — แก้ `WatchHistory` movie subtext hardcode

2b เปิด "Watch again" → movie มี watchlog ได้หลาย entry → `"1 watch"` ผิด:

```ts
const sub = isMovie
  ? watchLogs.length > 0
    ? `last ${watchLogs.length} watch${watchLogs.length === 1 ? "" : "es"}` // honest window: watchLogs cap ที่ 5 (query limit) — ไม่ใช่ total
    : ""
  : `last ${Math.min(watchLogs.length, 5)} episodes`;
```

---

## 5. Design fidelity — deviation ที่ตั้งใจ (อย่าพยายาม "แก้")

1. **Favorite = circle 26×26** (as-built 2a) ไม่ใช่ full-width ghost แบบ design intent — decision (i), backlog reconcile หลัง 2b (ต้องเพิ่ม variant prop ใน FavoriteButton ซึ่ง shared กับ MediaCard). **ห้ามแตะ `FavoriteButton.tsx`**
2. **Confirm modal ไม่มี loading state** — optimistic tracker แทน (§3.4)
3. **`⋯ More` disabled ทุกที่** — Phase 5 "Edit progress"
4. **caught-up state** ไม่มีใน design bundle (net-new จาก completion guard) — spec ใน §3.3④ ครบ ไม่ต้องรอ design
5. อย่างอื่น **build เข้าหา design prototype** (`Tracker` ใน screens.jsx + `.tracker-*` CSS): card container, row layout, stack สำหรับ interrupted, secondary Rewatch, primary +1

---

## 6. Business-rule guardrails (ห้ามพลาด — prototype encode ผิด)

- **Branch ด้วย server `status` ไม่ใช่ `ep >= total`** — prototype route ด้วย `ep>=total` → โชว์ Rewatch ให้ caught-up (ongoing ดูครบ aired) ผิด เพราะ `startRewatch` guard = `status IN (completed,dropped,on_hold)` → caught-up (`watching`) กด Rewatch = stale เงียบ
- **caught-up predicate ต้อง gate `airingStatus === "ongoing"`** — ถ้า copy พูด "waiting for new episodes" แต่โชว์ให้ finished series (ที่หลุด status watching) = โกหก. + `totalEpisodes > 0` กัน false-positive ตอน AniList ไม่ให้ episode count (`0>=0`=true) — นั่นเป็น data gap คนละเรื่อง (RPC ก็ block +1 ด้วย `1<=0`=false), backlog
- **movie watched ใช้ `status === "completed"` เท่านั้น** (§3.2)
- **completion optimistic ผ่าน `computeStatusAfterIncrement`** (§1) — ห้าม inline `ep>=total ? completed` ใน component (จะ complete ongoing ผิด + business logic รั่วเข้า UI)

> **Known residual (§P4 1.9 — data class, ไม่ใช่ bug อย่า "แก้"):** movie ที่ `airing_status='ongoing'` (data ผิด, admin ควรแก้) → Mark ส่ง from=0, CAS ผ่านแต่ completion guard block → status ค้าง `watching` → โชว์ "Mark as watched" ตลอด (ครั้งถัดไป from=1 > total=1 → CAS fail → dead-end). เป็น **data issue ไม่ใช่ tracker bug** — movie watched keyed off `status==="completed"` ถูกแล้ว ปล่อยตามนี้

---

## 7. เสร็จแล้ว

1. `npm run typecheck` + `npm run lint` + `npm test` (Vitest) — ผ่านทั้งหมด
2. **Browser verify** (CLAUDE.md — ต้อง test UI จริง) บน `/media/[id]`:
   - `+1` → optimistic ขยับทันที (StatusPill / bar / ep count) → `router.refresh()` แล้ว watch history เพิ่ม entry ใหม่
   - **stale path**: กด `+1` เร็ว ๆ 2 ครั้ง → ครั้งที่ 2 **เงียบ** (ไม่ toast, ไม่ loop, ไม่ค้าง revert)
   - **caught-up**: ongoing series ที่ `ep === total` + watching → **ไม่มีปุ่ม** + hint "Caught up — waiting for new episodes"
   - Rewatch / Watch again → confirm modal → confirm → tracker reset ทันที (modal ปิดทันที)
   - movie: Mark → ✓ Watched + Watch again + Unmark ครบ
3. อัปเดต **PROGRESS.md** (Part 2b tasks + "Notes for Chat") + **CHANGELOG.md** (entry `[date] feat(phase4): Part 2b — interactive EpisodeTracker`)
4. รัน **`/sync-progress`** skill ปิด session (CLAUDE.md)
5. เปิด PR เข้า **`develop`** (ไม่ใช่ main) — Phase 4 ปิดครบหลัง 2b merge

---

## 8. ห้าม

- ❌ ห้าม `any` · ห้าม inline static style (dynamic values เท่านั้น เช่น tile color — static ใช้ Tailwind class)
- ❌ ห้าม business logic ใน component/hook เกินกว่าเรียก `computeStatusAfterIncrement` (completion rule อยู่ domain)
- ❌ ห้ามแตะ `FavoriteButton.tsx` (decision i) · ห้ามแก้ `app/actions/userMedia.ts` (contract locked จาก Part 1)
- ❌ ห้ามแก้ `src/types/database.ts` · ห้าม `console.log` · ห้าม import `'zod'` (ใช้ `'zod/v4'` — ไม่เกี่ยว 2b แต่คง rule)
- ❌ ห้าม PR เข้า `main` — **develop เท่านั้น** · ห้ามลบ `develop`
- ❌ ห้าม copy result-handling branch จาก FavoriteButton ตรง ๆ — try/catch structure copy ได้ แต่ต้องเพิ่ม `reason === "stale"` → `router.refresh()` เงียบ (ไม่ toast) + success → `router.refresh()` (§2)

---

## 9. Contracts resolved (Code review ยืนยันกับ develop แล้ว — ใช้ได้เลย)

- ✅ `AiringStatus` = `"ongoing"|"finished"|"upcoming"` · canonical `@/types/enums` · export จาก `@/domain/entities/Media` (helper §1 + hook §2 import จาก Media)
- ✅ `UserMedia.ts` **ไม่** re-export `AiringStatus` (แค่ `AudioType, WatchStatus`) → §2 import แยกจาก Media (แก้แล้ว)
- ✅ `Toast` props = `{ variant, title, description?, onClose, className? }`
- ✅ `media.airingStatus` มีบน `Media` entity
- ✅ action signatures · `UserMediaActionResult` + `reason:"stale"` · DS APIs (Modal/Button/Icon/StatusPill/ProgressBar/useToast) · `isTrackable` · `revalidatePath("/dashboard")` only · FavoriteButton pattern (try/catch + portal) — ตรง source ทั้งหมด
