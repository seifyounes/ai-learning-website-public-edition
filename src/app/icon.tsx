import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** The nav mark: "AI" printed in a square of the pad's print ink. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2d3e7e",
          color: "#e5eaf6",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        AI
      </div>
    ),
    size,
  );
}
