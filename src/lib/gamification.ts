/**
 * Pure, client-safe gamification math: XP, levels, streaks, badges.
 * Everything is DERIVED from the progress map + activity log on each render —
 * nothing here persists its own state, so there is nothing to migrate.
 */

export interface ActivityEvent {
  key: string;
  ts: number;
}

export interface LessonXpMeta {
  estMinutes?: number;
  level?: string;
}

const LEVEL_MULT: Record<string, number> = {
  beginner: 1,
  intermediate: 1.5,
  advanced: 2,
};

/** XP for one lesson: minutes weighted by difficulty. */
export function xpForLesson(meta: LessonXpMeta): number {
  const mult = LEVEL_MULT[meta.level ?? "beginner"] ?? 1;
  return Math.round((meta.estMinutes ?? 10) * mult);
}

export const LEVEL_NAMES = [
  "Explorer",
  "Builder",
  "Practitioner",
  "Engineer",
  "Senior Builder",
  "Applied AI Engineer",
] as const;

/** Level floors as fractions of the course's max XP — top rank lands at 90%. */
const LEVEL_FRACTIONS = [0, 0.08, 0.22, 0.42, 0.65, 0.9];

export interface LevelInfo {
  name: (typeof LEVEL_NAMES)[number];
  index: number;
  /** XP where this level starts. */
  floor: number;
  /** XP where the next level starts (null at the top). */
  next: number | null;
}

export function levelForXp(xp: number, maxXp: number): LevelInfo {
  const floors = LEVEL_FRACTIONS.map((f) => Math.round(f * maxXp));
  let index = 0;
  for (let i = floors.length - 1; i >= 0; i--) {
    if (xp >= floors[i]) {
      index = i;
      break;
    }
  }
  return {
    name: LEVEL_NAMES[index],
    index,
    floor: floors[index],
    next: index + 1 < floors.length ? floors[index + 1] : null,
  };
}

function localDayStart(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function dayBefore(dayStart: number): number {
  const d = new Date(dayStart);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1).getTime();
}

function dayAfter(dayStart: number): number {
  const d = new Date(dayStart);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
}

export interface Streak {
  /** Consecutive days with ≥1 completion, ending today or yesterday. */
  current: number;
  best: number;
}

export function computeStreak(events: { ts: number }[], now = Date.now()): Streak {
  const days = new Set(events.map((e) => localDayStart(e.ts)));

  let cursor = localDayStart(now);
  if (!days.has(cursor)) cursor = dayBefore(cursor); // streak survives until today ends
  let current = 0;
  while (days.has(cursor)) {
    current++;
    cursor = dayBefore(cursor);
  }

  let best = current;
  let run = 0;
  let prev: number | null = null;
  for (const day of [...days].sort((a, b) => a - b)) {
    run = prev !== null && day === dayAfter(prev) ? run + 1 : 1;
    if (run > best) best = run;
    prev = day;
  }

  return { current, best };
}

export interface QuizScore {
  got: number;
  total: number;
  ts: number;
}

/** Last self-check attempt per lesson (written by SelfCheck.tsx). */
export function readQuizScores(): Record<string, QuizScore> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("ai-learn:quiz:v1");
    return raw ? (JSON.parse(raw) as Record<string, QuizScore>) : {};
  } catch {
    return {};
  }
}

export interface BadgeCtx {
  completedKeys: Set<string>;
  quizScores: Record<string, QuizScore>;
  pillars: { slug: string; lessonKeys: string[] }[];
  fastTrackKeys: string[];
  streak: Streak;
  totalLessons: number;
}

export interface BadgeDef {
  id: string;
  icon: string;
  label: string;
  desc: string;
  earned: (ctx: BadgeCtx) => boolean;
}

function pillarDone(ctx: BadgeCtx, slug: string): boolean {
  const p = ctx.pillars.find((x) => x.slug === slug);
  return Boolean(p && p.lessonKeys.length > 0 && p.lessonKeys.every((k) => ctx.completedKeys.has(k)));
}

export const BADGES: BadgeDef[] = [
  {
    id: "first-lesson",
    icon: "🚀",
    label: "Liftoff",
    desc: "Complete your first lesson",
    earned: (c) => c.completedKeys.size >= 1,
  },
  {
    id: "ten-lessons",
    icon: "🔟",
    label: "Double digits",
    desc: "Complete 10 lessons",
    earned: (c) => c.completedKeys.size >= 10,
  },
  {
    id: "quiz-perfect",
    icon: "🎯",
    label: "Bullseye",
    desc: "Ace a self-check with a perfect score",
    earned: (c) =>
      Object.values(c.quizScores).some((s) => s.total > 0 && s.got === s.total),
  },
  {
    id: "streak-3",
    icon: "🔥",
    label: "On a roll",
    desc: "Study 3 days in a row",
    earned: (c) => c.streak.best >= 3,
  },
  {
    id: "streak-7",
    icon: "⚡",
    label: "Momentum",
    desc: "Study 7 days in a row",
    earned: (c) => c.streak.best >= 7,
  },
  {
    id: "streak-14",
    icon: "🌟",
    label: "Unstoppable",
    desc: "Study 14 days in a row",
    earned: (c) => c.streak.best >= 14,
  },
  {
    id: "pillar-complete",
    icon: "🏛️",
    label: "Pillar down",
    desc: "Finish every lesson in any pillar",
    earned: (c) => c.pillars.some((p) => pillarDone(c, p.slug)),
  },
  {
    id: "engineers-spine",
    icon: "🧠",
    label: "Engineer's spine",
    desc: "Finish the Applied AI engineering pillar",
    earned: (c) => pillarDone(c, "applied-ai-engineering"),
  },
  {
    id: "job-ready",
    icon: "💼",
    label: "Job-ready",
    desc: "Finish every lesson on the Get-Hired fast track",
    earned: (c) =>
      c.fastTrackKeys.length > 0 && c.fastTrackKeys.every((k) => c.completedKeys.has(k)),
  },
  {
    id: "course-complete",
    icon: "🏆",
    label: "The whole galaxy",
    desc: "Finish every lesson on the site",
    earned: (c) => c.totalLessons > 0 && c.completedKeys.size >= c.totalLessons,
  },
];
