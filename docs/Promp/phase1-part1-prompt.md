# Phase 1 — Part 1: Supabase Clients + Auth + Middleware

อ่าน CLAUDE.md, DECISIONS.md, schema.sql ก่อนเริ่ม

## ก่อนเริ่ม — minor fixes จาก design review

แก้ 2 จุดเล็กก่อน:
1. `src/components/ui/Toast.tsx` — description ใช้ `text-sm` ซึ่ง map เป็น 13px/500 แต่ spec เป็น 13px/400 → เพิ่ม `font-normal` ที่ description `<p>`
2. `src/styles/tokens.css` — ลบ `--weight-semi: 600` ออก (brand ใช้แค่ 400/500)

## งานหลัก

### 1. Supabase Client Setup

สร้าง 3 ไฟล์ตาม project structure:

**`src/lib/supabase/client.ts`**
- `createBrowserClient()` จาก `@supabase/ssr`
- ใช้ `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ห้าม export singleton — return new client ทุกครั้ง

**`src/lib/supabase/server.ts`**
- `createServerClient()` จาก `@supabase/ssr`
- ใช้ `cookies()` จาก `next/headers`
- สำหรับ Server Components + Server Actions

**`src/lib/supabase/middleware.ts`**
- `updateSession()` function สำหรับ refresh token
- เรียกจาก `src/middleware.ts`

### 2. Next.js Middleware

**`src/middleware.ts`**
- เรียก `updateSession()` จาก `lib/supabase/middleware.ts`
- config matcher: ครอบคลุมทุก route ยกเว้น `_next/static`, `_next/image`, `favicon.ico`, public assets

### 3. Environment Variables

สร้าง `.env.local.example` พร้อม placeholder:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Auth Route Group

**`src/app/(auth)/login/page.tsx`**
- Server Component wrapper
- Client component สำหรับ login form (email + password)
- Zod schema validate email + password
- Server Action: `loginAction.ts` ใช้ Supabase Auth `signInWithPassword`
- Link ไปหน้า register
- Error handling: แสดง error message จาก Supabase

**`src/app/(auth)/register/page.tsx`**
- เหมือน login แต่ใช้ `signUp`
- Zod schema: email + password + confirm password
- Server Action: `registerAction.ts`

**`src/app/(auth)/layout.tsx`**
- centered layout สำหรับ auth pages
- ถ้า user logged in แล้ว → redirect ไป `/dashboard`

**`src/app/(auth)/auth/callback/route.ts`**
- Route handler สำหรับ OAuth callback
- Exchange code for session
- Redirect ไป `/dashboard`

### 5. Protected Routes

**`src/app/(main)/layout.tsx`**
- เช็ค session ใน Server Component
- ถ้าไม่มี session → redirect ไป `/login`

**`src/app/(main)/dashboard/page.tsx`**
- placeholder page แสดง "Welcome, {email}" + logout button
- Server Action: `logoutAction.ts` ใช้ `signOut`

**`src/app/admin/layout.tsx`**
- เช็ค session + เช็ค role จาก profiles table (จะ refactor ไป repository pattern ภายหลัง)
- ถ้า role ≠ 'admin' → redirect ไป `/dashboard`

### 6. loading.tsx + error.tsx

สร้างให้ทุก route group:
- `src/app/(auth)/loading.tsx`
- `src/app/(auth)/error.tsx`
- `src/app/(main)/loading.tsx`
- `src/app/(main)/error.tsx`
- `src/app/admin/loading.tsx`
- `src/app/admin/error.tsx`

ใช้ Skeleton component ที่มีอยู่แล้วสำหรับ loading, error.tsx ใช้ Card + Button retry

### 7. ลบ Boilerplate

- ลบ `src/app/page.tsx` (Next.js default landing) → แทนด้วย redirect ไป `/login` หรือ `/dashboard` ตาม session
- ลบ `public/next.svg`, `public/vercel.svg`
- อัปเดท `README.md` ให้เป็น Animorize

---

**หลังเสร็จ:** run `npm run typecheck` + `npm run lint` ให้ผ่าน แล้วอัปเดท PROGRESS.md

**ห้ามลืม:**
- ห้าม business logic ใน component/action (ไว้ domain layer ภายหลัง)
- ห้าม `any` type
- Server Components เป็น default
- `'use client'` เฉพาะ form components ที่ต้อง interactivity
