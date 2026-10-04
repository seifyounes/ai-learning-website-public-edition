"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/use-progress";
import { useChecklist } from "@/lib/use-checklist";
import {
  FAST_TRACK_KEYS,
  PHASES,
  READINESS_WEIGHTS,
  type Phase,
} from "@/lib/career";
import { Arrow, Gauge, Tick } from "./TitleBlock";

const CAREER_KEY = "ai-learn:career:v1";

export interface LessonRef {
  title: string;
  href: string;
  estMinutes?: number;
}

function checklistId(phase: Phase, itemId: string): string {
  return `${phase.id}:${itemId}`;
}

function fraction(done: number, total: number): number {
  return total > 0 ? done / total : 0;
}

export default function GetHiredView({
  lessons,
}: {
  lessons: Record<string, LessonRef>;
}) {
  const { map, hydrated } = useProgress();
  const checklist = useChecklist(CAREER_KEY);
  const [open, setOpen] = useState<string | null>(PHASES[0]?.id ?? null);
  const [autoOpened, setAutoOpened] = useState(false);

  const phaseStats = PHASES.map((phase) => {
    const keys = (phase.lessonKeys ?? []).filter((k) => lessons[k]);
    const lessonsDone = keys.filter((k) => map[k]).length;
    const items = phase.checklist ?? [];
    const itemsDone = items.filter((i) => checklist.map[checklistId(phase, i.id)]).length;
    const total = keys.length + items.length;
    const done = lessonsDone + itemsDone;
    return { phase, keys, lessonsDone, items, itemsDone, total, done };
  });

  // Open the first incomplete phase once progress hydrates.
  useEffect(() => {
    if (!hydrated || !checklist.hydrated || autoOpened) return;
    const first = phaseStats.find((s) => s.done < s.total);
    if (first) setOpen(first.phase.id);
    setAutoOpened(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, checklist.hydrated, autoOpened]);

  // Readiness score.
  const fastTrack = FAST_TRACK_KEYS.filter((k) => lessons[k]);
  const fastDone = fastTrack.filter((k) => map[k]).length;
  const skills = fraction(fastDone, fastTrack.length);

  const byId = (id: string) => phaseStats.find((s) => s.phase.id === id);
  const portfolio = fraction(byId("portfolio")?.itemsDone ?? 0, byId("portfolio")?.items.length ?? 0);
  const interview = fraction(
    byId("interview-prep")?.itemsDone ?? 0,
    byId("interview-prep")?.items.length ?? 0,
  );
  const apply = fraction(byId("apply")?.itemsDone ?? 0, byId("apply")?.items.length ?? 0);

  const readiness = Math.round(
    100 *
      (skills * READINESS_WEIGHTS.skills +
        portfolio * READINESS_WEIGHTS.portfolio +
        interview * READINESS_WEIGHTS.interview +
        apply * READINESS_WEIGHTS.apply),
  );

  const lessonsLeft = fastTrack.length - fastDone;
  const minutesLeft = fastTrack
    .filter((k) => !map[k])
    .reduce((sum, k) => sum + (lessons[k]?.estMinutes ?? 15), 0);
  const itemsLeft = phaseStats.reduce((sum, s) => sum + (s.items.length - s.itemsDone), 0);

  const subBars: [string, number][] = [
    ["Skills", skills],
    ["Portfolio", portfolio],
    ["Interview", interview],
    ["Applying", apply],
  ];

  return (
    <div className="space-y-8">
      {/* Readiness: the one large quantity, then its four parts as ruled gauges. */}
      <div className="pad-box grid gap-6 p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-10 sm:p-6">
        <div>
          <span className="field-label">Job readiness</span>
          <p className="qty mt-2 text-[56px] font-medium leading-none text-graphite">
            {hydrated ? readiness : "–"}
            <span className="text-[26px] text-muted">%</span>
          </p>
        </div>
        <div className="space-y-2.5">
          {subBars.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[88px_minmax(0,1fr)_44px] items-center gap-3">
              <span className="field-label">{label}</span>
              <Gauge pct={hydrated ? Math.round(value * 100) : 0} label={label} />
              <span className="qty text-end text-[14px] text-pencil">
                {hydrated ? `${Math.round(value * 100)}%` : "–"}
              </span>
            </div>
          ))}
        </div>
        <p className="measure text-body-small text-pencil sm:col-span-2">
          {hydrated && readiness >= 100 ? (
            <>You&apos;ve done the work — now it&apos;s a numbers game. Keep the apply cadence up.</>
          ) : hydrated ? (
            <>
              You&apos;re{" "}
              <span className="font-semibold text-graphite">
                <span className="qty">{lessonsLeft}</span> fast-track lesson{lessonsLeft === 1 ? "" : "s"}
              </span>{" "}
              (≈<span className="qty">{Math.max(1, Math.round(minutesLeft / 60))}</span> h of study) and{" "}
              <span className="font-semibold text-graphite">
                <span className="qty">{itemsLeft}</span> checklist item{itemsLeft === 1 ? "" : "s"}
              </span>{" "}
              from fully job-ready. One focused block a day gets there fast.
            </>
          ) : (
            "Loading your progress…"
          )}
        </p>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {phaseStats.map(({ phase, keys, items, total, done }) => {
          const isOpen = open === phase.id;
          const complete = total > 0 && done === total;
          return (
            <section key={phase.id} className="pad-box">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : phase.id)}
                aria-expanded={isOpen}
                className="hover-tint flex w-full items-start justify-between gap-4 px-4 py-4 text-start sm:px-5"
              >
                <div>
                  <h2 className="print-title flex items-center gap-2">
                    {complete && <Tick className="text-graphite" />}
                    {phase.title}
                  </h2>
                  <p className="mt-1 text-body-small text-muted">{phase.goal}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="qty text-[15px] text-graphite">
                    {hydrated ? done : "–"}/{total}
                  </span>
                  <Arrow dir={isOpen ? "up" : "down"} className="text-print" />
                </div>
              </button>

              {isOpen && (
                <div className="space-y-4 border-t border-print px-4 py-4 sm:px-5">
                  {keys.length > 0 && (
                    <ul>
                      {keys.map((k) => {
                        const l = lessons[k];
                        const doneLesson = hydrated && Boolean(map[k]);
                        return (
                          <li key={k}>
                            <Link
                              href={l.href}
                              className="rule-row hover-tint group flex items-center justify-between gap-3 px-1 py-2"
                            >
                              <span className="flex min-w-0 items-center gap-2.5">
                                <span className="grid h-5 w-5 shrink-0 place-items-center border-[1.2px] border-pencil text-graphite">
                                  {doneLesson ? <Tick className="h-3.5 w-3.5" /> : null}
                                </span>
                                <span
                                  className={
                                    doneLesson
                                      ? "text-muted line-through"
                                      : "text-graphite group-hover:underline"
                                  }
                                >
                                  {l.title}
                                </span>
                              </span>
                              {l.estMinutes ? (
                                <span className="qty shrink-0 text-[14px] text-muted">
                                  {l.estMinutes} min
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {items.length > 0 && (
                    <ul className="space-y-3">
                      {items.map((item) => {
                        const id = checklistId(phase, item.id);
                        const checked = checklist.hydrated && checklist.isChecked(id);
                        return (
                          <li key={item.id} className="pencil-box px-3 py-3">
                            <label className="flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => checklist.toggle(id)}
                                className="mt-1 h-4 w-4 shrink-0"
                              />
                              <span>
                                <span
                                  className={`font-semibold ${
                                    checked ? "text-muted line-through" : "text-graphite"
                                  }`}
                                >
                                  {item.label}
                                </span>
                                {item.detail && (
                                  <span className="mt-1 block text-body-small text-pencil">
                                    {item.detail}
                                  </span>
                                )}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <p className="text-body-small text-pencil">
        Wondering which application track to study after the fast track?{" "}
        <Link href="/path" className="text-print underline">
          See the recommended order →
        </Link>
      </p>
    </div>
  );
}
