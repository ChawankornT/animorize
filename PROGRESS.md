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
- **Status:** Phase 2 Part 6 (Media Provider + Sync Logs + Settings) complete — พร้อมเริ่ม Phase 3

## Phase 2 Progress
- [x] Phase 2 schema migration — schema/ folder (13 SQL files) + types/database.ts updated
- [x] Domain entities + usecases — Provider, Franchise, Media, SyncLog, SystemSettings
- [x] Repository interfaces + Supabase implementations + factory
- [x] Provider CRUD UI (ชื่อ, สี, logo, URL) — Server Actions + Admin pages + components
- [x] Franchise CRUD UI — Server Actions + Admin pages (list/new/edit) + FranchiseForm + FranchiseDeleteButton
- [x] Media CRUD UI (manual)
- [x] AniList import by ID + preview before save
- [x] Media Provider assignment (media → provider + audio + base_url)
- [x] Sync log viewer + retry button
- [x] system_settings: auto-sync toggle

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
| 2026-05-28 | refactor: AssignProviderForm ใช้ `<Select>` + `<Input>` UI components แทน raw HTML (ลบ manual label/error/style) | src/components/admin/AssignProviderForm.tsx |
| 2026-05-28 | Phase 2 Part 6: MediaProvider entity+repo+usecases, AssignProvider/RemoveProvider/ListMediaProviders/ListSyncLogs usecases, mediaProvider+systemSettings actions, AssignProviderForm+RemoveProviderButton+RetrySyncButton+SystemSettingsForm components, media detail page, sync-logs page, settings page, loading/error for all new routes | src/domain/entities/MediaProvider.ts, src/domain/usecases/Assign|Remove|ListMedia|ListSyncLogs, src/repositories/interfaces/IMediaProviderRepository.ts, src/repositories/supabase/SupabaseMediaProviderRepository.ts, src/app/actions/mediaProvider.ts|systemSettings.ts, src/components/admin/*, src/app/admin/media/[id]/*, src/app/admin/sync-logs/*, src/app/admin/settings/* |
| 2026-05-28 | SyncLog entity เพิ่ม mediaTitle? field + SupabaseSyncLogRepository JOIN media table + mappers updated | src/domain/entities/SyncLog.ts, src/repositories/supabase/SupabaseSyncLogRepository.ts, mappers.ts |
| 2026-05-28 | Media list: เปลี่ยน "Edit" → "View" link ไป detail page `/admin/media/[id]` | src/app/admin/media/page.tsx |
| 2026-05-28 | Phase 2 Part 5: AniList import — lib/anilist (types/api/mapper), usecases (ImportMedia/RetrySync), actions/anilist.ts, admin/import page + ImportPanel (3-step flow) | src/lib/anilist/*, src/domain/usecases/ImportMedia.ts, RetrySync.ts, src/app/actions/anilist.ts, src/app/admin/import/*, src/components/admin/ImportPanel.tsx |
| 2026-05-28 | Phase 2 Part 4: Media CRUD — Server Actions, Admin pages (list/new/edit + loading/error), MediaForm, MediaDeleteButton | src/app/actions/media.ts, src/app/admin/media/*, src/components/admin/MediaForm.tsx, MediaDeleteButton.tsx |

## Blockers
[ยังไม่มี]

## Notes for Chat
- **Phase 2 COMPLETE** — Admin Panel ครบทุก task พร้อมเริ่ม Phase 3
- **Phase 2 Part 6 complete** — `/admin/media/[id]` (detail + providers + sync history), `/admin/sync-logs` (table + retry), `/admin/settings` (auto-sync toggle)
- **RemoveProviderButton pattern** — ใช้ `Modal` โดยตรง (ไม่ใช้ `DeleteConfirmModal`) เพราะต้องการ hidden `<input name="mediaId">` ใน form สำหรับ revalidatePath
- **removeProviderAction signature** — `(id: string, prevState, formData)` (3 args) ต่างจาก deleteXxx pattern เดิมที่ใช้ `(id: string, _: FormData)` เพราะต้องการ formData จริงๆ สำหรับ mediaId
- **SyncLog JOIN** — `SupabaseSyncLogRepository.findAll()` ใช้ `select('*, media(...))` → mapper build `mediaTitle` จาก title_th > title_en > title_romaji
- **MediaProvider JOIN** — `SupabaseMediaProviderRepository.findByMediaId()` ใช้ `select('*, providers(name, color)')` → entity มี `providerName`, `providerColor`
- **Navigation flow** — List `/admin/media` → "View" → detail `/admin/media/[id]` → "Edit" → `/admin/media/[id]/edit`
- **Phase 2 Part 5 complete** — AniList import พร้อมใช้งาน: `/admin/import` (3-step flow: ID → preview+edit → success)
- **Import flow:** fetchAnilistPreviewAction (fetch + duplicate check, ไม่ save) → saveImportAction (save + sync_log) — ห้าม auto-save
- **Dev DB migration ต้องทำ (ถ้ายังไม่ได้ทำ):** รัน `schema/01-enums.sql` (enums ใหม่) + `schema/03-franchises.sql` → `schema/12-indexes.sql` ใน Supabase SQL Editor (ข้าม 00, 02)
- Google OAuth ยังไม่ทำ — Phase 1 ใช้ Email/Password เท่านั้น
