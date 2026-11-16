// Import Config
import { readPositiveIntegerEnv } from "./env";

/* -------------------------------------- Config -------------------------------------- */

// Config พฤติกรรมของ test-hook
export const TEST_HOOK_CONFIG = {
  maxContentLength: 1000,
  retentionDays: readPositiveIntegerEnv("RECEIVED_EVENT_RETENTION_DAYS", 30),
  cleanupIntervalMs: 6 * 60 * 60 * 1000,
};
