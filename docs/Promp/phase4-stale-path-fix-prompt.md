# Fix prompt — Phase 4 stale-path hardening

> **branch:** `fix/phase4-stale-path-hardening` (off `develop`) → PR → `develop`
> **scope:** 2 fixes จาก stale-seam audit เท่านั้น — **อย่าแตะ method/ไฟล์อื่น ไม่ refactor เพิ่ม**

## Fix 1 — `startRewatchAction`: revalidate ก่อน stale return

ไฟล์: `src/app/actions/userMedia.ts` (`startRewatchAction`)

ปัญหา: `revalidatePath("/dashboard")` อยู่ **หลัง** `if (!result) return {stale}` → stale path ไม่ revalidate
(ขัด pattern `incrementEpisodeAction` ที่ revalidate ก่อน check + หลักการ §P4 1.1 "ปล่อย revalidate sync เงียบ")

แก้ → ย้าย `revalidatePath("/dashboard")` ขึ้นก่อน `if (!result)`:

```ts
const result = await startRewatch(repo, userMediaId);
revalidatePath("/dashboard");
if (!result) {
  return { success: false, message: "Cannot rewatch from current status", reason: "stale" };
}
return { success: true, message: "Rewatch started" };
```

เหตุผล: stale ของ startRewatch ที่สำคัญคือ **double-fire** (รอบแรกสำเร็จ → status `'watching'` → รอบสอง guard miss = no-op) = DB นำหน้า client → ต้อง sync state เงียบ เหมือน increment

## Fix 2 — `incrementEpisode` repo: harden null guard

ไฟล์: `src/repositories/supabase/SupabaseUserMediaRepository.ts` (`incrementEpisode`)

ปัญหา: `if (data == null)` ถูกทิศทาง แต่ถ้า PostgREST serialize `RETURN NULL` จาก `RETURNS user_media`
เป็น **all-null composite object** (`{ id: null, user_id: null, ... }`) แทน JS `null` → guard พลาด →
`toUserMedia(data)` คืน entity ที่ field เป็น null หมด

แก้ → ปิดทั้งสอง representation by construction:

```ts
// PostgREST อาจคืน RETURN NULL ของ composite เป็น all-null object แทน JS null;
// id เป็น PK → success จริงไม่มีทาง null → ใช้ตรวจ "ไม่ใช่ row จริง" ได้ทั้งสองเคส
if (data == null || data.id == null) return { status: "stale" };
```

เหตุผล: `id` เป็น PK → CAS hit จริงไม่มีทาง null → `data.id == null` ระบุ stale ได้ทั้ง true-null และ
all-null object โดยไม่มี false positive; robust ต่อ PostgREST/Supabase version → **ตัด dependency กับ runtime probe**

## Tests

ไฟล์ test ที่เกี่ยวข้อง (repo + action):

1. **`incrementEpisode`** — เพิ่ม case ใหม่: mock `.rpc()` คืน `{ data: { id: null, /* rest null */ }, error: null }`
   → expect `{ status: "stale" }` (lock hardened guard ของ Fix 2)
2. **`startRewatchAction`** — ถ้ามี test ที่ assert revalidate **ไม่** ถูกเรียกตอน stale → อัปเดตให้สะท้อนว่า
   ตอนนี้ revalidate ถูกเรียกแล้ว (ตรงกับ `incrementEpisodeAction`); ถ้า test เช็คแค่ result shape → ไม่ต้องแก้

## ปิดงาน

- `npm run lint` + typecheck + test → เขียวทั้งหมด
- `/sync-progress`: mark Part 1 "Verification findings" → **resolved** (stale seam hardened: guard `id` +
  revalidate consistency); ระบุว่า Task B runtime probe ไม่จำเป็นแล้ว (ปิด by construction)
- commit → PR `fix/phase4-stale-path-hardening` → `develop`
- **scope เท่านี้**
