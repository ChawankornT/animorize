---
paths:
  - "src/repositories/**"
---

# Repository Layer Rules

- interfaces/ = TypeScript interfaces เท่านั้น (ไม่มี implementation)
- supabase/ = implementation ของ interface ที่ใช้ Supabase client
- ห้ามมี business logic ใน repository — logic อยู่ใน domain/usecases/
- Repository return domain entities เท่านั้น ไม่ return Supabase raw response
- ทุก repository method ต้อง handle error: try/catch + throw descriptive error
- Interface naming: `IMediaRepository`, `IWatchLogRepository`
- Implementation naming: `SupabaseMediaRepository`, `SupabaseWatchLogRepository`
