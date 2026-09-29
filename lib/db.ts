import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  reitPrisma?: PrismaClient;
};

const adapter = new PrismaPg({
  // Let the app build without production credentials; actual database access still
  // requires DATABASE_URL and is checked by the deployment entrypoint.
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://build:build@127.0.0.1:5432/build?schema=public",
});

export const prisma =
  globalForPrisma.reitPrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.reitPrisma = prisma;
}
