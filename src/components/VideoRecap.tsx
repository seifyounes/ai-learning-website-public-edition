"use client";

import { useEffect, useRef, useState } from "react";
import type { RecapStep } from "@/lib/types";
import Confetti from "./Confetti";
import InlineMarkdown from "./InlineMarkdown";
import { Arrow, Gauge, Tick } from "./TitleBlock";

const RECAP_KEY = "ai-learn:recap:v1";

interface RecapState {
  done: boolean;
  ts: number;
  /** Ideas recalled before flipping, on the last full run. */
  recalled?: number;
}

function readStates(): Record<string, RecapState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(RECAP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, RecapState>) : {};
  } catch {
    return {};
  }
}

function saveDone(lessonKey: string, recalled: number) {
  try {
    const all = readStates();
    all[lessonKey] = { done: true, ts: Date.now(), recalled };
    window.localStorage.setItem(RECAP_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

/**
 * Video recap as retrieval practice. Each step shows only its cue (the title); the learner
 * recalls the idea, flips the card to check, and says whether they had it. A full pass marks the
 * recap complete (persisted per lesson) with confetti and a recall score; the cards marked "Not
 * yet" can then be gone over again on their own until they stick.
 */
export default function VideoRecap({
  steps,
  lessonKey,
}: {
  steps: RecapStep[];
  lessonKey: string;
}) {
  // The cards in this pass (indexes into steps) and how far through it the learner is.
  const [queue, setQueue] = useState<number[] | null>(null);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // Latest answer per card: true = recalled, false = not yet.
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [fullPass, setFullPass] = useState(true);
  const [last, setLast] = useState<RecapState | null>(null);
  const [burst, setBurst] = useState(0);
  const controlRef = useRef<HTMLButtonElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    setLast(readStates()[lessonKey] ?? null);
  }, [lessonKey]);

  // After each action the old button is replaced; put focus on the new primary control.
  useEffect(() => {
    if (moved.current) controlRef.current?.focus();
  }, [queue, pos, flipped]);

  if (!steps.length) return null;

  const total = steps.length;
  const started = queue !== null;
  const done = started && pos >= queue.length;
  const recalledCount = Object.values(results).filter(Boolean).length;
  const missed = steps.map((_, i) => i).filter((i) => results[i] === false);
  const pct = started ? Math.round((Math.min(pos, queue.length) / queue.length) * 100) : 0;

  const begin = (cards: number[], full: boolean) => {
    moved.current = true;
    if (full) setResults({});
    setFullPass(full);
    setQueue(cards);
    setPos(0);
    setFlipped(false);
  };
  const flip = () => {
    moved.current = true;
    setFlipped(true);
  };
  const grade = (had: boolean) => {
    if (!queue) return;
    moved.current = true;
    const next = { ...results, [queue[pos]]: had };
    setResults(next);
    setFlipped(false);
    setPos(pos + 1);
    if (pos + 1 >= queue.length) {
      const got = Object.values(next).filter(Boolean).length;
      if (fullPass) saveDone(lessonKey, got);
      setLast({ done: true, ts: Date.now(), recalled: got });
      if (got === total) setBurst((b) => b + 1);
    }
  };

  const shown = started ? queue.slice(0, Math.min(pos + 1, queue.length)) : [];

  return (
    <div>
      <Confetti burst={burst} />
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-body-small text-muted">
          {started && !fullPass
            ? "Second look: only the ideas you didn't have yet."
            : "Read the cue, say the idea to yourself, then flip to check."}
          {last?.done && !started
            ? last.recalled !== undefined
              ? ` Last time you recalled ${last.recalled} of ${total}.`
              : " Completed before ✓"
            : ""}
        </p>
        <span className="qty shrink-0 text-[15px] text-graphite">
          {started ? `${Math.min(pos, queue.length)} / ${queue.length}` : `0 / ${total}`}
        </span>
      </div>

      <div className="mb-4">
        <Gauge pct={pct} label="Recap progress" />
      </div>

      {!started ? (
        <button
          ref={controlRef}
          type="button"
          onClick={() => begin(steps.map((_, i) => i), true)}
          className="hover-tint flex w-full items-center justify-center gap-3 border-[1.5px] border-dashed border-print px-4 py-6 text-center font-semibold text-print"
        >
          <Arrow />
          Start the recap: recall each idea before you flip it
        </button>
      ) : (
        <ol aria-live="polite">
          {shown.map((i, k) => {
            const s = steps[i];
            const graded = k < pos;
            const open = graded || (k === pos && flipped);
            return (
              <li key={`${i}-${k}`} className="pen-land rule-row flex items-start gap-3 py-3">
                <span className="step-box" aria-hidden>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-graphite">
                    <span className="me-2 grayscale" aria-hidden>
                      {s.emoji}
                    </span>
                    <InlineMarkdown>{s.title}</InlineMarkdown>
                    {graded ? (
                      <span className="ms-2 text-[14px] font-normal text-muted">
                        {results[i] ? "· recalled" : "· not yet"}
                      </span>
                    ) : null}
                  </p>
                  {open ? (
                    <p className="pen-land mt-1 text-body-small text-pencil">
                      <InlineMarkdown>{s.text}</InlineMarkdown>
                    </p>
                  ) : (
                    <p className="hatch mt-1.5 px-3 py-2 text-body-small text-muted">
                      What&rsquo;s the idea? Say it, then flip.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {started && !done && !flipped && (
        <button ref={controlRef} type="button" onClick={flip} className="btn-next mt-4 w-full">
          Flip the card <Arrow />
        </button>
      )}

      {started && !done && flipped && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button ref={controlRef} type="button" onClick={() => grade(true)} className="btn-next w-full">
            ✓ I had it
          </button>
          <button type="button" onClick={() => grade(false)} className="btn-print w-full">
            Not yet
          </button>
        </div>
      )}

      {done && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-print pt-3">
          <span role="status" className="flex items-center gap-2 font-semibold text-graphite">
            <Tick draw />
            {missed.length === 0
              ? `All ${total} ideas recalled.`
              : `You recalled ${recalledCount} of ${total}.`}
            {missed.length === 0 ? " 🎉" : ""}
          </span>
          <span className="flex flex-wrap gap-2">
            {missed.length > 0 && (
              <button ref={controlRef} type="button" onClick={() => begin(missed, false)} className="btn-print btn-sm">
                Go over the {missed.length} you missed
              </button>
            )}
            <button
              ref={missed.length > 0 ? undefined : controlRef}
              type="button"
              onClick={() => begin(steps.map((_, i) => i), true)}
              className="btn-print btn-sm"
            >
              Replay all
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
