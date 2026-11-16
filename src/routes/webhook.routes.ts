// Import Library
import { bodyLimit } from "hono/body-limit";
// Import Middlewares
import { httpError } from "../middlewares/error.middleware";
// Import Services
import * as webhookService from "../services/webhook.service";
// Import Utils
import { createRouter, sendJson } from "../utils/http";

const router = createRouter();

/* -------------------------------------- Config -------------------------------------- */

// Config ขนาด body สูงสุด
const BODY_LIMIT_BYTES = 1024 * 1024;

/* -------------------------------------- Webhook Routes -------------------------------------- */

router.post(
  "/",
  bodyLimit({
    maxSize: BODY_LIMIT_BYTES,
    onError: () => {
      throw httpError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
    },
  }),
  async (c) => {
    const result = await webhookService.handleWebhook(await c.req.text(), c.req.header("x-line-signature"));

    return sendJson(c, result.body, result.status);
  },
);

export default router;
