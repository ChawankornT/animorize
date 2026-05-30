---
paths:
  - "src/domain/**"
---

# Domain Layer Rules (Clean Architecture)

## Import restrictions (enforced by ESLint `no-restricted-imports`)
กฎเหล่านี้ fail ที่ CI lint step อัตโนมัติ — ไม่ใช่แค่ convention:
- ห้าม import: `react`, `next/*`, `@supabase/*`, `@/lib/supabase/*`
- ห้าม import: `@/repositories/supabase/*` (implementations) — ใช้ได้เฉพาะ interfaces
- ห้าม import: `@/hooks/*`, `@/components/*`, `@/app/*`, `@/stores/*`
- **อนุญาต:** `@/repositories/interfaces/*` (dependency inversion — usecase import interface type ได้)
- **อนุญาต:** external utility ที่ไม่มี side effects (zod, date-fns ฯลฯ)

## Entity rules
- Entities = plain TypeScript types + business validation functions
- `getDisplayTitle` — shared util ที่ `domain/entities/title.ts` re-exported จาก Media + Franchise; ห้าม inline `titleEn ?? titleRomaji ?? titleTh` ในโค้ดใหม่
- UseCases = pure functions รับ repository interface เป็น parameter
- ห้ามมี side effects (fetch, DB call, console.log) ใน domain/
- ทุก usecase ต้องมี JSDoc อธิบาย input/output/business rule
- usecase ใหม่ทุกตัวต้องมาพร้อม unit test ใน `src/__tests__/domain/usecases/`

## Documented exception (Phase 4)
- `IncrementEpisode` usecase จะเรียก repository method ที่ wrap Postgres RPC — atomic step (increment + insert watchlog + auto-complete) อยู่ใน DB function
- นี่คือข้อยกเว้นที่ตั้งใจ: atomicity > layer purity สำหรับ read-modify-write 2 ตาราง
- ดูรายละเอียด: DECISIONS.md § "Atomic +1 Episode ผ่าน Postgres RPC"
