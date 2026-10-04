"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/use-progress";
import type { TrackPath } from "@/lib/nav";
import { ROUTES, type Route } from "@/lib/routes";
import { Arrow, Gauge } from "./TitleBlock";

/** Share of the needed foundation lessons already done (only the ones this goal needs). */
function readiness(track: TrackPath, map: Record<string, boolean>, needed?: string[]) {
  const keys = track.buildsOn.filter((p) => !needed || needed.includes(p.slug)).flatMap((p) => p.lessonKeys);
  const done = keys.filter((k) => map[k]).length;
  return { done, total: keys.length, pct: keys.length ? Math.round((done / keys.length) * 100) : 0 };
}

const GOAL_KEY = "ai-learn:goal:v1";

/**
 * The Applications tracks ordered for the learner's goal (?goal= in the URL, so a route card
 * can link straight to its path; else the goal picked last time). Until a goal is picked, the
 * tracks sit in course order (A–D) and nothing is singled out as "first".
 */
export default function PathView({ tracks: allTracks }: { tracks: TrackPath[] }) {
  const { map, hydrated } = useProgress();
  const [goal, setGoal] = useState<Route["id"] | null>(null);

  useEffect(() => {
    let g = new URLSearchParams(window.location.search).get("goal");
    if (!g) {
      try {
        g = localStorage.getItem(GOAL_KEY);
      } catch {
        // Storage blocked: start with no goal.
      }
    }
    if (ROUTES.some((r) => r.id === g)) setGoal(g as Route["id"]);
  }, []);

  const choose = (id: Route["id"]) => {
    setGoal(id);
    try {
      localStorage.setItem(GOAL_KEY, id);
    } catch {
      // Storage blocked: the URL still carries the goal.
    }
    const url = new URL(window.location.href);
    url.searchParams.set("goal", id);
    window.history.replaceState(null, "", url);
  };

  const route = ROUTES.find((r) => r.id === goal);
  const tracks = useMemo(() => {
    if (!route) return [...allTracks].sort((a, b) => a.letter.localeCompare(b.letter));
    const rank = (slug: string) => {
      const i = route.trackOrder.indexOf(slug);
      return i < 0 ? 99 : i;
    };
    return [...allTracks].sort((a, b) => rank(a.slug) - rank(b.slug));
  }, [allTracks, route]);
  const first = route ? tracks[0] : undefined;

  return (
    <div className="space-y-8">
      <div role="group" aria-label="Your goal" className="pad-box px-4 py-4 sm:px-5">
        <p className="field-label">Your goal</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {ROUTES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={goal === r.id}
              onClick={() => choose(r.id)}
              className={`pencil-box hover-tint px-3 py-2.5 text-start text-body-small ${
                goal === r.id ? "border-[1.5px] border-graphite bg-[var(--tint-strong)] font-semibold text-graphite" : "text-pencil"
              }`}
            >
              {r.goal}
            </button>
          ))}
        </div>
        {!route && (
          <p className="mt-3 text-body-small text-pencil">
            Pick a goal and the tracks below reorder for it, best fit first. Until then they are
            listed in course order, A to D.
          </p>
        )}
        {route && (
          <p className="mt-3 text-body-small text-pencil">
            Foundations for this goal:{" "}
            {route.steps.map((st, i) => (
              <span key={st.href}>
                {i > 0 ? " → " : ""}
                <Link href={st.href} className="text-print underline decoration-1 underline-offset-[3px]">
                  {st.label}
                </Link>
              </span>
            ))}
          </p>
        )}
      </div>

      {first && (
        <div className="border-2 border-print bg-sheet p-5 sm:p-6" aria-live="polite">
          <span className="field-label">Your first Applications track</span>
          <h2 className="print-display mt-3 text-[30px] text-graphite">{first.title}</h2>
          <p className="measure mt-2 text-body text-pencil">{first.goalFit}</p>
          <Link href={first.href} className="btn-next mt-5">
            Start {first.title} <Arrow />
          </Link>
        </div>
      )}

      <div className="space-y-5">
        {tracks.map((track, ti) => {
          const r = readiness(
            track,
            map,
            route?.foundations ?? track.buildsOn.filter((p) => !p.optional).map((p) => p.slug),
          );
          const core = route
            ? track.buildsOn.filter((p) => route.foundations.includes(p.slug))
            : track.buildsOn.filter((p) => !p.optional);
          const optional = route
            ? track.buildsOn.filter((p) => !route.foundations.includes(p.slug))
            : track.buildsOn.filter((p) => p.optional);
          return (
            <div key={track.slug} className="pad-box">
              <div className="flex items-start justify-between gap-4 border-b border-print px-4 py-4 sm:px-5">
                <div className="flex items-start gap-3">
                  <span className="step-box">{route ? ti + 1 : track.letter}</span>
                  <div>
                    <Link href={track.href} className="print-title hover:underline">
                      {track.title}
                    </Link>
                    <p className="mt-0.5 text-body-small text-muted">{track.goalFit}</p>
                  </div>
                </div>
                <span className="shrink-0 text-end">
                  <span className="qty block text-[15px] text-graphite">
                    {hydrated ? `${r.pct}% ready` : "—"}
                  </span>
                  <span className="qty mt-1 block text-[14px] text-muted">
                    {track.count} {track.count === 1 ? "lesson" : "lessons"}
                  </span>
                </span>
              </div>

              <div className="px-4 py-3 sm:px-5">
                <p className="field-label">{route ? "Foundations you need first" : "Builds on these foundations"}</p>
                <ul className="mt-1">
                  {core.map((p) => {
                    const done = p.lessonKeys.filter((k) => map[k]).length;
                    const pct = p.count ? Math.round((done / p.count) * 100) : 0;
                    return (
                      <li key={p.slug}>
                        <Link
                          href={p.href}
                          className="rule-row hover-tint group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-1 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_160px_auto]"
                        >
                          <span className="min-w-0 truncate text-graphite group-hover:underline">
                            {p.title}
                          </span>
                          <span className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
                            <Gauge pct={hydrated ? pct : 0} label={`${p.title} progress`} />
                          </span>
                          <span className="qty text-[14px] text-pencil">
                            {hydrated ? `${done}/${p.count}` : `0/${p.count}`}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {optional.length > 0 && (
                  <p className="mt-2 text-body-small text-muted">
                    Optional for your goal:{" "}
                    {optional.map((p, i) => (
                      <span key={p.slug}>
                        {i > 0 ? ", " : ""}
                        <Link href={p.href} className="text-print underline decoration-1 underline-offset-[3px]">
                          {p.title}
                        </Link>
                      </span>
                    ))}
                    . A few lessons in this track use them; skip those or come back later.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
