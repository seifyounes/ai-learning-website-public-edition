import type { Metadata } from "next";
import { getAllLessons, totalMinutes } from "@/lib/content";
import { ALL_PILLARS } from "@/lib/curriculum";
import { getAllNavLessons } from "@/lib/nav";
import SearchView, { type SearchEntry } from "@/components/SearchView";

export const metadata: Metadata = {
  alternates: { canonical: "/search" },
  title: "Search lessons",
  description: "Search every lesson in the course by topic, tool or skill.",
};

/** First paragraph of the breakdown as plain text, trimmed for a result line. */
function summary(body: string): string {
  const para = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith("#") && !p.startsWith(">") && !p.startsWith("```"));
  if (!para) return "";
  const text = para
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\(→[^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 200 ? `${text.slice(0, 197).replace(/\s+\S*$/, "")}…` : text;
}

export default function SearchPage() {
  const pillarTitle = new Map(ALL_PILLARS.map((p) => [`${p.section}/${p.slug}`, p.title]));
  // Course order (Foundations 1–8, then Applications A–D), so the unfiltered list reads like the syllabus.
  const position = new Map(getAllNavLessons().map((l, i) => [l.key, i]));
  const entries: SearchEntry[] = [...getAllLessons()]
    .sort((a, b) => (position.get(a.key) ?? 999) - (position.get(b.key) ?? 999))
    .map((l) => ({
      key: l.key,
      href: l.href,
      title: l.subtitle ? `${l.title}: ${l.subtitle}` : l.title,
      pillar: pillarTitle.get(`${l.section}/${l.pillar}`) ?? l.pillar,
      level: l.level,
      minutes: totalMinutes(l),
      tags: l.tags ?? [],
      summary: l.summary ?? summary(l.body),
    }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="print-display text-graphite">Search lessons</h1>
      <p className="measure mt-4 text-body text-pencil">
        Find a lesson by topic, tool or skill: try &ldquo;RAG&rdquo;, &ldquo;prompt&rdquo;,
        &ldquo;Cursor&rdquo;, &ldquo;n8n&rdquo; or &ldquo;pricing&rdquo;.
      </p>
      <SearchView entries={entries} />
    </div>
  );
}
