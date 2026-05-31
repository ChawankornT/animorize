## ⛔ ตรวจสอบ base branch ก่อน merge

> **ระหว่าง phase**: PR ต้องมี base เป็น `develop` เท่านั้น
> `develop` → `main` = release PR ที่เจ้าของอนุมัติเองตอนปิด phase เท่านั้น

- [ ] **Base branch ถูกต้อง** — `feature/*` / `fix/*` → `develop` (ไม่ใช่ `main`)

---

## สรุปการเปลี่ยนแปลง

<!-- อธิบายสั้นๆ ว่าทำอะไร และทำไม -->

## ประเภทของ PR

- [ ] feat — feature ใหม่
- [ ] fix — แก้ bug
- [ ] refactor — ปรับโครงสร้าง ไม่เพิ่ม feature / ไม่แก้ bug
- [ ] chore — งาน maintenance (docs, deps, config)
- [ ] test — เพิ่ม/แก้ test

## Checklist

- [ ] CI ผ่านทุก check (lint + typecheck + test)
- [ ] ถ้า PR เข้า `main` → `build` job ผ่านด้วย
- [ ] ไม่มี `any` ใหม่
- [ ] usecase / mapper ใหม่มาพร้อม unit test
- [ ] ถ้ามี UI → fetch design bundle แล้ว (ดู `.claude/rules/ui.md`)
- [ ] ถ้าแก้ schema → ไม่แตะ `types/database.ts` โดยตรง (auto-gen)
