"use client";

import { useEffect, useState } from "react";

// Pad inks only: print, graphite, pencil, muted and the grid rule. Never the red pen (red is
// never a fill).
const COLORS = ["var(--print)", "var(--graphite)", "var(--grid-major)", "var(--muted)", "var(--pencil)"];
const PIECES = 28;

/**
 * Zero-dependency celebration burst — square paper scraps in the pad's inks. Increment `burst`
 * to fire; the layer removes itself when the CSS animation finishes. Off under reduced motion.
 */
export default function Confetti({ burst }: { burst: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!burst) return;
    setActive(burst);
    const t = setTimeout(() => setActive(0), 1900);
    return () => clearTimeout(t);
  }, [burst]);

  if (!active) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: PIECES }).map((_, i) => (
        <span
          key={`${active}-${i}`}
          className="confetti-piece"
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 7) * 0.09}s`,
            animationDuration: `${1.1 + ((i * 13) % 6) * 0.13}s`,
          }}
        />
      ))}
    </div>
  );
}
