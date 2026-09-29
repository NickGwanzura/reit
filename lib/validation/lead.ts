import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value == null || (typeof value === "string" && value.trim() === "") ? undefined : value),
    z.string().trim().max(max).optional(),
  );

const phoneSchema = optionalText(40).refine(
  (value) => value === undefined || /^[+\d\s().-]+$/.test(value),
  "Enter a valid phone number.",
);

export const leadSubmissionSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    phone: phoneSchema,
    whatsapp: phoneSchema,
    country: optionalText(80),
    investorType: z.enum([
      "INDIVIDUAL",
      "DIASPORA",
      "CORPORATE",
      "PENSION_FUND",
      "INSURANCE",
      "BANK",
      "EMPLOYER",
      "OTHER",
    ]),
    investmentRange: z.enum([
      "RANGE_100_999",
      "RANGE_1000_4999",
      "RANGE_5000_9999",
      "RANGE_10000_49999",
      "RANGE_50000_99999",
      "RANGE_100000_PLUS",
    ]),
    timeline: z.enum([
      "IMMEDIATELY",
      "WITHIN_30_DAYS",
      "ONE_TO_THREE_MONTHS",
      "THREE_TO_SIX_MONTHS",
      "RESEARCHING",
    ]),
    preferredContact: z.enum(["PHONE", "WHATSAPP", "EMAIL"]),
    consent: z.literal(true),
    website: optionalText(200),
    attribution: z
      .object({
        utmSource: optionalText(200),
        utmMedium: optionalText(200),
        utmCampaign: optionalText(200),
        utmContent: optionalText(200),
        utmTerm: optionalText(200),
        landingPage: optionalText(500),
      })
      .optional(),
  })
  .strict();

export type LeadSubmissionInput = z.infer<typeof leadSubmissionSchema>;

export function normalizePhone(value?: string) {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  return digits ? `+${digits}` : undefined;
}

export function safeLandingPath(value?: string) {
  if (!value) return undefined;
  try {
    const parsed = new URL(value, "https://mutirikwireitzim.com");
    return parsed.origin === "https://mutirikwireitzim.com"
      ? `${parsed.pathname}${parsed.search}`.slice(0, 500)
      : undefined;
  } catch {
    return undefined;
  }
}
