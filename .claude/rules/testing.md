---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
---

# Testing Rules

- Domain usecases: test ด้วย mock repository (ไม่ต่อ DB จริง)
- Repository: test ด้วย test database (Supabase dev project)
- Hooks: test ด้วย mock repository + renderHook
- Components: test user interaction ไม่ใช่ implementation detail
- Format: `describe('[ชื่อ]', () => { it('should [behavior] when [condition]', ...) })`
- ทำความสะอาดหลัง test (cleanup, reset state)
- ห้าม skip test โดยไม่ใส่ TODO comment อธิบายเหตุผล
