// Import Library
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
// Import Types
import type { AppContext } from "../types/http.type";
// Import Utils
import { sendJson } from "../utils/http";
import { logger } from "../utils/logger";

/* -------------------------------------- Config -------------------------------------- */

// Config code เริ่มต้นตาม status (ใช้เมื่อ HTTPException ไม่ได้ระบุ code ใน cause)
const DEFAULT_ERROR_CODES: Record<number, string> = {
  400: "VALIDATION_ERROR",
  404: "NOT_FOUND",
  413: "PAYLOAD_TOO_LARGE",
};

/* -------------------------------------- Functions -------------------------------------- */

// Function สร้าง HTTPException พร้อม code (เก็บ code ไว้ใน cause)
export function httpError(status: ContentfulStatusCode, code: string, message: string): HTTPException {
  return new HTTPException(status, { message, cause: { code } });
}

// Function ตอบ 404 เมื่อไม่พบ route
export function notFoundHandler(c: AppContext): Response {
  return sendJson(c, { status_code: 404, code: "NOT_FOUND", message: "Route not found." }, 404);
}

// Function แปลง error ทุกแบบเป็น JSON response (error ที่ไม่ได้ตั้งใจตอบ 500 และเขียน log)
export function errorHandler(error: unknown, c: AppContext): Response {
  if (error instanceof HTTPException) {
    const code = (error.cause as { code?: string } | undefined)?.code ?? DEFAULT_ERROR_CODES[error.status] ?? "HTTP_ERROR";

    return sendJson(c, { status_code: error.status, code, message: error.message }, error.status);
  }

  logger.error("Request failed.", { method: c.req.method, path: c.req.path, error });

  return sendJson(c, { status_code: 500, code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error." }, 500);
}
