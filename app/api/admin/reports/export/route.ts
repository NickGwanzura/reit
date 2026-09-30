import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffUser } from "@/lib/authz";
import { hasValidOrigin, readJsonBody } from "@/lib/api-security";
import { buildLeadReport, buildLeadReportCsv } from "@/lib/lead-reporting";
import { resolveReportRange } from "@/lib/lead-report-range";
import { hashClientAddress } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

const exportSchema = z.object({ from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).strict();

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (staff.role !== "SUPER_ADMIN" && staff.role !== "FUND_MANAGER") return NextResponse.json({ error: "Only Super Admins and Fund Managers can export CRM reports." }, { status: 403 });

  const body = await readJsonBody(request, 2048);
  if (!body.ok) return NextResponse.json({ error: body.tooLarge ? "Request is too large." : "Invalid request body." }, { status: body.tooLarge ? 413 : 400 });
  const parsed = exportSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid report date range." }, { status: 400 });

  let range;
  try {
    range = resolveReportRange(parsed.data.from, parsed.data.to);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Choose a valid report date range." }, { status: 400 });
  }

  try {
    const report = await buildLeadReport(staff, range);
    await prisma.auditLog.create({
      data: {
        actorUserId: staff.id,
        action: "CRM_REPORT_EXPORTED",
        entityType: "LeadReport",
        entityId: `${range.from}:${range.to}`,
        newValue: { from: range.from, to: range.to, scope: "aggregate-only" },
        ipHash: hashClientAddress(request),
      },
    });
    return new Response(buildLeadReportCsv(report), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="mutirikwi-reit-crm-report-${range.from}-to-${range.to}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("CRM aggregate report export could not be prepared.");
    return NextResponse.json({ error: "Could not prepare the report export." }, { status: 503 });
  }
}
