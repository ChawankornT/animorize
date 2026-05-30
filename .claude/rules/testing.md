---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
---

# Testing Rules

## Priority (MVP)
- **Must test:** `domain/usecases/` + mappers (`repositories/supabase/mappers.ts`, `lib/anilist/mapper.ts`) + Zod schemas (admin input)
- **Defer:** RTL/component tests (ROI ต่ำสำหรับ solo — ทบทวน Phase 5)
- **No coverage % gate** — CI รัน test ทุก PR แต่ไม่ fail บน threshold
- usecase + mapper ใหม่ทุกตัวต้องมาพร้อม unit test

## Mock Repository Harness
- ใช้ `src/__tests__/utils/mockRepositories.ts` เป็น base — อย่าสร้าง mock ใหม่ต่างหาก
- mock ใช้ `vi.fn()` — override ด้วย `.mockResolvedValue` / `.mockRejectedValue` ต่อ test case
- สร้าง factory ใหม่ใน harness เมื่อเพิ่ม repository interface ใหม่ (Phase 3+ เพิ่ม UserMedia/WatchLog)

## Format
- `describe('[ชื่อ]', () => { it('should [behavior] when [condition]', ...) })`
- ทำความสะอาดหลัง test (cleanup, reset state)
- ห้าม skip test โดยไม่ใส่ TODO comment อธิบายเหตุผล

## Layer-specific
- Domain usecases: mock repository เสมอ (ไม่ต่อ DB จริง)
- Repository implementation: test ด้วย Supabase dev project (integration test — defer)
- Hooks: mock repository + renderHook
