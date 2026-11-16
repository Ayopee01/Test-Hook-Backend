-- AlterTable
ALTER TABLE "received_events" DROP COLUMN "reply_status",
DROP COLUMN "reply_error",
ADD COLUMN     "error" TEXT;
