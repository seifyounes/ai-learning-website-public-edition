import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Lesson, LessonFrontmatter, Section } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const SECTIONS: Section[] = ["foundations", "applications"];

function readLessonFile(
  section: Section,
  pillar: string,
  fileName: string,
): Lesson | null {
  const filePath = path.join(CONTENT_DIR, section, pillar, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as Partial<LessonFrontmatter>;

  if (!fm.title || typeof fm.order !== "number") {
    // Skip malformed files rather than crashing the whole build.
    return null;
  }

  const slug = fileName.replace(/\.mdx?$/, "");
  const href = `/${section}/${pillar}/${slug}`;

  return {
    title: fm.title,
    subtitle: fm.subtitle,
    summary: fm.summary,
    changeNote: fm.changeNote,
    audience: fm.audience,
    section,
    pillar,
    module: fm.module,
    order: fm.order,
    level: fm.level ?? "beginner",
    estMinutes: fm.estMinutes,
    taskMinutes: fm.taskMinutes,
    shortPath: fm.shortPath,
    prerequisites: fm.prerequisites ?? [],
    reviewedOn: fm.reviewedOn,
    status: fm.status ?? "published",
    video: fm.video ?? null,
    readAfter: fm.readAfter ?? [],
    applyIt: fm.applyIt,
    toolkit: fm.toolkit,
    recap: fm.recap ?? [],
    task: fm.task,
    selfCheck: fm.selfCheck ?? [],
    mcq: fm.mcq ?? [],
    backupResources: fm.backupResources ?? [],
    tags: fm.tags ?? [],
    slug,
    body: content.trim(),
    href,
    key: `${section}/${pillar}/${slug}`,
  };
}

// The static build asks for the lesson list hundreds of times; read the disk once there.
// Dev re-reads so edits to content/ show up on refresh.
let cached: Lesson[] | null = null;

/** Read every lesson from disk, sorted by pillar then order. */
export function getAllLessons(): Lesson[] {
  if (cached && process.env.NODE_ENV === "production") return cached;
  cached = readAllLessons();
  return cached;
}

function readAllLessons(): Lesson[] {
  const lessons: Lesson[] = [];

  for (const section of SECTIONS) {
    const sectionDir = path.join(CONTENT_DIR, section);
    if (!fs.existsSync(sectionDir)) continue;

    for (const pillar of fs.readdirSync(sectionDir)) {
      const pillarDir = path.join(sectionDir, pillar);
      if (!fs.statSync(pillarDir).isDirectory()) continue;

      for (const fileName of fs.readdirSync(pillarDir)) {
        if (!/\.mdx?$/.test(fileName)) continue;
        const lesson = readLessonFile(section, pillar, fileName);
        if (lesson) lessons.push(lesson);
      }
    }
  }

  return lessons.sort((a, b) => a.order - b.order);
}

export function getLessonsByPillar(section: Section, pillar: string): Lesson[] {
  return getAllLessons().filter((l) => l.section === section && l.pillar === pillar);
}

export function getLesson(
  section: Section,
  pillar: string,
  slug: string,
): Lesson | undefined {
  return getAllLessons().find(
    (l) => l.section === section && l.pillar === pillar && l.slug === slug,
  );
}

export interface PillarCount {
  total: number;
  byPillar: Record<string, number>;
}

export function getLessonCounts(): PillarCount {
  const lessons = getAllLessons();
  const byPillar: Record<string, number> = {};
  for (const l of lessons) {
    byPillar[`${l.section}/${l.pillar}`] = (byPillar[`${l.section}/${l.pillar}`] ?? 0) + 1;
  }
  return { total: lessons.length, byPillar };
}

/**
 * A lesson pointer: "→ slug", optionally "→ covered in slug", with the slug optionally wrapped
 * in **bold**, `code` or **`both`**. Groups: 1 "covered in ", 2 the slug.
 */
const POINTER = /→\s*(covered in\s+)?(?:\*\*`|\*\*|`)?([a-z0-9]+(?:-[a-z0-9]+)+)(?:`\*\*|\*\*|`)?(?![\w-])/g;

/**
 * Lessons point at each other with "→ lesson-slug" (see POINTER). Turn every pointer whose slug
 * is a real lesson into a markdown link titled with that lesson's name, or, with `plain`, into
 * just the title (for places a link can't go, such as inside a button). Fenced code (prompt
 * cards) is left untouched and unknown slugs stay as written. `scripts/check-public.js` fails on
 * slugs written any other way.
 */
export function linkLessonPointers(
  markdown: string | undefined,
  { plain = false }: { plain?: boolean } = {},
): string | undefined {
  if (!markdown) return markdown;
  const bySlug = new Map(getAllLessons().map((l) => [l.slug, l]));
  return markdown
    .split(/(```[\s\S]*?```)/g)
    .map((part) =>
      part.startsWith("```")
        ? part
        : part.replace(POINTER, (match, coveredIn: string | undefined, slug: string) => {
            const target = bySlug.get(slug);
            if (!target) return match;
            const title = target.title.replace(/[[\]]/g, "");
            return plain ? `→ ${coveredIn ?? ""}*${title}*` : `→ ${coveredIn ?? ""}[${title}](${target.href})`;
          }),
    )
    .join("");
}

/** Link the lesson pointers in every prose field a lesson page renders. */
export function linkLesson(lesson: Lesson): Lesson {
  const link = linkLessonPointers;
  return {
    ...lesson,
    body: link(lesson.body) ?? "",
    applyIt: link(lesson.applyIt),
    toolkit: link(lesson.toolkit),
    task: link(lesson.task),
    shortPath: link(lesson.shortPath),
    video: lesson.video
      ? { ...lesson.video, why: link(lesson.video.why), notes: lesson.video.notes?.map((n) => link(n) ?? "") }
      : lesson.video,
    recap: lesson.recap?.map((r) => ({ ...r, title: link(r.title, { plain: true }) ?? "", text: link(r.text) ?? "" })),
    // Questions render inside a button, so they name the lesson without linking it.
    selfCheck: lesson.selfCheck?.map((s) => ({ ...s, q: link(s.q, { plain: true }) ?? "", a: link(s.a) ?? "" })),
    mcq: lesson.mcq?.map((q) => ({
      ...q,
      q: link(q.q, { plain: true }) ?? "",
      options: q.options.map((o) => link(o, { plain: true }) ?? ""),
      explain: link(q.explain) ?? "",
    })),
  };
}

/** Words of lesson prose (breakdown + apply + setup), excluding code. */
function proseWords(lesson: Lesson): number {
  return [lesson.body, lesson.applyIt, lesson.toolkit]
    .filter(Boolean)
    .join(" ")
    .replace(/```[\s\S]*?```/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Reading time at a study pace of ~180 words a minute. */
export function readMinutes(lesson: Lesson): number {
  return Math.max(1, Math.round(proseWords(lesson) / 180));
}

/** Minutes of video this lesson asks for: the recommended part of a long video, else all of it. */
export function videoMinutes(lesson: Lesson): number | undefined {
  return lesson.video?.watchMinutes ?? lesson.video?.minutes;
}

/** Total study time: video + reading + task. Falls back to the authored estimate. */
export function totalMinutes(lesson: Lesson): number {
  const video = videoMinutes(lesson);
  const parts = (video ?? 0) + readMinutes(lesson) + (lesson.taskMinutes ?? 0);
  return video && lesson.taskMinutes ? parts : lesson.estMinutes ?? parts;
}
