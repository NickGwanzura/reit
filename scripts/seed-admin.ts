import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const email = process.env.CRM_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.CRM_ADMIN_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error("DATABASE_URL must be set before seeding a CRM admin.");
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("Set CRM_ADMIN_EMAIL to the initial authorised staff email.");
}
if (!password || password.length < 16 || password.length > 72 || Buffer.byteLength(password, "utf8") > 72) {
  throw new Error("Set CRM_ADMIN_PASSWORD to a unique password of 16 to 72 UTF-8 bytes.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

try {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    console.log("The CRM staff account already exists; no credentials were changed.");
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
        passwordHash,
        role: "SUPER_ADMIN",
        mustChangePassword: true,
      },
    });
    console.log("Initial SUPER_ADMIN account created. Remove CRM_ADMIN_PASSWORD from the app environment after bootstrap.");
  }
} finally {
  await prisma.$disconnect();
}
