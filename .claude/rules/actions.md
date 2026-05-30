---
paths:
  - "src/app/actions/**"
---

# Server Actions Rules

## Basics
- ทุก action ต้อง `'use server'` ที่บรรทัดแรก
- Validate input ด้วย Zod schema ก่อนทำอะไรทั้งนั้น
- Return format: `{ success: boolean, data?, message?, errors? }`
- Error handling: try/catch + console.error + return `{ success: false, message }`
- ห้ามมี business logic ใน action — delegate ไป usecase
- Flow: Action → validate (Zod) → usecase (domain) → repository → DB
- AniList API call ทำใน action เท่านั้น (server side) ห้าม call จาก client

## Optimistic UI pattern
- Mutations ที่ต้องการ optimistic UX ใช้ `useOptimistic` + Server Action คู่กัน
- action fail → rollback optimistic state + toast error message
- ตัวอย่างแรก (Phase 3): favorite toggle — reuse pattern เดียวกันกับ +1 episode (Phase 4)
- ไม่ wire TanStack Query สำหรับ mutations — `useOptimistic` + `revalidatePath` เพียงพอ

## Validation SoT
- Zod = ตรวจ shape/format ที่ขอบ action (untrusted input)
- Domain = business invariant canonical — ถ้า rule เปลี่ยน แก้ domain ก่อน แล้ว sync Zod message
- overlap ที่ยอมรับ: at-least-one-title + provider format (Zod ให้ user error, domain เป็น safety net)
