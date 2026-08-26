# Animorize — Phase 5 · Design addendum: `⋯ More` menu + Edit progress inline mode

> **Actor: Claude Design.** Phase 5 (P2) — blocker ของ implementation
> **Spec SoT:** `DECISIONS.md` §P5 1.1–1.7, 1.15 — ห้ามเดา business rule เอง ทุกข้อในนี้ derive มาจาก §P5 แล้ว
> **Bundle verified 2026-08-26** — สิ่งที่มีอยู่แล้วอย่าออกแบบซ้ำ

---

## บริบท

Phase 4 วาง `[⋯ More]` เป็น **placeholder ที่ disabled ถาวร** ไว้ใน `.tracker-actions` ทุก state — Phase 5 เปิดใช้งานจริง ปุ่ม `⋯` จะ **enabled เสมอ** (§P5 1.5) และเมนูข้างในมี 2 รายการ

`Edit progress` คือ **correction tool** — แก้ตัวเลขที่จำผิด ไม่ใช่ state change (เช่น จำได้ว่าดูถึง ep 12 แต่ pointer ค้างที่ 5 เพราะลืมกด `+1`) เป็น absolute set ไม่ใช่ increment

---

## สถานะ bundle ปัจจุบัน (verify แล้ว 2026-08-26)

**มีแล้ว ✅ — reuse ห้ามสร้างใหม่**

- `.popover` / `.popover-item` / `.popover-divider` / `.popover-item--destructive` / `.kbd` — `ds/styles.css:459-495`
- `PopoverMenu` — `ds/components.jsx:262-280` (รับ `items[]`: `label` / `icon` / `kbd` / `destructive` / `divider`)
- `FilterPopoverDemo` + `SortPopoverDemo` — `screens/library-screens.jsx:270-313` (open state)
- `Tracker` state-aware ครบ 5 layout — `screens/screens.jsx:79-155`
- icon `edit` + `trash` + `alert-circle` + `check` — `ds/icons.jsx` **มีครบ ไม่ต้องเพิ่ม path**
- `Input` / `Button` (primary / secondary / ghost, size sm/md) / `StatusPill` / `.lib-bar` / `.atl-spin`
- `--z-popover: 60` (< `--z-modal: 80`)

**ยังไม่มี ❌ — คือของที่ขอในรอบนี้**

- เนื้อในของ `⋯ More` menu
- **popover disabled item state** (DS มีแค่ default / hover / `--destructive`)
- Edit progress inline mode ทุก state
- popover placement/anchor spec (ตอนนี้ demo วางลอยใต้ปุ่มเฉย ๆ)

---

## A · `⋯ More` popover — เนื้อใน + disabled state

### A1 · รายการในเมนู (§P5 1.15 — ล็อกแล้ว ห้ามเพิ่ม/ลด)

```
[edit]  Edit progress
────────────────────────
[trash] Remove from library      ← .popover-item--destructive
```

- ไม่มี `Rewatch` ในเมนู (§P5 1.15 — `startRewatch` SQL guard ไม่รองรับ `watching` และ Phase 5 ห้ามแตะ SQL)
- ไม่มี `Change provider` (ยังไม่ scope)
- ไม่มี `kbd` slot ใน 2 รายการนี้ (แต่ component รองรับไว้แล้ว)

### A2 · Disabled item + reason text — **ของหลักที่ขอ**

`Edit progress` disable ได้ **2 เคส** ปุ่ม `⋯` เองไม่เคย disable:

| เงื่อนไข                                            | reason text (proposal — Design เคาะ wording สุดท้ายได้) |
| --------------------------------------------------- | ------------------------------------------------------- |
| `total_episodes = 0` (AniList ไม่ส่ง episode count) | `Episode count not set`                                 |
| `total_episodes = 1` (movie / special)              | `Use mark as watched`                                   |

`Remove from library` **ไม่มีเคส disabled** — enabled เสมอ

**สิ่งที่ต้องออกแบบ:**

