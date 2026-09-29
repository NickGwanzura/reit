import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getStaffUser, leadWhereFor, mayManageAllLeads } from "@/lib/authz";
import { LeadDashboard, type CrmLead, type CrmTask, type CrmUser } from "@/app/admin/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  const staff = await getStaffUser({ allowPasswordChange: true });
  if (!staff) redirect("/admin/login?error=access");
  if (staff.mustChangePassword) redirect("/admin/security?required=1");

  const leadWhere = leadWhereFor(staff);
  const [leads, statusGroups, tasks, users] = await Promise.all([
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
  ]);

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
    contact: {
      firstName: lead.contact.firstName,
      lastName: lead.contact.lastName,
      email: lead.contact.email,
      phone: lead.contact.phone,
      whatsapp: lead.contact.whatsapp,
      country: lead.contact.country,
      investorType: lead.contact.investorType,
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
      counts={{ total: totalLeads, new: newLeads, qualified, statuses: Object.fromEntries(statusGroups.map((item) => [item.status, item._count._all])) }}
    />
  );
}
