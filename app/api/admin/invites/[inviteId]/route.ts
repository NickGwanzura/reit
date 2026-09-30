import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffUser } from "@/lib/authz";
import { hasValidOrigin, readJsonBody } from "@/lib/api-security";
import { consumeLeadRateLimit, hashClientAddress } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";
import { createStaffInviteToken, STAFF_INVITE_LIFETIME_MS } from "@/lib/staff-invite";
import { deliverStaffInvite } from "@/lib/staff-invite-delivery";

const paramsSchema = z.object({ inviteId: z.string().min(1).max(64) });

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ inviteId: string }> }) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (staff.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Only a super admin can resend invitations." }, { status: 403 });
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return NextResponse.json({ error: "Staff invitations require RESEND_API_KEY and EMAIL_FROM to be configured." }, { status: 503 });
  }

  const parsedParams = paramsSchema.safeParse(await context.params);
  if (!parsedParams.success) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  const { inviteId } = parsedParams.data;
  const ipHash = hashClientAddress(request);
  if (!(await consumeLeadRateLimit(`staff-invite:${staff.id}:${ipHash}`, 12))) {
    return NextResponse.json({ error: "Invitation limit reached. Try again later." }, { status: 429 });
  }
  const existing = await prisma.staffInvite.findUnique({ where: { id: inviteId } });
  if (!existing || existing.acceptedAt || existing.revokedAt) {
    return NextResponse.json({ error: "This invitation is no longer available to resend." }, { status: 409 });
  }
  const account = await prisma.user.findUnique({ where: { email: existing.email }, select: { id: true } });
  if (account) return NextResponse.json({ error: "A staff account already exists for this email." }, { status: 409 });

  const { token, tokenHash } = createStaffInviteToken();
  const expiresAt = new Date(Date.now() + STAFF_INVITE_LIFETIME_MS);
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const changed = await tx.staffInvite.updateMany({
        where: { id: inviteId, tokenHash: existing.tokenHash, acceptedAt: null, revokedAt: null },
        data: { tokenHash, expiresAt, sentAt: null },
      });
      if (changed.count !== 1) return null;
      await tx.auditLog.create({
        data: {
          actorUserId: staff.id,
          action: "STAFF_INVITE_RESEND_REQUESTED",
          entityType: "StaffInvite",
          entityId: inviteId,
          newValue: { email: existing.email, expiresAt: expiresAt.toISOString() },
          ipHash,
        },
      });
      return { ...existing, tokenHash, expiresAt, sentAt: null };
    });
    if (!updated) return NextResponse.json({ error: "This invitation changed. Refresh the page and try again." }, { status: 409 });

    const delivered = await deliverStaffInvite(updated, token, staff.id, ipHash);
    return NextResponse.json({
      delivery: delivered ? "sent" : "failed",
      message: delivered ? "A fresh invitation link was emailed. Any previous link has been invalidated." : "Email delivery failed. Try resending again.",
      sentAt: delivered ? new Date().toISOString() : null,
      expiresAt: expiresAt.toISOString(),
    }, { status: delivered ? 200 : 502 });
  } catch {
    console.error("Staff invitation could not be resent.");
    return NextResponse.json({ error: "Could not resend this staff invitation." }, { status: 503 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ inviteId: string }> }) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (staff.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Only a super admin can revoke invitations." }, { status: 403 });

  const parsedParams = paramsSchema.safeParse(await context.params);
  if (!parsedParams.success) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  const { inviteId } = parsedParams.data;
  const ipHash = hashClientAddress(request);

  try {
    const revoked = await prisma.$transaction(async (tx) => {
      const invite = await tx.staffInvite.findUnique({ where: { id: inviteId }, select: { email: true, role: true, acceptedAt: true, revokedAt: true } });
      if (!invite || invite.acceptedAt || invite.revokedAt) return false;
      const changed = await tx.staffInvite.updateMany({
        where: { id: inviteId, acceptedAt: null, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      if (changed.count !== 1) return false;
      await tx.auditLog.create({
        data: {
          actorUserId: staff.id,
          action: "STAFF_INVITE_REVOKED",
          entityType: "StaffInvite",
          entityId: inviteId,
          oldValue: { email: invite.email, role: invite.role },
          ipHash,
        },
      });
      return true;
    });
    if (!revoked) return NextResponse.json({ error: "This invitation is already accepted, revoked, or unavailable." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch {
    console.error("Staff invitation could not be revoked.");
    return NextResponse.json({ error: "Could not revoke this staff invitation." }, { status: 503 });
  }
}
