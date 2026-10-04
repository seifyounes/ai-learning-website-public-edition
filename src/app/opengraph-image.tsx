import { ImageResponse } from "next/og";
import { getLessonCounts } from "@/lib/content";
import { ALL_PILLARS } from "@/lib/curriculum";

export const alt = "AI Learning — a free, vendor-neutral course from near-beginner to applied AI engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The share card is the pad itself: a sheet of grid paper on the desk with a ruled title block.
const DESK = "#ccd3e5";
const SHEET = "#e5eaf6";
const GRID = "#ccd4e8";
const GRID_MAJOR = "#b8c2da";
const PRINT = "#2d3e7e";
const GRAPHITE = "#262b25";
const RED = "#a82c17";

export default function OpengraphImage() {
  const counts = getLessonCounts();
  const lines = [];
  for (let x = 0; x <= 1140; x += 20) {
    lines.push(
      <div
        key={`v${x}`}
        style={{ position: "absolute", left: x, top: 0, width: 1, height: 570, background: x % 100 === 0 ? GRID_MAJOR : GRID }}
      />,
    );
  }
  for (let y = 0; y <= 570; y += 20) {
    lines.push(
      <div
        key={`h${y}`}
        style={{ position: "absolute", top: y, left: 0, height: 1, width: 1140, background: y % 100 === 0 ? GRID_MAJOR : GRID }}
      />,
    );
  }

  const cell = (label: string, value: string, flex: number, big = false) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex,
        background: SHEET,
        padding: "14px 22px 18px",
      }}
    >
      <div style={{ fontSize: 20, letterSpacing: 2, color: PRINT, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: big ? 84 : 52, color: GRAPHITE, fontWeight: 700, lineHeight: 1 }}>{value}</div>
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: DESK, padding: 30 }}>
        <div style={{ position: "relative", display: "flex", flex: 1, background: SHEET, overflow: "hidden" }}>
          {lines}
          <div style={{ position: "absolute", left: 60, top: 70, right: 60, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", border: `4px solid ${PRINT}`, background: PRINT, gap: 2 }}>
              {cell("COURSE", "AI Learning", 2.6, true)}
              {cell("PILLARS", String(ALL_PILLARS.length), 1)}
              {cell("LESSONS", String(counts.total), 1)}
            </div>
            <div style={{ marginTop: 44, fontSize: 40, color: GRAPHITE, fontWeight: 700, lineHeight: 1.2 }}>
              A free, vendor-neutral course from near-beginner to applied AI engineer.
            </div>
            <div style={{ marginTop: 26, display: "flex", alignItems: "center", fontSize: 28, color: RED }}>
              <div style={{ width: 34, height: 34, border: `3px solid ${RED}`, marginRight: 14 }} />
              Hand-picked video · original breakdown · hands-on task · quiz
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
