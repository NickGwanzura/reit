import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffUser, leadWhereFor, mayManageAllLeads } from "@/lib/authz";
import { hasValidOrigin, readJsonBody } from "@/lib/api-security";
import { hashClientAddress } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

const taskUpdateSchema = z.object({ status: z.literal("COMPLETED") }).strict();

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/tasks/[taskId]">) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await readJsonBody(request, 2048);
  if (!body.ok) return NextResponse.json({ error: body.tooLarge ? "Request is too large." : "Invalid request body." }, { status: body.tooLarge ? 413 : 400 });
  const parsed = taskUpdateSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Invalid task update." }, { status: 400 });
  const { taskId } = await context.params;

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { lead: { select: { assignedUserId: true } } } });
    if (!task || (staff.role === "RELATIONSHIP_MANAGER" && task.assignedToId !== staff.id)) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }
    const canManage = mayManageAllLeads(staff) || task.assignedToId === staff.id;
    if (!canManage || (!mayManageAllLeads(staff) && task.lead.assignedUserId !== staff.id)) {
      return NextResponse.json({ error: "You cannot update this task." }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id: task.id },
        data: { status: parsed.data.status, completedAt: new Date() },
      });
      await tx.activity.create({
        data: { leadId: task.leadId, actorUserId: staff.id, type: "TASK_COMPLETED", body: `Follow-up completed: ${task.title}` },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: staff.id,
          action: "TASK_COMPLETED",
          entityType: "Task",
          entityId: task.id,
          oldValue: { status: task.status },
          newValue: { status: updated.status },
          ipHash: hashClientAddress(request),
        },
      });
      await tx.lead.update({ where: { id: task.leadId }, data: { updatedAt: new Date() } });
    });
    return NextResponse.json({ completed: true });
  } catch {
    console.error("CRM task update could not be saved.");
    return NextResponse.json({ error: "Could not update this task." }, { status: 503 });
  }
}
