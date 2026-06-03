# Design prompt — Add to library modal (Claude Design)

> Phase 3 ส่วนที่ยังขาดใน handoff bundle

---

## Context

ใน `animorize-screens.html` มี Dashboard / Media detail / Search / Admin ครบแล้ว และ DS (`ds/app.jsx`) มี Provider `Select` + Custom URL `Field` (พร้อม validation) + audio sub/dub `Badge` + ปุ่ม "Add to library" อยู่แล้ว — **แต่ "flow ตอนกด Add to library" ยังไม่ถูกประกอบเป็น modal จริง** ออกแบบเฉพาะส่วนนี้

**อย่าแก้ DS หรือ screens 1–4 เดิม** — เอา DNA มาใช้: flat, hairline 0.5px, radius ตาม token, sparkle accent เฉพาะ favorite/brand, ห้าม shadow/gradient (ยกเว้น poster overlay)

---

## สิ่งที่ต้องออกแบบ

**Add to library modal** — เปิดเมื่อ user กด "Add to library" จาก search result หรือ media detail (เรื่องที่ยังไม่อยู่ใน library)

เนื้อหา modal:
- **header** — poster swatch เล็ก + ชื่อเรื่อง (EN > Romaji > TH) + meta (`type · year`)
- **Provider** — เลือกจาก provider ที่เรื่องนี้มี (`media_providers`); ถ้าเยอะใช้ `SearchableSelect`
- **Audio** — segmented/toggle: `sub` (japanese · sub) / `sub` (english · sub) / `dub` (thai · dub) ตามที่ provider รองรับ
- **Custom URL** (optional) — `TextInput` + hint "ปล่อยว่างได้ เราจะใช้ลิงก์ของ provider"; รองรับ error state
- **CTA** — primary "Add to library" + secondary "Cancel"

---

## Artboards (light + dark)

1. **default** — provider เลือกแล้ว, audio = sub
2. **custom URL invalid** — error "That doesn't look like a valid URL."
3. **submitting** — ปุ่ม loading state
4. **dup error** — toast "Couldn't add to library — already in your library"

---

## Components ที่ใช้ (จาก DS)

- `Modal` — radius 16px, backdrop `bg-overlay` (no blur), width `min(420px, calc(100% - 32px))`, §10.10
- `Field` (label 13/500), `Select`/`SearchableSelect`, `TextInput` (custom URL), `Button` (primary = ink, **ห้าม pink**), `Badge` (audio)

Voice: sentence case, **ไม่มี `!` ไม่มี emoji**

---

## Output

วางเป็น section ใหม่ **"5 · Add to library"** ใน screens canvas เพื่อให้ Claude Code เอาไป implement ตรง spec
