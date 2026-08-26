# Animorize — Phase 5 · P1 · DS chore

> **Actor: Claude Code** · branch `feature/phase5-p1-ds-chore` แตกจาก `develop`
> **PR เข้า `develop` เท่านั้น** — ห้าม PR เข้า `main` ระหว่าง phase (มี CI guard `check-branch-target`)
> **Phase 5 ไม่มี migration** (§P5 1.12) — ถ้างานไหนโผล่ความจำเป็นต้องแตะ `schema/` ให้ **หยุดแล้วถาม** ห้ามแก้เอง

---

## 0 · อ่านก่อนเริ่ม

`PROGRESS.md` · `DECISIONS.md` (§P5 1.5, 1.6, 1.15) · `CLAUDE.md` · `BRAND.md` (§10.10 Modal, §10.11 Popover, §10.12 Toast)

**Precondition:** P0 (`feature/phase5-p0-docs`) merge เข้า `develop` แล้ว ✅ (owner ยืนยัน 2026-08-26) — แตก branch จาก `develop` ที่ update แล้วเท่านั้น

---

## 1 · ทำไมต้องทำก่อน

P1 เป็น **blocker ของทั้ง P2 และ P3** — ทั้งสองต้องใช้ `Popover` ที่ยังไม่มีในโปรเจกต์
`Modal` → native `<dialog>` และ shared `ToastPortal` เป็นหนี้เก่าจาก code review 2026-06-03 ที่ยังเปิดอยู่ — ทำตอนนี้ได้ของแถมคือ **a11y ของ P8 ล่วงหน้า** (focus trap / Esc / inert background ได้ฟรีจาก platform)

**งานนี้ไม่แตะ business logic ใด ๆ** — ไม่มี usecase ใหม่ ไม่มี action ใหม่ ไม่มี repository ใหม่

---

## 2 · Baseline — verify แล้ว อย่า verify ซ้ำ

| ข้อ                                               | ผล                                                                                     | ที่มา                                                |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `Popover` component                               | **ไม่มี** ใน `components/ui/`                                                          | verified 2026-08-25                                  |
| `Modal.tsx`                                       | ยัง custom div ไม่ใช่ native `<dialog>`                                                | verified 2026-08-25 · code review 2026-06-03 finding |
| toast portal                                      | **duplicate 3 จุด** — `FavoriteButton`, `EpisodeTracker`, `AddToLibraryModal`          | verified 2026-08-25                                  |
| `useToast`                                        | มีอยู่แล้วที่ `hooks/useToast.ts` — มี `description?` + `timersRef` cleanup on unmount | PROGRESS Phase 3                                     |
| `AddToLibraryModal`                               | มี Escape handler + `role="dialog"` + `aria-modal` เขียนมือไว้แล้ว                     | PROGRESS Phase 3 code review fixes                   |
| `⋯ More` ใน `EpisodeTracker`                      | render อยู่แล้วแต่ **`disabled` ถาวร** (Phase 4 placeholder)                           | CHANGELOG 2026-08-24                                 |
| `--z-popover: 60` `--z-modal: 80` `--z-toast: 90` | มีใน design tokens                                                                     | bundle `ds/tokens.css`                               |

### 2b · Baseline corrections จาก Claude Code (2026-08-26) — **ทับตาราง §2**

ตาราง §2 verify ไว้ **2026-08-25 ก่อน** bundle รอบใหม่และก่อน Code อ่าน source จริง — **ถ้าขัดกับ live source ให้ live source ชนะ** และรายงานความต่างใน PR description

