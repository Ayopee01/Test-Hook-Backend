// Import App
import app from "./src/app";
// Import Config
import { TEST_HOOK_CONFIG } from "./src/config/test-hook.config";
import { closePrisma } from "./src/db/prisma";
// Import Services
import { deleteExpiredReceivedEvents } from "./src/services/received-event.service";
// Import Utils
import { logger } from "./src/utils/logger";

/* -------------------------------------- Config -------------------------------------- */

// Config host และ port (Bun โหลด .env ให้อัตโนมัติ)
const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST || "0.0.0.0";

/* -------------------------------------- Functions -------------------------------------- */

// Function ลบ event ที่หมดอายุ (error แค่เขียน log)
function cleanupReceivedEvents(): void {
  deleteExpiredReceivedEvents()
    .then((deleted) => deleted > 0 && logger.info("Deleted expired received events.", { deleted }))
    .catch((error: unknown) => logger.error("Failed to delete expired received events.", { error }));
}

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled promise rejection.", { error: reason });
});

const server = Bun.serve({ fetch: app.fetch, port: PORT, hostname: HOST });

logger.info("Server started.", { host: HOST, port: PORT });
cleanupReceivedEvents();

const cleanupTimer = setInterval(cleanupReceivedEvents, TEST_HOOK_CONFIG.cleanupIntervalMs);
cleanupTimer.unref();

// Function ปิด server แบบ graceful
async function shutdown(signal: string): Promise<void> {
  logger.info("Shutting down.", { signal });
  clearInterval(cleanupTimer);
  await server.stop();
  await closePrisma();
  process.exit(0);
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
