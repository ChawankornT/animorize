# ANIMORIZE — Project Instructions
> Claude อ่านไฟล์นี้ทุก conversation
> สำหรับรายละเอียดและเหตุผลเชิงลึก ดู DECISIONS.md และ schema/ (ดู schema/README.md)

---

## Concept

แอปติดตามสื่อที่กำลังดู (Anime, Series, Movie, OVA, Special, Documentary)
แทนการจดใน Excel — บันทึกความคืบหน้า เลือก Provider ค้นหาเรื่องได้ง่าย
Admin จัดการเนื้อหา + import จาก AniList

---

## Tech Stack (Locked — ห้ามเปลี่ยนโดยไม่บันทึกใน DECISIONS.md)

| Category     | Package               | Version |
|--------------|-----------------------|---------|
| Framework    | Next.js               | 16.0.5  |
| Language     | TypeScript            | latest  |
| Styling      | Tailwind CSS          | v4      |
| Database     | Supabase (PostgreSQL) | latest  |
| Auth         | Supabase Auth         | —       |
| State        | Zustand               | v5      |
| Server State | TanStack Query        | v5      |
| Animations   | Motion (Framer Motion)| v11+    |
| Forms        | React Hook Form + Zod | latest  |
| Testing      | Vitest + RTL          | latest  |
| Linting      | ESLint + Prettier     | latest  |
| Git Hooks    | Husky + lint-staged   | latest  |
| Package Mgr  | npm                   | latest  |

---

## Project Structure (Clean Architecture)

```
src/
├── app/
│   ├── (auth)/          # login, register
│   ├── (main)/          # dashboard, search, category
│   ├── admin/           # admin panel (protected)
│   ├── franchise/[id]/  # franchise detail
│   ├── actions/         # Server Actions
│   └── layout.tsx
├── components/
│   ├── ui/              # base components (Button, Input, Modal, Skeleton)
│   ├── media/           # MediaCard, ProviderBadge, EpisodeTracker
│   ├── franchise/       # FranchiseHeader, MediaList
│   ├── admin/           # AdminForm, ImportPanel
│   └── layout/          # Header, Footer, Navigation
├── domain/
│   ├── entities/        # Media, Franchise, WatchLog (pure TS types + business rules)
│   └── usecases/        # IncrementEpisode, ImportMedia, ToggleFavorite
├── repositories/
│   ├── interfaces/      # IMediaRepository, IWatchLogRepository (contracts)
│   └── supabase/        # SupabaseMediaRepository (implementation)
├── hooks/               # custom hooks (orchestrate usecases)
├── lib/
│   ├── supabase/        # client.ts, server.ts, middleware.ts
│   ├── anilist/         # api.ts, types.ts
│   └── utils/
├── stores/              # Zustand stores
├── types/               # database.ts (auto-gen), index.ts
└── constants/
```

---

## Architecture — Clean Architecture

### Dependency Rule (ห้ามละเมิด)

```
domain/         →  pure TS เท่านั้น, ห้าม import Supabase/Next.js/React
repositories/   →  import ได้เฉพาะ domain/entities/ (สำหรับ return types)
hooks/          →  import domain/ + repositories/
UI (app/ + components/)  →  import hooks/ + domain/entities/ (สำหรับ types)
```

### Layer Responsibilities

```
Domain      →  business rules + entities, ไม่มี side effects
Repository  →  DB access ผ่าน interface, implementation แยก
Hook        →  orchestrate usecases → UI, ไม่มี JSX
UI          →  render + user events เท่านั้น, ไม่มี business logic
```

ตัวอย่าง: EpisodeTracker component → useEpisodeTracker hook → IncrementEpisode usecase → IWatchLogRepository interface → SupabaseWatchLogRepository

---

## Supabase Setup

```
lib/supabase/
├── client.ts      ← createBrowserClient()  — 'use client' components
├── server.ts      ← createServerClient()   — Server Components + Actions
└── middleware.ts   ← refresh session ใน Next.js middleware

src/middleware.ts   ← เรียก supabase/middleware.ts
```

---

## Roles & Auth