| §2 เขียนว่า                                      | ของจริง                                                                                                     | ผลต่อ scope                                                                                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Modal.tsx` ยัง custom div                       | **เป็น native `<dialog>` อยู่แล้ว**                                                                         | §4 หดลงมาก — เหลือ verify + เก็บ gap ไม่ใช่ conversion                                                                                      |
| `AddToLibraryModal` เป็น call site ของ `<Modal>` | **ไม่ได้ consume `<Modal>` เลย**                                                                            | ต้องมี **migration step ชัด ๆ** ให้มาใช้ `<Modal>` ไม่ใช่แค่ลบ Esc handler                                                                  |
| `IconName` union                                 | **codebase ไม่มี union** — `Icon.tsx` รับ component ref (lucide-react) ไม่ใช่ string key แบบ `ds/icons.jsx` | §3.2 `icon?: IconName` ผิด → ใช้ type ที่ `Icon.tsx` รับจริง                                                                                |
| —                                                | **dark mode ยังไม่ wire**                                                                                   | §4.1 บรรทัด `[data-theme="dark"] .modal` เขียน CSS ไว้ได้ แต่ยังทดสอบด้วยตาไม่ได้จนกว่า P6 → §9 acceptance ตัด "ทดสอบ dark" ออกสำหรับ Modal |

> §4 (Modal) ต้อง **rescope ก่อนลงมือ** — อย่าทำตาม §4.1 ทั้งดุ้นเหมือนยังต้อง convert
> ถ้าอ่าน source แล้วเจอว่า §4 เหลืองานจริงน้อยกว่าที่เขียนไว้มาก → **รายงานว่าเหลืออะไรบ้าง แล้วรอ owner เคาะ** ก่อนขยายไปทำอย่างอื่นแทน

### 2c · CSS ข้างล่างมาจาก **bundle เก่า (ก่อน addendum)** — ใช้เป็น context เท่านั้น

**SoT คือ bundle รอบใหม่ที่ import แล้ว** ซึ่งเพิ่ม `.popover-item--disabled` / `.popover-item-reason` / `.popover-icon` และแก้ `PopoverMenu` — **อ่านจากไฟล์จริง อย่ายึด block ที่ copy ไว้ตรงนี้**

```css
.popover {
  background: bg-page;
  border: 0.5px solid border-default;
  border-radius: radius-card;
  padding: 6px;
  display: flex;
  flex-direction: column;
  min-width: 200px;
}
.popover-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  font-size: md;
  color: text-primary;
  border-radius: 6px;
  border: none;
  background: transparent;
  text-align: left;
  font-weight: regular;
}
.popover-item:hover {
  background: bg-surface;
}
.popover-item .kbd {
  margin-left: auto;
  font-size: 11px;
  color: text-tertiary;
}
.popover-divider {
  height: 0.5px;
  background: border-default;
  margin: 4px 0;
}
.popover-item--destructive {
  color: status-error;
}
```

`PopoverMenu` ให้มาแค่ **visual shell + โครง markup** (รวม disabled item และ icon slot ใน bundle ใหม่)
**พฤติกรรมทั้งหมดยังเป็นของใหม่ในงานนี้** — anchor / open state / positioning / keyboard / roving focus / `role="menu"` / `aria-*` ไม่มีใน bundle

---

## 3 · Task 1 — `components/ui/Popover.tsx` (ของใหม่)

### 3.1 Disabled item — **design addendum กลับมาแล้ว ใช้ของจริงเลย** (แก้ 2026-08-26 รอบสอง)

> ~~เดิม §3.1 สั่งให้ทำ provisional visual แล้วค่อย finalize ที่ P2~~ — **ยกเลิก** addendum กลับมาวันเดียวกันและ merge เข้า bundle แล้ว

**ห้ามสร้าง placeholder · ห้ามเขียน comment `// provisional visual` · ไม่มีงาน rework รอที่ P2**

ดึง spec จาก **bundle ที่ import แล้ว** เป็น SoT — `ds/styles.css` (`.popover-item--disabled`, `.popover-item-reason`) + `ds/components.jsx` (`PopoverMenu`) · อย่า transcribe ค่าจาก prompt นี้ อ่านจากไฟล์จริง

สิ่งที่ addendum ตอบไปแล้วในตัว **ไม่ต้องกลับไปถาม design:**

- disabled label + reason ใช้ `--text-secondary` ทั้งคู่ (ไม่ใช่ `text-tertiary` ตามที่ prompt รอบแรกเดา)
- `min-width: 200px` คงเดิมแม้ reason ทำให้เป็น 2 บรรทัด
- `align-items: flex-start` + padding บน/ล่างไม่เท่ากัน = **optical correction ตั้งใจ ห้าม normalize ให้สมมาตร**
- `font-size: 12.5px` เป็นค่า hardcode โดยเจตนา คร่อม `--font-size-xs`/`-sm` — **ห้ามแปลงเป็น token** (precedent: `.kbd` = 11px ใน component เดียวกัน)

**API ตาม §3.2 ยังใช้ตามเดิมทุกอย่าง** — ที่หายไปคือขั้นตอน placeholder เท่านั้น

### 3.2 API

