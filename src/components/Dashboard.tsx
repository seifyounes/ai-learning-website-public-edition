"use client";

import Link from "next/link";
import { useActivity, useProgress } from "@/lib/use-progress";
import type { NavSection } from "@/lib/nav";
import {
  BADGES,
  computeStreak,
  levelForXp,
  readQuizScores,
  xpForLesson,
} from "@/lib/gamification";
import { FAST_TRACK_KEYS } from "@/lib/career";
import { Cell, Gauge, TitleBlock } from "./TitleBlock";

export default function Dashboard({ nav }: { nav: NavSection[] }) {
  const { map, hydrated } = useProgress();
  const { events } = useActivity();

  const allLessons = nav.flatMap((s) => s.pillars.flatMap((p) => p.lessons));
  const total = allLessons.length;
  const completedLessons = allLessons.filter((l) => map[l.key]);
  const completed = completedLessons.length;
  const overallPct = total ? Math.round((completed / total) * 100) : 0;

  // XP & level — derived from the completion map every render, no drift.
  const xp = completedLessons.reduce((sum, l) => sum + xpForLesson(l), 0);
  const maxXp = allLessons.reduce((sum, l) => sum + xpForLesson(l), 0);
  const level = levelForXp(xp, maxXp);
  const levelPct = level.next
    ? Math.round(((xp - level.floor) / (level.next - level.floor)) * 100)
    : 100;

  const streak = computeStreak(events);

  const badgeCtx = {
    completedKeys: new Set(completedLessons.map((l) => l.key)),
    quizScores: hydrated ? readQuizScores() : {},
    pillars: nav.flatMap((s) =>
      s.pillars.map((p) => ({ slug: p.slug, lessonKeys: p.lessons.map((l) => l.key) })),
    ),
    fastTrackKeys: FAST_TRACK_KEYS,
    streak,
    totalLessons: total,
  };
  const earnedCount = hydrated ? BADGES.filter((b) => b.earned(badgeCtx)).length : 0;

  const next = allLessons.find((l) => !map[l.key]);

  return (
    <div className="space-y-10">
      {/* Rank, XP, streak and overall progress as the page's counts. */}
      <div>
        <TitleBlock className="grid-cols-2 min-[760px]:grid-cols-[2fr_1fr_1.4fr_1fr]">
          <Cell label="Your rank" className="col-span-2 min-[760px]:col-span-1">
            <span className="print-sheet-title block pt-1 text-[22px] min-[760px]:text-[24px]">
              {hydrated ? level.name : "—"}
            </span>
          </Cell>
          <Cell label="XP">
            <span className="qty text-quantity-large text-graphite">
              {hydrated ? xp.toLocaleString() : "–"}
            </span>
          </Cell>
          <Cell label="Streak">
            {hydrated && streak.current > 0 ? (
              <span className="qty text-quantity-large text-graphite">
                {streak.current}
                <span className="ms-1.5 text-[15px] text-muted">
                  day{streak.current === 1 ? "" : "s"}
                </span>
              </span>
            ) : (
              <span className="text-body-small text-muted">Complete a lesson today to start one</span>
            )}
          </Cell>
          <Cell label="Done" className="col-span-2 min-[760px]:col-span-1">
            <span className="qty text-quantity-large text-graphite">
              {hydrated ? completed : "–"}
              <span className="text-[15px] text-muted"> / {total}</span>
            </span>
          </Cell>
        </TitleBlock>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex justify-between gap-3 text-[14px] text-muted">
              <span>
                {hydrated && level.next ? (
                  <>
                    Next rank at <span className="qty">{level.next.toLocaleString()}</span> XP
                  </>
                ) : hydrated ? (
                  "Top rank reached"
                ) : (
                  "…"
                )}
              </span>
              <span className="qty text-graphite">{hydrated ? `${levelPct}%` : ""}</span>
            </div>
            <Gauge pct={hydrated ? levelPct : 0} label="Progress to next rank" />
          </div>
          <div>
            <div className="mb-1.5 flex justify-between gap-3 text-[14px] text-muted">
              <span className="qty">
                {hydrated ? `${completed} / ${total} lessons` : `– / ${total} lessons`}
              </span>
              <span className="qty text-graphite">{hydrated ? `${overallPct}%` : ""}</span>
            </div>
            <Gauge pct={hydrated ? overallPct : 0} label="Overall progress" />
          </div>
        </div>

        {next && (
          <Link href={next.href} className="btn-next mt-6">
            Continue → {next.title}
          </Link>
        )}
      </div>

      {/* Badges: square stamps. Earned is inked in graphite and ringed by the red pen. */}
      <section>
        <h2 className="group-heading flex items-baseline justify-between gap-3">
          Badges
          <span className="qty text-[16px] font-normal text-graphite [font-variation-settings:normal]">
            {hydrated ? `${earnedCount}/${BADGES.length}` : ""}
          </span>
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((b) => {
            const earned = hydrated && b.earned(badgeCtx);
            return (
              <div
                key={b.id}
                title={b.desc}
                className={
                  earned
                    ? "border-2 border-graphite bg-sheet p-3 text-center outline outline-2 outline-offset-[3px] outline-red-pen"
                    : "border-[1.2px] border-dashed border-pencil bg-sheet p-3 text-center opacity-60"
                }
              >
                <div className="text-2xl grayscale" aria-hidden>
                  {b.icon}
                </div>
                <div className="mt-1 font-print text-[15px] font-bold text-graphite [font-variation-settings:'wdth'_80]">
                  {b.label}
                </div>
                <div className="mt-0.5 text-[13px] leading-tight text-muted">{b.desc}</div>
                <div className="field-label mt-2 block">{earned ? "Earned" : "Locked"}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Per-pillar progress */}
      {nav.map((section) => (
        <section key={section.slug}>
          <h2 className="group-heading">{section.title}</h2>
          <ul>
            {section.pillars.map((pillar) => {
              const done = pillar.lessons.filter((l) => map[l.key]).length;
              const pct = pillar.count ? Math.round((done / pillar.count) * 100) : 0;
              return (
                <li key={pillar.slug}>
                  <Link
                    href={pillar.href}
                    className="rule-row hover-tint group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-1 py-3 sm:grid-cols-[minmax(0,1fr)_200px_64px]"
                  >
                    <span className="min-w-0 text-graphite group-hover:underline">
                      <span className="qty me-2 text-print">{pillar.number}</span>
                      {pillar.title}
                    </span>
                    <span className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
                      <Gauge pct={hydrated ? pct : 0} label={`${pillar.title} progress`} />
                    </span>
                    <span className="qty text-end text-[14px] text-pencil">
                      {hydrated ? `${done}/${pillar.count}` : `0/${pillar.count}`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
