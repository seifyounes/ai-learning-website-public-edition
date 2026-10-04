import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the nav mark on the pad's paper, framed in print. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e5eaf6",
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#2d3e7e",
            color: "#e5eaf6",
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          AI
        </div>
      </div>
    ),
    size,
  );
}
