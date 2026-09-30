import "server-only";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  normalizePhone,
  safeLandingPath,
  type LeadSubmissionInput,
} from "@/lib/validation/lead";

function clean(value?: string) {
  return value?.trim() || undefined;
}

export async function captureLead(
  input: LeadSubmissionInput,
  options: { ipHash: string; referer?: string | null },
) {
  const email = input.email.trim().toLowerCase();
  const phone = clean(input.phone);
  const whatsapp = clean(input.whatsapp);
  const normalizedPhone = normalizePhone(phone);
  const normalizedWhatsapp = normalizePhone(whatsapp);
  const attribution = input.attribution;
  let referer: string | undefined;
  try {
    referer = options.referer ? new URL(options.referer).toString().slice(0, 1000) : undefined;
  } catch {
    referer = undefined;
  }

  const write = () =>
    prisma.$transaction(async (tx) => {
      const byEmail = await tx.contact.findUnique({ where: { normalizedEmail: email } });
      const byPhone = !byEmail && normalizedPhone
        ? await tx.contact.findUnique({ where: { normalizedPhone } })
        : null;
      const byWhatsapp = !byEmail && !byPhone && normalizedWhatsapp
        ? await tx.contact.findUnique({ where: { normalizedWhatsapp } })
        : null;
      const existing = byEmail ?? byPhone ?? byWhatsapp;

      let contactId: string;
      let contactDoNotContact = false;
      if (existing) {
        const phoneOwner = normalizedPhone
          ? await tx.contact.findUnique({ where: { normalizedPhone } })
          : null;
        const whatsappOwner = normalizedWhatsapp
          ? await tx.contact.findUnique({ where: { normalizedWhatsapp } })
          : null;
        const contact = await tx.contact.update({
          where: { id: existing.id },
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            email,
            normalizedEmail: email,
            country: clean(input.country) ?? existing.country,
            investorType: input.investorType,
            phone: phoneOwner && phoneOwner.id !== existing.id ? existing.phone : phone ?? existing.phone,
            normalizedPhone:
              phoneOwner && phoneOwner.id !== existing.id
                ? existing.normalizedPhone
                : normalizedPhone ?? existing.normalizedPhone,
            whatsapp:
              whatsappOwner && whatsappOwner.id !== existing.id
                ? existing.whatsapp
                : whatsapp ?? existing.whatsapp,
            normalizedWhatsapp:
              whatsappOwner && whatsappOwner.id !== existing.id
                ? existing.normalizedWhatsapp
                : normalizedWhatsapp ?? existing.normalizedWhatsapp,
          },
        });
        contactId = contact.id;
        contactDoNotContact = Boolean(contact.doNotContactAt);
      } else {
        const contact = await tx.contact.create({
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            email,
            normalizedEmail: email,
            phone,
            normalizedPhone,
            whatsapp,
            normalizedWhatsapp,
            country: clean(input.country),
            investorType: input.investorType,
          },
        });
        contactId = contact.id;
      }

      const existingLead = await tx.lead.findUnique({ where: { contactId } });
      const eventTime = new Date();
      let assignment: { assignedUserId: string | null } = { assignedUserId: existingLead?.assignedUserId ?? null };
      if (!existingLead) {
        // Serialize only new-lead assignment so simultaneous enquiries follow one fair rotation.
        await tx.$queryRaw`SELECT 1::int AS lock_acquired FROM (SELECT pg_advisory_xact_lock(734294001)) AS advisory_lock`;
        const mostRecentAssignment = await tx.user.aggregate({
          where: { isActive: true, role: "RELATIONSHIP_MANAGER" },
          _max: { lastLeadAssignedAt: true },
        });
        const nextManager = await tx.user.findFirst({
          where: { isActive: true, role: "RELATIONSHIP_MANAGER" },
          orderBy: [{ lastLeadAssignedAt: { sort: "asc", nulls: "first" } }, { createdAt: "asc" }, { id: "asc" }],
          select: { id: true },
        });
        if (nextManager) {
          assignment = { assignedUserId: nextManager.id };
          const previousAssignment = mostRecentAssignment._max.lastLeadAssignedAt?.getTime() ?? 0;
          await tx.user.update({ where: { id: nextManager.id }, data: { lastLeadAssignedAt: new Date(Math.max(eventTime.getTime(), previousAssignment + 1)) } });
        }
      }

      const lead = existingLead
        ? await tx.lead.update({
            where: { id: existingLead.id },
            data: {
              intendedInvestmentRange: input.investmentRange,
              timeline: input.timeline,
              preferredContact: input.preferredContact,
              lastSubmissionAt: new Date(),
              source: existingLead.source ?? clean(attribution?.utmSource) ?? "website",
            },
          })
        : await tx.lead.create({
            data: {
              contactId,
              intendedInvestmentRange: input.investmentRange,
              timeline: input.timeline,
              preferredContact: input.preferredContact,
              source: clean(attribution?.utmSource) ?? "website",
              assignedUserId: assignment.assignedUserId,
            },
          });

      const enquiry = await tx.enquiry.create({
        data: {
          leadId: lead.id,
          firstName: input.firstName,
          lastName: input.lastName,
          email,
          phone,
          whatsapp,
          country: clean(input.country),
          investorType: input.investorType,
          investmentRange: input.investmentRange,
          timeline: input.timeline,
          preferredContact: input.preferredContact,
          consentAt: new Date(),
          utmSource: clean(attribution?.utmSource),
          utmMedium: clean(attribution?.utmMedium),
          utmCampaign: clean(attribution?.utmCampaign),
          utmContent: clean(attribution?.utmContent),
          utmTerm: clean(attribution?.utmTerm),
          referrer: referer,
          landingPage: safeLandingPath(attribution?.landingPage),
        },
      });

      if (!existingLead) {
        await tx.activity.create({
          data: {
            leadId: lead.id,
            type: "LEAD_CREATED",
            body: "Lead created from a website enquiry.",
            createdAt: eventTime,
          },
        });
        await tx.auditLog.create({
          data: {
            action: "LEAD_CREATED",
            entityType: "Lead",
            entityId: lead.id,
            newValue: { status: lead.status, source: lead.source },
            ipHash: options.ipHash,
            createdAt: eventTime,
          },
        });
      }
      if (!existingLead && assignment.assignedUserId) {
        await tx.activity.create({
          data: {
            leadId: lead.id,
            type: "ASSIGNMENT_CHANGED",
            body: "Lead automatically assigned through the relationship manager rotation.",
            createdAt: eventTime,
          },
        });
        await tx.auditLog.create({
          data: {
            action: "LEAD_AUTO_ASSIGNED",
            entityType: "Lead",
            entityId: lead.id,
            newValue: { assignedUserId: assignment.assignedUserId },
            ipHash: options.ipHash,
            createdAt: eventTime,
          },
        });
      }
      await tx.activity.create({
        data: {
          leadId: lead.id,
          type: "ENQUIRY_RECEIVED",
          body: existingLead
            ? "Repeat website enquiry received. Prior lead history and stage were preserved."
            : "Initial website enquiry received.",
          metadata: { enquiryId: enquiry.id },
          createdAt: eventTime,
        },
      });

      return {
        leadId: lead.id,
        enquiryId: enquiry.id,
        firstName: input.firstName,
        email,
        doNotContact: contactDoNotContact,
        repeated: Boolean(existingLead),
      };
    });

  try {
    return await write();
  } catch (error) {
    // A concurrent submission can win the unique contact key between lookup and create.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return await write();
    }
    throw error;
  }
}
