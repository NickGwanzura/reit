const CRM_STAFF_ROLES = ["SUPER_ADMIN", "FUND_MANAGER", "RELATIONSHIP_MANAGER"] as const;

export type RemovableAccount = { id: string; role: string; isActive: boolean };
export type UserRemovalDecision = "remove" | "self" | "not-staff" | "inactive" | "last-admin";

export function decideUserRemoval(target: RemovableAccount, actorId: string, activeSuperAdminCount: number): UserRemovalDecision {
  if (target.id === actorId) return "self";
  if (!CRM_STAFF_ROLES.includes(target.role as (typeof CRM_STAFF_ROLES)[number])) return "not-staff";
  if (!target.isActive) return "inactive";
  if (target.role === "SUPER_ADMIN" && activeSuperAdminCount <= 1) return "last-admin";
  return "remove";
}
