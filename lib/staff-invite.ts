import { createHash, randomBytes } from "node:crypto";

export const STAFF_INVITE_LIFETIME_MS = 72 * 60 * 60 * 1000;

export function createStaffInviteToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashStaffInviteToken(token) };
}

export function hashStaffInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isStaffInviteToken(token: unknown): token is string {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}
