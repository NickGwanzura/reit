import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addHarareBusinessMinutes, isFirstContactOverdue } from "@/lib/lead-sla";
import { sendFirstContactReminderEmail } from "@/lib/email";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expectedBytes = Buffer.from(secret);
  const suppliedBytes = Buffer.from(supplied);
  return suppliedBytes.length === expectedBytes.length && timingSafeEqual(suppliedBytes, expectedBytes);
}

export async function POST(request: Request) {
  if (!process.env.CRON_SECRET) return NextResponse.json({ error: "Reminder schedule secret is not configured." }, { status: 503 });
  if (!isAuthorized(request)) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return NextResponse.json({ error: "Email delivery is not configured." }, { status: 503 });

  const now = new Date();
  const staleClaim = new Date(now.getTime() - 15 * 60 * 1000);
  const candidates = await prisma.lead.findMany({
    where: { status: "NEW_LEAD", firstContactAt: null, firstContactReminderSentAt: null, contact: { is: { doNotContactAt: null } }, createdAt: { lt: now } },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: {
      id: true,
      createdAt: true,
      assignedUser: { select: { name: true, email: true, isActive: true } },
      contact: { select: { firstName: true, lastName: true, email: true } },
    },
  });
  const dueCandidates = candidates.filter((lead) => isFirstContactOverdue(lead.createdAt, null, now));
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const lead of dueCandidates) {
    const claimed = await prisma.lead.updateMany({
      where: {
        id: lead.id,
        status: "NEW_LEAD",
        firstContactAt: null,
        firstContactReminderSentAt: null,
        OR: [{ firstContactReminderClaimedAt: null }, { firstContactReminderClaimedAt: { lt: staleClaim } }],
      },
      data: { firstContactReminderClaimedAt: now },
    });
    if (!claimed.count) { skipped += 1; continue; }

    const stillDue = await prisma.lead.findFirst({
      where: { id: lead.id, status: "NEW_LEAD", firstContactAt: null, firstContactReminderSentAt: null, contact: { is: { doNotContactAt: null } } },
      select: { id: true },
    });
    if (!stillDue) {
      await prisma.lead.updateMany({ where: { id: lead.id, firstContactReminderSentAt: null }, data: { firstContactReminderClaimedAt: null } });
      skipped += 1;
      continue;
    }

    const assignee = lead.assignedUser?.isActive ? { name: lead.assignedUser.name, email: lead.assignedUser.email } : null;
    const delivered = await sendFirstContactReminderEmail({
      leadId: lead.id,
      leadName: `${lead.contact.firstName} ${lead.contact.lastName}`,
      leadEmail: lead.contact.email,
      assignee,
      dueAt: addHarareBusinessMinutes(lead.createdAt),
    });

    if (!delivered) {
      await prisma.lead.updateMany({ where: { id: lead.id, firstContactReminderSentAt: null }, data: { firstContactReminderClaimedAt: null } });
      failed += 1;
      continue;
    }

    await prisma.$transaction([
      prisma.lead.update({ where: { id: lead.id }, data: { firstContactReminderSentAt: new Date(), firstContactReminderClaimedAt: null } }),
      prisma.auditLog.create({
        data: {
          action: "FIRST_CONTACT_REMINDER_SENT",
          entityType: "Lead",
          entityId: lead.id,
          newValue: { channel: "email", target: "assigned-manager-or-team" },
        },
      }),
    ]);
    sent += 1;
  }

  return NextResponse.json({ scanned: candidates.length, overdue: dueCandidates.length, sent, failed, skipped }, { status: failed ? 503 : 200 });
}