```ts
type PopoverItem =
  | { kind: "divider" }
  | {
      kind: "item";
      label: string;
      onSelect: () => void;
      icon?: LucideIcon; // ⚠️ §2b: codebase ไม่มี IconName union — `Icon.tsx` รับ component ref
      //    ใช้ type ที่ `Icon.tsx` รับจริง ห้ามประดิษฐ์ union ใหม่ ห้ามเป็น string เปล่า
      checked?: boolean; // Filter/Sort selected → ใส่ check ใน icon slot (ชนะ icon)
      //    ⚠️ ไม่ใช่แค่ visual — เปลี่ยน role ด้วย ดู §3.6
      destructive?: boolean;
      disabled?: boolean;
      disabledReason?: string; // บังคับมีเมื่อ disabled = true (§P5 1.5)
      kbd?: string;
    };
```

- `disabled: true` **โดยไม่มี** `disabledReason` → ผิด §P5 1.5 · บังคับด้วย type ถ้าทำได้สวย (discriminated union) ถ้า type ซับซ้อนเกินไปให้ใช้ runtime `console.error` ใน dev แทน แล้วบันทึกเหตุผลไว้ใน PR description
- **ห้ามใช้ `any`** · ห้าม `label: string` ที่จริง ๆ ควรเป็น union

### 3.3 Trigger

ปุ่ม trigger ต่างกันไปตาม consumer (More = `Button ghost iconOnly` · Filter = `Button secondary iconLeft` · Sort = `Button secondary iconRight`) → **ใช้ render prop** ไม่ใช่ `cloneElement`:

```tsx
renderTrigger: (p: {
  ref: React.Ref<HTMLButtonElement>;
  onClick: () => void;
  onKeyDown: React.KeyboardEventHandler;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
}) => React.ReactNode;
```

> **ทางเลือกที่พิจารณาแล้วไม่เอา:** `asChild` / Radix Slot — อยู่ใน Backlog ต้องเพิ่ม dependency = ต้องบันทึก DECISIONS · `cloneElement` — implicit เกินไป, type-unsafe, React ไม่แนะนำแล้ว

### 3.4 Positioning

**ไม่เพิ่ม dependency** (ห้าม floating-ui / popper — ต้องบันทึก DECISIONS ก่อน)
ใช้ wrapper `position: relative` + panel `position: absolute; top: calc(100% + 4px)` · `align: "start" | "end"` (default `"end"` = ขอบขวาตรงกัน) · `z-index: var(--z-popover)`

**ข้อจำกัดที่ยอมรับ:** ไม่มี collision detection / flip — Phase 5 เป็น desktop-only (§P5 1.16) · เขียนเป็น comment ใน component + เพิ่มบรรทัดใน Backlog ของ `DECISIONS.md`

### 3.5 Icon slot — **มีใน bundle แล้ว mirror ตรง ๆ**

`PopoverMenu` เวอร์ชันใหม่ทำแล้ว: `.popover-icon { flex: 0 0 16px }` + render slot เสมอแม้ไม่มี icon
→ **ลอกโครงนี้ตรง ๆ อย่า re-derive** — Filter/Sort จะได้ประโยชน์อัตโนมัติเพราะ fix อยู่ใน shared component ไม่ใช่ demo file

_(บันทึกไว้เป็น context: ปัญหาเดิมคือ render icon แบบมีเงื่อนไข + `gap: 10px` → item ที่ไม่มี icon ขยับซ้าย 26px → เมนูขยับทุกครั้งที่เปลี่ยน selection)_

### 3.6 a11y baseline (บังคับ — P8 คือ audit ไม่ใช่ retrofit ของที่เพิ่งเขียน)

