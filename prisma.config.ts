import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma Client generation does not need a live database connection. Migrations do.
const url =
  process.env.DATABASE_URL ??
  "postgresql://build:build@127.0.0.1:5432/build?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url },
});
