// Import Library
import { randomUUID } from "node:crypto";
import { validateSignature, type webhook } from "@line/bot-sdk";
// Import Config
import { TEST_HOOK_CONFIG } from "../config/test-hook.config";
// Import Repositories
import * as receivedEventRepository from "../repositories/received-event.repository";
// Import Types
import type { ReceivedEventCreateInput } from "../types/received-event.type";
// Import Utils
import { truncate } from "../utils/http";
import { logger } from "../utils/logger";

/* -------------------------------------- Types -------------------------------------- */

// Type ผลการรับ webhook ที่ route ใช้ตอบกลับ
type WebhookResult = {
  status: number;
  body: { message: string; request_id: string; received: number; signature_valid: boolean };
};

/* -------------------------------------- Helpers -------------------------------------- */

// Function ตรวจ x-line-signature คืนสาเหตุที่ไม่ผ่าน (ผ่านคืน null)
function checkSignature(rawBody: string, signature: string | undefined): string | null {
  const secret = process.env.LINE_CHANNEL_SECRET;

  if (!secret) {
    return "LINE_CHANNEL_SECRET_NOT_CONFIGURED";
  }

  if (!signature) {
    return "MISSING_SIGNATURE";
  }

  return validateSignature(rawBody, secret, signature) ? null : "INVALID_SIGNATURE";
}

// Function parse body ของ webhook (parse ไม่ได้คืน null)
function parseBody(rawBody: string): webhook.CallbackRequest | null {
  try {
    const body: unknown = JSON.parse(rawBody);
    return body && typeof body === "object" && !Array.isArray(body) ? (body as webhook.CallbackRequest) : null;
  } catch {
    return null;
  }
}

// Function สรุปเนื้อหาของ event (ข้อความ, postback data หรือชนิดข้อความ)
function describeEventContent(event: webhook.Event): string | null {
  if (event.type === "message") {
    return event.message?.type === "text" ? event.message.text ?? null : `[${event.message?.type ?? "unknown"}]`;
  }

  if (event.type === "postback") {
    return event.postback?.data ?? null;
  }

  return null;
}

// Function หา userId ของผู้ส่ง (source แบบ group/room อาจไม่มี)
function getUserId(event: webhook.Event): string | null {
  return event.source && "userId" in event.source ? event.source.userId ?? null : null;
}

// Function สร้างข้อมูลที่จะบันทึกจาก request (ไม่มี event เก็บหนึ่งแถวไว้ดู body ที่ได้รับ)
function buildRecords(requestId: string, rawBody: string, body: webhook.CallbackRequest | null, signatureValid: boolean, error: string | null, responseStatus: number): ReceivedEventCreateInput[] {
  const base = { request_id: requestId, signature_valid: signatureValid, destination: body?.destination ?? null, response_status: responseStatus, error };
  const events = Array.isArray(body?.events) ? body.events : [];

  if (events.length === 0) {
    return [{
      ...base,
      webhook_event_id: null,
      line_user_id: null,
      event_type: null,
      message_type: null,
      content: null,
      payload: body ?? { raw: truncate(rawBody, TEST_HOOK_CONFIG.maxContentLength) },
    }];
  }

  return events.map((event) => ({
    ...base,
    webhook_event_id: event.webhookEventId ?? null,
    line_user_id: getUserId(event),
    event_type: event.type ?? "unknown",
    message_type: event.type === "message" ? event.message?.type ?? null : null,
    content: truncate(describeEventContent(event), TEST_HOOK_CONFIG.maxContentLength),
    payload: event,
  }));
}

/* -------------------------------------- Functions -------------------------------------- */

// Function รับ webhook บันทึกทุก event ลง DB พร้อมสาเหตุ error (signature ผิดตอบ 401)
export async function handleWebhook(rawBody: string, signature: string | undefined): Promise<WebhookResult> {
  const requestId = randomUUID();
  const signatureError = checkSignature(rawBody, signature);
  const body = parseBody(rawBody);
  const error = signatureError ?? (body ? null : "INVALID_JSON");
  const signatureValid = signatureError === null;
  const status = signatureValid ? 200 : 401;
  const records = buildRecords(requestId, rawBody, body, signatureValid, error, status);

  await receivedEventRepository.createReceivedEvents(records);

  if (error) {
    logger.warn("Webhook received with error.", { requestId, error, status });
  } else {
    logger.info("Webhook received.", { requestId, status, events: records.map((record) => `${record.event_type}:${record.content ?? ""}`) });
  }

  return {
    status,
    body: {
      message: error ? `Webhook received with error: ${error}.` : "Webhook received.",
      request_id: requestId,
      received: Array.isArray(body?.events) ? body.events.length : 0,
      signature_valid: signatureValid,
    },
  };
}
