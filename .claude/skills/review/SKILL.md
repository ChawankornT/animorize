---
name: review
description: Review code quality ตาม Clean Architecture + conventions
allowed-tools: Read, Grep, Bash(npm run lint), Bash(npm run typecheck)
---

# Code Review

Review code ใน: $ARGUMENTS

**ตรวจสอบ:**
1. **Clean Architecture** — dependency rule ถูกไหม? domain import Supabase ไหม?
2. **Type safety** — มี `any` ไหม? types ครบไหม?
3. **Business logic placement** — logic อยู่ใน domain/usecases/ ไหม? ไม่ใช่ใน component/action?
4. **Repository pattern** — DB access ผ่าน interface ไหม?
5. **Error handling** — Server Actions มี try/catch ไหม? error.tsx มีไหม?
6. **Conventions** — naming, Zod validation, Server Components default
7. Run `npm run lint` + `npm run typecheck`

**Output:**
- 🔴 Critical (ต้องแก้)
- 🟡 Warning (ควรแก้)
- 🟢 Suggestion (optional)

ไม่มีปัญหา → LGTM + สรุปสั้นๆ
