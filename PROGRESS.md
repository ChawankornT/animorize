# ANIMORIZE — PROGRESS.md
> ไฟล์นี้เป็น single source of truth ระหว่าง Chat และ Code
> อัปเดทโดย Claude Code ท้ายทุก session (skill: /sync-progress)
> อัปโหลดไฟล์นี้ใน Chat ทุกครั้งที่เริ่ม conversation ใหม่

---

## Versions (สำหรับ sync check)
```
instructions_version: 2026-05-24-v1
decisions_version: 2026-05-27-v1
schema_version: 2026-05-27-v2
claude_md_version: 2026-05-27-v3
```

## Current Phase
- **Active:** Phase 2 — Admin Panel + Import
- **Status:** Phase 2 Part 5 (AniList import) complete — พร้อมเริ่ม Part 6 (Media Provider assignment)

## Phase 2 Progress
- [x] Phase 2 schema migration — schema/ folder (13 SQL files) + types/database.ts updated
- [x] Domain entities + usecases — Provider, Franchise, Media, SyncLog, SystemSettings
- [x] Repository interfaces + Supabase implementations + factory
- [x] Provider CRUD UI (ชื่อ, สี, logo, URL) — Server Actions + Admin pages + components
- [x] Franchise CRUD UI — Server Actions + Admin pages (list/new/edit) + FranchiseForm + FranchiseDeleteButton
- [x] Media CRUD UI (manual)
- [x] AniList import by ID + preview before save
- [ ] Media Provider assignment (media → provider + audio + base_url)
- [ ] Sync log viewer + retry button
- [ ] system_settings: auto-sync toggle

## Phase 1 Progress
- [x] Supabase project setup (dev) — สร้างแล้ว + apply schema + .env.local พร้อม
- [x] Schema (profiles + auth) — applied ใน Supabase SQL Editor แล้ว
- [x] pg_cron keep-alive — schedule 'keep-alive' ทุก 3 วัน applied แล้วใน Supabase
- [x] Supabase Auth: Email/Password — actions + login/signup pages done (Google OAuth ทีหลัง)
- [x] Auto-create profile trigger — ใน schema/02-profiles.sql
- [x] Header (logged out / logged in) — Wordmark + nav + avatar/logout
- [x] Footer — wordmark + © 2026
- [x] Next.js proxy — session refresh via @supabase/ssr (renamed middleware→proxy per Next.js 16)
- [x] Protected routes — (main)/layout.tsx + admin/layout.tsx
- [x] GitHub repo + branch protection — ruleset on main, CI required before merge
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
| 2026-05-28 | Phase 2 Part 5: AniList import — lib/anilist (types/api/mapper), usecases (ImportMedia/RetrySync), actions/anilist.ts, admin/import page + ImportPanel (3-step flow) | src/lib/anilist/*, src/domain/usecases/ImportMedia.ts, RetrySync.ts, src/app/actions/anilist.ts, src/app/admin/import/*, src/components/admin/ImportPanel.tsx |
| 2026-05-28 | config: เพิ่ม AniList image domain (s4.anilist.co) ใน next.config.ts | next.config.ts |
| 2026-05-28 | Phase 2 Part 4: Media CRUD — Server Actions, Admin pages (list/new/edit + loading/error), MediaForm, MediaDeleteButton | src/app/actions/media.ts, src/app/admin/media/*, src/components/admin/MediaForm.tsx, MediaDeleteButton.tsx |
| 2026-05-28 | Phase 2 Part 3: Franchise CRUD — Server Actions, Admin pages (list/new/edit), FranchiseForm, FranchiseDeleteButton, loading/error | src/app/actions/franchise.ts, src/app/admin/franchises/*, src/components/admin/FranchiseForm.tsx, FranchiseDeleteButton.tsx |
| 2026-05-27 | docs: เพิ่ม client boundary convention ใน CLAUDE.md (pure utility ต้องไม่มี 'use client') | CLAUDE.md |

## Blockers
[ยังไม่มี]

## Notes for Chat
- **Phase 2 Part 5 complete** — AniList import พร้อมใช้งาน: `/admin/import` (3-step flow: ID → preview+edit → success)
- **Import flow:** fetchAnilistPreviewAction (fetch + duplicate check, ไม่ save) → saveImportAction (save + sync_log) — ห้าม auto-save
- **retrySyncAction** — fetch AniList ใน action layer, retrySync usecase strip protected fields (titleTh, synopsis, posterUrl) ก่อน update
- **ImportMedia usecase error handling** — ถ้า media create fail: throw ทันที (ไม่มี mediaId → ไม่ log); ถ้า success log fail: เขียน failed log แล้ว re-throw
- **genres round-trip** — comma-joined string ใน hidden input → split/trim/filter ใน saveImportAction (เหมือน MediaForm)
- **AniList image domain** — เพิ่ม `s4.anilist.co` ใน next.config.ts remotePatterns แล้ว, ใช้ `next/image` ใน ImportPanel
- **Part 6 ต่อไป:** Media Provider assignment (media → provider + audio + base_url)
- **Phase 2 Part 4 complete** — Media CRUD พร้อมใช้งาน: `/admin/media` (list + filter), `/admin/media/new`, `/admin/media/[id]/edit`
- **Delete pattern** — `deleteXxxAction.bind(null, id)` + `useActionState` + `DeleteConfirmModal` + `XxxDeleteButton` wrapper — ใช้แล้วใน Provider, Franchise, Media
- **Dev DB migration ต้องทำ (ถ้ายังไม่ได้ทำ):** รัน `schema/01-enums.sql` (enums ใหม่) + `schema/03-franchises.sql` → `schema/12-indexes.sql` ใน Supabase SQL Editor (ข้าม 00, 02)
- Supabase email validation: ต้องใช้ email domain ที่มี MX record จริงเท่านั้น (หรือ disable ใน dashboard)
- Google OAuth ยังไม่ทำ — Phase 1 ใช้ Email/Password เท่านั้น
