import { NextResponse } from "next/server";
import { z } from "zod";
import { LeadStatus } from "@/app/generated/prisma/client";
import { getStaffUser, leadWhereFor, mayManageAllLeads } from "@/lib/authz";
import { hasValidOrigin, readJsonBody } from "@/lib/api-security";
import { hashClientAddress } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

const updateSchema = z
  .object({
    status: z.nativeEnum(LeadStatus).optional(),
    assignedUserId: z.string().min(1).max(40).nullable().optional(),
    doNotContact: z.boolean().optional(),
    doNotContactReason: z.string().trim().min(3).max(500).optional(),
    doNotContactClearReason: z.string().trim().min(3).max(500).optional(),
    retentionReview: z.boolean().optional(),
    retentionReviewNote: z.string().trim().min(3).max(1000).optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((field) => field !== undefined))
  .refine((value) => value.doNotContact !== true || Boolean(value.doNotContactReason), { path: ["doNotContactReason"] })
  .refine((value) => value.doNotContact !== false || Boolean(value.doNotContactClearReason), { path: ["doNotContactClearReason"] })
  .refine((value) => value.retentionReview !== true || Boolean(value.retentionReviewNote), { path: ["retentionReviewNote"] });

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/leads/[leadId]">) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await readJsonBody(request, 4096);
  if (!body.ok) return NextResponse.json({ error: body.tooLarge ? "Request is too large." : "Invalid request body." }, { status: body.tooLarge ? 413 : 400 });
  const parsed = updateSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Invalid lead update." }, { status: 400 });

  const { leadId } = await context.params;
  if (parsed.data.assignedUserId !== undefined && !mayManageAllLeads(staff)) {
    return NextResponse.json({ error: "You cannot assign leads." }, { status: 403 });
  }

  const ipHash = hashClientAddress(request);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findFirst({
        where: { id: leadId, ...leadWhereFor(staff) },
        select: { id: true, contactId: true, status: true, assignedUserId: true, firstContactAt: true, retentionReviewAt: true, contact: { select: { doNotContactAt: true, doNotContactReason: true } } },
      });
      if (!lead) return { missing: true as const };
      if (
        lead.contact.doNotContactAt && parsed.data.status !== undefined && parsed.data.status !== lead.status &&
        parsed.data.status !== "LOST" && parsed.data.status !== "DEFERRED"
      ) return { suppressed: true as const };

      let assignment = lead.assignedUserId;
      if (parsed.data.assignedUserId !== undefined) {
        assignment = parsed.data.assignedUserId;
        if (assignment) {
          const target = await tx.user.findFirst({
            where: { id: assignment, isActive: true, role: "RELATIONSHIP_MANAGER" },
            select: { id: true },
          });
          if (!target) return { invalidAssignee: true as const };
        }
      }

      const changes: Array<Promise<unknown>> = [];
      const now = new Date();
      const contactActivity = parsed.data.status !== undefined && parsed.data.status !== lead.status && parsed.data.status !== "NEW_LEAD";
      const updatedLead = await tx.lead.update({
        where: { id: lead.id },
        data: {
          ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
          ...(parsed.data.assignedUserId !== undefined ? { assignedUserId: assignment } : {}),
          ...(contactActivity && !lead.firstContactAt ? { firstContactAt: now } : {}),
          ...(parsed.data.retentionReview !== undefined ? {
            retentionReviewAt: parsed.data.retentionReview ? now : null,
            retentionReviewNote: parsed.data.retentionReview ? parsed.data.retentionReviewNote : null,
          } : {}),
        },
      });

      if (parsed.data.doNotContact !== undefined && Boolean(lead.contact.doNotContactAt) !== parsed.data.doNotContact) {
        await tx.contact.update({
          where: { id: lead.contactId },
          data: {
            doNotContactAt: parsed.data.doNotContact ? now : null,
            doNotContactReason: parsed.data.doNotContact ? parsed.data.doNotContactReason : lead.contact.doNotContactReason,
            doNotContactClearedAt: parsed.data.doNotContact ? null : now,
            doNotContactClearReason: parsed.data.doNotContact ? null : parsed.data.doNotContactClearReason,
          },
        });
        changes.push(tx.auditLog.create({
          data: {
            actorUserId: staff.id,
            action: parsed.data.doNotContact ? "CONTACT_SUPPRESSED" : "CONTACT_SUPPRESSION_CLEARED",
            entityType: "Contact",
            entityId: lead.contactId,
            oldValue: { doNotContact: Boolean(lead.contact.doNotContactAt) },
            newValue: parsed.data.doNotContact
              ? { doNotContact: true }
              : { doNotContact: false, renewedPermissionDocumented: true },
            ipHash,
          },
        }));
      }

      if (parsed.data.retentionReview !== undefined && Boolean(lead.retentionReviewAt) !== parsed.data.retentionReview) {
        changes.push(tx.auditLog.create({
          data: {
            actorUserId: staff.id,
            action: parsed.data.retentionReview ? "RETENTION_REVIEW_FLAGGED" : "RETENTION_REVIEW_CLEARED",
            entityType: "Lead",
            entityId: leadId,
            oldValue: { flagged: Boolean(lead.retentionReviewAt) },
            newValue: { flagged: parsed.data.retentionReview },
            ipHash,
          },
        }));
      }

      if (parsed.data.status !== undefined && parsed.data.status !== lead.status) {
        changes.push(tx.activity.create({
          data: {
            leadId,
            actorUserId: staff.id,
            type: "STAGE_CHANGED",
            body: `Pipeline stage changed from ${lead.status.replaceAll("_", " ")} to ${parsed.data.status.replaceAll("_", " ")}.`,
          },
        }));
        changes.push(tx.auditLog.create({
          data: {
            actorUserId: staff.id,
            action: "LEAD_STAGE_CHANGED",
            entityType: "Lead",
            entityId: leadId,
            oldValue: { status: lead.status },
            newValue: { status: parsed.data.status },
            ipHash,
          },
        }));
      }
      if (parsed.data.assignedUserId !== undefined && assignment !== lead.assignedUserId) {
        changes.push(tx.activity.create({
          data: {
            leadId,
            actorUserId: staff.id,
            type: "ASSIGNMENT_CHANGED",
            body: assignment ? "Lead assigned to a relationship manager." : "Lead unassigned.",
          },
        }));
        changes.push(tx.auditLog.create({
          data: {
            actorUserId: staff.id,
            action: "LEAD_ASSIGNMENT_CHANGED",
            entityType: "Lead",
            entityId: leadId,
            oldValue: { assignedUserId: lead.assignedUserId },
            newValue: { assignedUserId: assignment },
            ipHash,
          },
        }));
      }
      await Promise.all(changes);
      return { updatedLead };
    });

    if ("missing" in result) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    if ("suppressed" in result) return NextResponse.json({ error: "This contact has an active do-not-contact flag. Clear it only after documenting valid renewed permission." }, { status: 409 });
    if ("invalidAssignee" in result) return NextResponse.json({ error: "Select an active relationship manager." }, { status: 400 });
    return NextResponse.json({
      id: result.updatedLead.id,
      status: result.updatedLead.status,
      assignedUserId: result.updatedLead.assignedUserId,
      retentionReviewAt: result.updatedLead.retentionReviewAt?.toISOString() ?? null,
    });
  } catch {
    console.error("CRM lead update could not be saved.");
    return NextResponse.json({ error: "Could not save this change." }, { status: 503 });
  }
}
