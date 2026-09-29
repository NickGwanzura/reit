import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffUser, leadWhereFor } from "@/lib/authz";
import { hasValidOrigin, readJsonBody } from "@/lib/api-security";
import { hashClientAddress } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

const taskSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(["CALL", "EMAIL", "WHATSAPP", "MEETING", "FOLLOW_UP"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]),
  dueAt: z.string().datetime().optional(),
}).strict();

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext<"/api/admin/leads/[leadId]/tasks">) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await readJsonBody(request, 4096);
  if (!body.ok) return NextResponse.json({ error: body.tooLarge ? "Request is too large." : "Invalid request body." }, { status: body.tooLarge ? 413 : 400 });
  const parsed = taskSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Enter a task title and valid due date." }, { status: 400 });
  const { leadId } = await context.params;

  try {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, ...leadWhereFor(staff) },
      select: { id: true, assignedUserId: true },
    });
    if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    const created = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          leadId,
          createdById: staff.id,
          assignedToId: lead.assignedUserId ?? staff.id,
          title: parsed.data.title,
          description: parsed.data.description,
          type: parsed.data.type,
          priority: parsed.data.priority,
          dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : undefined,
        },
      });
      await tx.activity.create({
        data: { leadId, actorUserId: staff.id, type: "TASK_CREATED", body: `Follow-up task created: ${task.title}` },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: staff.id,
          action: "TASK_CREATED",
          entityType: "Task",
          entityId: task.id,
          newValue: { leadId, type: task.type, priority: task.priority, dueAt: task.dueAt?.toISOString() ?? null },
          ipHash: hashClientAddress(request),
        },
      });
      return task;
    });
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch {
    console.error("CRM task could not be saved.");
    return NextResponse.json({ error: "Could not create this task." }, { status: 503 });
  }
}