- trigger: `aria-haspopup="menu"` · `aria-expanded` · `aria-controls`
- panel: `role="menu"` · items `role="menuitem"`
- **เปิด:** click / `Enter` / `Space` / `ArrowDown` → focus item แรก (ถ้า item แรก disabled ก็ยัง focus ได้ — ดูข้อ disabled ด้านล่าง)
- **นำทาง:** `ArrowUp` / `ArrowDown` **แวะทุก item รวม disabled** · `Home` / `End`
- **ปิด:** `Esc` (คืน focus ให้ trigger) · click นอก panel · focus หลุดออกจาก panel
- **disabled item — แก้จาก prompt รอบแรก (ซึ่งเขียนขัดกันเอง)**
  - เดิมเขียนว่า "arrow-key ข้าม" คู่กับ "ยังอ่านได้ด้วย screen reader" → **เป็นไปไม่ได้พร้อมกัน** ใน `role="menu"` ที่ใช้ roving tabindex ถ้า item ไม่มี `tabindex` เลย focus mode จะไม่มีวันไปถึง = SR user ไม่รู้ด้วยซ้ำว่ามี item นี้อยู่ = §P5 1.5 (reason ต้องเข้าถึงได้) ไม่ถูก implement ครบ
  - **ที่ถูก:** คง markup + visual ของ design ทั้งหมด (`<div role="menuitem" aria-disabled="true">` ไม่ใช่ `<button>`) **เพิ่ม `tabindex="-1"` และให้ roving focus แวะ** → arrow key ลงมาหยุดได้ อ่าน label + reason ได้ แต่ `Enter`/`Space`/click ไม่ทำอะไร
  - `disabledReason` ผูกด้วย `aria-describedby`
  - **ต้องมี focus ring** เพราะ focus ลงได้จริง → ใช้ ring เดียวกับ enabled item (design ตอบว่า "ไม่ต้องมี" บนสมมติฐานว่าเข้าไม่ถึง — สมมติฐานนั้นถูกยกเลิกแล้ว) ไม่ต้องกลับไปถาม design
- **single-select menu (Filter / Sort) ต้องใช้ radio semantics** — bundle ใส่ `role="menuitem"` ให้ทุก item ซึ่งทำให้ check เป็น **visual ล้วน** SR ไม่รู้ว่าอันไหนถูกเลือกอยู่
  - item ที่มี `checked` ระบุมา (true หรือ false) → `role="menuitemradio"` + `aria-checked={checked}`
  - item ที่ไม่มี `checked` เลย (More menu) → `role="menuitem"` ตามเดิม
  - **แก้ที่ `Popover` ไม่ใช่ที่ consumer** — P3 จะได้ของถูกฟรีโดยไม่ต้องรู้เรื่องนี้
- divider: `role="separator"` (bundle ไม่ได้ใส่ — เพิ่มเอง)
- panel ต้องมี `aria-label` (bundle ไม่มี) — consumer ส่งมา เช่น `"More actions"`
- ห้าม trap focus (นี่คือ menu ไม่ใช่ modal)

### 3.7 Tests

unit test ครอบอย่างน้อย: เปิดด้วย keyboard → focus ลงที่ item แรก · **arrow แวะ disabled item ได้ และ item นั้นมี `aria-disabled="true"` + `aria-describedby` ชี้ไป reason** · `Enter`/`Space`/click บน disabled ไม่เรียก `onSelect` · `Esc` ปิดแล้ว focus กลับ trigger · destructive มี class ถูก · icon slot ถูก render แม้ item ไม่มี icon · **item ที่มี `checked` ได้ `role="menuitemradio"` + `aria-checked` ตรงค่า**

---

## 4 · Task 2 — `Modal` → native `<dialog>`

### 4.1 ต้องได้

- `showModal()` ตอนเปิด · `close()` ตอนปิด → ได้ focus trap + Esc + inert background จาก platform
- **sync กลับเข้า React state:** จับ `cancel` event (Esc) → `preventDefault()` แล้วเรียก `onClose` เอง เพื่อไม่ให้ DOM กับ state หลุดกัน
- **click backdrop ปิด:** native `<dialog>` ไม่ทำให้ — click บน backdrop จะ land บน element `<dialog>` เอง → เทียบ `e.target === dialogRef.current` (อย่าใช้ `stopPropagation` แบบ bundle ซึ่งเป็น div-based)
- `::backdrop` ใช้ `--bg-overlay` · ไม่มี blur (DNA)
- dark: `[data-theme="dark"] .modal { background: bg-surface; border-color: border-strong }` — bundle จงใจยกโทนขึ้นเพราะ backdrop ดำบนหน้าดำแยกไม่ออก · **เช็คว่า code ปัจจุบันมีข้อนี้แล้วหรือยัง ถ้ายังให้เพิ่ม**

### 4.2 ห้าม churn call sites

**คง prop API เดิมไว้ทั้งหมด** — งานนี้เป็น internal swap ไม่ใช่ redesign
ถ้าพบว่า API เดิมเข้ากับ `<dialog>` ไม่ได้จริง ๆ → **หยุดแล้วรายงาน** พร้อมทางเลือก อย่าเปลี่ยน signature เงียบ ๆ

### 4.3 ของที่กลายเป็นซ้ำซ้อน → ลบ

