import { ImageResponse } from "next/og";

export const alt = "Kaghan Naran: Kaghan Valley guide from Balakot to Babusar Top";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default share image for every page that has no photo of its own. */
export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#12302C", padding: 72, color: "#EEF1EE", position: "relative" }}>
        <svg width="1200" height="330" viewBox="0 0 1200 330" style={{ position: "absolute", left: 0, bottom: 0 }}>
          <path d="M0 330 L170 170 L260 240 L430 70 L560 200 L690 120 L830 230 L980 40 L1200 260 L1200 330 Z" fill="#1C3D38" />
          <path d="M930 95 L980 40 L1030 100 L1000 90 L980 105 L955 88 Z" fill="#F4F6F4" />
          <path d="M0 330 C200 300 420 310 600 280 C780 250 960 260 1200 210" stroke="#F3C64B" strokeWidth="8" fill="none" strokeDasharray="22 16" />
        </svg>
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: "#F3C64B" }}>KAGHANNARAN.COM</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1 }}>Kaghan Valley guide</div>
          <div style={{ fontSize: 38, color: "#C9D4CF" }}>Live road status, weather, places and services</div>
          <div style={{ fontSize: 30, color: "#F2A33A" }}>Balakot · Kaghan · Naran · Babusar Top</div>
        </div>
      </div>
    ),
    size,
  );
}
