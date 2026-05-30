---
paths:
  - "src/repositories/**"
---

# Repository Layer Rules

## Import restrictions (enforced by ESLint `no-restricted-imports`)
- ห้าม import: `react`, `next/*`, `@/hooks/*`, `@/components/*`, `@/app/*`, `@/stores/*`
- อนุญาต: `@supabase/*`, `@/lib/supabase/*`, `@/domain/entities/*`, `@/types/*`

## General rules
- interfaces/ = TypeScript interfaces เท่านั้น (ไม่มี implementation)
- supabase/ = implementation ของ interface ที่ใช้ Supabase client
- ห้ามมี business logic ใน repository — logic อยู่ใน domain/usecases/
- Repository return domain entities เท่านั้น ไม่ return Supabase raw response
- ทุก repository method ต้อง handle error: try/catch + throw descriptive error
- Interface naming: `IMediaRepository`, `IWatchLogRepository`
- Implementation naming: `SupabaseMediaRepository`, `SupabaseWatchLogRepository`

## Supabase client สำหรับ user-owned tables
- `user_media`, `watchlogs` และ table per-user อื่นๆ ต้องใช้ **`server.ts` (session-scoped client) เท่านั้น**
- ห้ามใช้ service-role client — bypass RLS ทำให้ user เห็นข้อมูลคนอื่นได้
- Admin content (providers/franchises/media) ใช้ `is_admin()` RLS policy ตามเดิม
