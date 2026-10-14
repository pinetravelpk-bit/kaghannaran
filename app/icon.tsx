import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Small favicon (the full logo is too detailed at tab size). */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#12302C", borderRadius: 14 }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <path d="M6 50 L24 22 L33 34 L42 18 L58 50 Z" fill="#EEF1EE" />
          <path d="M38 24 L42 18 L46 25 L43 23 Z" fill="#12302C" />
          <path d="M6 54 L58 54" stroke="#F3C64B" strokeWidth="5" strokeDasharray="6 4" />
        </svg>
      </div>
    ),
    size,
  );
}
