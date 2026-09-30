import { redirect } from "next/navigation";
import { AdminFrame } from "@/app/admin/admin-frame";
import { getStaffUser } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function readable(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AdminAuditPage() {
  const staff = await getStaffUser({ allowPasswordChange: true });
  if (!staff) redirect("/admin/login");
  if (staff.mustChangePassword) redirect("/admin/security?required=1");
  if (staff.role !== "SUPER_ADMIN") redirect("/admin");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 250,
    include: { actor: { select: { name: true, email: true } } },
  });

  return (
    <AdminFrame name={staff.name} role={staff.role}>
      <main className="crm-main crm-audit-main">
        <div className="crm-page-heading">
          <div><p className="crm-kicker">SECURITY & ACCOUNTABILITY</p><h1>Audit log</h1><p>Recent staff and CRM actions, newest first. Investor contact details and raw record values are intentionally excluded.</p></div>
          <span className="crm-team-count">Latest {logs.length} events</span>
        </div>
        <section className="crm-audit-card" aria-label="Recent CRM audit events">
          {logs.length ? <div className="crm-audit-table-wrap"><table className="crm-audit-table"><thead><tr><th scope="col">When</th><th scope="col">Action</th><th scope="col">Record type</th><th scope="col">Performed by</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td><time dateTime={log.createdAt.toISOString()}>{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(log.createdAt)}</time></td><td><span className="crm-audit-action">{readable(log.action)}</span></td><td>{readable(log.entityType)}</td><td>{log.actor?.name ?? "System"}{log.actor?.email && <small>{log.actor.email}</small>}</td></tr>)}</tbody></table></div> : <p className="crm-report-empty">No CRM audit events have been recorded yet.</p>}
          <p className="crm-report-footnote">For privacy, this view omits raw before-and-after data and client network identifiers.</p>
        </section>
      </main>
    </AdminFrame>
  );
}
