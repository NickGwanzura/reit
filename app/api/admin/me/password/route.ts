import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffUser } from "@/lib/authz";
import { hasValidOrigin, readJsonBody } from "@/lib/api-security";
import { prisma } from "@/lib/db";

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: z.string().min(16).max(72),
}).strict();

function requestIpHash(request: Request) {
  const address = request.headers.get("x-real-ip")?.trim() || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return address ? createHash("sha256").update(address).digest("hex") : null;
}

export async function PATCH(request: Request) {
  if (!request.headers.get("origin") || !hasValidOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }
  const staff = await getStaffUser({ allowPasswordChange: true });
  if (!staff) return NextResponse.json({ error: "Sign in with an authorised staff account." }, { status: 401 });

  const body = await readJsonBody(request, 4096);
  if (!body.ok) return NextResponse.json({ error: body.tooLarge ? "Request is too large." : "A valid JSON body is required." }, { status: body.tooLarge ? 413 : 400 });
  const parsed = passwordSchema.safeParse(body.value);
  if (!parsed.success || Buffer.byteLength(parsed.data?.newPassword ?? "", "utf8") > 72 || Buffer.byteLength(parsed.data?.currentPassword ?? "", "utf8") > 72) {
    return NextResponse.json({ error: "Use the current password and a new password between 16 and 72 UTF-8 bytes." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: staff.id }, select: { passwordHash: true } });
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "The current password is incorrect." }, { status: 400 });
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json({ error: "Choose a new password that differs from the current one." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: staff.id }, data: { passwordHash, mustChangePassword: false, sessionVersion: { increment: 1 } } });
    await tx.auditLog.create({
      data: {
        actorUserId: staff.id,
        action: "PASSWORD_CHANGED",
        entityType: "User",
        entityId: staff.id,
        ipHash: requestIpHash(request),
      },
    });
  });
  return NextResponse.json({ ok: true });
}
