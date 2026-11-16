// Import Library
import type { Context } from "hono";

/* -------------------------------------- Types -------------------------------------- */

// Type environment ของ Hono app (รันบน Bun ไม่มี binding เพิ่ม)
export type AppEnv = Record<string, never>;

// Type context ของ request
export type AppContext = Context<AppEnv>;
