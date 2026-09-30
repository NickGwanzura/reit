import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffUser, leadWhereFor } from "@/lib/authz";
import { hasValidOrigin, readJsonBody } from "@/lib/api-security";
import { hashClientAddress } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

const reviewSchema = z.object({
  leftLeadId: z.string().min(1).max(40),
  rightLeadId: z.string().min(1).max(40),
  outcome: z.enum(["same_person", "different_people"]),
}).strict().refine((value) => value.leftLeadId !== value.rightLeadId);

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await readJsonBody(request, 2048);
  if (!body.ok) return NextResponse.json({ error: body.tooLarge ? "Request is too large." : "Invalid request body." }, { status: body.tooLarge ? 413 : 400 });
  const parsed = reviewSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Select a valid pair of leads and review outcome." }, { status: 400 });

  const scope = leadWhereFor(staff);
  const leads = await prisma.lead.findMany({
    where: { ...scope, id: { in: [parsed.data.leftLeadId, parsed.data.rightLeadId] } },
    select: { id: true, contact: { select: { id: true, firstName: true, lastName: true, country: true } } },
  });
  if (leads.length !== 2) return NextResponse.json({ error: "One or both leads are not available to your role." }, { status: 404 });
  const [left, right] = parsed.data.leftLeadId < parsed.data.rightLeadId
    ? [leads.find((item) => item.id === parsed.data.leftLeadId)!, leads.find((item) => item.id === parsed.data.rightLeadId)!]
    : [leads.find((item) => item.id === parsed.data.rightLeadId)!, leads.find((item) => item.id === parsed.data.leftLeadId)!];
  const normalize = (value: string | null) => value?.trim().toLocaleLowerCase("en") ?? "";
  if (
    normalize(left.contact.firstName) !== normalize(right.contact.firstName) ||
    normalize(left.contact.lastName) !== normalize(right.contact.lastName) ||
    !normalize(left.contact.country) || normalize(left.contact.country) !== normalize(right.contact.country)
  ) return NextResponse.json({ error: "These records no longer match the duplicate-review criteria." }, { status: 400 });

  const pairKey = [left.contact.id, right.contact.id].sort().join(":");
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: staff.id,
        action: "DUPLICATE_REVIEWED",
        entityType: "PotentialDuplicate",
        entityId: pairKey,
        oldValue: { reviewed: false },
        newValue: { outcome: parsed.data.outcome, recordsChanged: false },
        ipHash: hashClientAddress(request),
      },
    });
    return NextResponse.json({ reviewed: true });
  } catch {
    console.error("Duplicate review audit could not be saved.");
    return NextResponse.json({ error: "Could not save this review." }, { status: 503 });
  }
}
