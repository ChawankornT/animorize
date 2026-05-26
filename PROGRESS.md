# ANIMORIZE — PROGRESS.md
> ไฟล์นี้เป็น single source of truth ระหว่าง Chat และ Code
> อัปเดทโดย Claude Code ท้ายทุก session (skill: /sync-progress)
> อัปโหลดไฟล์นี้ใน Chat ทุกครั้งที่เริ่ม conversation ใหม่

---

## Versions (สำหรับ sync check)
```
instructions_version: 2026-05-24-v1
decisions_version: 2026-05-27-v1
schema_version: 2026-05-26-v1
claude_md_version: 2026-05-24-v1
```

## Current Phase
- **Active:** Phase 2 — Admin Panel + Import
- **Status:** Phase 1 complete และ tested แล้ว — พร้อมเริ่ม Phase 2

## Phase 1 Progress
- [x] Supabase project setup (dev) — สร้างแล้ว + apply schema + .env.local พร้อม
- [x] Schema (profiles + auth) — applied ใน Supabase SQL Editor แล้ว
- [x] pg_cron keep-alive — schedule 'keep-alive' ทุก 3 วัน applied แล้วใน Supabase
- [x] Supabase Auth: Email/Password — actions + login/signup pages done (Google OAuth ทีหลัง)
- [x] Auto-create profile trigger — ใน schema.sql
- [x] Header (logged out / logged in) — Wordmark + nav + avatar/logout
- [x] Footer — wordmark + © 2026
- [x] Next.js proxy — session refresh via @supabase/ssr (renamed middleware→proxy per Next.js 16)
- [x] Protected routes — (main)/layout.tsx + admin/layout.tsx
- [ ] GitHub repo + branch protection
- [x] GitHub Actions CI — .github/workflows/ci.yml (trigger: PR to main/develop)
- [x] Husky + lint-staged — pre-commit: eslint --fix + tsc-files --noEmit

## Design System Progress (pre-Phase 1)
- [x] CSS design tokens (tokens.css)
- [x] Tailwind v4 theme mapping (globals.css @theme inline)
- [x] Base UI components (Button, Input, Textarea, Select, Card, Badge, Modal, Toast, Skeleton)
- [x] buttonVariants() helper — styled Link ใช้ได้โดยไม่ duplicate styles
- [x] Brand components: Sparkle.tsx, Wordmark.tsx
- [x] Layout components: Header.tsx, Footer.tsx
- [x] Layout updated to Inter font + brand metadata
- [x] cn() utility (lib/utils/cn.ts)
- [x] Dev preview page (/dev/components)

## Pending Decisions
(ไม่มี)

## Recent Changes (last 5)
| วันที่ | เปลี่ยนอะไร | เปลี่ยนในไฟล์ไหน |
|--------|------------|----------------|
| 2026-05-27 | Phase 1 tested: Supabase setup + signup/login/dashboard ทำงาน | — (no code change) |
| 2026-05-27 | Header, Footer, Sparkle, Wordmark, Husky, CI, buttonVariants | components/brand/*, components/layout/*, .husky/*, .github/workflows/*, Button.tsx, package.json |
| 2026-05-27 | Protected routes, loading/error states, page.tsx redirect, boilerplate cleanup | (auth|main|admin)/layout.tsx, loading.tsx, error.tsx, page.tsx, README.md |
| 2026-05-27 | Rename middleware→proxy per Next.js 16 | src/proxy.ts, lib/supabase/proxy.ts |
| 2026-05-26 | Phase 1 Part 1: Supabase clients, auth pages, schema.sql | lib/supabase/*, (auth)/*, schema.sql, types/database.ts |

## Blockers
[ยังไม่มี]

## Notes for Chat
- Phase 1 complete และ tested — signup/login/logout/dashboard/protected routes ทำงานได้จริงแล้ว
- Supabase email validation: ต้องใช้ email domain ที่มี MX record จริงเท่านั้น (หรือ disable ใน dashboard)
- Google OAuth ยังไม่ทำ — Phase 1 ใช้ Email/Password เท่านั้น
- GitHub repo + branch protection ยังไม่ได้ทำ (ไม่ใช่ code task)
- CI trigger: PR to main/develop — ปัจจุบัน repo ยัง push ไปที่ master
- Phase 2 ต่อไป: Admin Panel + AniList Import (Provider CRUD → Franchise CRUD → Media CRUD → AniList import)
