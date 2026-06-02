import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Racha Aí – Divisor de Contas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
        {/* círculo decorativo */}
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

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          {/* emoji taça */}
          <div style={{ fontSize: 120 }}>🥂</div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 80, fontWeight: 900, color: "white", letterSpacing: -2 }}>
              Racha Aí
            </span>
            <span style={{ fontSize: 36, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
              Divida a conta sem dividir a amizade.
            </span>
          </div>

          <div style={{
            marginTop: 16,
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
