import { Prisma } from "@/app/generated/prisma/client";
import { redirect } from "next/navigation";
import { AdminFrame } from "@/app/admin/admin-frame";
import { DataQualityView, type DuplicateCandidate, type RetentionReview } from "@/app/admin/data-quality/view";
import { getStaffUser, leadWhereFor } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type DuplicateRow = {
  pairKey: string;
  leftLeadId: string;
  rightLeadId: string;
  leftName: string;
  rightName: string;
  leftEmail: string;
  rightEmail: string;
  country: string;
  leftCreatedAt: Date;
  rightCreatedAt: Date;
};

export default async function AdminDataQualityPage() {
  const staff = await getStaffUser({ allowPasswordChange: true });
  if (!staff) redirect("/admin/login");
  if (staff.mustChangePassword) redirect("/admin/security?required=1");

  const assignmentFilter = staff.role === "RELATIONSHIP_MANAGER"
    ? Prisma.sql`AND l1."assignedUserId" = ${staff.id} AND l2."assignedUserId" = ${staff.id}`
    : Prisma.empty;
  const candidates = await prisma.$queryRaw<DuplicateRow[]>(Prisma.sql`
    SELECT
      LEAST(c1.id, c2.id) || ':' || GREATEST(c1.id, c2.id) AS "pairKey",
      l1.id AS "leftLeadId", l2.id AS "rightLeadId",
      concat_ws(' ', c1."firstName", c1."lastName") AS "leftName",
      concat_ws(' ', c2."firstName", c2."lastName") AS "rightName",
      c1.email AS "leftEmail", c2.email AS "rightEmail",
      c1.country AS country, l1."createdAt" AS "leftCreatedAt", l2."createdAt" AS "rightCreatedAt"
    FROM "Contact" c1
    JOIN "Lead" l1 ON l1."contactId" = c1.id
    JOIN "Contact" c2 ON lower(btrim(c1."firstName")) = lower(btrim(c2."firstName"))
      AND lower(btrim(c1."lastName")) = lower(btrim(c2."lastName"))
      AND lower(btrim(c1.country)) = lower(btrim(c2.country))
      AND c1.id < c2.id
    JOIN "Lead" l2 ON l2."contactId" = c2.id
    WHERE length(btrim(c1."firstName")) > 1
      AND length(btrim(c1."lastName")) > 1
      AND c1.country IS NOT NULL AND btrim(c1.country) <> ''
      AND NOT EXISTS (
        SELECT 1 FROM "AuditLog" reviewed
        WHERE reviewed.action = 'DUPLICATE_REVIEWED'
          AND reviewed.entityType = 'PotentialDuplicate'
          AND reviewed."entityId" = LEAST(c1.id, c2.id) || ':' || GREATEST(c1.id, c2.id)
      )
      ${assignmentFilter}
    ORDER BY l1."createdAt" DESC, l2."createdAt" DESC
    LIMIT 250
  `);
  const retentionRows = await prisma.lead.findMany({
      where: { ...leadWhereFor(staff), retentionReviewAt: { not: null } },
      orderBy: { retentionReviewAt: "asc" },
      take: 200,
      select: { id: true, status: true, retentionReviewAt: true, retentionReviewNote: true, contact: { select: { firstName: true, lastName: true, email: true } } },
    });
  const duplicates: DuplicateCandidate[] = candidates.map((item) => ({
    ...item,
    leftCreatedAt: item.leftCreatedAt.toISOString(),
    rightCreatedAt: item.rightCreatedAt.toISOString(),
  }));
  const retention: RetentionReview[] = retentionRows.map((item) => ({
    id: item.id,
    status: item.status,
    flaggedAt: item.retentionReviewAt!.toISOString(),
    note: item.retentionReviewNote ?? "",
    name: `${item.contact.firstName} ${item.contact.lastName}`,
    email: item.contact.email,
  }));

  return (
    <AdminFrame name={staff.name} role={staff.role}>
      <main className="crm-main crm-quality-main">
        <div className="crm-page-heading"><div><p className="crm-kicker">DATA GOVERNANCE</p><h1>Data quality & retention</h1><p>Review possible duplicate records and enquiries flagged for human retention review. Similar names are suggestions only; the CRM never merges records automatically.</p></div></div>
        <DataQualityView duplicates={duplicates} retention={retention} />
      </main>
    </AdminFrame>
  );
}