`AddToLibraryModal` มี Escape handler + `role="dialog"` + `aria-modal` เขียนมือ — native `<dialog>` ให้มาแล้วทั้งหมด → **ลบออก** (ถ้าไม่ลบจะได้ Esc ทำงานสองชั้น)

### 4.4 Call sites ที่ต้อง smoke test ด้วยมือ

`AddToLibraryModal` · rewatch/watch-again confirm ใน `EpisodeTracker` · admin confirmations
→ เช็ค: เปิด/ปิด, Esc, click backdrop, Tab วนอยู่ในกล่อง, focus กลับที่เดิมหลังปิด, dark mode

---

## 5 · Task 3 — shared `ToastPortal`

- สร้าง `components/ui/ToastPortal.tsx` — รับ `toasts` + `onDismiss` จาก `useToast` แล้ว `createPortal` ไป `document.body`
- **`useToast` คงเดิม** (state hook) — งานนี้ยุบเฉพาะส่วน render
- แทนที่ duplicate ทั้ง 3 จุด: `FavoriteButton` · `EpisodeTracker` · `AddToLibraryModal`
- SSR guard — portal หลัง mount เท่านั้น
- `z-index: var(--z-toast)` (90 — เหนือ modal 80 ถูกต้องแล้ว: toast ต้องเห็นทับ modal ได้)
- ปุ่มปิดมี `aria-label`

### 5.1 ⚠️ `Toast.tsx` hardcode `role="alert"` ทุก variant — ต้องแก้ที่ตัวมันเอง

`src/components/ui/Toast.tsx:49` ใส่ `role="alert"` ตายตัวให้ทุก variant (success/warning/info/error เหมือนกันหมด)

**ห้ามแก้ด้วยการเติม `role`/`aria-live` ที่ wrapper ของ `ToastPortal`** — live region ซ้อนกัน ตัวในชนะ → toast success ที่ควร polite จะประกาศแบบ assertive อยู่ดี และได้ ARIA ขัดแย้งกันเองในสองชั้น

**ทำแบบ A (เคาะแล้ว):**

- `Toast.tsx` เลือก role เอง — `error` → `role="alert"` · variant อื่น → `role="status"` · ไม่ต้องใส่ `aria-live` แยก (role ทั้งสองมี implicit live อยู่แล้ว)
- `ToastPortal` เป็น **container สำหรับจัดตำแหน่งอย่างเดียว ไม่มี ARIA ใด ๆ**
- `role="alert"` แบบ interrupt ควรสงวนไว้ให้ error จริง ๆ — ใช้กับ "Added to library" เป็น a11y anti-pattern ที่รู้จักกันดี

> **pointer สำหรับ P8:** ทางเลือก B คือ mount live region ถาวรสองอัน (`polite` + `assertive`) ใน `ToastPortal` แล้ว route toast เข้าอันที่ถูก ส่วน `Toast.tsx` ไม่มี ARIA เลย — ถูกตามตำรามากกว่าเพราะ region มีอยู่ก่อน content แต่เพิ่ม routing state · **ถ้า P8 ทดสอบกับ AT จริงแล้วเจอ toast ที่ไม่ถูกประกาศ ให้อัปเป็น B — แก้อยู่ใน `ToastPortal` จุดเดียว** เขียน comment กำกับไว้ในไฟล์ด้วย

- **ถ้า markup ของ 3 จุดไม่เหมือนกันจริง** → อย่ารวบให้เหมือนเงียบ ๆ · รายงานความต่างแล้วเสนอว่าจะยึดอันไหน

---

## 6 · Task 4 — doc sync (ขยายขอบเขต 2026-08-26 รอบสาม)

> P1 ship component ที่ BRAND ยังไม่ได้อธิบายเลย — **ถ้าไม่ sync ตอนนี้ BRAND จะ stale ทันทีที่ merge** และเราจะกลับไปเจอ drift แบบเดียวกับแถว `bg-surface` อีกรอบ

### 6.1 `BRAND.md` — ตาราง token บรรทัด ~146

`bg-surface` เขียน "Where it lives" ว่า **"Cards, modals, popovers, sidebar"** ซึ่งผิด

