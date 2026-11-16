// Import Config
import { TEST_HOOK_CONFIG } from "../config/test-hook.config";
// Import Middlewares
import { httpError } from "../middlewares/error.middleware";
// Import Repositories
import * as receivedEventRepository from "../repositories/received-event.repository";
// Import Schemas
import type { ListQuery } from "../schemas/received-event.schema";
// Import Types
import type { ReceivedEventDto, ReceivedEventListResponse } from "../types/received-event.type";

/* -------------------------------------- Functions -------------------------------------- */

// Function ค้นหา event แบบแบ่งหน้าตาม filter
export async function listReceivedEvents(query: ListQuery): Promise<ReceivedEventListResponse> {
  const { page, limit, ...filters } = query;
  const { items, total } = await receivedEventRepository.listReceivedEvents(filters, page, limit);

  return { data: items, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

// Function ดึง event หนึ่งรายการ
export async function getReceivedEvent(id: number): Promise<ReceivedEventDto> {
  const event = await receivedEventRepository.findReceivedEventById(id);

  if (!event) {
    throw httpError(404, "RECEIVED_EVENT_NOT_FOUND", "Received event not found.");
  }

  return event;
}

// Function ลบ event ที่เก่ากว่าอายุที่กำหนด คืนจำนวนที่ลบ
export async function deleteExpiredReceivedEvents(): Promise<number> {
  const before = new Date(Date.now() - TEST_HOOK_CONFIG.retentionDays * 24 * 60 * 60 * 1000);

  return receivedEventRepository.deleteReceivedEventsBefore(before);
}
