# ANIMORIZE — PROGRESS.md
> ไฟล์นี้เป็น single source of truth ระหว่าง Chat และ Code
> อัปเดทโดย Claude Code ท้ายทุก session (skill: /sync-progress)
> อัปโหลดไฟล์นี้ใน Chat ทุกครั้งที่เริ่ม conversation ใหม่

---

## Versions (สำหรับ sync check)
```
instructions_version: 2026-05-24-v1
decisions_version: 2026-05-29-v2
schema_version: 2026-05-27-v2
claude_md_version: 2026-05-29-v4
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
- [ ] เพิ่ม CHANGELOG.md entry สำหรับ Phase 2 Part 1-6 (2026-05-28) — Media CRUD, AniList import, MediaProvider, SyncLogs, Settings

## Recent Changes (last 5)
| วันที่ | เปลี่ยนอะไร | เปลี่ยนในไฟล์ไหน |
|--------|------------|----------------|
| 2026-05-29 | Admin UI redesign ตาม design file (7 หน้า): Dashboard → "Needs attention" inbox, Providers list → row+chip, Media list → EN title+swatch+Season+AutoSync columns, Media detail → color tile 110×156, Provider form → color picker swatch, Import panel → 3-step redesign, Franchises list → sub-title | src/app/admin/page.tsx, providers/page.tsx, media/page.tsx, media/[id]/page.tsx, franchises/page.tsx, import/page.tsx, src/components/admin/ProviderForm.tsx, ImportPanel.tsx |
| 2026-05-29 | getDisplayTitle order เปลี่ยน Thai>EN>Romaji → **EN>Romaji>Thai** ทั้ง Media และ Franchise entity + อัปเดท CLAUDE.md + DECISIONS.md | src/domain/entities/Media.ts, Franchise.ts, CLAUDE.md, DECISIONS.md |
| 2026-05-29 | สร้าง src/constants/admin.ts รวม MEDIA_TYPE_LABELS, MEDIA_STATUS_VARIANT, SEASON_LABELS, TILE_COLORS แทนการ define ซ้ำใน 3 ไฟล์ | src/constants/admin.ts (ใหม่), media/page.tsx, media/[id]/page.tsx, ImportPanel.tsx |
| 2026-05-28 | refactor: AssignProviderForm ใช้ `<Select>` + `<Input>` UI components แทน raw HTML (ลบ manual label/error/style) | src/components/admin/AssignProviderForm.tsx |
| 2026-05-28 | Phase 2 Part 6: MediaProvider entity+repo+usecases, AssignProvider/RemoveProvider/ListMediaProviders/ListSyncLogs usecases, mediaProvider+systemSettings actions, AssignProviderForm+RemoveProviderButton+RetrySyncButton+SystemSettingsForm components, media detail page, sync-logs page, settings page, loading/error for all new routes | src/domain/entities/MediaProvider.ts, src/domain/usecases/*, src/repositories/interfaces/IMediaProviderRepository.ts, src/repositories/supabase/SupabaseMediaProviderRepository.ts, src/app/actions/mediaProvider.ts|systemSettings.ts, src/components/admin/*, src/app/admin/media/[id]/*, src/app/admin/sync-logs/*, src/app/admin/settings/* |

## Blockers
[ยังไม่มี]

## Notes for Chat
- **⚠️ CLAUDE.md + DECISIONS.md เปลี่ยนแล้ว** — Chat ต้อง reload: title order rule เปลี่ยนเป็น `title_en > title_romaji > title_th` และมี decisions ใหม่ 2 รายการ
- **Title display order (ใหม่)** — `getDisplayTitle()` ทั้ง Media และ Franchise ใช้ EN > Romaji > Thai แล้ว แต่ `SupabaseSyncLogRepository` mapper ยัง hardcode Thai-first สำหรับ `mediaTitle` field — ควรแก้ถ้า consistency สำคัญ
- **src/constants/admin.ts** — shared constants สำหรับ admin: `MEDIA_TYPE_LABELS`, `MEDIA_STATUS_VARIANT`, `SEASON_LABELS`, `TILE_COLORS` — Phase อื่นที่ต้องการใช้ import จากที่นี่
- **Phase 2 COMPLETE** — Admin Panel ครบทุก task พร้อมเริ่ม Phase 3
- **RemoveProviderButton pattern** — ใช้ `Modal` โดยตรง (ไม่ใช้ `DeleteConfirmModal`) เพราะต้องการ hidden `<input name="mediaId">` ใน form สำหรับ revalidatePath
- **removeProviderAction signature** — `(id: string, prevState, formData)` (3 args) ต่างจาก deleteXxx pattern เดิมที่ใช้ `(id: string, _: FormData)` เพราะต้องการ formData จริงๆ สำหรับ mediaId
- **MediaProvider JOIN** — `SupabaseMediaProviderRepository.findByMediaId()` ใช้ `select('*, providers(name, color)')` → entity มี `providerName`, `providerColor`
- **Navigation flow** — List `/admin/media` → "View" → detail `/admin/media/[id]` → "Edit" → `/admin/media/[id]/edit`
- **Import flow:** fetchAnilistPreviewAction (fetch + duplicate check, ไม่ save) → saveImportAction (save + sync_log) — ห้าม auto-save
- **Dev DB migration ต้องทำ (ถ้ายังไม่ได้ทำ):** รัน `schema/01-enums.sql` (enums ใหม่) + `schema/03-franchises.sql` → `schema/12-indexes.sql` ใน Supabase SQL Editor (ข้าม 00, 02)
- Google OAuth ยังไม่ทำ — Phase 1 ใช้ Email/Password เท่านั้น
