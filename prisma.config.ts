// Import Library
import { defineConfig, env } from "prisma/config";

/* -------------------------------------- Config -------------------------------------- */

// Config Prisma CLI (schema และ URL ของ DB, รันด้วย bunx --bun จึงโหลด .env ให้อัตโนมัติ)
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
