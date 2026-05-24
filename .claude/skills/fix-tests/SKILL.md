---
name: fix-tests
description: วิเคราะห์และแก้ test ที่ fail โดยไม่แก้ test ให้ผ่านเอง
allowed-tools: Read, Grep, Bash(npm test*), Edit
---

# Fix Failing Tests

1. Run `npm test` เพื่อดู error ทั้งหมด
2. อ่าน test file + implementation file ที่เกี่ยวข้อง
3. ระบุก่อน: test ผิดหรือ implementation ผิด — ห้ามแก้ test ให้ผ่านลอยๆ
4. ถ้า implementation ผิด → แก้ implementation, ไม่แตะ test
5. ถ้า test ผิด → แก้ test + comment เหตุผล
6. ตรวจสอบ Clean Architecture: mock repository ถูกต้องไหม, domain logic ถูก layer ไหม
7. Run test อีกครั้งยืนยัน
8. Report: pass/fail + แก้อะไรบ้าง

Focus: $ARGUMENTS
