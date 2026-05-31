# Phase 1 — Part 2: Header + Footer + Husky + CI

ทำหลัง Part 1 เสร็จ (Supabase + Auth ต้องทำงานก่อน)

## งานหลัก

### 1. Header Component

**`src/components/layout/Header.tsx`** — Server Component

ตาม BRAND.md §10.9:
- สร้าง sparkle SVG component หรือ inline SVG สำหรับ wordmark ก่อนใช้ใน Header
- Height: 56px, bg-page, border-bottom 0.5px border-default, padding-x 24px
- Logo ซ้าย: animorize wordmark (ใช้ dotless ı + sparkle SVG ตาม §2.4)
- Links กลาง: Dashboard, Search (ถ้า logged in)
- Controls ขวา:
  - Logged out: Login button (ghost), Register button (primary)
  - Logged in: avatar/initials + logout

ใช้ Supabase server client เช็ค session เพื่อ render conditional

### 2. Footer Component

**`src/components/layout/Footer.tsx`** — Server Component

- Simple footer: "animorize" wordmark + © 2026
- border-top 0.5px border-default
- text-xs text-tertiary, centered
- padding: 24px

### 3. Apply Header + Footer

- เพิ่มใน `src/app/(main)/layout.tsx`
- เพิ่มใน `src/app/admin/layout.tsx`
- auth layout ไม่ใส่ Header/Footer (clean auth pages)

### 4. Root Page

**`src/app/page.tsx`** — แทน boilerplate
- Server Component เช็ค session
- มี session → redirect `/dashboard`
- ไม่มี session → redirect `/login`

### 5. Husky + lint-staged

```bash
npx husky init
```

**`.husky/pre-commit`:**
```bash
npx lint-staged
```

**`package.json` เพิ่ม:**
```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "tsc-files --noEmit"]
}
```

Install `tsc-files`:
```bash
npm install -D tsc-files
```

(บันทึกใน DECISIONS.md package change log)

### 6. GitHub Actions CI

**`.github/workflows/ci.yml`:**
- Trigger: PR to `develop` and `main`
- Steps: checkout → setup node 20 → npm ci → lint → typecheck → test
- ใช้ `npm run lint`, `npm run typecheck`, `npm test`

### 7. อัปเดท PROGRESS.md

Mark completed items:
- [x] Header (logged out / logged in)
- [x] Footer
- [x] Protected routes + Next.js middleware
- [x] Husky + lint-staged setup
- [x] GitHub Actions CI

(Supabase project setup + schema + RLS + pg_cron + Google OAuth ทำฝั่ง Supabase Dashboard เอง ไม่ใช่ code task)

---

**หลังเสร็จ:** run `npm run typecheck` + `npm run lint` + `npm test` ให้ผ่าน
