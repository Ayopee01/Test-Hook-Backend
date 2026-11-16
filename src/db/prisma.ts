// Import Library
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
// Import Config
import { readPositiveIntegerEnv, readRequiredEnv } from "../config/env";

/* -------------------------------------- Config -------------------------------------- */

// Config Prisma client ตัวเดียวของ process (สร้างแบบ lazy)
let prismaClient: PrismaClient | null = null;

/* -------------------------------------- Functions -------------------------------------- */

// Function สร้าง Prisma client พร้อม adapter ของ PostgreSQL
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: readRequiredEnv("DATABASE_URL"),
    max: readPositiveIntegerEnv("DATABASE_POOL_MAX", 5),
  });

  return new PrismaClient({ adapter, log: ["error", "warn"] });
}

// Function คืน Prisma client ตัวเดียวของ process
export function getPrisma(): PrismaClient {
  prismaClient ??= createPrismaClient();
  return prismaClient;
}

// Function proxy ให้ import prisma ได้ทันที แต่สร้าง client จริงตอนใช้งานครั้งแรก
export const prisma = new Proxy({} as PrismaClient, {
  get(target, property, receiver) {
    return Reflect.get(getPrisma(), property, receiver ?? target);
  },
});

// Function ปิด Prisma client ตอน shutdown
export async function closePrisma(): Promise<void> {
  if (!prismaClient) {
    return;
  }

  await prismaClient.$disconnect();
  prismaClient = null;
}
