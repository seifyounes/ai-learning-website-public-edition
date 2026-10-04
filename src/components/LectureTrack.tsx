"use client";

import { useEffect, useState } from "react";
import type { Lecture } from "@/lib/types";
import InlineMarkdown from "./InlineMarkdown";
import YouTubeEmbed from "./YouTubeEmbed";
import { Gauge, Tick } from "./TitleBlock";

const KEY = "ai-learn:lectures:v1";

/** "4 h 10 min" or "50 min". */
function duration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

function readWatched(lessonKey: string): string[] {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, string[]>;
    return Array.isArray(all[lessonKey]) ? all[lessonKey] : [];
  } catch {
    return [];
  }
}

function writeWatched(lessonKey: string, ids: string[]) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, string[]>;
    all[lessonKey] = ids;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage blocked: ticks last for this visit only.
  }
}

/**
 * A subject's full lecture series, in watching order. Each lecture opens its own click-to-load
 * player in place and can be ticked off; ticks are saved per lesson in this browser.
 */
export default function LectureTrack({
  lectures,
  lessonKey,
  primaryId,
}: {
  lectures: Lecture[];
  lessonKey: string;
  /** The lesson's main video, which the track may include. */
  primaryId?: string;
}) {
  const [watched, setWatched] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    setWatched(readWatched(lessonKey));
    setHydrated(true);
  }, [lessonKey]);

  const toggle = (id: string) => {
    const next = watched.includes(id) ? watched.filter((w) => w !== id) : [...watched, id];
    setWatched(next);
    writeWatched(lessonKey, next);
  };

  const core = lectures.filter((l) => !l.optional);
  const coreMin = core.reduce((s, l) => s + (l.minutes ?? 0), 0);
  const extraMin = lectures.filter((l) => l.optional).reduce((s, l) => s + (l.minutes ?? 0), 0);
  const coreDone = core.filter((l) => watched.includes(l.videoId)).length;
  const pct = core.length ? Math.round((coreDone / core.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <p className="text-body-small text-pencil">
        The video above opens the subject. This track is the whole series to work through, one or
        two lectures a sitting:{" "}
        <span className="qty text-graphite">{core.length}</span> core lectures (
        <span className="qty text-graphite">{duration(coreMin)}</span>)
        {extraMin > 0 ? (
          <>
            {" "}
            plus <span className="qty text-graphite">{lectures.length - core.length}</span> optional
            ones for depth (<span className="qty text-graphite">{duration(extraMin)}</span>)
          </>
        ) : null}
        .
      </p>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-[14px] text-muted">
          <span>Core lectures watched</span>
          <span className="qty">{hydrated ? `${coreDone} / ${core.length}` : "–"}</span>
        </div>
        <Gauge pct={hydrated ? pct : 0} label="Core lectures watched" />
      </div>
      <ol className="space-y-3">
        {lectures.map((l, i) => {
          const done = watched.includes(l.videoId);
          const isOpen = open === l.videoId;
          const panel = `lecture-${l.videoId}`;
          return (
            <li key={l.videoId} className={`pencil-box ${l.optional ? "border-dashed" : ""}`}>
              <div className="flex gap-3 px-3 py-3 sm:px-4">
                <span className="step-box shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug text-graphite">{l.title}</p>
                  <p className="mt-0.5 text-[14px] text-muted">
                    {l.channel}
                    {l.year ? ` · ${l.year}` : ""}
                    {l.minutes ? (
                      <>
                        {" · "}
                        <span className="qty">{l.minutes} min</span>
                      </>
                    ) : null}
                    {l.optional ? " · optional" : ""}
                    {l.videoId === primaryId ? " · the video above" : ""}
                  </p>
                  <p className="mt-1.5 text-body-small text-pencil">
                    <InlineMarkdown>{l.covers}</InlineMarkdown>
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-print btn-sm"
                      aria-expanded={isOpen}
                      aria-controls={isOpen ? panel : undefined}
                      onClick={() => setOpen(isOpen ? null : l.videoId)}
                    >
                      {isOpen ? "Close player" : "Watch here"}
                    </button>
                    <button
                      type="button"
                      className={`btn-print btn-sm ${done ? "border-graphite text-graphite" : ""}`}
                      aria-pressed={done}
                      onClick={() => toggle(l.videoId)}
                    >
                      {done ? (
                        <>
                          <Tick className="me-1.5" /> Watched
                        </>
                      ) : (
                        "Mark watched"
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {isOpen && (
                <div id={panel} className="border-t border-pencil p-3 sm:p-4">
                  <YouTubeEmbed videoId={l.videoId} title={l.title} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
