import "server-only";
import { Prisma } from "@/app/generated/prisma/client";
import type { StaffUser } from "@/lib/authz";
import { leadWhereFor } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { isFirstContactOverdue } from "@/lib/lead-sla";
import type { LeadReportRange } from "@/lib/lead-report-range";

const DAY = 24 * 60 * 60 * 1000;
export type ReportPoint = { name: string; count: number };
export type TrendPoint = { label: string; count: number };
export type LeadReportData = {
  generatedAt: string;
  range: { from: string; to: string };
  totalLeads: number;
  totalEnquiries: number;
  qualified: number;
  onboarded: number;
  conversionPercent: number;
  averageFirstResponseMinutes: number | null;
  unassigned: number;
  openTasks: number;
  overdueTasks: number;
  overdueFirstContact: number;
  trend: TrendPoint[];
  statuses: ReportPoint[];
  sources: ReportPoint[];
};

export async function buildLeadReport(staff: StaffUser, range: LeadReportRange, now = new Date()): Promise<LeadReportData> {
  const scope = leadWhereFor(staff);
  const cohort = { ...scope, createdAt: { gte: range.start, lt: range.endExclusive } };
  const overdueCutoff = new Date(now.getTime() - 3 * DAY);
  const olderOverdueEnd = new Date(Math.min(range.endExclusive.getTime(), overdueCutoff.getTime()));
  const recentSlaQueryStart = new Date(Math.max(range.start.getTime(), overdueCutoff.getTime()));
  const recentSlaQueryEnd = new Date(Math.min(range.endExclusive.getTime(), now.getTime()));
  const [totalLeads, totalEnquiries, qualified, onboarded, unassigned, statusGroups, sourceGroups, responseRows, openTasks, overdueTasks, oldUncontacted, recentUncontacted, monthlyRows] = await Promise.all([
    prisma.lead.count({ where: cohort }),
    prisma.enquiry.count({ where: { createdAt: { gte: range.start, lt: range.endExclusive }, lead: scope } }),
    prisma.lead.count({ where: { ...cohort, status: { in: ["QUALIFIED", "INTERESTED"] } } }),
    prisma.lead.count({ where: { ...cohort, status: "ONBOARDED_INVESTOR" } }),
    prisma.lead.count({ where: { ...cohort, assignedUserId: null, contact: { is: { doNotContactAt: null } } } }),
    prisma.lead.groupBy({ by: ["status"], where: cohort, _count: { _all: true }, orderBy: { status: "asc" } }),
    prisma.lead.groupBy({ by: ["source"], where: cohort, _count: { _all: true }, orderBy: { source: "asc" } }),
    prisma.lead.findMany({ where: { ...cohort, firstContactAt: { not: null } }, select: { createdAt: true, firstContactAt: true } }),
    prisma.task.count({ where: { lead: cohort, status: "OPEN" } }),
    prisma.task.count({ where: { lead: cohort, status: "OPEN", dueAt: { lt: now } } }),
    prisma.lead.count({ where: { ...cohort, status: "NEW_LEAD", firstContactAt: null, contact: { is: { doNotContactAt: null } }, createdAt: { gte: range.start, lt: olderOverdueEnd } } }),
    prisma.lead.findMany({
      where: { ...cohort, status: "NEW_LEAD", firstContactAt: null, contact: { is: { doNotContactAt: null } }, createdAt: { gte: recentSlaQueryStart, lt: recentSlaQueryEnd } },
      select: { createdAt: true },
    }),
    prisma.$queryRaw<Array<{ month: string; count: number }>>(Prisma.sql`
      SELECT to_char(date_trunc('month', "createdAt" + interval '2 hours'), 'YYYY-MM') AS month, count(*)::int AS count
      FROM "Lead"
      WHERE "createdAt" >= ${range.start} AND "createdAt" < ${range.endExclusive}
      ${staff.role === "RELATIONSHIP_MANAGER" ? Prisma.sql`AND "assignedUserId" = ${staff.id}` : Prisma.empty}
      GROUP BY date_trunc('month', "createdAt" + interval '2 hours')
      ORDER BY month ASC
    `),
  ]);

  const responseDurations = responseRows.flatMap((row) => {
    const duration = row.firstContactAt!.getTime() - row.createdAt.getTime();
    return duration >= 0 ? [duration] : [];
  });
  const averageFirstResponseMinutes = responseDurations.length
    ? Math.round(responseDurations.reduce((sum, value) => sum + value, 0) / responseDurations.length / 60_000)
    : null;
  const overdueRecent = recentUncontacted.filter((lead) => isFirstContactOverdue(lead.createdAt, null, now)).length;

  const monthlyCounts = new Map(monthlyRows.map((row) => [row.month, row.count]));
  const [fromYear, fromMonth] = range.from.split("-").map(Number);
  const [toYear, toMonth] = range.to.split("-").map(Number);
  const firstMonth = new Date(Date.UTC(fromYear, fromMonth - 1, 1));
  const lastMonth = new Date(Date.UTC(toYear, toMonth - 1, 1));
  const trend: TrendPoint[] = [];
  for (const month = new Date(firstMonth); month <= lastMonth; month.setUTCMonth(month.getUTCMonth() + 1)) {
    const key = month.toISOString().slice(0, 7);
    trend.push({
      label: new Intl.DateTimeFormat("en", { month: "short", year: "2-digit", timeZone: "UTC" }).format(month),
      count: monthlyCounts.get(key) ?? 0,
    });
  }

  return {
    generatedAt: now.toISOString(),
    range: { from: range.from, to: range.to },
    totalLeads,
    totalEnquiries,
    qualified,
    onboarded,
    conversionPercent: totalLeads ? Math.round((onboarded / totalLeads) * 100) : 0,
    averageFirstResponseMinutes,
    unassigned,
    openTasks,
    overdueTasks,
    overdueFirstContact: oldUncontacted + overdueRecent,
    trend,
    statuses: statusGroups.map((item) => ({ name: item.status, count: item._count._all })),
    sources: sourceGroups.map((item) => ({ name: item.source || "Not specified", count: item._count._all })),
  };
}

export function buildLeadReportCsv(data: LeadReportData) {
  const cell = (value: string | number) => {
    const text = String(value);
    const safe = /^[\s]*[=+@\-]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  const rows: (string | number)[][] = [
    ["Mutirikwi REIT CRM lead report"], ["Period", data.range.from, "to", data.range.to], ["Generated at", data.generatedAt], [],
    ["Metric", "Value"], ["Leads received", data.totalLeads], ["Enquiries received", data.totalEnquiries],
    ["Qualified or interested (current stage)", data.qualified], ["Onboarded (current stage)", data.onboarded],
    ["Onboarded share of lead cohort (%)", data.conversionPercent],
    ["Average first recorded response (minutes)", data.averageFirstResponseMinutes ?? "Not available"],
    ["Unassigned leads", data.unassigned], ["Open follow-ups", data.openTasks],
    ["Overdue follow-ups", data.overdueTasks], ["Overdue first contacts", data.overdueFirstContact],
    [], ["Monthly leads"], ["Month", "Leads"], ...data.trend.map((item) => [item.label, item.count]),
    [], ["Current pipeline stage distribution"], ["Stage", "Leads"], ...data.statuses.map((item) => [item.name, item.count]),
    [], ["Lead source distribution"], ["Source", "Leads"], ...data.sources.map((item) => [item.name, item.count]),
  ];
  return `\uFEFF${rows.map((row) => row.map(cell).join(",")).join("\r\n")}`;
}
