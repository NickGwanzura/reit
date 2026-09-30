import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffUser } from "@/lib/authz";
import { hasValidOrigin, readJsonBody } from "@/lib/api-security";
import { consumeLeadRateLimit, hashClientAddress } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";
import { createStaffInviteToken, STAFF_INVITE_LIFETIME_MS } from "@/lib/staff-invite";
import { deliverStaffInvite } from "@/lib/staff-invite-delivery";

const inviteSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  role: z.enum(["FUND_MANAGER", "RELATIONSHIP_MANAGER"]),
}).strict();

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (staff.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Only a super admin can invite staff." }, { status: 403 });

  const body = await readJsonBody(request, 4096);
  if (!body.ok) return NextResponse.json({ error: body.tooLarge ? "Request is too large." : "Invalid request body." }, { status: body.tooLarge ? 413 : 400 });
  const parsed = inviteSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Provide a name, valid email, and supported staff role." }, { status: 400 });
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return NextResponse.json({ error: "Staff invitations require RESEND_API_KEY and EMAIL_FROM to be configured." }, { status: 503 });
  }

  const email = parsed.data.email.toLowerCase();
  const ipHash = hashClientAddress(request);
  if (!(await consumeLeadRateLimit(`staff-invite:${staff.id}:${ipHash}`, 12))) {
    return NextResponse.json({ error: "Invitation limit reached. Try again later." }, { status: 429 });
  }
  const { token, tokenHash } = createStaffInviteToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + STAFF_INVITE_LIFETIME_MS);

  try {
    const created = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email }, select: { id: true } });
      if (existingUser) return { kind: "user-exists" as const };

      const pending = await tx.staffInvite.findFirst({
        where: { email, acceptedAt: null, revokedAt: null },
        orderBy: { createdAt: "desc" },
      });
      if (pending && pending.expiresAt > now) return { kind: "invite-exists" as const, invite: pending };

      const invite = pending
        ? await tx.staffInvite.update({
            where: { id: pending.id },
            data: { name: parsed.data.name, role: parsed.data.role, tokenHash, expiresAt, sentAt: null, invitedById: staff.id },
          })
        : await tx.staffInvite.create({
            data: { email, name: parsed.data.name, role: parsed.data.role, tokenHash, expiresAt, invitedById: staff.id },
          });

      await tx.auditLog.create({
        data: {
          actorUserId: staff.id,
          action: pending ? "STAFF_INVITE_RENEWED" : "STAFF_INVITE_CREATED",
          entityType: "StaffInvite",
          entityId: invite.id,
          newValue: { email, role: invite.role, expiresAt: invite.expiresAt.toISOString() },
          ipHash,
        },
      });
      return { kind: "created" as const, invite };
    });

    if (created.kind === "user-exists") {
      return NextResponse.json({ error: "A staff account already uses that email address." }, { status: 409 });
    }
    if (created.kind === "invite-exists") {
      return NextResponse.json({ error: "An unexpired invitation already exists. Resend it from the pending invitations list." }, { status: 409 });
    }

    const delivered = await deliverStaffInvite(created.invite, token, staff.id, ipHash);
    return NextResponse.json({
      invite: {
        id: created.invite.id,
        name: created.invite.name,
        email: created.invite.email,
        role: created.invite.role,
        expiresAt: created.invite.expiresAt.toISOString(),
        sentAt: delivered ? new Date().toISOString() : null,
        acceptedAt: null,
        revokedAt: null,
      },
      delivery: delivered ? "sent" : "failed",
      message: delivered ? "Invitation email sent." : "Invitation saved, but email delivery failed. You can retry from the pending invitations list.",
    }, { status: delivered ? 201 : 502 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "An invitation for this email was just created. Refresh the list and try resending it." }, { status: 409 });
    }
    console.error("Staff invitation could not be created.");
    return NextResponse.json({ error: "Could not create this staff invitation." }, { status: 503 });
  }
}
