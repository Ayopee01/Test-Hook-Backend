/* -------------------------------------- Types -------------------------------------- */

// Type ข้อมูลที่ใช้บันทึก event ที่ได้รับ
export type ReceivedEventCreateInput = {
  request_id: string;
  signature_valid: boolean;
  destination: string | null;
  webhook_event_id: string | null;
  line_user_id: string | null;
  event_type: string | null;
  message_type: string | null;
  content: string | null;
  payload: unknown;
  response_status: number;
  error: string | null;
};

// Type event ที่ได้รับสำหรับตอบ API
export type ReceivedEventDto = ReceivedEventCreateInput & {
  id: number;
  created_at: Date;
};

// Type filter ของการค้นหา event
export type ReceivedEventFilters = {
  event_type?: string;
  line_user_id?: string;
  signature_valid?: boolean;
  has_error?: boolean;
  from?: Date;
  to?: Date;
};

// Type response ของรายการ event แบบแบ่งหน้า
export type ReceivedEventListResponse = {
  data: ReceivedEventDto[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
};
