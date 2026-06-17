# Animorize — Phase 4 · **DESIGN addendum request** (Rewatch)

> **Actor: Claude Design.** ส่งคำขอนี้ตอน **เข้า Part 2 (UI)** — **ไม่ใช่ตอนนี้** (Part 1 = backend ไม่มี design)
> Part 1 ไม่มีงาน design ใดๆ · ไฟล์นี้เตรียมไว้ให้ Part 2 ไม่ต้อง re-derive

---

## ทำไมต้อง addendum

bundle ปัจจุบันมีครบแล้ว: +1 pill (`lib-plus`), progress (ticks ≤24 / smooth >24), detail “+1 episode” + ⋯ More, per-media “Watch history” (5 entries)
**ยังไม่มี** → ต้อง design เพิ่ม: **Rewatch button + confirm dialog** ใน tracker block ของ detail page

> ⚠️ ก่อน fetch bundle ใด ๆ: “export ใหม่ = ลิงก์ใหม่เสมอ” → ขอ **handoff URL ล่าสุด** จากเจ้าของก่อน (อย่าใช้ `xch7...` / `5D8C...` เก่าโดยไม่ยืนยัน)

---

## สิ่งที่ขอให้ design

**Rewatch ใน tracker block (detail page)** — แสดงเมื่อ status ∈ `{completed, dropped, on_hold}`

- ปุ่ม **Rewatch** — icon `RotateCcw` (sanctioned set) + label
- **confirm dialog** — “Start over from episode 1?” + ปุ่ม confirm / cancel
- ครอบ 3 state: `completed` / `dropped` / `on_hold` (ดูว่า tracker block แต่ละ state ควรวาง Rewatch ตรงไหน เทียบกับ +1 / ⋯ More ที่มีอยู่)

**ใช้ DNA เดิม (มีใน DS):** Button + Modal/confirm + Icon system — ให้กลืนกับ detail surfaces ที่ออกแบบไว้แล้ว (+1, ⋯ More, Watch history)

---

## Behavior ref (ให้ design เข้าใจ flow — มาจาก DECISIONS §P4 1.4)

- Rewatch → confirm → reset เป็น ep 0 / status `watching` / `rewatch_count + 1` (ไม่แตะ history เดิม)
- `dropped`/`on_hold` มี 2 ทางในหน้าเดียว: **+1** (ดูต่อจากที่ค้าง) กับ **Rewatch** (เริ่มใหม่) → design ต้องไม่ทำให้สับสนว่าปุ่มไหนทำอะไร
- badge “Nth watch” = ยังไม่ทำรอบนี้ (เก็บ data ก่อน) → ไม่ต้อง design

---

## Output ที่ต้องการ

Claude Design handoff bundle ครอบ Rewatch states (completed/dropped/on_hold) + confirm dialog → ส่ง URL กลับให้เจ้าของ → Chat fetch + verify ก่อนร่าง **Part 2 UI prompt**
