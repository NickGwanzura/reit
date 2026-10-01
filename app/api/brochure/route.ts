import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { hasBrochureAccess } from "@/lib/brochure-access";

export const runtime = "nodejs";

const brochurePath = join(
  process.cwd(),
  "private-assets",
  "Mutirikwi_REIT_Fact_Sheet_Oct_2026.pdf",
);

function privateHeaders(contentType = "text/plain; charset=utf-8") {
  return {
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  };
}

export async function GET(request: Request) {
  if (!hasBrochureAccess(request.headers.get("cookie"))) {
    return new Response("Submit the investor enquiry form to access the fact sheet.", {
      status: 401,
      headers: privateHeaders(),
    });
  }

  try {
    const file = await readFile(brochurePath);
    const body = Uint8Array.from(file);
    return new Response(body, {
      headers: {
        ...privateHeaders("application/pdf"),
        "Content-Disposition": 'attachment; filename="Mutirikwi_REIT_Fact_Sheet_Oct_2026.pdf"',
        "Content-Length": String(body.byteLength),
      },
    });
  } catch {
    console.error("The private investor fact sheet could not be read.");
    return new Response("The fact sheet is temporarily unavailable.", {
      status: 503,
      headers: privateHeaders(),
    });
  }
}
