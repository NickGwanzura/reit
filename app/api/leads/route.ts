import { NextResponse } from "next/server";
import { captureLead } from "@/lib/lead-service";
import { deliverLeadEmails } from "@/lib/email";
import { consumeLeadRateLimit, hashClientAddress } from "@/lib/rate-limit";
import { leadSubmissionSchema } from "@/lib/validation/lead";
import { readJsonBody } from "@/lib/api-security";
import {
  BROCHURE_ACCESS_COOKIE,
  BROCHURE_ACCESS_TTL_SECONDS,
  createBrochureAccessToken,
} from "@/lib/brochure-access";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 12_000;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
  }

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok && body.tooLarge) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  }
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = leadSubmissionSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the required enquiry details." }, { status: 400 });
  }

  // Quietly absorb basic bot submissions; the field is never stored.
  if (parsed.data.website) {
    return NextResponse.json({ received: true }, { status: 202 });
  }

  const ipHash = hashClientAddress(request);
  try {
    const allowed = await consumeLeadRateLimit(ipHash);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many enquiries. Please try again later." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }

    const lead = await captureLead(parsed.data, {
      ipHash,
      referer: request.headers.get("referer"),
    });

    try {
      await deliverLeadEmails({
        ...lead,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        whatsapp: parsed.data.whatsapp,
        country: parsed.data.country,
        investorType: parsed.data.investorType,
        investmentRange: parsed.data.investmentRange,
        timeline: parsed.data.timeline,
        preferredContact: parsed.data.preferredContact,
      });
    } catch {
      console.error("Lead was stored, but email delivery did not complete.");
    }

    const brochureToken = createBrochureAccessToken();
    const response = NextResponse.json(
      { received: true, firstName: lead.firstName, brochureAccessGranted: Boolean(brochureToken) },
      { status: 201 },
    );

    if (brochureToken) {
      response.cookies.set(BROCHURE_ACCESS_COOKIE, brochureToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/brochure",
        maxAge: BROCHURE_ACCESS_TTL_SECONDS,
        priority: "high",
      });
    }

    return response;
  } catch {
    console.error("Lead submission could not be saved.");
    return NextResponse.json(
      { error: "We could not save your enquiry just now. Please try again shortly." },
      { status: 503 },
    );
  }
}
