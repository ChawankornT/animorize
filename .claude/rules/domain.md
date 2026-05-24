---
paths:
  - "src/domain/**"
---

# Domain Layer Rules (Clean Architecture)

- ห้าม import จาก:
  - `@supabase/*`, `lib/supabase/*`
  - `next/*`, `react`
  - `repositories/supabase/*` (ห้าม import implementation, import เฉพาะ interface)
  - `hooks/`, `components/`, `app/`, `stores/`
- อนุญาต import เฉพาะ:
  - ไฟล์อื่นใน `domain/`
  - external utility ที่ไม่มี side effects (เช่น zod, date-fns)
- Entities = plain TypeScript types + business validation functions
- UseCases = pure functions ที่รับ repository interface เป็น parameter
- ห้ามมี side effects (fetch, DB call, console.log) ใน domain/
- ทุก usecase ต้องมี JSDoc อธิบาย input/output/business rule
