export function hasValidOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const requestOrigin = new URL(origin).origin;
    const canonicalOrigin = process.env.AUTH_URL
      ? new URL(process.env.AUTH_URL).origin
      : null;
    if (canonicalOrigin && requestOrigin === canonicalOrigin) return true;
    return requestOrigin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
