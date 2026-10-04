export type Section = "foundations" | "applications";

export type Level = "beginner" | "intermediate" | "advanced";

export interface VideoRef {
  /** YouTube video id (preferred) or a full url. Omit while a lesson is unvetted. */
  videoId?: string;
  url?: string;
  title?: string;
  /** Creator / source label, e.g. "Dave Ebbelaar" or "Hugging Face". */
  channel?: string;
  /** Non-YouTube primaries only: what kind of resource the url points to. */
  kind?: "video" | "course" | "docs" | "article" | "interactive";
  /** Why this is the single best explanation, versus the alternatives. */
  why?: string;
  /** Video length in minutes (written by `scripts/check-links.js --durations --write`). */
  minutes?: number;
  /** Year the video was published (written by the same script). */
  year?: number;
  /** Upload date, YYYY-MM-DD (written by the same script). */
  published?: string;
  /** For long videos: where the part this lesson needs starts, in seconds. */
  start?: number;
  /** For long videos: minutes of the recommended part. */
  watchMinutes?: number;
  /** Watch notes: timestamps, segments to skip, what has changed since the video was made. */
  notes?: string[];
  /** A shorter alternative shown under the video for learners short on time. */
  short?: { label: string; url: string; minutes: number };
}

/**
 * Follow-up reading shown directly under the video embed ("Read after the video").
 * No "video" kind — extra videos belong in backupResources.
 */
export interface ReadAfterItem {
  label: string;
  url: string;
  kind?: "docs" | "course" | "article" | "interactive" | "repo";
}

export interface SelfCheckItem {
  q: string;
  a: string;
}

/** A challenging multiple-choice question (Math & ML Core lessons). */
export interface McqItem {
  q: string;
  /** Exactly one correct option; 3–5 options total. */
  options: string[];
  /** Index into options. */
  answer: number;
  /** Why the right answer is right (and the tempting wrong one is wrong). */
  explain: string;
}

/** One step of the gamified video recap — revealed one at a time, in order. */
export interface RecapStep {
  /** Single emoji shown on the step card. */
  emoji: string;
  /** ≤6-word headline for the idea. */
  title: string;
  /** 1–2 sentence recap of that idea, in our own words (never the transcript). */
  text: string;
}

export interface Resource {
  label: string;
  url: string;
  type?: string;
}

/** What the author writes in a lesson's frontmatter. */
export interface LessonFrontmatter {
  title: string;
  /** Second line of the title: what the lesson covers. */
  subtitle?: string;
  /** One plain sentence: what the learner can do after the lesson (search, share cards). */
  summary?: string;
  /** What the last review changed or checked, shown beside the review date. */
  changeNote?: string;
  /** "builders": aimed at people who build software; others can come back later. */
  audience?: "builders";
  section: Section;
  pillar: string; // pillar/track slug
  module?: string;
  order: number;
  level: Level;
  estMinutes?: number;
  /** Realistic minutes for the hands-on task. */
  taskMinutes?: number;
  /** Inline markdown: a first sitting of about 40 minutes for a long lesson, and what to come back to. */
  shortPath?: string;
  /** Slugs of earlier lessons a learner should do first. */
  prerequisites?: string[];
  /** ISO date the lesson's pick was last reviewed. Drives the freshness flag. */
  reviewedOn?: string;
  status?: "draft" | "published";
  video?: VideoRef | null;
  /** Follow-up reading rendered as a strip under the video embed. */
  readAfter?: ReadAfterItem[];
  /** Markdown: how to apply this to the learner's own project or work. */
  applyIt?: string;
  /** Markdown: "Upgrade your AI setup" — durable improvements to the learner's AI tools and habits. */
  toolkit?: string;
  /** Gamified animated video summary — steps revealed one at a time after watching. */
  recap?: RecapStep[];
  /** Markdown: the hands-on "do this now" task. */
  task?: string;
  selfCheck?: SelfCheckItem[];
  /** Challenging AI-connected MCQs — rendered as an interactive quiz block. */
  mcq?: McqItem[];
  backupResources?: Resource[];
  tags?: string[];
}

/** A fully-resolved lesson: frontmatter + body + computed routing fields. */
export interface Lesson extends LessonFrontmatter {
  slug: string;
  /** Markdown body = the expert breakdown. */
  body: string;
  href: string;
  /** Stable key used for localStorage progress + notes. */
  key: string;
}
