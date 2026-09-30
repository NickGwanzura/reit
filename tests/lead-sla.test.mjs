import assert from "node:assert/strict";
import test from "node:test";
import { addHarareBusinessMinutes, isFirstContactOverdue } from "../lib/lead-sla.ts";

test("first-contact SLA adds eight weekday business hours from a weekday morning", () => {
  assert.equal(addHarareBusinessMinutes(new Date("2026-09-28T08:00:00.000Z")).toISOString(), "2026-09-29T07:00:00.000Z");
});

test("first-contact SLA carries remaining hours across a weekend", () => {
  assert.equal(addHarareBusinessMinutes(new Date("2026-10-02T14:00:00.000Z")).toISOString(), "2026-10-05T13:00:00.000Z");
});

test("a weekend enquiry starts its SLA on Monday at 08:00 Harare time", () => {
  assert.equal(addHarareBusinessMinutes(new Date("2026-10-03T06:00:00.000Z")).toISOString(), "2026-10-05T14:00:00.000Z");
});

test("only uncontacted records can be overdue", () => {
  const createdAt = new Date("2026-09-28T08:00:00.000Z");
  assert.equal(isFirstContactOverdue(createdAt, null, new Date("2026-09-29T08:00:00.000Z")), true);
  assert.equal(isFirstContactOverdue(createdAt, new Date("2026-09-29T07:00:00.000Z"), new Date("2026-09-30T10:00:00.000Z")), false);
});