- **ผิดแค่แถวนี้แถวเดียว** — §10.3 Card (`bg-page` default / `bg-surface` variant) และ §10.10 Modal (`bg-page`) ถูกอยู่แล้ว **อย่าไปแก้**
- ของจริง: `bg-surface` = **hover ของ `.popover-item`** · Card `surface` variant · sidebar · inset surfaces
- **verify กับ code จริงก่อนแก้** — ถ้า code ปัจจุบันใช้ `bg-surface` อยู่ (ไม่ตรงทั้ง BRAND และ bundle) ให้ **หยุดแล้วรายงาน**

### 6.2 `BRAND.md` §10.10 Modal — เพิ่มแถว dark

ตอนนี้เป็น light-only แต่ P1 จะ ship `[data-theme="dark"] .modal { background: bg-surface; border-color: border-strong }`
เพิ่มแถวในตาราง พร้อมเหตุผลสั้น ๆ ว่าทำไมถึงยกโทน (backdrop เกือบดำบนหน้าเกือบดำ ถ้า modal เป็นสีหน้าเดียวกันจะแยกไม่ออก)
หมายเหตุกำกับด้วยว่า **ยังมองด้วยตาไม่ได้จนกว่า dark mode จะ wire** (§2b)

### 6.3 `BRAND.md` §10.11 Popover — **เพิ่ม disabled item + icon slot + focus ring**

ตอนนี้มี 6 bullet ไม่พูดถึง disabled เลย ต้องเพิ่ม (ค่าเอาจาก bundle ไม่ใช่จาก prompt นี้):

- **icon slot 16px คงที่เสมอ** — render แม้ item ไม่มี icon เพื่อให้ label ทุกบรรทัดตรงกัน
- **disabled item** — label + reason ใช้ `text-secondary` ทั้งคู่ · `align-items: flex-start` · padding บน/ล่างไม่เท่ากัน (optical, ตั้งใจ) · ไม่มี hover
- **reason text** — 12.5px `line-snug` `text-secondary` · เป็นค่า hardcode คร่อม `--font-size-xs`/`-sm` โดยเจตนา ไม่ใช่ token
- **focus ring บน disabled item** — ใช้ตัวเดียวกับ enabled item

### 6.4 `DECISIONS.md` — บันทึก deviation (ข้อสำคัญที่สุดของ Task 4)

เพิ่ม entry §P5 ใหม่ (ต่อจาก 1.16) — **เขียนเป็นหลักการ ไม่ใช่รายการเดี่ยว**

**หลักการ:** design bundle `PopoverMenu` เป็น **visual prototype ไม่ใช่ a11y reference** · `Popover` ในโค้ดจงใจมี semantics ที่ prototype ไม่มี · **การ import bundle รอบหน้าอัปเดตได้เฉพาะ visual ห้ามถอด ARIA ออก**

**deviation ที่ครอบ (ณ P1):**

| #   | โค้ดทำ                                                                        | bundle เป็นยังไง                                                                              |
| --- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1   | disabled item **focusable** (`tabindex="-1"`, roving แวะ) + **มี focus ring** | `<div>` ไม่มี `tabindex` · comment เขียนว่า _"arrow-key roving skips them, so no focus ring"_ |
| 2   | `checked` → `role="menuitemradio"` + `aria-checked`                           | `role="menuitem"` ทุก item — check เป็น visual ล้วน                                           |
| 3   | divider → `role="separator"`                                                  | ไม่มี role                                                                                    |
| 4   | panel มี `aria-label`                                                         | ไม่มี                                                                                         |

**เหตุผลของข้อ 1** (ข้ออื่นเป็น addition ตรงไปตรงมา): `role="menu"` ทำให้ NVDA/JAWS สลับเข้า focus mode อัตโนมัติ · ใน mode นั้น arrow ถูกส่งให้ app ไม่ใช่ browse cursor → `<div>` ที่ไม่มี `tabindex` ไม่ถูกแตะเลย → SR user ไม่รู้ว่ามี item อยู่ ไม่ต้องพูดถึง reason → **§P5 1.5 (reason ต้องเข้าถึงได้) ไม่ถูก implement ครบ** · ARIA APG แนะนำ focusable ด้วยเหตุผล discoverability

**บรรทัดที่ห้ามขาด — เขียนพูดกับ session อนาคตโดยตรง:**

> ห้าม revert ข้อใดข้อหนึ่งด้วยเหตุผลว่า "ไม่ตรง design bundle" · ถ้า bundle รอบใหม่ยังเป็นแบบเดิม **นั่นคือสิ่งที่คาดไว้แล้ว ไม่ใช่ regression**

