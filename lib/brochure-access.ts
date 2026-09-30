import { createHmac, timingSafeEqual } from "node:crypto";

export const BROCHURE_ACCESS_COOKIE = "mutirikwi_brochure_access";
export const BROCHURE_ACCESS_TTL_SECONDS = 60 * 60 * 24;

function signingKey() {
  const secret =
    process.env.BROCHURE_ACCESS_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.DATABASE_URL?.trim();

  if (!secret) return null;

  return createHmac("sha256", secret)
    .update("mutirikwi-reit:brochure-access:v1")
    .digest();
}

export function createBrochureAccessToken(nowSeconds = Math.floor(Date.now() / 1000)) {
  const key = signingKey();
  if (!key) return null;

  const payload = `v1.${nowSeconds + BROCHURE_ACCESS_TTL_SECONDS}`;
  const signature = createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function hasBrochureAccess(cookieHeader: string | null, nowSeconds = Math.floor(Date.now() / 1000)) {
  const cookie = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${BROCHURE_ACCESS_COOKIE}=`));
  const token = cookie?.slice(BROCHURE_ACCESS_COOKIE.length + 1);
  if (!token) return false;

  const [version, expirationValue, signature, ...extra] = token.split(".");
  const expiration = Number(expirationValue);
  if (
    extra.length > 0 ||
    version !== "v1" ||
    !Number.isSafeInteger(expiration) ||
    expiration <= nowSeconds ||
    expiration > nowSeconds + BROCHURE_ACCESS_TTL_SECONDS + 60 ||
    !/^[A-Za-z0-9_-]{43}$/.test(signature ?? "")
  ) {
    return false;
  }

  const key = signingKey();
  if (!key) return false;

  const payload = `v1.${expiration}`;
  const expected = createHmac("sha256", key).update(payload).digest();
  const supplied = Buffer.from(signature, "base64url");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
