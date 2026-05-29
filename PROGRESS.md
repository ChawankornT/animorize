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
- **Active:** Phase 3 — User Library & Dashboard
- **Status:** Phase 2 merged to main (PR #3) — พร้อมเริ่ม Phase 3

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
| 2026-05-29 | fix(admin): 4 bugs จาก follow-up code review (issue #4, PR #5) — (1) toSyncLog Thai-first → EN-first; (2) media list secondary title เทียบ primaryTitle (ไม่ใช่ titleEn); (3) AniList mapper `?? undefined` (เดิม `?? 0` ทำให้ `?? 1` ไม่ทำงาน → total_episodes=0); (4) retrySync รับ fetch เป็น callback → fetch fail ก็เขียน failed sync_log + revalidate /admin/sync-logs ใน catch | src/repositories/supabase/mappers.ts, src/app/admin/media/page.tsx, src/lib/anilist/mapper.ts, src/domain/usecases/RetrySync.ts, src/app/actions/anilist.ts |
| 2026-05-29 | fix(import): 3 bugs จาก code review + PR comment — autoSync checkbox (name="autoSync"), totalEpisodes ?? 1 (ไม่ใช่ 0), retrySyncAction revalidate /admin/sync-logs ด้วย | src/components/admin/ImportPanel.tsx, src/app/actions/anilist.ts |
| 2026-05-29 | Admin UI redesign ตาม design file (7 หน้า): Dashboard → "Needs attention" inbox, Providers list → row+chip, Media list → EN title+swatch+Season+AutoSync columns, Media detail → color tile 110×156, Provider form → color picker swatch, Import panel → 3-step redesign, Franchises list → sub-title | src/app/admin/page.tsx, providers/page.tsx, media/page.tsx, media/[id]/page.tsx, franchises/page.tsx, import/page.tsx, src/components/admin/ProviderForm.tsx, ImportPanel.tsx |
| 2026-05-29 | getDisplayTitle order เปลี่ยน Thai>EN>Romaji → **EN>Romaji>Thai** ทั้ง Media และ Franchise entity + อัปเดท CLAUDE.md + DECISIONS.md | src/domain/entities/Media.ts, Franchise.ts, CLAUDE.md, DECISIONS.md |
| 2026-05-29 | สร้าง src/constants/admin.ts รวม MEDIA_TYPE_LABELS, MEDIA_STATUS_VARIANT, SEASON_LABELS, TILE_COLORS แทนการ define ซ้ำใน 3 ไฟล์ | src/constants/admin.ts (ใหม่), media/page.tsx, media/[id]/page.tsx, ImportPanel.tsx |

## Blockers
[ยังไม่มี]

## Notes for Chat
- **Phase 2 merged to main** (PR #3) — 120 files, 5853 insertions — พร้อมเริ่ม Phase 3
- **3 bugs fixed หลัง code review** — (1) ImportPanel autoSync checkbox ใช้ `name="autoSync" value="true"` แล้ว (ไม่ใช่ `autoSyncCheck`); (2) `totalEpisodes ?? 1` แล้ว (ไม่ใช่ 0); (3) `retrySyncAction` revalidate `/admin/sync-logs` ด้วยแล้ว
- **4 bugs fixed (PR #5, issue #4) — รอ merge** — (1) `toSyncLog()` ใน `mappers.ts` เป็น EN-first แล้ว (Known issue เดิมแก้แล้ว); (2) media list secondary title เทียบ `primaryTitle`; (3) AniList `mapper.ts` คืน `undefined` เมื่อ episodes=null (เดิม `?? 0` ทำให้ import ได้ total_episodes=0 — กระทบ Phase 4); (4) retry-sync fetch fail บันทึก failed sync_log แล้ว
- **`retrySync()` signature เปลี่ยน** — เดิม `(mediaRepo, syncLogRepo, mediaId, updateInput)` → ตอนนี้ `(mediaRepo, syncLogRepo, mediaId, fetchUpdate)` โดย `fetchUpdate: () => Promise<Partial<UpdateMediaInput>>` (inject AniList fetch เป็น callback ให้ try/catch ครอบ fetch+update ทั้งคู่ — infra dependency อยู่นอก domain)
- **src/constants/admin.ts** — shared constants: `MEDIA_TYPE_LABELS`, `MEDIA_STATUS_VARIANT`, `SEASON_LABELS`, `TILE_COLORS` — import จากที่นี่
- **RemoveProviderButton pattern** — ใช้ `Modal` โดยตรง (ไม่ใช้ `DeleteConfirmModal`) เพราะต้องการ hidden `<input name="mediaId">` ใน form
- **removeProviderAction signature** — `(id: string, prevState, formData)` (3 args)
- **MediaProvider JOIN** — `SupabaseMediaProviderRepository.findByMediaId()` ใช้ `select('*, providers(name, color)')` → entity มี `providerName`, `providerColor`
- **Import flow:** fetchAnilistPreviewAction (fetch + duplicate check, ไม่ save) → saveImportAction (save + sync_log) — ห้าม auto-save
- **Dev DB migration ต้องทำ (ถ้ายังไม่ได้ทำ):** รัน `schema/01-enums.sql` + `schema/03-franchises.sql` → `schema/12-indexes.sql` ตามลำดับ (ข้าม 00, 02)
- Google OAuth ยังไม่ทำ — Phase 1 ใช้ Email/Password เท่านั้น
