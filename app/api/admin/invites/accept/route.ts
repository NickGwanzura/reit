import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { hasValidOrigin, readJsonBody } from "@/lib/api-security";
import { prisma } from "@/lib/db";
import { hashStaffInviteToken, isStaffInviteToken } from "@/lib/staff-invite";

const acceptSchema = z.object({
  token: z.string().min(1).max(64),
  password: z.string().min(16).max(72),
}).strict();

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const body = await readJsonBody(request, 4096);
  if (!body.ok) return NextResponse.json({ error: body.tooLarge ? "Request is too large." : "Invalid request body." }, { status: body.tooLarge ? 413 : 400 });
  const parsed = acceptSchema.safeParse(body.value);
  if (!parsed.success || !isStaffInviteToken(parsed.data?.token) || Buffer.byteLength(parsed.data?.password ?? "", "utf8") > 72) {
    return NextResponse.json({ error: "Use a valid invitation and choose a password of 16–72 UTF-8 bytes." }, { status: 400 });
  }

  const tokenHash = hashStaffInviteToken(parsed.data.token);
  const invite = await prisma.staffInvite.findUnique({ where: { tokenHash } });
  const now = new Date();
  if (!invite || invite.acceptedAt || invite.revokedAt || invite.expiresAt <= now) {
    return NextResponse.json({ error: "This invitation is invalid, expired, or already used. Ask a super admin to send a fresh one." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  try {
    const accepted = await prisma.$transaction(async (tx) => {
      const claimed = await tx.staffInvite.updateMany({
        where: { id: invite.id, tokenHash, acceptedAt: null, revokedAt: null, expiresAt: { gt: now } },
        data: { acceptedAt: now },
      });
      if (claimed.count !== 1) return false;

      const user = await tx.user.create({
        data: {
          email: invite.email,
          name: invite.name,
          role: invite.role,
          passwordHash,
          mustChangePassword: false,
        },
        select: { id: true },
      });
      await tx.auditLog.create({
        data: {
          action: "STAFF_INVITE_ACCEPTED",
          entityType: "StaffInvite",
          entityId: invite.id,
          newValue: { email: invite.email, role: invite.role, userId: user.id },
        },
      });
      return true;
    });
    if (!accepted) return NextResponse.json({ error: "This invitation has already been used or is no longer available." }, { status: 409 });
    return NextResponse.json({ ok: true, email: invite.email });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "A staff account already exists for this invitation. Contact a super admin." }, { status: 409 });
    }
    console.error("Staff invitation could not be accepted.");
    return NextResponse.json({ error: "Could not activate this staff account." }, { status: 503 });
  }
}
