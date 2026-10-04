import Link from "next/link";
import type { Metadata } from "next";
import { getNav, getAllNavLessons } from "@/lib/nav";
import LessonList from "@/components/LessonList";
import RouteCards from "@/components/RouteCards";
import { Arrow } from "@/components/TitleBlock";

export const metadata: Metadata = {
  alternates: { canonical: "/start-here" },
  title: "Start Here",
  description: "The guided path through the course, with three routes by goal: understand AI, build with AI, or use AI at work.",
};

const TIPS = [
  ["One lesson per sitting", "Each lesson header shows its video, reading and task time. Most fit one sitting of 40–90 minutes; capstones and a few long ones span two, so stop after the video or after the reading and pick up from there."],
  ["Do the task", "The hands-on task is where it sticks. Mark the lesson complete only after you've done it."],
  ["Your progress is local", "Completion, notes and quiz scores save in this browser. No account needed."],
] as const;

export default function StartHere() {
  const nav = getNav();
  const first = getAllNavLessons()[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="print-display text-graphite">Start Here</h1>
      <p className="measure mt-4 text-body text-pencil">
        Everyone starts with pillar 1, AI mental models. Then pick the route that matches your
        goal below: each one names the Foundations pillars to do next and the Applications track
        that fits. The full course list is further down if you&apos;d rather browse.
      </p>

      {first && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={first.href} className="btn-next">
            Begin with: {first.title} <Arrow />
          </Link>
          <Link href="/path" className="btn-print">
            See your path by goal <Arrow />
          </Link>
        </div>
      )}

      {/* Three routes in, by goal — each names the pillars to do first. */}
      <section className="pad-box mt-10" aria-labelledby="routes-heading">
        <div className="border-b border-print px-4 py-3 sm:px-5">
          <h2 id="routes-heading" className="print-title">
            Pick your route
          </h2>
          <p className="mt-1 text-body-small text-muted">
            Everyone starts with pillar 1. After that, follow the route that matches your goal.
          </p>
        </div>
        <RouteCards />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="How to study">
        {TIPS.map(([title, text]) => (
          <div key={title} className="pencil-box px-4 pb-4 pt-3">
            <span className="field-label">{title}</span>
            <p className="mt-2 text-body-small text-pencil">{text}</p>
          </div>
        ))}
      </section>

      <div className="mt-12 space-y-12">
        {nav.map((section) => (
          <div key={section.slug}>
            <h2 className="group-heading">{section.title}</h2>
            <div className="mt-5 space-y-6">
              {section.pillars.map((pillar) => (
                <div key={pillar.slug} className="pad-box">
                  <div className="flex items-start justify-between gap-3 border-b border-print px-4 py-3 sm:px-5">
                    <div>
                      <Link href={pillar.href} className="print-title hover:underline">
                        <span className="qty me-2 text-print">{pillar.number}</span>
                        {pillar.title}
                      </Link>
                      <p className="mt-1 text-body-small text-muted">{pillar.blurb}</p>
                    </div>
                    <span className="qty shrink-0 text-[14px] text-pencil">
                      {pillar.count} {pillar.count === 1 ? "lesson" : "lessons"}
                    </span>
                  </div>
                  <div className="px-3 py-2 sm:px-4">
                    {pillar.lessons.length > 0 ? (
                      <LessonList
                        items={pillar.lessons.map((l) => ({
                          title: l.title,
                          href: l.href,
                          key: l.key,
                        }))}
                      />
                    ) : (
                      <p className="hatch my-2 px-4 py-3 text-body-small text-muted">
                        Lessons for this pillar are on the way.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
