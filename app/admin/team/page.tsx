import { redirect } from "next/navigation";
import { AdminFrame } from "@/app/admin/admin-frame";
import { TeamForm } from "@/app/admin/team-form";
import { getStaffUser } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const staff = await getStaffUser({ allowPasswordChange: true });
  if (!staff) redirect("/admin/login");
  if (staff.mustChangePassword) redirect("/admin/security?required=1");
  if (staff.role !== "SUPER_ADMIN") redirect("/admin");

  const [users, invites] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "FUND_MANAGER", "RELATIONSHIP_MANAGER"] } },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    }),
    prisma.staffInvite.findMany({
      select: { id: true, name: true, email: true, role: true, expiresAt: true, sentAt: true, acceptedAt: true, revokedAt: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <AdminFrame name={staff.name} role={staff.role}>
      <main className="crm-main crm-team-main">
        <div className="crm-page-heading">
          <div><p className="crm-kicker">PEOPLE & PERMISSIONS</p><h1>Team access</h1><p>Invite trusted staff and manage access to the private lead workspace.</p></div>
        </div>
        <TeamForm
          initialUsers={users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString() }))}
          initialInvites={invites.map((invite) => ({ ...invite, expiresAt: invite.expiresAt.toISOString(), sentAt: invite.sentAt?.toISOString() ?? null, acceptedAt: invite.acceptedAt?.toISOString() ?? null, revokedAt: invite.revokedAt?.toISOString() ?? null }))}
        />
      </main>
    </AdminFrame>
  );
}