```
user   →  Dashboard, library, tracking, search
admin  →  ทุกอย่างของ user + Admin Panel (Franchise, Media, Provider, Import, Sync)

Protected routes:
  /dashboard  →  login required
  /admin/*    →  role = 'admin' required
```

---

## Business Rules (สำคัญ — ห้ามลืม)

```
movie / special   →  total_episodes = 1 เสมอ, UI เป็น toggle "Watched"
ova               →  episode tracking ปกติ (อาจมีหลายตอน)
anime / series    →  episode tracking ปกติ

+1 Episode:
  current_episode++  →  INSERT watchlog  →  ถ้า current = total → status = 'completed'

Title display:    title_en > title_romaji > title_th
Dashboard filter: status = 'watching' OR is_favorite = true
Provider URL:     custom_url ?? base_url

Auto-sync logic:  system_settings.enabled = true
                  AND media.auto_sync = true
                  AND media.airing_status = 'ongoing'

Sync ไม่ overwrite: title_th, synopsis, poster_url
```

---

## Coding Conventions

```
DO:
  ✅ Server Components เป็น default
  ✅ 'use client' เฉพาะเมื่อต้องการ interactivity จริงๆ
  ✅ Mutations ผ่าน Server Actions เท่านั้น
  ✅ ทุก form มี Zod schema + validate ก่อน action
  ✅ Supabase RLS ทุก table
  ✅ Skeleton loading (loading.tsx) ทุก route group
  ✅ Error boundary (error.tsx) ทุก route group
  ✅ JSDoc สำหรับ function ที่ซับซ้อน
  ✅ Business logic ใน domain/usecases/ เท่านั้น
  ✅ DB access ผ่าน repository interface เท่านั้น
  ✅ Server-side errors ใช้ console.error

DON'T:
  ❌ ห้ามใช้ any type
  ❌ ห้าม console.log ใน production
  ❌ ห้าม call AniList API จาก client side
  ❌ ห้าม store sensitive data ใน localStorage
  ❌ ห้าม inline style
  ❌ ห้าม install package ใหม่โดยไม่บันทึกใน DECISIONS.md
  ❌ ห้ามแก้ src/types/database.ts ตรงๆ (auto-generated)
  ❌ ห้าม import Supabase ใน domain/ (ผิด dependency rule)
```

## Naming Conventions

```
Components:     PascalCase      →  MediaCard.tsx
Hooks:          camelCase       →  useWatchlog.ts
Stores:         camelCase       →  useUserStore.ts
Entities:       PascalCase      →  Media.ts
UseCases:       PascalCase      →  IncrementEpisode.ts
Repositories:   PascalCase + I  →  IMediaRepository.ts
Server Actions: camelCase       →  updateProfileAction.ts
Utils:          camelCase       →  formatEpisode.ts
DB Tables:      snake_case      →  user_media, sync_logs
Types:          PascalCase      →  WatchStatus, MediaType
Constants:      UPPER_SNAKE     →  MAX_FILE_SIZE
```

---

## Error Handling Strategy

```
Server Actions:  try/catch + console.error + return { success, message, errors? }
Server Comp:     error.tsx boundary ทุก route group
Client Comp:     error boundary + toast notification
Loading:         loading.tsx (skeleton) ทุก route group
Empty states:    แสดง illustration + action button
```

---

## Git & Deploy

```
Branches:
  main      →  production  (animorize.com)
  develop   →  staging     (dev.animorize.com)
  feature/* →  feature branches → PR → develop
  fix/*     →  bug fixes

Supabase: 2 projects แยกกัน
  animorize-dev   →  develop + feature branches
  animorize-prod  →  main เท่านั้น

CI (GitHub Actions on PR):  lint → typecheck → test
Git hooks (Husky):          pre-commit → lint-staged (lint + typecheck staged files)
```

---

## MVP Phases (ดู DECISIONS.md สำหรับรายละเอียด)

```
Phase 1  Foundation & Auth
Phase 2  Admin Panel + AniList Import
Phase 3  User Library & Dashboard
Phase 4  Progress Tracking + Watchlog
Phase 5  UX Polish
Phase 6  Extended Features
```
