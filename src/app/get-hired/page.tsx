import type { Metadata } from "next";
import Link from "next/link";
import { getAllLessons, totalMinutes } from "@/lib/content";
import { PHASES } from "@/lib/career";
import GetHiredView, { type LessonRef } from "@/components/GetHiredView";

export const metadata: Metadata = {
  alternates: { canonical: "/get-hired" },
  title: "Get hired — Applied AI Engineer roadmap",
  description:
    "The granular path from studying to a signed offer: fast-track lessons, portfolio proof, interview prep, and an apply pipeline — with a live readiness score.",
};

export default function GetHiredPage() {
  const all = getAllLessons();
  const byKey = new Map(all.map((l) => [l.key, l]));

  const lessons: Record<string, LessonRef> = {};
  for (const phase of PHASES) {
    for (const key of phase.lessonKeys ?? []) {
      const lesson = byKey.get(key);
      if (!lesson) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[get-hired] unresolved fast-track lesson key: ${key}`);
        }
        continue;
      }
      lessons[key] = {
        title: lesson.title,
        href: lesson.href,
        estMinutes: totalMinutes(lesson),
      };
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <header className="mb-8">
        <h1 className="print-display text-graphite">
          Get hired as an <span className="text-print">Applied AI Engineer</span>
        </h1>
        <p className="measure mt-4 text-body text-pencil">
          The whole journey on one page: the fast-track lessons interviews assume, the
          portfolio that proves them, the interview reps, and the apply pipeline. Check
          things off — the readiness score is yours to push to 100.
        </p>
        <p className="measure mt-3 pencil-box px-4 py-2.5 text-body-small text-pencil">
          Not aiming for an engineering role? To use AI in the job you have, follow{" "}
          <Link href="/applications/ai-in-companies" className="text-print underline decoration-1 underline-offset-[3px]">
            Track C: AI inside companies
          </Link>
          ; to sell AI services, follow{" "}
          <Link href="/applications/agency-freelance" className="text-print underline decoration-1 underline-offset-[3px]">
            Track D: Agency / freelance services
          </Link>
          .
        </p>
      </header>
      <GetHiredView lessons={lessons} />
    </div>
  );
}
