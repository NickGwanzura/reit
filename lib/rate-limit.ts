import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";

export function hashClientAddress(request: Request) {
  const address =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "address-unavailable";
  return createHash("sha256").update(address).digest("hex");
}

export async function consumeLeadRateLimit(key: string, limit = 10) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 60 * 60 * 1000);
  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "RateLimitBucket" ("key", "count", "windowStart", "updatedAt")
    VALUES (${key}, 1, ${now}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."windowStart" <= ${windowStart} THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimitBucket"."windowStart" <= ${windowStart} THEN ${now}
        ELSE "RateLimitBucket"."windowStart"
      END,
      "updatedAt" = ${now}
    RETURNING "count"
  `;
  return rows[0]?.count <= limit;
}
