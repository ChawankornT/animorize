# Copilot Review Summary

_รีวิวนี้จัดทำโดย GitHub Copilot (วันที่: 2026-05-29)_

---

## จุดแข็ง

- โครงสร้างสอดคล้องกับ Clean Architecture อย่างชัดเจน (แบ่ง Domain, Repository, Hook, UI ได้ดี)
- ใช้เทคโนโลยีที่เหมาะกับงาน (Next.js App Router, Supabase, Zustand, TanStack Query, React Hook Form, Zod)
- ตั้ง conventions ได้น่าเชื่อถือ ป้องกันปัญหาได้ระยะยาว เช่น 
  - ห้าม logic ซ้อน import ข้ามชั้น
  - ห้ามดัก DB interface ใน domain 
  - มีข้อกำหนดชื่อไฟล์และแพทเทิร์น
- ใส่ใจกับ DX (error.tsx, loading.tsx, pure function, mutation แยกเป็น Server Action)
- มี business rule ระบุชัด (sync, progress, naming, session sync)
- จัดการ session/login ด้วย Server Components + Middleware ได้ดี เหมาะกับ Next.js 16

## ข้อเสนอแนะ/ข้อควรระวัง

### Clean Architecture

- ตรวจสอบให้แน่ใจว่าทุก usecase (domain/usecases/) ไม่ import อะไรจาก Supabase, React หรือการใช้งาน DB
- interface กับ supabase repository (repositories/interfaces/ กับ repositories/supabase/) ต้องไม่รั่ว logic ข้าม

### RLS & Supabase

- ตรวจสอบทุกการ query ว่าตรงตาม RLS (ผ่าน auth.uid()) จริงหรือไม่ (prod มักหลุดตรงนี้บ่อย)
- ควรเขียน test หรือ integration flow พิเศษสำหรับ RLS rule กัน regress ใน production

### Session/Sync Progress

- หลังจบ session ต้องมี routine sync /sync-progress ทุกครั้ง ถ้าหลุดจะทำให้ PROGRESS.md ไม่อัปเดท (ควร automate ตรงนี้ ป้องกันพลาด)
- อาจเสริม CI เช็ค auto-bump version ถ้าแก้ไฟล์ schema หรือ docs สำคัญ

### Zod Validation

- ตรวจความครอบคลุมของ Zod validation ว่าครบทุกจุด (โดยเฉพาะ input สำคัญ, admin panel)
- มี test หรือ coverage เช็ค logic validation ป้องกัน input หลุด

### คลุม Test

- มี Vitest, RTL แต่ยังไม่มีข้อมูล coverage/ตัวอย่าง test – แนะนำเพิ่ม coverage และอาจแชร์ตัวอย่าง structure test ที่เหมาะกับ Clean Architecture
- Mutations ผ่าน Server Actions ก็ควรมี test scenarios ครบ

### สไตล์ & UX

- Tailwind 4 โอเคมาก แต่ควรระวัง duplicate style, ตรวจสอบ consistency ของ components/ui/
- Motion v11: ตรวจสอบประสบการณ์ performance กับมือถือ/ช้า

### DECISIONS.md & โครงสร้างเอกสาร

- ทุก PR ที่เปลี่ยน dependency/decision ใหญ่มากๆ ควรมีรายละเอียดใน DECISIONS.md และบอกชัดใน PROGRESS.md
- โครงสร้างใหม่/ไฟล์ใหม่ใน schema/ ต้อง sync doc ตลอด

### หลีกเลี่ยงจุดต่อไปนี้ (ตาม conventions ที่บอกไว้)

- ห้าม import Supabase ใน domain
- หลีกเลี่ยงการแก้ types/database.ts โดยตรง
- ห้าม console.log ใน production (ควรใช้ Logger standard หรือแยก dev/prod log)

---

## คอมเมนต์แนะนำ

- โดยรวม structure ดี ระดับ enterprise-ready ถ้าคุม discipline ตาม conventions ได้ต่อเนื่องจะดูแลง่าย
- ควรอัปเดทตัวอย่าง README (หรือ Quickstart สำหรับ contributor/project setup)
- ควรมี test coverage (.test.tsx, .spec.ts, etc.) ในแต่ละชั้น (domain, repo, hook, UI) ให้ครบ ไม่น้อยกว่า 70%
- ทำ automation sync, test routine เอาไว้เพื่อป้องกัน manual miss

---

_Last updated: 2026-05-29_
