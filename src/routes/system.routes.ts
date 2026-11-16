// Import Config
import { prisma } from "../db/prisma";
// Import Utils
import { createRouter, sendJson } from "../utils/http";

const router = createRouter();

/* -------------------------------------- Types -------------------------------------- */

type CheckResult = { status: "ok" | "error"; message?: string; latency_ms?: number };

/* -------------------------------------- Functions -------------------------------------- */

// Function เช็คการเชื่อมต่อ DB พร้อมวัดเวลาตอบกลับ
async function checkDatabase(): Promise<CheckResult> {
  const startedAt = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", latency_ms: Math.round(performance.now() - startedAt) };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message.trim() : "Database unavailable.",
      latency_ms: Math.round(performance.now() - startedAt),
    };
  }
}

// Function เช็คว่าตั้ง LINE_CHANNEL_SECRET ไว้หรือยัง (ไม่ตั้งจะตรวจ signature ไม่ได้)
function checkLineChannelSecret(): CheckResult {
  return process.env.LINE_CHANNEL_SECRET
    ? { status: "ok" }
    : { status: "error", message: "LINE_CHANNEL_SECRET is not configured." };
}

/* -------------------------------------- System Routes -------------------------------------- */

// เช็คสถานะทั้งหมดในเส้นเดียว (ตอบ 503 ถ้ามีตัวใดไม่ผ่าน)
router.get("/", async (c) => {
  const checks = {
    server: { status: "ok" } as CheckResult,
    database: await checkDatabase(),
    line_channel_secret: checkLineChannelSecret(),
  };
  const isReady = Object.values(checks).every((check) => check.status === "ok");

  return sendJson(
    c,
    {
      status: isReady ? "ok" : "error",
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.round(process.uptime()),
      checks,
    },
    isReady ? 200 : 503,
  );
});

export default router;
