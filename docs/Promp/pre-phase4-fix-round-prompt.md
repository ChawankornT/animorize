# Pre-Phase 4 — Fix round: error-handling hardening (5 task)

> สำหรับ Claude Code · run **หลัง** PR `docs/pre-phase4-decisions` merge แล้ว (PROGRESS/CHANGELOG จะได้ไม่ conflict)
> Branch: `fix/pre-phase4-hardening` จาก `develop` ล่าสุด → **PR เข้า `develop` เท่านั้น** (verify base ก่อนเปิด)
> Scope: 5 task ข้างล่าง **เท่านั้น** — เจอ issue อื่นให้จดใส่ PROGRESS backlog ห้าม fix นอก scope
> Convention อ้างอิง (จาก docs PR): **CLAUDE.md → Conventions DO block** (imperative handler = try/catch+toast; queryFn = throw+isError) + **DECISIONS.md §P4 1.8**

---

## Baseline (verified จาก develop, 2026-06-07)

1. `src/components/media/FavoriteButton.tsx` — `handleToggle` await action ใน `startTransition` **ไม่มี try/catch** → action throw (network) = optimistic revert เงียบ ไม่มี toast
2. `src/components/media/AddToLibraryModal.tsx` — `handleSubmit` ไม่มี try/catch และ `setSubmitting(false)` อยู่กลาง flow ไม่ใช่ finally → throw = ปุ่มค้าง "Adding…" ถาวร (ต่างจาก `load()` ใน useEffect ที่มี try/catch/finally แล้ว — อย่าแตะ)
3. `src/app/actions/userMedia.ts` — `addToLibraryAction` catch ดักเฉพาะ `instanceof DuplicateLibraryEntryError`; **TOCTOU race** (concurrent add ผ่าน pre-check พร้อมกัน) → Postgres `23505` unique violation ตก branch generic → `reason: "error"` ที่ควรเป็น `"duplicate"`
4. `src/components/media/SearchView.tsx` — `useQuery` destructure แค่ `{ data, isFetching }` **ไม่มี `isError`** → queryFn throw = ตก default `results = []` → โชว์ "No results found" (user เข้าใจผิดว่าค้นไม่เจอ)
5. `src/app/actions/userMedia.ts` — auth boilerplate (`createClient → getUser → if (!user) return …`) ซ้ำทั้ง 6 actions; Phase 4 จะเพิ่มอีก 3+

---

## Task 1 — `FavoriteButton.handleToggle`

- Wrap ภายใน `startTransition(async () => { … })` ด้วย try/catch — โครงเดิมคงไว้ (`setOptimisticFav(next)` ก่อน await)
- catch → `show("Failed to update favorite", "error")` — **curated copy ห้ามใช้ `err.message`** (action layer curation rule); optimistic revert React จัดการเองเมื่อ transition จบ

## Task 2 — `AddToLibraryModal.handleSubmit`

- try → await action; `result.success` → `onAdded(media.id)`; ไม่ success → toast `result.message` (พฤติกรรมเดิม)
- catch → toast generic: title "Couldn't add to library" + description ทำนอง "Something went wrong — try again." (voice: sentence case, ไม่มี `!` ไม่มี emoji)
- **finally → `setSubmitting(false)`** (ย้ายจาก inline)

## Task 3 — TOCTOU → reason "duplicate"

> ⚠️ **Root cause ที่ต้องแก้ก่อน:** `SupabaseUserMediaRepository.add()` (line ~32) ทำ `throw new Error(\`Failed to add media to library: ${error.message}\`)`— **wrap PostgrestError ใน plain Error →`.code`("23505") หาย**. ถ้าไม่แก้ repo ให้ preserve code, helper จะ return false เสมอใน production และ unit test`{ code: "23505" }` จะ **false-green** (test ผ่านแต่ prod ไม่กัน race จริง). ดังนั้น Task นี้ **ต้องแก้ทั้ง errors.ts + repo + action + test** ให้ตรง path จริง

**3a · `src/lib/supabase/errors.ts` (ไฟล์ใหม่)** — typed error class ที่เก็บ code:

