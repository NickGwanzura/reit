import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getStaffUser, leadWhereFor, mayManageAllLeads } from "@/lib/authz";
import { LeadDashboard, type CrmLead, type CrmTask, type CrmUser } from "@/app/admin/dashboard";
import { addHarareBusinessMinutes, isFirstContactOverdue } from "@/lib/lead-sla";
import { LeadStatus } from "@/app/generated/prisma/client";
import { resolveReportRange } from "@/lib/lead-report-range";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const single = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  const staff = await getStaffUser({ allowPasswordChange: true });
  if (!staff) redirect("/admin/login?error=access");
  if (staff.mustChangePassword) redirect("/admin/security?required=1");

  const params = await searchParams;
  const requestedLeadIdValue = single(params.leadId);
  const requestedLeadId = requestedLeadIdValue && requestedLeadIdValue.length <= 40 ? requestedLeadIdValue : undefined;
  const statusValue = single(params.status);
  const sourceValue = single(params.source);
  const status = statusValue && Object.values(LeadStatus).includes(statusValue as LeadStatus) ? statusValue as LeadStatus : undefined;
  let dateWhere = {};
  let filterPeriod: string | undefined;
  const from = single(params.from);
  const to = single(params.to);
  if (from || to) {
    try {
      const range = resolveReportRange(from, to);
      dateWhere = { createdAt: { gte: range.start, lt: range.endExclusive } };
      filterPeriod = `${range.from} to ${range.to}`;
    } catch {
      // Invalid drill-down parameters are ignored; the dashboard remains available.
    }
  }
  const sourceFilter = sourceValue !== undefined ? { source: sourceValue || null } : {};
  const leadWhere = { ...leadWhereFor(staff), ...dateWhere, ...sourceFilter, ...(status ? { status } : {}), ...(requestedLeadId ? { id: requestedLeadId } : {}) };
  const now = new Date();
  const slaCutoff = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const slaWhere = { ...leadWhereFor(staff), status: "NEW_LEAD" as const, firstContactAt: null, contact: { is: { doNotContactAt: null } } };
  const [leads, statusGroups, tasks, users, unassignedLeads, unassignedCount, oldSlaCandidates, oldSlaCount, recentSlaCandidates] = await Promise.all([
    prisma.lead.findMany({
      where: leadWhere,
      orderBy: [{ updatedAt: "desc" }],
      take: 100,
      include: {
        contact: true,
        assignedUser: { select: { id: true, name: true } },
        enquiries: { orderBy: { createdAt: "desc" }, take: 3 },
        activities: { orderBy: { createdAt: "desc" }, take: 8, include: { actor: { select: { name: true } } } },
        tasks: { where: { status: "OPEN" }, orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }], take: 5 },
      },
    }),
    prisma.lead.groupBy({ by: ["status"], where: leadWhere, _count: { _all: true } }),
    prisma.task.findMany({
      where: staff.role === "RELATIONSHIP_MANAGER"
        ? { assignedToId: staff.id, status: "OPEN" }
        : { status: "OPEN" },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 12,
      include: { lead: { include: { contact: { select: { firstName: true, lastName: true } } } } },
    }),
    mayManageAllLeads(staff)
      ? prisma.user.findMany({
          where: { isActive: true, role: "RELATIONSHIP_MANAGER" },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    mayManageAllLeads(staff)
      ? prisma.lead.findMany({
          where: { status: "NEW_LEAD", assignedUserId: null, contact: { is: { doNotContactAt: null } } },
          orderBy: { createdAt: "asc" },
          take: 30,
          select: { id: true, createdAt: true, contact: { select: { firstName: true, lastName: true, email: true, doNotContactAt: true } } },
        })
      : Promise.resolve([]),
    mayManageAllLeads(staff) ? prisma.lead.count({ where: { status: "NEW_LEAD", assignedUserId: null, contact: { is: { doNotContactAt: null } } } }) : Promise.resolve(0),
    prisma.lead.findMany({
      where: { ...slaWhere, createdAt: { lt: slaCutoff } },
      orderBy: { createdAt: "asc" },
      take: 30,
      select: { id: true, createdAt: true, assignedUser: { select: { name: true } }, contact: { select: { firstName: true, lastName: true, email: true, doNotContactAt: true } } },
    }),
    prisma.lead.count({ where: { ...slaWhere, createdAt: { lt: slaCutoff } } }),
    prisma.lead.findMany({
      where: { ...slaWhere, createdAt: { gte: slaCutoff, lt: now } },
      orderBy: { createdAt: "asc" },
      select: { id: true, createdAt: true, assignedUser: { select: { name: true } }, contact: { select: { firstName: true, lastName: true, email: true, doNotContactAt: true } } },
    }),
  ]);

  const overdueRecent = recentSlaCandidates.filter((lead) => isFirstContactOverdue(lead.createdAt, null, now));
  const overdueLeads = [...oldSlaCandidates, ...overdueRecent]
    .slice(0, 30)
    .map((lead) => ({
      id: lead.id,
      name: `${lead.contact.firstName} ${lead.contact.lastName}`,
      email: lead.contact.email,
      createdAt: lead.createdAt.toISOString(),
      dueAt: addHarareBusinessMinutes(lead.createdAt).toISOString(),
      assignedTo: lead.assignedUser?.name ?? null,
    }));

  const serializedLeads: CrmLead[] = leads.map((lead) => ({
    id: lead.id,
    status: lead.status,
    intendedInvestmentRange: lead.intendedInvestmentRange,
    timeline: lead.timeline,
    preferredContact: lead.preferredContact,
    source: lead.source,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    lastSubmissionAt: lead.lastSubmissionAt.toISOString(),
    firstContactAt: lead.firstContactAt?.toISOString() ?? null,
    retentionReviewAt: lead.retentionReviewAt?.toISOString() ?? null,
    retentionReviewNote: lead.retentionReviewNote,
    contact: {
      firstName: lead.contact.firstName,
      lastName: lead.contact.lastName,
      email: lead.contact.email,
      phone: lead.contact.phone,
      whatsapp: lead.contact.whatsapp,
      country: lead.contact.country,
      investorType: lead.contact.investorType,
      doNotContactAt: lead.contact.doNotContactAt?.toISOString() ?? null,
      doNotContactReason: lead.contact.doNotContactReason,
      doNotContactClearedAt: lead.contact.doNotContactClearedAt?.toISOString() ?? null,
      doNotContactClearReason: lead.contact.doNotContactClearReason,
    },
    assignedUser: lead.assignedUser,
    enquiries: lead.enquiries.map((enquiry) => ({
      id: enquiry.id,
      email: enquiry.email,
      createdAt: enquiry.createdAt.toISOString(),
    })),
    activities: lead.activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      body: activity.body,
      createdAt: activity.createdAt.toISOString(),
      actorName: activity.actor?.name ?? "System",
    })),
    tasks: lead.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      dueAt: task.dueAt?.toISOString() ?? null,
      type: task.type,
      priority: task.priority,
    })),
  }));

  const serializedTasks: CrmTask[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    dueAt: task.dueAt?.toISOString() ?? null,
    type: task.type,
    priority: task.priority,
    leadId: task.leadId,
    leadName: `${task.lead.contact.firstName} ${task.lead.contact.lastName}`,
  }));

  const serializedUsers: CrmUser[] = users.map((user) => ({ id: user.id, name: user.name }));
  const totalLeads = statusGroups.reduce((total, item) => total + item._count._all, 0);
  const newLeads = statusGroups.find((item) => item.status === "NEW_LEAD")?._count._all ?? 0;
  const qualified = statusGroups
    .filter((item) => ["QUALIFIED", "INTERESTED"].includes(item.status))
    .reduce((total, item) => total + item._count._all, 0);

  return (
    <LeadDashboard
      name={staff.name}
      role={staff.role}
      leads={serializedLeads}
      tasks={serializedTasks}
      users={serializedUsers}
      unassignedLeads={unassignedLeads.map((lead) => ({ id: lead.id, name: `${lead.contact.firstName} ${lead.contact.lastName}`, email: lead.contact.email, doNotContact: Boolean(lead.contact.doNotContactAt), createdAt: lead.createdAt.toISOString() }))}
      overdueLeads={overdueLeads}
      counts={{ total: totalLeads, new: newLeads, qualified, unassigned: unassignedCount, overdue: oldSlaCount + overdueRecent.length, statuses: Object.fromEntries(statusGroups.map((item) => [item.status, item._count._all])) }}
      initialStatusFilter={status ?? "ALL"}
      filterSummary={[requestedLeadId ? "Selected lead" : "", status ? `Stage: ${status.replaceAll("_", " ")}` : "", sourceValue !== undefined ? `Source: ${sourceValue || "Not specified"}` : "", filterPeriod ?? ""].filter(Boolean).join(" · ")}
    />
  );
}
