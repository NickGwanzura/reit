import assert from "node:assert/strict";
import test from "node:test";
import { resolveReportRange } from "../lib/lead-report-range.ts";

test("date filters include full Harare calendar days", () => {
  const range = resolveReportRange("2026-09-30", "2026-09-30", new Date("2026-09-30T10:00:00.000Z"));
  assert.equal(range.start.toISOString(), "2026-09-29T22:00:00.000Z");
  assert.equal(range.endExclusive.toISOString(), "2026-09-30T22:00:00.000Z");
});

test("default report period uses the current Harare date and six calendar months", () => {
  const range = resolveReportRange(undefined, undefined, new Date("2026-09-29T23:30:00.000Z"));
  assert.equal(range.from, "2026-04-01");
  assert.equal(range.to, "2026-09-30");
});

test("invalid, reversed, and overlong date ranges are rejected", () => {
  assert.throws(() => resolveReportRange("2026-02-30", "2026-03-01"));
  assert.throws(() => resolveReportRange("2026-10-02", "2026-10-01"));
  assert.throws(() => resolveReportRange("2025-01-01", "2026-01-02"), /366 days/);
});
