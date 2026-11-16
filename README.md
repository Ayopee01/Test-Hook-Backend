# Test Hook Backend

ปลายทางจำลองสำหรับทดสอบ center-hook ใช้แทน "ระบบอื่น" ที่ `WEBHOOK_URL` ชี้ไป

Test-Hook-Backend บันทึกทุก request ที่ได้รับลง DB ของตัวเอง แล้วเปิดให้ GET ดูได้ ว่า event ไหนมาถึง, signature ถูกต้องไหม และตอบกลับด้วย status อะไร ไม่มี auth เพราะใช้สำหรับทดสอบเท่านั้น

```
LINE ──► center-hook ──┬─ event ของ Labor ──► Labor
                       └─ event อื่น ───────► Test-Hook-Backend /webhook ──► DB ──► GET /events (Postman)
```

## Tech Stack

| Technology | Version | Role |
| --- | --- | --- |
| [Bun](https://bun.sh) | 1.4.4 | runtime และ package manager |
| [TypeScript](https://www.typescriptlang.org) | 7.0.2 | ภาษา |
| [Hono](https://hono.dev) | 4.13.18 | web framework |
| PostgreSQL | 16 | database |
| [Prisma](https://www.prisma.io) | 7.10.1 | ORM และ migration |
| Docker | `oven/bun:1.4.4-alpine` | container สำหรับ deploy |

## Libraries

| Library | Version | Role |
| --- | --- | --- |
| [`@line/bot-sdk`](https://github.com/line/line-bot-sdk-nodejs) | 11.4.0 | ตรวจ `x-line-signature` และ type ของ webhook event |
| [`zod`](https://zod.dev) | 4.6.7 | schema ตรวจ query / params ของ API |
| [`@hono/zod-validator`](https://github.com/honojs/middleware/tree/main/packages/zod-validator) | 0.9.1 | ใช้ schema ของ zod เป็น middleware ของ Hono |
| [`@prisma/adapter-pg`](https://www.prisma.io/docs/orm/overview/databases/postgresql) | 7.10.1 | เชื่อม Prisma กับ PostgreSQL |
| [`pino`](https://getpino.io) | 10.4.0 | เขียน log เป็น JSON (ปิดบังค่า secret) |

ไฟล์ [Postman_Collection.json](Postman_Collection.json) ใช้ยิง GET ดูข้อมูลแทน Frontend

## Recorded Errors

ทุก request ถูกบันทึกเสมอ ถ้ามีปัญหาจะมีค่าใน `error` (ดูเฉพาะรายการที่ผิดพลาดด้วย `GET /events?has_error=true`)

| `error` | สาเหตุ | Status ที่ตอบ |
| --- | --- | --- |
| `LINE_CHANNEL_SECRET_NOT_CONFIGURED` | Test-Hook-Backend ไม่ได้ตั้ง `LINE_CHANNEL_SECRET` | 401 |
| `MISSING_SIGNATURE` | request ไม่มี header `x-line-signature` | 401 |
| `INVALID_SIGNATURE` | secret ของผู้ส่งไม่ตรงกับ `LINE_CHANNEL_SECRET` | 401 |
| `INVALID_JSON` | signature ถูกแต่ body ไม่ใช่ JSON object (เก็บ body ดิบใน `payload.raw`) | 200 |

event เก่ากว่า `RECEIVED_EVENT_RETENTION_DAYS` (30 วัน) ถูกลบอัตโนมัติ

## Common Commands

```bash
bun install
cp .env.example .env          # LINE_CHANNEL_SECRET ต้องตรงกับ center-hook
bun run docker:db             # Postgres ที่ localhost:5436
bun run db:deploy
bun run dev                   # port 4002
bun run typecheck
```

ทดสอบ flow ครบบนเครื่อง ตั้ง `LINE_CHANNEL_SECRET` ให้ตรงกันทุกระบบ และตั้ง center-hook ให้ `WEBHOOK_URL=http://localhost:4002/webhook`
