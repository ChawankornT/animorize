# ANIMORIZE — PROGRESS.md
> ไฟล์นี้เป็น single source of truth ระหว่าง Chat และ Code
> อัปเดทโดย Claude Code ท้ายทุก session (skill: /sync-progress)
> อัปโหลดไฟล์นี้ใน Chat ทุกครั้งที่เริ่ม conversation ใหม่

---

## Versions (สำหรับ sync check)
```
instructions_version: 2026-05-24-v1
decisions_version: 2026-05-24-v1
schema_version: 2025-05-v1
claude_md_version: 2026-05-24-v1
```

## Current Phase
- **Active:** Phase 1 — Foundation & Auth
- **Status:** In progress

## Phase 1 Progress
- [ ] Supabase project setup (dev + prod)
- [ ] Schema migration + RLS policies
- [ ] pg_cron keep-alive
- [ ] Supabase Auth: Google OAuth + Email/Password
- [ ] Auto-create profile trigger
- [ ] Header (logged out / logged in)
- [ ] Footer
- [ ] Protected routes + Next.js middleware
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
| 2026-05-26 | Design review fixes: 6 issues (Button hover, uppercase, Toast icons, Modal gap, extra radii) | Button.tsx, Toast.tsx, Modal.tsx, globals.css, page.tsx |
| 2026-05-25 | Design tokens + Tailwind v4 theme + 9 base UI components | tokens.css, globals.css, layout.tsx, components/ui/* |
| 2026-05-24 | Initial setup: Clean Architecture, npm, logging strategy | DECISIONS.md, CLAUDE.md, PROJECT_INSTRUCTIONS.md |

## Blockers
[ยังไม่มี]

## Notes for Chat
- Design system review fixes ครบ 6 จุดแล้ว — ยังไม่ commit รอ user ตัดสินใจ
- พร้อมเริ่ม Phase 1 (Supabase setup + Auth)
