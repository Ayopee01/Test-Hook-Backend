// Import Library
import type { Prisma, ReceivedEvent } from "@prisma/client";
// Import Config
import { prisma } from "../db/prisma";
// Import Types
import type { ReceivedEventCreateInput, ReceivedEventDto, ReceivedEventFilters } from "../types/received-event.type";

/* -------------------------------------- Helpers -------------------------------------- */

// Function แปลง row ของ DB เป็น DTO (snake_case)
function mapReceivedEvent(row: ReceivedEvent): ReceivedEventDto {
  return {
    id: row.id,
    request_id: row.requestId,
    signature_valid: row.signatureValid,
    destination: row.destination,
    webhook_event_id: row.webhookEventId,
    line_user_id: row.lineUserId,
    event_type: row.eventType,
    message_type: row.messageType,
    content: row.content,
    payload: row.payload,
    response_status: row.responseStatus,
    error: row.error,
    created_at: row.createdAt,
  };
}

// Function สร้าง Prisma where จาก filters
function buildWhere(filters: ReceivedEventFilters): Prisma.ReceivedEventWhereInput {
  return {
    eventType: filters.event_type,
    lineUserId: filters.line_user_id,
    signatureValid: filters.signature_valid,
    ...(filters.has_error !== undefined && { error: filters.has_error ? { not: null } : null }),
    ...((filters.from || filters.to) && { createdAt: { gte: filters.from, lte: filters.to } }),
  };
}

/* -------------------------------------- Functions -------------------------------------- */

// Function บันทึก event หลายรายการของ request เดียว
export async function createReceivedEvents(inputs: ReceivedEventCreateInput[]): Promise<void> {
  await prisma.receivedEvent.createMany({
    data: inputs.map((input) => ({
      requestId: input.request_id,
      signatureValid: input.signature_valid,
      destination: input.destination,
      webhookEventId: input.webhook_event_id,
      lineUserId: input.line_user_id,
      eventType: input.event_type,
      messageType: input.message_type,
      content: input.content,
      payload: (input.payload ?? undefined) as Prisma.InputJsonValue | undefined,
      responseStatus: input.response_status,
      error: input.error,
    })),
  });
}

// Function ค้นหา event แบบแบ่งหน้า เรียงจากใหม่ไปเก่า
export async function listReceivedEvents(filters: ReceivedEventFilters, page: number, limit: number): Promise<{ items: ReceivedEventDto[]; total: number }> {
  const where = buildWhere(filters);
  const [items, total] = await Promise.all([
    prisma.receivedEvent.findMany({ where, orderBy: { id: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.receivedEvent.count({ where }),
  ]);

  return { items: items.map(mapReceivedEvent), total };
}

// Function ดึง event จาก id
export async function findReceivedEventById(id: number): Promise<ReceivedEventDto | null> {
  const row = await prisma.receivedEvent.findUnique({ where: { id } });

  return row ? mapReceivedEvent(row) : null;
}

// Function ลบ event ที่เก่ากว่าเวลาที่กำหนด คืนจำนวนที่ลบ
export async function deleteReceivedEventsBefore(before: Date): Promise<number> {
  const { count } = await prisma.receivedEvent.deleteMany({ where: { createdAt: { lt: before } } });

  return count;
}