- **reason text** ต้องเห็นได้จริง ไม่ใช่แค่ทำ label เทา (§P5 1.5: "disabled item ต้องมี reason text ไม่ใช่เทาเฉย ๆ") — เสนอ: 12–13px `text-tertiary` บรรทัดที่สองใต้ label ภายใน `.popover-item` เดียวกัน (ไม่ใช่ tooltip — tooltip เข้าไม่ถึงด้วย keyboard และเรายังไม่มี tooltip ใน DS)
- **label color** ตอน disabled — ต้องต่างจาก default ชัดพอ แต่ยังอ่านออก (contrast ต้องผ่าน AA สำหรับ non-interactive text)
- **icon** ตอน disabled — เทาตาม label หรือคงเดิม
- **hover** ต้องไม่ติด (`bg-surface` ไม่ขึ้น) และ cursor ไม่ใช่ `pointer`
- item สูงขึ้นเพราะมี 2 บรรทัด → เช็คว่า `min-width: 200px` ยังพอไหม หรือควรขยายเมื่อมี reason
- **focus ring** ตอน keyboard tab มาถึง item ที่ disabled — เราจะให้ screen reader อ่านได้ (`aria-disabled`) แต่ arrow-key จะข้าม · Design ตัดสินว่าต้องมี focus indicator หรือไม่

### A3 · Placement / anchor

`⋯` อยู่ **ท้ายแถวขวาสุด** ของ `.tracker-actions` ในการ์ด `.tracker` (คอลัมน์ขวาของ detail page) — ต้องระบุ:

- align **ขวา** (ขอบขวาของ popover ตรงกับขอบขวาของปุ่ม `⋯`) หรือซ้าย
- offset แนวตั้งจากปุ่ม (เสนอ 4px)
- ไม่มี shadow (DNA) → **ต้องอาศัย hairline + `bg-page` แยกตัวจากพื้นหลัง** เช็คทั้ง light + dark ว่าอ่านออกจริงตอนซ้อนทับการ์ด
- ไม่ต้องออกแบบ collision/flip — Phase 5 desktop-only

### A4 · Artboards ที่ขอ

1. More popover — **open, ทั้ง 2 item enabled** (light + dark)
2. More popover — **`Edit progress` disabled + reason** (light + dark) — ใช้เคส `total_episodes = 0` เป็นตัวแทน
3. More popover — **in context** ซ้อนบน `.tracker` card จริง เพื่อดู z-order + การแยกตัวจากพื้นหลัง

---

## B · Edit progress — inline mode

### B1 · กฎการแทนที่ (owner-confirmed 2026-08-26)

Edit mode **แทนที่ `.tracker-actions` ทั้งบล็อก** ไม่ใช่แทนปุ่มใดปุ่มหนึ่ง — ระหว่างแก้ไขไม่ต้องมี action อื่นให้กด

`Tracker` มี 5 layout แต่ **movie / special ถูกตัดออกแล้ว** (§A2 — `total = 1` → item disabled) เหลือ 3 layout ที่ต้องรองรับ:

| state                                           | `.tracker-actions` ปกติ                             | ตอน edit mode                              |
| ----------------------------------------------- | --------------------------------------------------- | ------------------------------------------ |
| watching / plan_to_watch (`ep < total`)         | `[+1 episode] [⋯]`                                  | → edit block                               |
| **interrupted** (dropped/on_hold, `ep < total`) | `[[+1 episode] [⋯]]` + `[Rewatch 100%]` — **2 แถว** | → edit block · **แถว `Rewatch` หายไปด้วย** |
| completed (`ep = total`)                        | `[Rewatch] [⋯]`                                     | → edit block                               |

**สิ่งที่ยังอยู่ระหว่าง edit mode (ไม่ถูกแทนที่):** `.tracker-row` (`StatusPill` + "ep X of Y") · `.lib-bar` progress · `TrackerFav`

> ⚠️ **คำถามที่ขอให้ Design เคาะด้วยภาพ:** "ep **X** of Y" ที่แถวบนควรคง **ค่าเดิม** ไว้ระหว่างแก้ (= ค่า "from" ที่ทำให้เห็นว่ากำลังแก้จากอะไรไปอะไร) หรือรกเกินจนควรซ่อน · progress bar ก็เช่นกัน — เสนอ: **คงไว้ทั้งคู่ ไม่ preview ค่าใหม่** (ยังไม่ save = ยังไม่จริง) แต่ถ้าดูแล้วซ้ำซ้อนกับ input ให้เสนอทางที่ดีกว่ามา

### B2 · เนื้อใน edit block

```
[ number input ]  / {total}          [Cancel]  [Save]
└── inline warning / error 13px อยู่ใต้ input
```

- **number input** — กว้างพอ 3 หลัก · ค่าเริ่มต้น = `current_episode` ปัจจุบัน · select-all ตอน focus (behavior — Design ไม่ต้องวาด แต่ระบุไว้ให้ครบ)
- **`/ {total}`** — static text `text-secondary` ไม่ใช่ input
- **Save** — `Button` primary **size sm**
- **Cancel** — `Button` ghost **size sm**
- layout แถวเดียวหรือ 2 แถวให้ Design เคาะตามความกว้างจริงของการ์ด

