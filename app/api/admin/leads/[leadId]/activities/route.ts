import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffUser, leadWhereFor } from "@/lib/authz";
import { hasValidOrigin, readJsonBody } from "@/lib/api-security";
import { hashClientAddress } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

const activitySchema = z.object({
  type: z.enum(["NOTE_ADDED", "PHONE_CALL", "WHATSAPP_MESSAGE", "EMAIL", "MEETING"]),
  body: z.string().trim().min(2).max(5000),
}).strict();

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext<"/api/admin/leads/[leadId]/activities">) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await readJsonBody(request, 8192);
  if (!body.ok) return NextResponse.json({ error: body.tooLarge ? "Request is too large." : "Invalid request body." }, { status: body.tooLarge ? 413 : 400 });
  const parsed = activitySchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid note or contact log." }, { status: 400 });
  const { leadId } = await context.params;

  try {
    const lead = await prisma.lead.findFirst({ where: { id: leadId, ...leadWhereFor(staff) }, select: { id: true } });
    if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    const activity = await prisma.$transaction(async (tx) => {
      const row = await tx.activity.create({
        data: { leadId, actorUserId: staff.id, type: parsed.data.type, body: parsed.data.body },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: staff.id,
          action: parsed.data.type,
          entityType: "Lead",
          entityId: leadId,
          newValue: { activityId: row.id, type: parsed.data.type },
          ipHash: hashClientAddress(request),
        },
      });
      await tx.lead.update({ where: { id: leadId }, data: { updatedAt: new Date() } });
      return row;
    });
    return NextResponse.json({ id: activity.id, createdAt: activity.createdAt.toISOString() }, { status: 201 });
  } catch {
    console.error("CRM activity could not be saved.");
    return NextResponse.json({ error: "Could not save this activity." }, { status: 503 });
  }
}