entry นี้ครอบของที่ P2/P3 จะเพิ่มทีหลังด้วย — **ไม่ต้องเขียน entry ใหม่ทุกครั้งที่เติม ARIA** ให้ต่อท้ายตารางแทน

**bump `decisions_version` → `2026-08-27-v1`** — precedent ตรง: `PROGRESS.md:355` (Phase 4 bump ตอนเพิ่ม §P4) · `instructions_version` / `schema_version` **ไม่แตะ**

### 6.5 `CLAUDE.md` — 1 บรรทัด ที่จุดเสี่ยงจริง

DECISIONS คือที่ที่คนไปหา "ทำไมถึงเป็นแบบนี้" · **CLAUDE.md คือไฟล์ที่ถูกอ่านตอนกำลังจะพลาด** (ทำ UI งานใหม่พร้อม bundle สด) → ต้องมีทั้งคู่

เพิ่มใน section conventions (ที่เดียวกับ standing rule เรื่อง design handoff):

> Design bundle = **visual/token SoT เท่านั้น ไม่ใช่ a11y SoT** · การ import bundle ใหม่ห้ามถอด ARIA/keyboard behaviour ที่โค้ดมีอยู่ ดู `DECISIONS.md` §P5 (entry deviation)

**bump `claude_md_version` → `2026-08-27-v1`**

### 6.6 `PROGRESS.md`

**สถานะ:** `P0` → ✅ (ใส่ PR number) · `P1` → in progress · `P2` blocked เหลือแค่รอ P1 · `P3` → ready
**ลบ** บรรทัด "ปิด provisional disabled-item visual ที่ P1 ทิ้งไว้" ในแถว `P2` ถ้ามี — obsolete แล้ว P1 ทำ final เลย

**versions block (บรรทัด 9–15):**

- `decisions_version` → `2026-08-27-v1` (§6.4)
- `claude_md_version` → `2026-08-27-v1` (§6.5)
- **เพิ่ม field ใหม่ `brand_version: 2026-08-27-v1`** + bump header ของ `BRAND.md` เอง (`v1.0 · May 2026` → `v1.1 · Aug 2026`)
  → เหตุผล: BRAND ประกาศตัวเป็น token SoT แต่ **ไม่มี version field ในระบบเลย และไม่เคยถูกแก้ตั้งแต่เขียน** · P1 แก้ 3 จุด (§6.1–6.3) ถ้าไม่มีสัญญาณ project copy จะค้างเงียบ ๆ = drift แบบเดียวกับแถว `bg-surface` ที่เพิ่งแก้ไป แค่คนละไฟล์
  → _ถ้า owner ไม่เอา field ใหม่ ลบบรรทัดนี้ทิ้งได้ ส่วนอื่นไม่กระทบ_
- `instructions_version` / `schema_version` **ไม่แตะ**

**⚠️ ปิดท้าย PR description ด้วยรายการไฟล์ที่ owner ต้อง re-upload เข้า Claude Chat project:** `DECISIONS.md` · `CLAUDE.md` · `BRAND.md`

### 6.7 `CHANGELOG.md`

entry ใหม่ **บนสุด**

### 6.8 ไม่ต้องแตะ

**`BRAND.md` §10.12 Toast** — role/`aria-live` เป็นเรื่อง behavior ไม่ใช่ visual token · BRAND ไม่ได้เป็น a11y doc ปล่อยไว้ตามเดิม

---

## 7 · Code-verify checklist (Chat ยืนยันไม่ได้ ต้องเช็คเองก่อนเขียน)

1. **DS components เขียน style ยังไง** — `Tabs.tsx` / `Empty.tsx` / `Modal.tsx` ใช้ Tailwind utility, global CSS class, หรือผสม → **ทำตามแบบเดิม อย่าเปิดวิธีที่สอง** (`.popover*` จาก bundle เป็น plain CSS อาจต้องแปลง)
2. **`Modal.tsx` signature ปัจจุบัน** — รับ `open` prop หรือ consumer conditional render (มีผลกับ `showModal()`/`close()` lifecycle มาก)
3. **`grep -rn "<Modal" src/`** — call sites ครบไหม มีที่อื่นนอกจาก 3 จุดที่ระบุ
4. **`useToast` return shape จริง** + markup ของ 3 consumer ต่างกันไหม
   4b. **`Toast.tsx` มี variant อะไรบ้างจริง ๆ** — §5.1 สมมติว่ามี `success` / `warning` / `info` / `error` · ถ้าชุด variant ต่างจากนี้ ให้ map เอง: **error เท่านั้นที่ได้ `role="alert"`** ที่เหลือ `role="status"`
