# Git & PR Rules

## Merge
- ห้าม merge PR จนกว่า CI จะผ่าน (`SUCCESS`) ทุก check — ใช้ทุก PR ทุก branch รวมถึง `develop` → `main`
- **release PR (`develop` → `main`) ต้องผ่าน `build` job เพิ่มเติม** — CI รัน `npm run build` อัตโนมัติเมื่อ base=main
- รัน `gh pr checks <number>` ก่อนเสมอ — ถ้า CI ยังรันอยู่ให้รอด้วย `gh pr checks <number> --watch`
- ถ้า CI fail → แก้ให้ผ่านก่อน ห้าม merge --admin หรือ bypass

## Branch

> ⛔ **ระหว่าง phase: ห้ามเปิด PR เข้า `main` เด็ดขาด**
> `feature/*` / `fix/*` → **PR เข้า `develop` เท่านั้น**
> `main` update เฉพาะ **release PR `develop` → `main`** ที่เจ้าของอนุมัติเองตอนปิด phase
> ยกเว้น: เจ้าของเปิด PR เอง และเป็น `develop` → `main` เท่านั้น — ห้ามข้าม branch ใดๆ
> ⚠️ **เคยมี PR หลุดเข้า `main` ทั้งที่กฎระบุไว้ → verify base branch ก่อนเปิด PR ทุกครั้งเสมอ**

- Feature/fix branch ตั้งชื่อ `<type>/<short-description>` (เช่น `fix/media-poster`, `feat/user-library`)
- Flow: `feature/*` / `fix/*` → `develop` → `main` — ห้าม merge ข้ามขั้นตรงเข้า `main`
- ลบ branch หลัง merge ทุกครั้ง: remote (`--delete-branch` ใน gh pr merge หรือ `git push origin --delete <branch>`) + local (`git branch -d <branch>`)
- หลัง merge แต่ละ PR ให้รัน `git fetch --prune` แล้วตรวจสอบด้วย `git branch -vv` ว่าไม่มี branch สถานะ `[gone]` หลงเหลือ — ถ้ามีให้ลบด้วย `git branch -d <branch>`
- **สำคัญ — แยกให้ออกระหว่าง 2 กรณี:**
  - `[origin/<name>: gone]` → remote เคยมีแล้วถูกลบ (หลัง merge) — **ลบ local ได้**
  - ไม่มี tracking info เลย (ไม่ขึ้น `[...]`) → branch ใหม่ที่ยังไม่เคย push — **ห้ามลบ นี่คือ active work**

## Commit
- ใช้ Conventional Commits: `feat|fix|docs|refactor|test|chore(<scope>): <message>`
- ห้าม skip hooks (`--no-verify`)
