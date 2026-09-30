import { redirect } from "next/navigation";
import { AdminFrame } from "@/app/admin/admin-frame";
import { LeadReports } from "@/app/admin/reports/report-view";
import { getStaffUser } from "@/lib/authz";
import { buildLeadReport } from "@/lib/lead-reporting";
import { resolveReportRange } from "@/lib/lead-report-range";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const single = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function AdminReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const staff = await getStaffUser({ allowPasswordChange: true });
  if (!staff) redirect("/admin/login");
  if (staff.mustChangePassword) redirect("/admin/security?required=1");

  const params = await searchParams;
  let range;
  let rangeError: string | null = null;
  try {
    range = resolveReportRange(single(params.from), single(params.to));
  } catch (error) {
    range = resolveReportRange();
    rangeError = error instanceof Error ? error.message : "Invalid date range.";
  }
  const data = await buildLeadReport(staff, range);

  return (
    <AdminFrame name={staff.name} role={staff.role}>
      <main className="crm-main crm-report-main">
        <div className="crm-page-heading">
          <div><p className="crm-kicker">LEAD PERFORMANCE</p><h1>CRM reports</h1><p>Filter lead intake, current pipeline, first-response times and follow-up workload. {staff.role === "RELATIONSHIP_MANAGER" ? "Figures are limited to leads assigned to you; exports are restricted to managers." : "Figures cover the full CRM."}</p></div>
        </div>
        <LeadReports data={data} canExport={staff.role === "SUPER_ADMIN" || staff.role === "FUND_MANAGER"} rangeError={rangeError} />
      </main>
    </AdminFrame>
  );
}
