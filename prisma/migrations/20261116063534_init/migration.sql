-- CreateTable
CREATE TABLE "received_events" (
    "id" SERIAL NOT NULL,
    "request_id" TEXT NOT NULL,
    "signature_valid" BOOLEAN NOT NULL,
    "destination" TEXT,
    "webhook_event_id" TEXT,
    "line_user_id" TEXT,
    "event_type" TEXT,
    "message_type" TEXT,
    "content" TEXT,
    "payload" JSONB,
    "response_status" INTEGER NOT NULL,
    "reply_status" TEXT,
    "reply_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "received_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "received_events_created_at_idx" ON "received_events"("created_at");

-- CreateIndex
CREATE INDEX "received_events_event_type_created_at_idx" ON "received_events"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "received_events_line_user_id_created_at_idx" ON "received_events"("line_user_id", "created_at");
