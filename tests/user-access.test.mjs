import assert from "node:assert/strict";
import test from "node:test";
import { decideUserRemoval } from "../lib/user-access.ts";

test("allows removal of active CRM staff other than the actor", () => {
  assert.equal(decideUserRemoval({ id: "staff-2", role: "RELATIONSHIP_MANAGER", isActive: true }, "staff-1", 1), "remove");
});

test("prevents self-removal and removal of the last active super-admin", () => {
  assert.equal(decideUserRemoval({ id: "staff-1", role: "SUPER_ADMIN", isActive: true }, "staff-1", 2), "self");
  assert.equal(decideUserRemoval({ id: "staff-2", role: "SUPER_ADMIN", isActive: true }, "staff-1", 1), "last-admin");
});

test("only active CRM roles can be deactivated", () => {
  assert.equal(decideUserRemoval({ id: "staff-2", role: "FUND_MANAGER", isActive: false }, "staff-1", 1), "inactive");
  assert.equal(decideUserRemoval({ id: "investor-1", role: "INVESTOR", isActive: true }, "staff-1", 1), "not-staff");
});
