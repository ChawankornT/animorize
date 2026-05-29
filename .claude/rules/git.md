# Git & PR Rules

## Merge
- ห้าม merge PR จนกว่า CI จะผ่าน (`SUCCESS`) ทุก check — ใช้ทุก PR ทุก branch รวมถึง `develop` → `main`
- รัน `gh pr checks <number>` ก่อนเสมอ — ถ้า CI ยังรันอยู่ให้รอด้วย `gh pr checks <number> --watch`
- ถ้า CI fail → แก้ให้ผ่านก่อน ห้าม merge --admin หรือ bypass

## Branch
- Feature/fix branch ตั้งชื่อ `<type>/<short-description>` (เช่น `fix/media-poster`, `feat/user-library`)
- Flow: `feature/*` / `fix/*` → `develop` → `main` — ห้าม merge ข้ามขั้นตรงเข้า `main`
- ลบ branch หลัง merge ทุกครั้ง (`--delete-branch` หรือ `git branch -d`)

## Commit
- ใช้ Conventional Commits: `feat|fix|docs|refactor|test|chore(<scope>): <message>`
- ห้าม skip hooks (`--no-verify`)
