import "server-only";
import { auth } from "@/auth";
import type { UserRole } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";

export type StaffUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  mustChangePassword: boolean;
};

export const CRM_ROLES: UserRole[] = ["SUPER_ADMIN", "FUND_MANAGER", "RELATIONSHIP_MANAGER"];

export async function getStaffUser(options: { allowPasswordChange?: boolean } = {}): Promise<StaffUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, isActive: true, sessionVersion: true, mustChangePassword: true },
  });
  if (
    !user?.isActive ||
    !CRM_ROLES.includes(user.role) ||
    (user.mustChangePassword && !options.allowPasswordChange) ||
    user.sessionVersion !== session.user.sessionVersion
  ) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role, mustChangePassword: user.mustChangePassword };
}

export function leadWhereFor(user: StaffUser) {
  return user.role === "RELATIONSHIP_MANAGER" ? { assignedUserId: user.id } : {};
}

export function mayManageAllLeads(user: StaffUser) {
  return user.role === "SUPER_ADMIN" || user.role === "FUND_MANAGER";
}