### B3 · 5 states ที่ต้องวาด

| state       | เงื่อนไข                                     | หน้าตา                                                                 |
| ----------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| **default** | เพิ่งเข้า edit mode                          | input มีค่าเดิม · ไม่มีข้อความใต้ input                                |
| **focused** | cursor อยู่ใน input                          | focus ring ตาม DS                                                      |
| **warning** | ค่าใหม่จะทำให้ **completed → ไม่ completed** | 13px `status-warning` ใต้ input · **Save ยังกดได้**                    |
| **error**   | ค่านอกช่วง `0..total` หรือไม่ใช่จำนวนเต็ม    | 13px `status-error` ใต้ input · **Save disabled**                      |
| **saving**  | กด Save แล้ว                                 | input + ปุ่มทั้งคู่ disabled · Save แสดง `.atl-spin` + label `Saving…` |

**warning ขึ้นเมื่อไหร่ (§P5 1.4 — path เดียวที่ `completed_at` หายถาวร):**
สถานะปัจจุบันเป็น `completed` **และ** ค่าใหม่จะทำให้หลุดจาก `completed` — ครอบทั้ง `n = 0`, `0 < n < total`, และ `n ≥ total` ของเรื่องที่ยัง `ongoing`
ถ้ายังอยู่ `completed` เหมือนเดิม → **ไม่ต้องเตือน** (`completed_at` ถูกกันด้วย `COALESCE` แล้ว §P5 1.3)

**copy proposal** (Design ปรับได้ ขอให้คง sentence case ไม่มี `!` ไม่มี emoji):

- warning: `Your completion date will be cleared.`
- error: `Enter a number between 0 and {total}.`

**ไม่มี confirm modal** — input + Save คือ confirmation ในตัวแล้ว (§P5 1.4) อย่าเสนอ dialog เพิ่ม

### B4 · Artboards ที่ขอ

1. edit block — **default** (light + dark)
2. edit block — **warning**
3. edit block — **error**
4. edit block — **saving**
5. **in context ×2** — `.tracker` card เต็มใบตอน edit mode ของ state `watching` และ state `interrupted` (เพื่อยืนยันว่าแถว `Rewatch` หายแล้วการ์ดไม่กระตุก/ยุบแปลก ๆ)

---

## C · DS fix (authorized) — `.popover-item` icon slot

> ปกติ prompt จะเขียนว่า "ห้ามแก้ DS" — ข้อนี้ **อนุญาตเฉพาะเจาะจง** เพราะเป็น bug ที่จะย้อนกลับมาถ้าปล่อยไว้

`PopoverMenu` render icon แบบมีเงื่อนไข (`{it.icon && <Icon/>}`) + `.popover-item { gap: 10px }` → item ที่ไม่มี icon จะขยับซ้าย **26px** เทียบกับ item ที่มี

เห็นได้ชัดที่ `FilterPopoverDemo` / `SortPopoverDemo` ซึ่งใส่ `icon: "check"` **เฉพาะตัวที่ selected** → **เมนูจะขยับทุกครั้งที่เปลี่ยน selection**

**ขอให้แก้:** icon slot กว้างคงที่ 16px เสมอ (ว่างเมื่อไม่มี icon) → label ทุกบรรทัดตรงกัน ทั้งเมนูที่มี check และเมนูที่ไม่มี
อัปเดต `FilterPopoverDemo` / `SortPopoverDemo` ให้เห็นผลด้วย

---

## Constraints

- **DNA เดิมทั้งหมด** — flat, hairline 0.5px, radius ตาม token, **ห้าม shadow / gradient**, sparkle `#D4537E` เฉพาะ favorite/brand, primary button = ink **ห้าม pink**
- voice: **sentence case · ไม่มี `!` · ไม่มี emoji**
- ทุก artboard ต้องมีคู่ **light + dark** (dark token ครบใน `ds/tokens.css` แล้ว)
- **ห้ามแตะ** artboard เดิมของ screens 1–4, modal, library full view, admin — เฉพาะเพิ่มของใหม่ + ข้อ C
- ห้ามเพิ่ม icon path ใหม่ (ที่ต้องใช้มีครบแล้ว)
- ไม่ต้องทำ responsive / `@media` — Phase 5 desktop-only, mobile ยกไป Phase 6+ (§P5 1.16)

## Output

วางเป็น section ใหม่ **"5 · Phase 5 — More menu + Edit progress"** ใน screens canvas ต่อจากของเดิม
พร้อม export bundle ใหม่ (ลิงก์ใหม่ทุกครั้ง — ฝั่ง Chat จะไม่ cache ลิงก์เก่า)
