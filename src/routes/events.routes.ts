// Import Library
import { zValidator } from "@hono/zod-validator";
import type { core } from "zod";
// Import Middlewares
import { httpError } from "../middlewares/error.middleware";
// Import Schemas
import { idParamSchema, listQuerySchema } from "../schemas/received-event.schema";
// Import Services
import * as receivedEventService from "../services/received-event.service";
// Import Utils
import { createRouter, sendJson } from "../utils/http";

const router = createRouter();

/* -------------------------------------- Helpers -------------------------------------- */

// Function hook ของ zValidator (ไม่ผ่านโยน 400 พร้อมรายการ field ที่ผิด)
function throwOnInvalid(result: { success: true } | { success: false; error: core.$ZodError }): void {
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
    throw httpError(400, "VALIDATION_ERROR", message);
  }
}

/* -------------------------------------- Received Event Routes -------------------------------------- */

router.get("/", zValidator("query", listQuerySchema, throwOnInvalid), async (c) => {
  return sendJson(c, await receivedEventService.listReceivedEvents(c.req.valid("query")));
});

router.get("/:id", zValidator("param", idParamSchema, throwOnInvalid), async (c) => {
  return sendJson(c, await receivedEventService.getReceivedEvent(c.req.valid("param").id));
});

export default router;
