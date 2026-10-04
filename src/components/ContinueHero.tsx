import Link from "next/link";
import type { NavLesson } from "@/lib/nav";

/**
 * The red-pen margin note — "you stopped here" — the returning-user resume pointer. It lives
 * in the contents margin beside the pillar that holds the next lesson, with a hand-drawn arrow
 * pointing at that line (sideways on desktop, curving down on phones). Red is the pen: text and
 * strokes only, never a fill. The parent decides when to show it (after the first completion).
 */
export default function ContinueHero({
  next,
  position,
  completed,
  total,
}: {
  next: NavLesson | null;
  /** e.g. "Pillar 3 · lesson 2 of 8" — the location line, set in mono. */
  position?: string;
  completed: number;
  total: number;
}) {
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const draw = { "--draw-ms": "520ms", "--draw-delay": "200ms" } as React.CSSProperties;

  if (!next) {
    return (
      <p className="pen-fade text-body-small font-semibold text-graphite">
        Everything complete 🏆
        <span className="qty mt-1 block text-[14px] font-normal text-muted">
          {completed} / {total} · {pct}%
        </span>
      </p>
    );
  }

  return (
    <Link href={next.href} className="group relative block text-red-pen">
      <span className="pen-fade block text-body-small font-bold leading-snug">You stopped here:</span>
      <span className="pen-fade block text-body-small leading-snug underline decoration-1 underline-offset-2 group-hover:decoration-2">
        Continue → {next.title}
      </span>
      {position && <span className="qty pen-fade mt-1 block text-[14px]">{position}</span>}
      <span className="qty pen-fade mt-0.5 block text-[14px] text-muted">
        {completed} / {total} lessons · {pct}%
      </span>
      {/* Sideways arrow into the contents line (desktop). */}
      <svg
        aria-hidden
        viewBox="0 0 40 24"
        className="absolute -end-12 top-1 hidden h-6 w-10 min-[760px]:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 16 C 12 18, 24 14, 36 8 M29 5.5 36 8 32.5 14" pathLength={1} className="pen-draw" style={draw} />
      </svg>
      {/* Curving-down arrow onto the line below (phones). */}
      <svg
        aria-hidden
        viewBox="0 0 28 30"
        className="absolute -bottom-8 start-6 h-7 w-7 min-[760px]:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 2 C 4 14, 10 22, 20 26 M13 26.5 20 26 17 20" pathLength={1} className="pen-draw" style={draw} />
      </svg>
    </Link>
  );
}
