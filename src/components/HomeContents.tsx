"use client";

import Link from "next/link";
import { useProgress } from "@/lib/use-progress";
import type { NavSection } from "@/lib/nav";
import ContinueHero from "./ContinueHero";

/**
 * The home page as the pad's contents sheet: per section a group heading, then each pillar as a
 * ruled contents line (sheet-number box, title + blurb, mono counts). A margin column on the
 * inline start holds the red-pen "you stopped here" note beside the pillar with the next lesson.
 */
export default function HomeContents({ nav }: { nav: NavSection[] }) {
  const { map, hydrated, completedCount } = useProgress();

  const lessons = nav.flatMap((s) => s.pillars.flatMap((p) => p.lessons));
  const showNote = hydrated && completedCount > 0;
  const next = showNote ? (lessons.find((l) => !map[l.key]) ?? null) : null;
  const pillars = nav.flatMap((s) => s.pillars);
  const notePillar = showNote
    ? next
      ? pillars.find((p) => p.lessons.some((l) => l.key === next.key))?.slug
      : pillars[0]?.slug
    : undefined;

  return (
    <div className="space-y-10">
      {nav.map((section) => (
        <section key={section.slug}>
          <div className="min-[760px]:ms-[184px] min-[1000px]:ms-[216px]">
            <h2 className="group-heading flex flex-wrap items-baseline justify-between gap-x-4">
              <Link href={`/${section.slug}`} className="hover:underline">
                {section.title}
              </Link>
              <span className="font-prose text-body-small font-normal text-muted [font-variation-settings:normal]">
                {section.blurb}
              </span>
            </h2>
          </div>
          <ol>
            {section.pillars.map((p) => {
              const done = hydrated ? p.lessons.filter((l) => map[l.key]).length : 0;
              const hasNote = p.slug === notePillar;
              const nextIndex = next ? p.lessons.findIndex((l) => l.key === next.key) : -1;
              return (
                <li
                  key={p.slug}
                  className="grid grid-cols-1 min-[760px]:grid-cols-[184px_minmax(0,1fr)] min-[1000px]:grid-cols-[216px_minmax(0,1fr)]"
                >
                  <div
                    className={
                      hasNote
                        ? "relative pb-10 pt-3 min-[760px]:p-0"
                        : "hidden min-[760px]:block"
                    }
                  >
                    {hasNote && (
                      // On desktop the note hangs in the margin without stretching its line.
                      <div className="min-[760px]:absolute min-[760px]:inset-x-0 min-[760px]:top-3 min-[760px]:pe-14">
                        <ContinueHero
                          next={next}
                          position={
                            next && nextIndex >= 0
                              ? `${typeof p.number === "string" ? "Track" : "Pillar"} ${p.number} · lesson ${nextIndex + 1} of ${p.count}`
                              : undefined
                          }
                          completed={completedCount}
                          total={lessons.length}
                        />
                      </div>
                    )}
                  </div>
                  <Link
                    href={p.href}
                    className="rule-row hover-tint group grid grid-cols-[44px_minmax(0,1fr)] items-start gap-x-4 py-3 min-[760px]:grid-cols-[44px_minmax(0,1fr)_72px_72px] min-[760px]:border-s min-[760px]:border-print min-[760px]:ps-4"
                  >
                    <span
                      className={[
                        "grid h-11 w-11 place-items-center border-[1.5px] border-print font-print text-[20px] font-bold text-print [font-variation-settings:'wdth'_75]",
                        hasNote && next ? "outline outline-2 outline-offset-[3px] outline-red-pen" : "",
                      ].join(" ")}
                    >
                      {p.number}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[18px] font-semibold leading-snug text-graphite group-hover:underline">
                        {p.title}
                      </span>
                      <span className="mt-0.5 block text-body-small text-muted">{p.blurb}</span>
                      {/* Counts wrap beneath the title with visible units on phones. */}
                      <span className="qty mt-1.5 block text-[14px] text-pencil min-[760px]:hidden">
                        {p.count} lessons{hydrated ? ` · ${done} done` : ""}
                      </span>
                    </span>
                    <span className="hidden text-end min-[760px]:block">
                      <span className="field-label block">Lessons</span>
                      <span className="qty mt-2 block text-quantity text-graphite">{p.count}</span>
                    </span>
                    <span className="hidden text-end min-[760px]:block">
                      <span className="field-label block">Done</span>
                      <span className="qty mt-2 block text-quantity text-graphite">
                        {hydrated ? done : "–"}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
