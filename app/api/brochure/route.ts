import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { hasBrochureAccess } from "@/lib/brochure-access";

export const runtime = "nodejs";

const brochurePath = join(
  process.cwd(),
  "private-assets",
  "Masvingo_Flats_Project_Brochure_Abridged.pdf",
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
    return new Response("Submit the investor enquiry form to access the brochure.", {
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
        "Content-Disposition": 'attachment; filename="Masvingo_Flats_Project_Brochure_Abridged.pdf"',
        "Content-Length": String(body.byteLength),
      },
    });
  } catch {
    console.error("The private investor brochure could not be read.");
    return new Response("The brochure is temporarily unavailable.", {
      status: 503,
      headers: privateHeaders(),
    });
  }
}
