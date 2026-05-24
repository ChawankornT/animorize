---
paths:
  - "src/app/actions/**"
---

# Server Actions Rules

- ทุก action ต้อง 'use server' ที่บรรทัดแรก
- Validate input ด้วย Zod schema ก่อนทำอะไรทั้งนั้น
- Return format: `{ success: boolean, data?, message?, errors? }`
- Error handling: try/catch + console.error + return { success: false, message }
- ห้ามมี business logic ใน action — delegate ไป usecase
- Flow: Action → validate (Zod) → usecase (domain) → repository → DB
- AniList API call ทำใน action เท่านั้น (server side) ห้าม call จาก client
