# UI / Design workflow

## กฎหลัก — ก่อนงานที่มี UI ทุกครั้ง

> ⛔ **ห้ามประดิษฐ์ UI เอง** นอกเหนือจาก design system และ Claude Design handoff bundle
> ก่อน implement component/screen ใดๆ ต้อง verify ว่ามี design ก่อนเสมอ

## ขั้นตอน (บังคับทุกครั้ง)

1. **ขอ / ใช้ Claude Design handoff URL ล่าสุดจากเจ้าของ** — อย่าใช้ลิงก์เก่าโดยไม่ยืนยัน (export ใหม่ = ลิงก์ใหม่เสมอ)
2. **`fetch` bundle → อ่าน `README.md` + `chats/` + screens source** — ทำความเข้าใจ spec ก่อน
3. **Verify ว่ามี screen/component ที่เกี่ยวข้องอยู่ใน bundle** — ถ้าไม่มี → หยุด
4. ถ้ายังไม่มี design → **สั่ง design ก่อน แล้วค่อย implement** — ห้าม implement จาก assumption

## Source of truth

- `BRAND.md` = token / spec / color / typography ของโปรเจกต์ — ใช้เป็น canonical เสมอ
- Design bundle = spec รายหน้า/component — recreate ตาม spec; ห้ามเบี่ยงโดยไม่มีเหตุผล
- ถ้า spec ขัดกับ `BRAND.md` → แจ้งเจ้าของก่อนตัดสินใจ

## Claude Code

- **fetch design bundle ก่อนสร้าง UI component เสมอ** ไม่ว่าจะเป็น page ใหม่หรือ component ใหม่
- export ใหม่จาก Claude Design = ลิงก์ใหม่ → อย่า cache ลิงก์เก่าไว้ใช้ข้ามครั้ง
- ถ้าไม่มีลิงก์ให้ใช้ → **ถามเจ้าของ** อย่าเดา

## Design bundle storage

- download + extract ที่ **`.design-bundle/`** (project root) — อยู่ใน `.gitignore` แล้ว
- เวอร์ชันใหม่มา → **ลบ `.design-bundle/` ทั้ง folder ก่อน** แล้ว extract ใหม่ (ป้องกันไฟล์เก่าค้าง)
- ขั้นตอน: `rm -rf .design-bundle && mkdir .design-bundle && cp <downloaded-file> .design-bundle/bundle.tar.gz && cd .design-bundle && tar xzf bundle.tar.gz`
- อ่าน spec จาก `.design-bundle/<project>/project/screens/` — ไม่ต้อง render ใน browser
