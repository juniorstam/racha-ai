import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "Racha Aí – Divisor de Contas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  const logoData = readFileSync(join(process.cwd(), "public/logo-white.png"));
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#2ecc71",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoBase64} width={320} height={250} alt="Racha Aí" />

          <span style={{ fontSize: 36, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
            Divida a conta sem dividir a amizade.
          </span>

          <div style={{
            padding: "12px 32px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: 999,
            color: "white",
            fontSize: 28,
            fontWeight: 700,
          }}>
            rachaai.stamcom.com.br
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
