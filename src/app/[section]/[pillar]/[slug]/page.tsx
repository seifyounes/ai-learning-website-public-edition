import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPillar, isSection } from "@/lib/curriculum";
import {
  getAllLessons,
  getLesson,
  getLessonsByPillar,
  linkLesson,
  readMinutes,
  totalMinutes,
  videoMinutes,
} from "@/lib/content";
import { getAllNavLessons } from "@/lib/nav";
import WithSidebar from "@/components/WithSidebar";
import { SITE_URL } from "@/lib/site";
import LessonView from "@/components/LessonView";

// Only the course's own paths exist; anything else gets the prerendered 404 page.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllLessons().map((l) => ({
    section: l.section,
    pillar: l.pillar,
    slug: l.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; pillar: string; slug: string }>;
}): Promise<Metadata> {
  const { section, pillar, slug } = await params;
  const lesson = isSection(section) ? getLesson(section, pillar, slug) : undefined;
  if (!lesson) return { title: "Page not found" };
  const pillarMeta = getPillar(lesson.section, pillar);
  const description =
    lesson.summary ??
    summarize(lesson.body) ??
    `A free lesson in ${pillarMeta?.title ?? "AI"}: a hand-picked video, an original breakdown, a hands-on task and a self-check.`;
  const title = `${lesson.title} · ${pillarMeta?.title ?? "AI Learning"}`;
  const pageTitle = lesson.subtitle ? `${lesson.title}: ${lesson.subtitle}` : lesson.title;
  return {
    title: pageTitle,
    description,
    alternates: { canonical: lesson.href },
    openGraph: { type: "article", siteName: "AI Learning", title, description, url: lesson.href },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** The breakdown's opening sentence(s) as plain text, trimmed to a share-card length. */
function summarize(markdown: string): string | undefined {
  const para = markdown
    .replace(/```[\s\S]*?```/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|>|[-*] |\d+\. |\|)/.test(p));
  if (!para) return undefined;
  const text = para
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/→\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 160) return text;
  const cut = text.slice(0, 157);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ section: string; pillar: string; slug: string }>;
}) {
  const { section, pillar, slug } = await params;
  if (!isSection(section)) notFound();

  const meta = getPillar(section, pillar);
  const lesson = getLesson(section, pillar, slug);
  if (!meta || !lesson) notFound();

  const inPillar = getLessonsByPillar(section, pillar);
  const index = inPillar.findIndex((l) => l.key === lesson.key) + 1;
  // Previous / next follow the whole course order (Foundations, then Applications).
  const order = getAllNavLessons();
  const at = order.findIndex((l) => l.key === lesson.key);
  const prev = at > 0 ? order[at - 1] : undefined;
  const next = at >= 0 && at < order.length - 1 ? order[at + 1] : undefined;
  const all = getAllLessons();
  const prerequisites = (lesson.prerequisites ?? [])
    .map((s) => all.find((l) => l.slug === s))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .map((l) => ({ title: l.title, href: l.href }));

  // Structured data so search engines can show the lesson as a free learning resource.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.subtitle ? `${lesson.title}: ${lesson.subtitle}` : lesson.title,
    description: lesson.summary,
    url: `${SITE_URL}${lesson.href}`,
    educationalLevel: lesson.level,
    timeRequired: `PT${totalMinutes(lesson)}M`,
    isAccessibleForFree: true,
    inLanguage: "en",
    dateModified: lesson.reviewedOn,
    isPartOf: { "@type": "Course", name: "AI Learning", url: SITE_URL },
    author: { "@type": "Person", name: "Seif Younes" },
    ...(lesson.video?.videoId
      ? {
          video: {
            "@type": "VideoObject",
            name: lesson.video.title,
            embedUrl: `https://www.youtube-nocookie.com/embed/${lesson.video.videoId}`,
            thumbnailUrl: `https://i.ytimg.com/vi/${lesson.video.videoId}/hqdefault.jpg`,
            uploadDate: lesson.video.published,
            duration: lesson.video.minutes ? `PT${lesson.video.minutes}M` : undefined,
            author: lesson.video.channel ? { "@type": "Person", name: lesson.video.channel } : undefined,
          },
        }
      : {}),
  };

  return (
    <WithSidebar>
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped cannot close the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <LessonView
        lesson={linkLesson(lesson)}
        time={{ video: videoMinutes(lesson), read: readMinutes(lesson), task: lesson.taskMinutes, total: totalMinutes(lesson) }}
        prerequisites={prerequisites}
        pillar={meta}
        position={{ index, total: inPillar.length }}
        prev={prev && { title: prev.title, href: prev.href }}
        next={next && { title: next.title, href: next.href }}
      />
    </WithSidebar>
  );
}
