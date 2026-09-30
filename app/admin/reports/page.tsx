import { redirect } from "next/navigation";
import { AdminFrame } from "@/app/admin/admin-frame";
import { LeadReports, type LeadReportData } from "@/app/admin/reports/report-view";
import { getStaffUser, leadWhereFor } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", year: "2-digit", timeZone: "UTC" }).format(date);
}

export default async function AdminReportsPage() {
  const staff = await getStaffUser({ allowPasswordChange: true });
  if (!staff) redirect("/admin/login");
  if (staff.mustChangePassword) redirect("/admin/security?required=1");

  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const previous30 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const leadWhere = leadWhereFor(staff);
  const [totalLeads, leadsLast30, leadsPrevious30, totalEnquiries, enquiriesLast30, onboarded, statusGroups, sourceGroups, recentLeads, openTasks, overdueTasks] = await Promise.all([
    prisma.lead.count({ where: leadWhere }),
    prisma.lead.count({ where: { ...leadWhere, createdAt: { gte: last30 } } }),
    prisma.lead.count({ where: { ...leadWhere, createdAt: { gte: previous30, lt: last30 } } }),
    prisma.enquiry.count({ where: { lead: leadWhere } }),
    prisma.enquiry.count({ where: { lead: leadWhere, createdAt: { gte: last30 } } }),
    prisma.lead.count({ where: { ...leadWhere, status: "ONBOARDED_INVESTOR" } }),
    prisma.lead.groupBy({ by: ["status"], where: leadWhere, _count: { _all: true }, orderBy: { status: "asc" } }),
    prisma.lead.groupBy({ by: ["source"], where: leadWhere, _count: { _all: true }, orderBy: { source: "asc" } }),
    prisma.lead.findMany({ where: { ...leadWhere, createdAt: { gte: monthStart } }, select: { createdAt: true } }),
    prisma.task.count({ where: { lead: leadWhere, status: "OPEN" } }),
    prisma.task.count({ where: { lead: leadWhere, status: "OPEN", dueAt: { lt: now } } }),
  ]);

  const trend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    return { label: monthLabel(date), count: recentLeads.reduce((count, lead) => count + (lead.createdAt.toISOString().slice(0, 7) === key ? 1 : 0), 0) };
  });
  const data: LeadReportData = {
    generatedAt: now.toISOString(),
    totalLeads,
    leadsLast30,
    leadsPrevious30,
    totalEnquiries,
    enquiriesLast30,
    onboarded,
    openTasks,
    overdueTasks,
    trend,
    statuses: statusGroups.map((item) => ({ name: item.status, count: item._count._all })),
    sources: sourceGroups.map((item) => ({ name: item.source || "Not specified", count: item._count._all })),
  };

  return (
    <AdminFrame name={staff.name} role={staff.role}>
      <main className="crm-main crm-report-main">
        <div className="crm-page-heading">
          <div><p className="crm-kicker">LEAD PERFORMANCE</p><h1>CRM reports</h1><p>Lead pipeline, enquiry activity and follow-up workload. {staff.role === "RELATIONSHIP_MANAGER" ? "Figures are limited to leads assigned to you." : "Figures cover the full CRM."}</p></div>
        </div>
        <LeadReports data={data} />
      </main>
    </AdminFrame>
  );
}
