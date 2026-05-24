---
paths:
  - "src/app/admin/**"
---

# Admin Panel Rules

- ทุก admin page ต้องเช็ค role = 'admin' ใน Server Component ก่อน render
- ถ้า role ไม่ใช่ admin → redirect('/dashboard') ทันที ห้าม show content
- Admin mutations ต้องมี confirmation dialog ก่อน destructive actions (delete franchise, delete media)
- ทุก CRUD form ต้องมี Zod schema validate ก่อน Server Action
- AniList import ต้องแสดง preview ก่อน save — ห้าม auto-save
- Sync retry ต้องทำทีละรายการ ห้าม bulk retry
