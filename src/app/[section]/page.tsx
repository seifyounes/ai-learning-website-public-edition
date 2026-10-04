import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isSection, SECTIONS } from "@/lib/curriculum";
import { getNav } from "@/lib/nav";
import WithSidebar from "@/components/WithSidebar";
import PillarArt from "@/components/PillarArt";
import { BackCell, Cell, TitleBlock } from "@/components/TitleBlock";

// Only the course's own paths exist; anything else gets the prerendered 404 page.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ section: "foundations" }, { section: "applications" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  if (!isSection(section)) return { title: "Page not found" };
  return { title: SECTIONS[section].title, alternates: { canonical: `/${section}` } };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isSection(section)) notFound();

  const meta = SECTIONS[section];
  const navSection = getNav().find((s) => s.slug === section)!;
  const lessonTotal = navSection.pillars.reduce((sum, p) => sum + p.count, 0);

  return (
    <WithSidebar>
      <header className="mb-8">
        <TitleBlock className="grid-cols-2 min-[760px]:grid-cols-[auto_2.6fr_1fr_1fr]">
          <BackCell href="/" className="col-span-2 min-[760px]:col-span-1" />
          <Cell label="Section" className="col-span-2 min-[760px]:col-span-1">
            <h1 className="print-display block pt-2 text-graphite">{meta.title}</h1>
          </Cell>
          <Cell label="Pillars">
            <span className="qty text-quantity-large text-graphite">{navSection.pillars.length}</span>
          </Cell>
          <Cell label="Lessons">
            <span className="qty text-quantity-large text-graphite">{lessonTotal}</span>
          </Cell>
        </TitleBlock>
        <p className="measure mt-4 text-body text-pencil">{meta.blurb}</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {navSection.pillars.map((pillar) => (
          <Link
            key={pillar.slug}
            href={pillar.href}
            className="group flex flex-col border-[1.5px] border-print transition-colors"
          >
            {/* The figure is plotted on the sheet's own grid: no fill behind it. */}
            <div className="relative h-24 overflow-hidden border-b border-print">
              <PillarArt slug={pillar.slug} className="h-full w-full" />
            </div>
            <div className="hover-tint flex-1 bg-sheet p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="print-sheet-title group-hover:underline">
                  <span className="qty me-1.5 text-print">{pillar.number}</span>
                  {pillar.title}
                </h2>
                <span className="shrink-0 text-end">
                  <span className="field-label block">Lessons</span>
                  <span className="qty mt-1 block text-quantity text-graphite">{pillar.count}</span>
                </span>
              </div>
              <p className="mt-2 text-body-small text-muted">{pillar.blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </WithSidebar>
  );
}
