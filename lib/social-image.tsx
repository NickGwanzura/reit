import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const socialImageSize = { width: 1200, height: 630 };
export const socialImageAlt =
  "Mutirikwi REIT — commercial real estate opportunities in the Masvingo region";

const [logoFile, lakeFile] = await Promise.all([
  readFile(join(process.cwd(), "public", "assets", "mutirikwi-reit-logo.png")),
  readFile(join(process.cwd(), "public", "assets", "lake-mutirikwi-hero.jpg")),
]);

const logoSource = `data:image/png;base64,${logoFile.toString("base64")}`;
const lakeSource = `data:image/jpeg;base64,${lakeFile.toString("base64")}`;

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#14243d",
          color: "#fff",
          fontFamily: "Arial",
        }}
      >
        <img
          src={lakeSource}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 660,
            height: "100%",
            objectFit: "cover",
            objectPosition: "58% center",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 540,
            background: "#14243d",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 540,
            width: 6,
            background: "#ed1c24",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 58,
            top: 36,
            width: 240,
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: 3,
            background: "#fff",
          }}
        >
          <img
            src={logoSource}
            style={{ width: 240, height: 160, objectFit: "contain" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 220,
            display: "flex",
            alignItems: "center",
            gap: 13,
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 2.2,
          }}
        >
          <span style={{ width: 32, height: 2, background: "#ed1c24" }} />
          MASVINGO REGION
        </div>
        <div
          style={{
            position: "absolute",
            left: 58,
            top: 265,
            display: "flex",
            flexDirection: "column",
            fontSize: 47,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -1.4,
          }}
        >
          <span>Unlocking real estate</span>
          <span style={{ color: "#f1d8d5" }}>value in Masvingo.</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 60,
            bottom: 38,
            display: "flex",
            color: "#e5e9ed",
            fontSize: 16,
            letterSpacing: 0.2,
          }}
        >
          SECZ-LICENSED REIT · COMMERCIAL PROPERTY
        </div>
        <div
          style={{
            position: "absolute",
            right: 36,
            bottom: 34,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "15px 21px",
            border: "1px solid rgba(255,255,255,.48)",
            borderLeft: "4px solid #ed1c24",
            background: "rgba(13, 29, 49, .94)",
          }}
        >
          <span style={{ fontSize: 42, fontWeight: 700, lineHeight: 1 }}>17%</span>
          <span style={{ color: "#e5e9ed", fontSize: 15, lineHeight: 1.35 }}>
            TARGET IRR ON<br />PROPERTY DEVELOPMENTS
          </span>
        </div>
      </div>
    ),
    socialImageSize,
  );
}
