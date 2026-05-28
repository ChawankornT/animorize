# ANIMORIZE

แอปติดตามสื่อ (Anime, Series, Movie, OVA) แทน Excel
Admin จัดการเนื้อหา + import จาก AniList / User ติดตาม progress

## Tech Stack
- Next.js 16.0.5 (App Router) + TypeScript strict
- Tailwind CSS v4 + Supabase (PostgreSQL + Auth + RLS)
- Zustand v5 + TanStack Query v5 + React Hook Form + Zod
- Motion v11 + Vitest + RTL + npm

## Commands
- `npm run dev` / `npm run build` / `npm test` / `npm run lint` / `npm run typecheck`

## Architecture — Clean Architecture

```
Domain      → domain/entities/ + usecases/     (pure logic, ห้าม import Supabase/React)
Repository  → repositories/interfaces/ + supabase/   (DB access ผ่าน interface)
Hook        → hooks/                            (orchestrate usecases → UI)
UI          → app/ + components/                (render เท่านั้น)
```

Dependency rule: ชั้นในห้าม import ชั้นนอก

```
src/
├── app/(auth)/ (main)/ admin/ franchise/[id]/ actions/
├── components/ui/ media/ layout/
├── domain/entities/ usecases/
├── repositories/interfaces/ supabase/
├── hooks/
├── lib/supabase/(client|server|middleware).ts  anilist/  utils/
├── stores/  types/  constants/
```

## Supabase
- client.ts → createBrowserClient() ('use client')
- server.ts → createServerClient() (Server Components + Actions)
- middleware.ts → refresh session — RLS ทุก table ผ่าน auth.uid()

## Conventions
**DO:** Server Components default / Mutations ผ่าน Server Actions / Zod validate ทุก form /
loading.tsx + error.tsx ทุก route group / logic ใน domain/usecases/ / DB ผ่าน repository interface

**DON'T:** ❌ `any` / ❌ `console.log` prod / ❌ AniList จาก client / ❌ inline style /
❌ install package ไม่บันทึก DECISIONS.md / ❌ แก้ types/database.ts / ❌ import Supabase ใน domain/

**Client boundary:** pure utility functions (ไม่ใช้ React hooks / browser API) ต้องอยู่ในไฟล์แยกที่ไม่มี `'use client'`
เพื่อให้ Server Components import ได้ — ดูตัวอย่าง `components/ui/button-variants.ts`

## Naming
Components: PascalCase `MediaCard.tsx` / Hooks: `useWatchlog.ts` / Entities: `Media.ts`
UseCases: `IncrementEpisode.ts` / Repos: `IMediaRepository.ts` / Actions: `updateProfileAction.ts`

## Key Business Rules
- movie/special → total_episodes=1, toggle "Watched" / ova → episode tracking ปกติ
- +1 Episode: current_episode++ → INSERT watchlog → ถ้า current=total → status='completed'
- Title: title_en > title_romaji > title_th
- Dashboard: status='watching' OR is_favorite=true
- Provider URL: custom_url ?? base_url
- Auto-sync: system enabled AND media.auto_sync AND airing_status='ongoing'
- Sync ไม่ overwrite: title_th, synopsis, poster_url

## Session Sync
- จบทุก session → รัน `/sync-progress` เพื่ออัปเดท PROGRESS.md
- ถ้าแก้ DECISIONS.md / CLAUDE.md / schema/ → bump version ใน PROGRESS.md
- ถ้าแก้ PROJECT_INSTRUCTIONS.md → เตือนใน PROGRESS.md ว่า Chat ต้องอัปเดท

## References
- @DECISIONS.md
- @schema/ (see schema/README.md for structure and migration order)
- @PROGRESS.md
