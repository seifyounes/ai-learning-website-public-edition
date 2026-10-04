"use client";

import { useActivity } from "@/lib/use-progress";
import { computeStreak } from "@/lib/gamification";

/** A small ruled STREAK cell on the desk — hidden until a streak exists. */
export default function StreakChip() {
  const { events, hydrated } = useActivity();
  if (!hydrated) return null;

  const { current } = computeStreak(events);
  if (current === 0) return null;

  return (
    <span
      title={`${current}-day study streak — complete a lesson today to keep it alive`}
      className="inline-flex items-baseline gap-2 border-[1.5px] border-print bg-sheet px-2 py-1"
    >
      <span className="field-label">Streak</span>
      <span className="qty text-[15px] text-graphite">{current}d</span>
    </span>
  );
}
