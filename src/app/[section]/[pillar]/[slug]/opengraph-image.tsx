import { ImageResponse } from "next/og";
import { getAllLessons, getLesson, totalMinutes } from "@/lib/content";
import { getPillar, isSection } from "@/lib/curriculum";

export const alt = "An AI Learning lesson";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllLessons().map((l) => ({ section: l.section, pillar: l.pillar, slug: l.slug }));
}

// Same pad as the site card: grid paper on the desk, a ruled title block with the lesson in it.
const DESK = "#ccd3e5";
const SHEET = "#e5eaf6";
const GRID = "#ccd4e8";
const GRID_MAJOR = "#b8c2da";
const PRINT = "#2d3e7e";
const GRAPHITE = "#262b25";
const MUTED = "#4e5566";

export default async function LessonOgImage({
  params,
}: {
  params: Promise<{ section: string; pillar: string; slug: string }>;
}) {
  const { section, pillar, slug } = await params;
  const lesson = isSection(section) ? getLesson(section, pillar, slug) : undefined;
  const pillarMeta = isSection(section) ? getPillar(section, pillar) : undefined;
  const title = lesson?.title ?? "AI Learning";

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

  const cell = (label: string, value: string, flex: number, size = 40) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex,
        background: SHEET,
        padding: "14px 22px 18px",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 20, letterSpacing: 2, color: PRINT, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: size, color: GRAPHITE, fontWeight: 700, lineHeight: 1.08 }}>{value}</div>
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: DESK, padding: 30 }}>
        <div style={{ position: "relative", display: "flex", flex: 1, background: SHEET, overflow: "hidden" }}>
          {lines}
          <div style={{ position: "absolute", left: 60, top: 60, right: 60, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", border: `4px solid ${PRINT}`, background: PRINT, gap: 2 }}>
              {cell("LESSON", title, 1, title.length > 48 ? 46 : 58)}
              <div style={{ display: "flex", gap: 2 }}>
                {cell("PILLAR", pillarMeta?.title ?? "", 3, 28)}
                {cell("LEVEL", lesson ? lesson.level[0].toUpperCase() + lesson.level.slice(1) : "", 1.2, 28)}
                {cell("TIME", lesson ? `${totalMinutes(lesson)} min` : "", 1, 28)}
              </div>
            </div>
            {lesson?.subtitle || lesson?.summary ? (
              <div style={{ marginTop: 30, fontSize: 32, lineHeight: 1.3, color: GRAPHITE }}>
                {lesson.subtitle ?? lesson.summary}
              </div>
            ) : null}
            <div style={{ marginTop: 26, display: "flex", alignItems: "center", fontSize: 26, color: MUTED }}>
              <div style={{ width: 26, height: 26, border: `3px solid ${PRINT}`, marginRight: 14 }} />
              AI Learning · free and vendor-neutral · video · breakdown · task · quiz
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
