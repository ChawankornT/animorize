---
name: commit
description: เขียน conventional commit message จาก staged changes
allowed-tools: Bash(git diff --staged), Bash(git status), Bash(git add*), Bash(git commit*)
---

# Smart Commit

1. Run `git diff --staged` ดู changes
2. วิเคราะห์ว่า changes ทำอะไร
3. เขียน commit message:

```
<type>(<scope>): <summary ไม่เกิน 72 ตัวอักษร>

[optional body — อธิบายว่าทำไม ไม่ใช่ทำอะไร]
```

**Types:** feat | fix | refactor | chore | docs | test | style | perf
**Scopes:** domain, repository, hook, ui, admin, auth, sync, config

**Rules:**
- Imperative: "add feature" ไม่ใช่ "added feature"
- ห้าม "fix bug" / "update code" — ต้องบอกว่า bug/update อะไร
- หลาย scope → แยก commit
- แสดง message ให้ confirm ก่อน commit

Focus: $ARGUMENTS
