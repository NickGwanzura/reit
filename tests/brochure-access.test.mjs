import assert from "node:assert/strict";
import test from "node:test";
import {
  BROCHURE_ACCESS_COOKIE,
  BROCHURE_ACCESS_TTL_SECONDS,
  createBrochureAccessToken,
  hasBrochureAccess,
} from "../lib/brochure-access.ts";

test("only a valid, unexpired signed brochure cookie grants access", () => {
  const previousSecret = process.env.BROCHURE_ACCESS_SECRET;
  process.env.BROCHURE_ACCESS_SECRET = "test-only-secret-with-enough-entropy-123456";

  try {
    const now = 1_800_000_000;
    const token = createBrochureAccessToken(now);
    assert.ok(token);

    const cookie = `other=value; ${BROCHURE_ACCESS_COOKIE}=${token}`;
    assert.equal(hasBrochureAccess(cookie, now + 1), true);
    assert.equal(hasBrochureAccess(cookie, now + BROCHURE_ACCESS_TTL_SECONDS), false);
    assert.equal(hasBrochureAccess(`${BROCHURE_ACCESS_COOKIE}=${token}x`, now + 1), false);
    assert.equal(hasBrochureAccess(`${BROCHURE_ACCESS_COOKIE}=v1.9999999999.forged`, now + 1), false);
  } finally {
    if (previousSecret === undefined) delete process.env.BROCHURE_ACCESS_SECRET;
    else process.env.BROCHURE_ACCESS_SECRET = previousSecret;
  }
});

test("brochure access fails closed when no signing secret is configured", () => {
  const previous = {
    brochure: process.env.BROCHURE_ACCESS_SECRET,
    auth: process.env.AUTH_SECRET,
    database: process.env.DATABASE_URL,
  };
  delete process.env.BROCHURE_ACCESS_SECRET;
  delete process.env.AUTH_SECRET;
  delete process.env.DATABASE_URL;

  try {
    assert.equal(createBrochureAccessToken(1_800_000_000), null);
    assert.equal(hasBrochureAccess(`${BROCHURE_ACCESS_COOKIE}=v1.1800086400.${"a".repeat(43)}`, 1_800_000_001), false);
  } finally {
    if (previous.brochure === undefined) delete process.env.BROCHURE_ACCESS_SECRET;
    else process.env.BROCHURE_ACCESS_SECRET = previous.brochure;
    if (previous.auth === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previous.auth;
    if (previous.database === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous.database;
  }
});
