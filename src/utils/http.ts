// Import Library
import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
// Import Types
import type { AppContext, AppEnv } from "../types/http.type";

/* -------------------------------------- Functions -------------------------------------- */

// Function สร้าง router ของ app (ยอมรับ / ท้าย path เหมือนกันทุก route)
export function createRouter(): Hono<AppEnv> {
  return new Hono<AppEnv>({ strict: false });
}

// Function ตอบ JSON พร้อม status code
export function sendJson(c: AppContext, body: unknown, status = 200): Response {
  return c.json(body as object, status as ContentfulStatusCode);
}

// Function ตัดข้อความให้ไม่เกินความยาวที่กำหนด
export function truncate(value: string | null, maxLength: number): string | null {
  return value && value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}
