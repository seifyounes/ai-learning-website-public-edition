import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The pad's shared printed pieces (the Computation Pad design system → Components).
 *
 * TitleBlock: every page opens with one — cells on a `print` ground so the 1px gaps read as
 * ruled lines, inside a 2px print border. Pass the grid columns per breakpoint via className.
 */
export function TitleBlock({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`grid gap-px border-2 border-print bg-print ${className}`}>{children}</div>
  );
}

/** A title-block cell: the printed field label on top, the value at the bottom. */
export function Cell({
  label,
  children,
  className = "",
  as: Tag = "div",
  align = "bottom",
}: {
  label: string;
  children?: ReactNode;
  className?: string;
  as?: "div" | "header";
  /** "top" keeps values on one line across a row whose cells differ in height. */
  align?: "bottom" | "top";
}) {
  return (
    <Tag
      className={`flex min-w-0 flex-col ${align === "top" ? "justify-start" : "justify-between"} gap-2 bg-sheet px-3 pb-[9px] pt-[7px] ${className}`}
    >
      <span className="field-label">{label}</span>
      <div className="min-w-0 text-pencil">{children}</div>
    </Tag>
  );
}

/** The back cell: a title-block cell that is a link — printed arrow plus BACK label. */
export function BackCell({ href, label = "Back", className = "" }: { href: string; label?: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`hover-tint flex items-center gap-2 bg-sheet px-3 py-3 text-print ${className}`}
    >
      <Arrow dir="back" />
      <span className="label-action">{label}</span>
    </Link>
  );
}

/** Drawn stroke arrow (2px, round caps) in currentColor. */
export function Arrow({ dir = "forward", className = "" }: { dir?: "forward" | "back" | "up" | "down"; className?: string }) {
  const rotate = { forward: 0, back: 180, down: 90, up: -90 }[dir];
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      width="16"
      height="16"
      className={`shrink-0 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}

/** A hand-drawn graphite tick; `draw` inks it along its path (300ms) on first render. */
export function Tick({ draw = false, className = "" }: { draw?: boolean; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      width="16"
      height="16"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 8.5 6.5 12.5 13.5 3.5" pathLength={1} className={draw ? "pen-draw" : undefined} />
    </svg>
  );
}

/** Square gauge: pencil frame, print fill, scaled (never resized) so it animates on transform. */
export function Gauge({ pct, label }: { pct: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className="gauge"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
    >
      <span style={{ transform: `scaleX(${clamped / 100})` }} />
    </div>
  );
}
