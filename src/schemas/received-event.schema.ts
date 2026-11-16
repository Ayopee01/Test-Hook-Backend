// Import Library
import { z } from "zod";

/* -------------------------------------- Schemas -------------------------------------- */

// Schema ค่า "true"/"false" ใน query แปลงเป็น boolean
const booleanQuery = z.enum(["true", "false"]).transform((value) => value === "true");

// Schema query ของการค้นหา event
export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  event_type: z.string().trim().min(1).optional(),
  line_user_id: z.string().trim().min(1).optional(),
  signature_valid: booleanQuery.optional(),
  has_error: booleanQuery.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// Schema param id ของ event
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/* -------------------------------------- Types -------------------------------------- */

// Type query ที่ผ่าน validation แล้ว
export type ListQuery = z.output<typeof listQuerySchema>;