```ts
export class SupabaseError extends Error {
  readonly code: string | undefined;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "SupabaseError";
    this.code = code;
  }
}

export function isPgUniqueViolation(err: unknown): boolean {
  return err instanceof SupabaseError && err.code === "23505";
}
```

**3b · `SupabaseUserMediaRepository.add()`** — throw `SupabaseError` (preserve code) แทน plain Error:

```ts
// import { SupabaseError } from "@/lib/supabase/errors";
if (error) throw new SupabaseError(`Failed to add media to library: ${error.message}`, error.code);
```

- **แก้เฉพาะ `add()`** — method อื่นใน repo ปล่อยไว้ (scope discipline); wrap ทั้ง repo ด้วย `SupabaseError` = follow-up จด PROGRESS backlog
- `lib/supabase/errors.ts` อยู่ชั้น infra → repo import ได้ (ไม่ผิด dependency rule — ต่างจาก `DuplicateLibraryEntryError` ที่อยู่ใน `domain/usecases/` ซึ่ง repo import **ไม่ได้** ตาม `.claude/rules/repositories.md` → จึงเลือกทาง `SupabaseError`)

**3c · `addToLibraryAction` catch:**

```ts
// import { isPgUniqueViolation } from "@/lib/supabase/errors";
if (error instanceof DuplicateLibraryEntryError || isPgUniqueViolation(error)) {
  /* reason "duplicate" + message เดิม */
}
```

- **คง pre-check ใน usecase ไว้** (fast path + domain-rule testable) — DB constraint = backstop สำหรับ race
- usecase `AddToLibrary` คง `return repository.add(input)` ตรงๆ (ไม่ catch/wrap) → `SupabaseError` propagate ถึง action ได้

**3d · Unit test `isPgUniqueViolation`** (สะท้อน path จริง — repo throw `SupabaseError`):

- `new SupabaseError("dup", "23505")` → true
- `new SupabaseError("fk", "23503")` → false · `new Error("plain")` → false · `null` / `undefined` → false

## Task 4 — `SearchView` isError branch

- Destructure `isError`, `refetch` เพิ่มจาก `useQuery`
- เพิ่ม branch ก่อน no-results: `hasQuery && isError` → ข้อความ "Couldn't search — try again." + ปุ่ม retry (`Button` secondary sm → `refetch()`)
- Branch no-results เดิมเพิ่มเงื่อนไข `&& !isError` กันชนกัน
- **ห้าม** ใส่ try/catch ใน `queryFn` (convention: ปล่อย throw)

## Task 5 — `getAuthedUser()` helper

- ไฟล์ใหม่ `src/lib/supabase/auth.ts`:

  ```ts
  // server-side only — ใช้ใน Server Actions / Server Components
  export async function getAuthedUser(): Promise<{
    supabase: Awaited<ReturnType<typeof createClient>>;
    user: User; // import type { User } from "@supabase/supabase-js"
  } | null>;
  // createClient() → supabase.auth.getUser() → ไม่มี user คืน null, มีคืน { supabase, user }
  ```

- Refactor **ทั้ง 6 actions** ใน `app/actions/userMedia.ts` ให้ใช้ helper:
  - mutation actions (toggleFavorite / removeFromLibrary / addToLibrary / changeLibraryProvider): `null` → return `{ success: false, message: "Unauthorized", reason: "unauthorized" }` (เดิม)
  - `searchMediaAction`: `null` → `[]` (เดิม) · `getAddToLibraryDataAction`: `null` → `{ allProviders: [], mediaProviders: [] }` (เดิม)
- **Behavior ต้องเหมือนเดิม 100%** — refactor ล้วน · admin actions ไม่เกี่ยว (layout guard + RLS อยู่แล้ว ห้ามแตะ)

---

## เสร็จแล้ว

- `npm run lint` + `npm run typecheck` + `npm test` ผ่านทั้งหมด (เดิม 116 + test ใหม่ของ Task 3)
- PROGRESS.md: ติ๊ก 3 correctness bugs ออกจาก backlog + บันทึก SearchView isError / getAuthedUser ว่าแก้แล้ว
- CHANGELOG.md: entry fix round
- Commit ตาม convention → เปิด **PR เข้า `develop`** (verify base ก่อนเปิด)
