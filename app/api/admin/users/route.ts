import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getStaffUser } from "@/lib/authz";
import { hasValidOrigin, readJsonBody } from "@/lib/api-security";
import { hashClientAddress } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  role: z.enum(["FUND_MANAGER", "RELATIONSHIP_MANAGER"]),
  temporaryPassword: z.string().min(16).max(72),
}).strict();

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (staff.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Only a super admin can add staff." }, { status: 403 });

  const body = await readJsonBody(request, 4096);
  if (!body.ok) return NextResponse.json({ error: body.tooLarge ? "Request is too large." : "Invalid request body." }, { status: body.tooLarge ? 413 : 400 });
  const parsed = createUserSchema.safeParse(body.value);
  if (!parsed.success || Buffer.byteLength(parsed.data?.temporaryPassword ?? "", "utf8") > 72) {
    return NextResponse.json({ error: "Provide a name, valid email, supported role, and a 16–72 byte temporary password." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.data.temporaryPassword, 12);
  try {
    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, name: parsed.data.name, passwordHash, role: parsed.data.role, mustChangePassword: true },
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: staff.id,
          action: "STAFF_ACCOUNT_CREATED",
          entityType: "User",
          entityId: user.id,
          newValue: { email: user.email, role: user.role },
          ipHash: hashClientAddress(request),
        },
      });
      return user;
    });
    return NextResponse.json({
      user: { ...created, createdAt: created.createdAt.toISOString() },
      mustChangePassword: true,
    }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "A staff account already uses that email address." }, { status: 409 });
    }
    console.error("Staff account could not be created.");
    return NextResponse.json({ error: "Could not add this staff account." }, { status: 503 });
  }
}
