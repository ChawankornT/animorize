---
name: sync-progress
description: อัปเดท PROGRESS.md ท้ายทุก session เพื่อ sync กับ Chat
allowed-tools: Read, Write, Edit, Bash(git status), Bash(git diff --name-only)
---

# Sync Progress

รันท้ายทุก session เพื่ออัปเดท PROGRESS.md ให้ Chat รู้สถานะล่าสุด

**ขั้นตอน:**
1. อ่าน PROGRESS.md ปัจจุบัน
2. สรุปว่า session นี้ทำอะไรไปบ้าง:
   - task ไหน complete → เปลี่ยน `[ ]` เป็น `[x]`
   - มี pending decisions ใหม่ไหม
   - มี blockers ไหม
3. เช็คว่ามีการแก้ไข DECISIONS.md, CLAUDE.md, PROJECT_INSTRUCTIONS.md, schema.sql ไหม:
   - ถ้ามี → bump version ใน `## Versions` section
   - เพิ่มใน `## Recent Changes`
   - เขียน note ใน `## Notes for Chat` บอก Chat ว่าต้องอัปเดท instructions อะไร
4. เช็คว่า phase ปัจจุบัน complete ทุก task ไหม:
   - ถ้า complete → เปลี่ยน status เป็น "Complete" + เพิ่ม checklist phase ถัดไป
5. อัปเดท CHANGELOG.md ถ้ามีการเปลี่ยนแปลงสำคัญ

**ห้ามลืม:**
- ถ้าแก้ DECISIONS.md → bump decisions_version
- ถ้าแก้ schema.sql → bump schema_version
- ถ้าแก้ CLAUDE.md → bump claude_md_version
- ถ้าแก้ PROJECT_INSTRUCTIONS.md → bump instructions_version + เตือนใน Notes for Chat

Focus: $ARGUMENTS (ถ้าไม่ระบุ = สรุป session ทั้งหมด)
