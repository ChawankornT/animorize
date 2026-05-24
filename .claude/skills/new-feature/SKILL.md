---
name: new-feature
description: สร้าง feature ใหม่ตาม Clean Architecture — Domain, Repository, Hook, UI
allowed-tools: Read, Write, Edit, Grep, Bash(npm run typecheck)
---

# New Feature (Clean Architecture)

สร้าง feature ตาม Clean Architecture:

**ขั้นตอน:**
1. อ่าน CLAUDE.md + schema.sql เพื่อเข้าใจ context
2. วิเคราะห์ feature: $ARGUMENTS
3. ระบุว่าต้องสร้างอะไรบ้าง (list ออกมาก่อน รอ confirm):
   - domain/entities/ — entity types ที่เกี่ยวข้อง
   - domain/usecases/ — business logic
   - repositories/interfaces/ — repository contract
   - repositories/supabase/ — Supabase implementation
   - hooks/ — orchestrate usecase → UI
   - components/ — UI components
   - app/actions/ — Server Actions (ถ้ามี mutation)
4. หลัง confirm ค่อย implement ตามลำดับ: Domain → Repository → Hook → UI → Action
5. Run `npm run typecheck` ให้ผ่าน

**ห้าม:**
- domain/ import Supabase
- Business logic ใน component หรือ action
- ใช้ `any` type
- ทำ feature อื่นที่ไม่ได้ขอ
