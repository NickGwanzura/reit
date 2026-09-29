import assert from "node:assert/strict";
import test from "node:test";
import { leadSubmissionSchema, normalizePhone, safeLandingPath } from "../lib/validation/lead.ts";
import { hasValidOrigin } from "../lib/origin.ts";

function validPayload(overrides = {}) {
  return {
    firstName: "Tariro",
    lastName: "Moyo",
    email: "TARIRO@example.com",
    phone: "+263 77 123 4567",
    whatsapp: "",
    country: "Zimbabwe",
    investorType: "INDIVIDUAL",
    investmentRange: "RANGE_1000_4999",
    timeline: "ONE_TO_THREE_MONTHS",
    preferredContact: "EMAIL",
    consent: true,
    website: "",
    attribution: {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      landingPage: "/?utm_source=campaign",
    },
    ...overrides,
  };
}

test("accepts a valid lead and normalizes email casing", () => {
  const parsed = leadSubmissionSchema.safeParse(validPayload());
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.email, "tariro@example.com");
    assert.equal(parsed.data.whatsapp, undefined);
  }
});

test("requires explicit consent and a supported pipeline category", () => {
  assert.equal(leadSubmissionSchema.safeParse(validPayload({ consent: false })).success, false);
  assert.equal(leadSubmissionSchema.safeParse(validPayload({ investorType: "UNKNOWN" })).success, false);
});

test("rejects unexpected fields rather than silently storing them", () => {
  assert.equal(leadSubmissionSchema.safeParse(validPayload({ bankAccount: "not-allowed" })).success, false);
});

test("normalizes phone digits and limits landing attribution to a local path", () => {
  assert.equal(normalizePhone("+263 (77) 123-4567"), "+263771234567");
  assert.equal(safeLandingPath("/?utm_campaign=web"), "/?utm_campaign=web");
  assert.equal(safeLandingPath("https://attacker.invalid/path"), undefined);
});

test("accepts the configured HTTPS origin when the reverse proxy reports an internal request origin", () => {
  process.env.AUTH_URL = "https://mutirikwireitzim.com";
  const request = new Request("http://mutirikwireitzim.com/api/admin/me/password", {
    method: "PATCH",
    headers: { origin: "https://mutirikwireitzim.com" },
  });
  assert.equal(hasValidOrigin(request), true);
});

test("rejects missing and unrelated request origins", () => {
  process.env.AUTH_URL = "https://mutirikwireitzim.com";
  assert.equal(hasValidOrigin(new Request("https://mutirikwireitzim.com/api/admin/me/password", { method: "PATCH" })), false);
  assert.equal(hasValidOrigin(new Request("http://internal/api/admin/me/password", {
    method: "PATCH",
    headers: { origin: "https://attacker.invalid" },
  })), false);
});
