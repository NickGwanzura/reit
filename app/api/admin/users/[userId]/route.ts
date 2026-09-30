import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffUser } from "@/lib/authz";
import { hasValidOrigin } from "@/lib/api-security";
import { hashClientAddress } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";
import { decideUserRemoval } from "@/lib/user-access";

const paramsSchema = z.object({ userId: z.string().min(1).max(64) });
export const runtime = "nodejs";

export async function DELETE(request: Request, context: { params: Promise<{ userId: string }> }) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (staff.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Only a super admin can remove staff access." }, { status: 403 });

  const parsedParams = paramsSchema.safeParse(await context.params);
  if (!parsedParams.success) return NextResponse.json({ error: "Staff account not found." }, { status: 404 });
  const { userId } = parsedParams.data;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id: userId }, select: { id: true, role: true, isActive: true } });
      if (!target) return "not-found" as const;
      const activeAdmins = target.role === "SUPER_ADMIN"
        ? await tx.user.count({ where: { role: "SUPER_ADMIN", isActive: true } })
        : Number.POSITIVE_INFINITY;
      const decision = decideUserRemoval(target, staff.id, activeAdmins);
      if (decision === "self") return "self" as const;
      if (decision === "not-staff") return "not-found" as const;
      if (decision === "inactive") return "already-disabled" as const;
      if (decision === "last-admin") return "last-admin" as const;

      const changed = await tx.user.updateMany({
        where: { id: userId, isActive: true },
        data: { isActive: false, sessionVersion: { increment: 1 } },
      });
      if (changed.count !== 1) return "already-disabled" as const;
      const unassignedLeads = await tx.lead.updateMany({ where: { assignedUserId: userId }, data: { assignedUserId: null } });
      const unassignedTasks = await tx.task.updateMany({ where: { assignedToId: userId }, data: { assignedToId: null } });
      await tx.auditLog.create({
        data: {
          actorUserId: staff.id,
          action: "USER_ACCESS_REVOKED",
          entityType: "User",
          entityId: userId,
          oldValue: { role: target.role, isActive: true, assignedLeads: unassignedLeads.count, assignedTasks: unassignedTasks.count },
          newValue: { role: target.role, isActive: false, assignedLeads: 0, assignedTasks: 0 },
          ipHash: hashClientAddress(request),
        },
      });
      return "removed" as const;
    }, { isolationLevel: "Serializable" });

    if (result === "not-found") return NextResponse.json({ error: "Staff account not found." }, { status: 404 });
    if (result === "self") return NextResponse.json({ error: "You cannot remove your own access." }, { status: 409 });
    if (result === "already-disabled") return NextResponse.json({ error: "This staff account is already inactive." }, { status: 409 });
    if (result === "last-admin") return NextResponse.json({ error: "The last active super-admin account cannot be removed." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch {
    console.error("Staff access could not be revoked.");
    return NextResponse.json({ error: "Could not remove staff access. Refresh and try again." }, { status: 503 });
  }
}
