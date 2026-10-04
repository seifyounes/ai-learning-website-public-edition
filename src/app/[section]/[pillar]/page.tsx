import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ALL_PILLARS, appsUsingPillar, getPillar, isSection, SECTIONS } from "@/lib/curriculum";
import { getLessonsByPillar, totalMinutes } from "@/lib/content";
import { getBuildsOnForTrack } from "@/lib/nav";
import WithSidebar from "@/components/WithSidebar";
import LessonList from "@/components/LessonList";
import BuildsOn from "@/components/BuildsOn";
import PillarArt from "@/components/PillarArt";
import { Arrow, BackCell, Cell, TitleBlock } from "@/components/TitleBlock";

// Only the course's own paths exist; anything else gets the prerendered 404 page.
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_PILLARS.map((p) => ({ section: p.section, pillar: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; pillar: string }>;
}): Promise<Metadata> {
  const { section, pillar } = await params;
  const meta = isSection(section) ? getPillar(section, pillar) : undefined;
  if (!meta) return { title: "Page not found" };
  return { title: meta.title, description: meta.blurb, alternates: { canonical: `/${section}/${pillar}` } };
}

export default async function PillarPage({
  params,
}: {
  params: Promise<{ section: string; pillar: string }>;
}) {
  const { section, pillar } = await params;
  if (!isSection(section)) notFound();
  const meta = getPillar(section, pillar);
  if (!meta) notFound();

  const lessons = getLessonsByPillar(section, pillar);
  const usedIn = section === "foundations" ? appsUsingPillar(pillar) : [];

  const pillarMinutes = lessons.reduce((sum, l) => sum + totalMinutes(l), 0);
  const advancedCount = lessons.filter((l) => l.level === "advanced").length;

  return (
    <WithSidebar>
      <header className="mb-8">
        <TitleBlock className="grid-cols-3 min-[760px]:grid-cols-[auto_3fr_1fr_1fr_1fr]">
          <BackCell href={`/${section}`} label={SECTIONS[section].title} className="col-span-3 min-[760px]:col-span-1" />
          <Cell label={`${meta.section === "applications" ? "Track" : "Pillar"} ${meta.number}`} className="col-span-3 min-[760px]:col-span-1">
            <h1 className="print-display block pt-2 text-[30px] text-graphite min-[760px]:text-[36px]">
              {meta.title}
            </h1>
          </Cell>
          <Cell label="Lessons">
            <span className="qty text-quantity text-graphite">{lessons.length}</span>
          </Cell>
          <Cell label="Study">
            <span className="qty text-quantity text-graphite">
              {pillarMinutes > 0 ? `≈${Math.round(pillarMinutes / 60) || 1} h` : "–"}
            </span>
          </Cell>
          <Cell label="Advanced">
            <span className="qty text-quantity text-graphite">{advancedCount}</span>
          </Cell>
        </TitleBlock>
        <div className="mt-5 grid gap-5 min-[900px]:grid-cols-[minmax(0,1fr)_300px] min-[900px]:items-start">
          <div>
            <p className="measure text-body text-pencil">{meta.blurb}</p>
            {meta.needs && (
              <p className="pencil-box measure mt-4 px-4 py-2.5 text-body-small text-pencil">
                <span className="field-label me-2">You&rsquo;ll need</span>
                {meta.needs}
              </p>
            )}
          </div>
          {/* The same figure the section page shows, plotted on the sheet in a print frame. */}
          <div className="relative h-28 border-[1.5px] border-print">
            <PillarArt slug={pillar} className="h-full w-full" />
          </div>
        </div>
      </header>

      {section === "applications" && <BuildsOn pillars={getBuildsOnForTrack(pillar)} />}

      {lessons.length > 0 ? (
        <LessonList
          highlightNext
          items={lessons.map((l) => ({
            title: l.title,
            href: l.href,
            key: l.key,
            level: l.level,
            estMinutes: totalMinutes(l),
            module: l.module,
            audience: l.audience,
          }))}
        />
      ) : (
        <div className="hatch border-[1.5px] border-dashed border-print p-8 text-center">
          <p className="text-graphite">Lessons for this pillar are coming.</p>
          <p className="mt-1 text-body-small text-muted">
            Each one is researched and written one at a time.
          </p>
        </div>
      )}

      {usedIn.length > 0 && (
        <section className="mt-12">
          <h2 className="group-heading">Used in these applications</h2>
          <p className="mt-2 text-body-small text-muted">
            Where this pillar pays off — the use-case tracks that build on it.
          </p>
          <ul className="mt-2">
            {usedIn.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/applications/${t.slug}`}
                  className="rule-row hover-tint group flex items-start gap-3 px-1 py-3"
                >
                  <Arrow className="mt-1 text-print" />
                  <span>
                    <span className="block font-semibold text-graphite group-hover:underline">{t.title}</span>
                    <span className="mt-0.5 block text-body-small text-muted">{t.goalFit ?? t.blurb}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </WithSidebar>
  );
}
