import "server-only";
import { prisma } from "@/lib/db";
import { sendStaffInviteEmail } from "@/lib/email";

type InviteForEmail = {
  id: string;
  email: string;
  name: string;
  role: string;
  expiresAt: Date;
};

export async function deliverStaffInvite(
  invite: InviteForEmail,
  token: string,
  actorUserId: string,
  ipHash: string | null,
) {
  const role = invite.role;
  if (role !== "FUND_MANAGER" && role !== "RELATIONSHIP_MANAGER") return false;
  const baseUrl = (process.env.AUTH_URL ?? "https://mutirikwireitzim.com").replace(/\/+$/, "");
  const inviteUrl = new URL("/admin/accept-invite", baseUrl);
  inviteUrl.searchParams.set("token", token);
  const sent = await sendStaffInviteEmail({
    email: invite.email,
    name: invite.name,
    role,
    inviteUrl: inviteUrl.toString(),
    expiresAt: invite.expiresAt,
  });
  if (!sent) return false;

  let recorded = false;
  await prisma.$transaction(async (tx) => {
    const updated = await tx.staffInvite.updateMany({
      where: { id: invite.id, acceptedAt: null, revokedAt: null },
      data: { sentAt: new Date() },
    });
    if (updated.count !== 1) return;
    await tx.auditLog.create({
      data: {
        actorUserId,
        action: "STAFF_INVITE_EMAIL_SENT",
        entityType: "StaffInvite",
        entityId: invite.id,
        newValue: { email: invite.email, role: invite.role },
        ipHash,
      },
    });
    recorded = true;
  });
  return recorded;
}
