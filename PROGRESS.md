# ANIMORIZE — PROGRESS.md
> ไฟล์นี้เป็น single source of truth ระหว่าง Chat และ Code
> อัปเดทโดย Claude Code ท้ายทุก session (skill: /sync-progress)
> อัปโหลดไฟล์นี้ใน Chat ทุกครั้งที่เริ่ม conversation ใหม่

---

## Versions (สำหรับ sync check)
```
instructions_version: 2026-05-24-v1
decisions_version: 2026-05-24-v1
schema_version: 2026-05-26-v1
claude_md_version: 2026-05-24-v1
```

## Current Phase
- **Active:** Phase 1 — Foundation & Auth
- **Status:** In progress

## Phase 1 Progress
- [~] Supabase project setup (dev + prod) — code ready, user ยังไม่ได้สร้าง project
- [x] Schema (profiles + auth) — schema.sql ready, รอ apply ใน Supabase SQL Editor
- [~] pg_cron keep-alive — SQL comment ใน schema.sql, รอ enable extension
- [x] Supabase Auth: Email/Password — actions + login/signup pages done (Google OAuth ทีหลัง)
- [x] Auto-create profile trigger — ใน schema.sql
- [ ] Header (logged out / logged in)
- [ ] Footer
- [x] Next.js middleware — session refresh via @supabase/ssr
- [ ] Protected routes
- [ ] GitHub repo + branch protection
- [ ] GitHub Actions CI (lint + typecheck + test)
- [ ] Husky + lint-staged setup

## Design System Progress (pre-Phase 1)
- [x] CSS design tokens (tokens.css)
- [x] Tailwind v4 theme mapping (globals.css @theme inline)
- [x] Base UI components (Button, Input, Textarea, Select, Card, Badge, Modal, Toast, Skeleton) — design review fixes applied
- [x] Layout updated to Inter font + brand metadata
- [x] cn() utility (lib/utils/cn.ts)
- [x] Dev preview page (/dev/components)

## Pending Decisions
(ไม่มี)

## Recent Changes (last 5)
| วันที่ | เปลี่ยนอะไร | เปลี่ยนในไฟล์ไหน |
|--------|------------|----------------|
| 2026-05-26 | Phase 1 Part 1: Supabase clients, middleware, auth pages, schema.sql | lib/supabase/*, middleware.ts, (auth)/*, schema.sql, types/database.ts |
| 2026-05-26 | Design review fixes + minor fix (remove --weight-semi) | Button.tsx, Toast.tsx, Modal.tsx, globals.css, tokens.css, page.tsx |
| 2026-05-25 | Design tokens + Tailwind v4 theme + 9 base UI components | tokens.css, globals.css, layout.tsx, components/ui/* |
| 2026-05-24 | Initial setup: Clean Architecture, npm, logging strategy | DECISIONS.md, CLAUDE.md, PROJECT_INSTRUCTIONS.md |

## Blockers
[ยังไม่มี]

## Notes for Chat
- Phase 1 Part 1 code done: Supabase clients + middleware + auth (Email/Password) + schema.sql
- User ยังไม่ได้สร้าง Supabase project — ต้องสร้าง + apply schema + ใส่ keys ใน .env.local ก่อน test ได้
- Google OAuth ยังไม่ทำ — จะเพิ่มทีหลัง
- เหลือ Part 2: Header/Footer + Protected Routes + CI/Husky
