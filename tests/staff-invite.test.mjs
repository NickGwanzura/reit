import assert from "node:assert/strict";
import test from "node:test";
import {
  createStaffInviteToken,
  hashStaffInviteToken,
  isStaffInviteToken,
  STAFF_INVITE_LIFETIME_MS,
} from "../lib/staff-invite.ts";

test("staff invite tokens are high-entropy, validated, and only stored as hashes", () => {
  const first = createStaffInviteToken();
  const second = createStaffInviteToken();

  assert.equal(isStaffInviteToken(first.token), true);
  assert.equal(first.token.length, 43);
  assert.match(first.tokenHash, /^[a-f0-9]{64}$/);
  assert.notEqual(first.token, first.tokenHash);
  assert.equal(first.tokenHash, hashStaffInviteToken(first.token));
  assert.notEqual(first.tokenHash, second.tokenHash);
  assert.equal(isStaffInviteToken("short"), false);
  assert.equal(isStaffInviteToken(`${first.token}.`), false);
});

test("staff invitation lifetime is 72 hours", () => {
  assert.equal(STAFF_INVITE_LIFETIME_MS, 72 * 60 * 60 * 1000);
});