5. **`.popover*` / `.modal*` class มีใน global stylesheet ของโปรเจกต์แล้วหรือยัง** หรือมีแต่ token
6. ~~`IconName` union~~ — **ตอบแล้ว §2b: ไม่มี union, `Icon.tsx` รับ component ref** · เหลือแค่เช็คว่า `Edit` / `Trash2` / `Check` / `Filter` ของ lucide-react ถูก re-export ที่ไหน แล้ว consumer เรียกยังไง
7. **`--z-popover` / `--z-toast` มีใน token ของโปรเจกต์จริงไหม** (ยืนยันแล้วว่ามีใน bundle — ไม่รับประกันว่าถูก port มา)

เจอ mismatch → **surface ใน PR description อย่า resolve เงียบ ๆ**

---

## 8 · Scope guard

**แตะได้:** `src/components/ui/` (รวม `Toast.tsx` §5.1) · `src/components/media/` (เฉพาะจุดที่ใช้ toast/modal) · `src/app/` call sites · global stylesheet · `BRAND.md` · `DECISIONS.md` (เฉพาะ entry §P5 ใหม่ + version) · `CLAUDE.md` (เฉพาะ 1 บรรทัด §6.5 + version) · `PROGRESS.md` · `CHANGELOG.md` · tests

**ห้ามแตะ:** `schema/` · `src/types/database.ts` · `package.json` (ห้ามลง dependency ใหม่) · `domain/` · `repositories/` · `app/actions/` · design bundle files

**ห้ามทำในงานนี้:**

- ห้ามเปิดใช้ `⋯ More` (ยัง disabled ต่อไป) — **เป็นงาน P2**
- ห้ามต่อ Filter / Sort / Search — **เป็นงาน P3**
- ห้ามทำ Edit progress — **เป็นงาน P2 และยังรอ design addendum**
- ห้าม refactor `useToast` logic (ยุบเฉพาะ render)

ตรวจก่อนเปิด PR: `git diff --name-only develop...HEAD` ต้องไม่มีไฟล์นอกรายการข้างบน

---

## 9 · Acceptance

- [ ] `npm run lint` ✅ · `npm run typecheck` ✅ · `npm test` ✅ (baseline 150 + tests ใหม่ของ `Popover`)
- [ ] `Popover` ผ่าน keyboard flow ครบตาม §3.6 — ทดสอบด้วยมือด้วย ไม่ใช่แค่ unit test
- [ ] Modal call sites เปิด/ปิด/Esc/backdrop/focus-return ผ่าน (**light เท่านั้น** — dark ยังไม่ wire ตาม §2b, ทดสอบไม่ได้จนถึง P6)
- [ ] `AddToLibraryModal` migrate มาใช้ `<Modal>` แล้ว (§2b — เดิมไม่ได้ consume)
- [ ] ไม่มี toast portal ซ้ำเหลือใน `src/` (`grep -rn "createPortal" src/` เหลือจุดเดียว)
- [ ] ไม่มี dependency ใหม่ใน `package.json`
- [ ] ไม่มี `any` · ไม่มี inline static style · ไม่มี `console.log`
- [ ] `Toast.tsx` role แปรตาม variant แล้ว · `ToastPortal` ไม่มี ARIA · ไม่มี live region ซ้อนกัน (§5.1)
- [ ] Doc อัปเดตครบ §6.1–6.7 (`BRAND` 3 จุด + header version · `DECISIONS` entry + bump · `CLAUDE.md` 1 บรรทัด + bump · `PROGRESS` สถานะ + versions block · `CHANGELOG`)
- [ ] PR description มีรายการไฟล์ที่ owner ต้อง re-upload เข้า Claude Chat project
- [ ] `/sync-progress` ก่อนปิด PR

---

## 10 · หลังจากนี้

P1 merge → **P3 (Filter/Sort/Search) เริ่มได้ทันที** design พร้อมใน bundle แล้ว
P2 ยังรอ design addendum ที่สั่งไปคู่กัน — ถ้า addendum กลับมาก่อน P1 เสร็จ ให้ทำ P1 ให้จบก่อนอยู่ดี (P2 ต้องใช้ `Popover` ที่ยังไม่มี)
