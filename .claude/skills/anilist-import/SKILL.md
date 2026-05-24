---
name: anilist-import
description: สร้าง/แก้ไข AniList import flow — Server Action + preview + save
allowed-tools: Read, Write, Edit, Grep, Bash(npm run typecheck)
---

# AniList Import

จัดการ AniList import flow: $ARGUMENTS

**Import Flow:**
1. Admin ใส่ AniList ID
2. Server Action call AniList GraphQL (server side เท่านั้น)
3. Map response ตาม fields mapping ใน DECISIONS.md
4. แสดง preview ให้ admin ก่อน save
5. Admin แก้ไขได้ (โดยเฉพาะ title_th)
6. Save → INSERT media + INSERT sync_log

**Fields Mapping:**
```
title.romaji     → title_romaji
title.english    → title_en
coverImage.large → poster_url
description      → synopsis
episodes         → total_episodes
season           → season_quarter (WINTER=1, SPRING=2, SUMMER=3, FALL=4)
seasonYear       → season_year
startDate        → air_date_start
endDate          → air_date_end
status           → airing_status (RELEASING=ongoing, FINISHED=finished, NOT_YET=upcoming)
genres           → genres[]
```

**ห้าม:**
- Call AniList จาก client side
- Auto-save โดยไม่ preview
- Overwrite title_th, synopsis, poster_url ที่ admin แก้ไว้แล้ว (sync)
