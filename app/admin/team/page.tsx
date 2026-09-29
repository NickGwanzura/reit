import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { TeamForm } from "@/app/admin/team-form";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const staff = await getStaffUser({ allowPasswordChange: true });
  if (!staff) redirect("/admin/login");
  if (staff.mustChangePassword) redirect("/admin/security?required=1");
  if (staff.role !== "SUPER_ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <main className="crm-shell">
      <header className="crm-header"><a className="crm-brand" href="/">MUTIRIKWI <span>REIT</span></a><nav aria-label="CRM sections"><a href="/admin">Leads</a><a className="active" href="/admin/team">Team</a></nav><div className="crm-account"><span>{staff.name}<small>Super admin</small></span><a className="crm-security-link" href="/admin/security">Security</a></div></header>
      <section className="crm-main crm-team-main">
        <div className="crm-page-heading"><div><p className="crm-kicker">ACCESS CONTROL</p><h1>Manage staff access</h1><p>Add a named fund or relationship manager account.</p></div><a className="crm-public-link" href="/admin">← Back to leads</a></div>
        <TeamForm initialUsers={users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString() }))} />
        <p className="crm-small-print">Only a super admin can create staff accounts. Accounts are not sent by email; share the one-time temporary password privately. New staff must change it before they can use the CRM.</p>
      </section>
    </main>
  );
}
