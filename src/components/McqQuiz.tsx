"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { McqItem } from "@/lib/types";
import Confetti from "./Confetti";
import InlineMarkdown from "./InlineMarkdown";

const MCQ_KEY = "ai-learn:mcq:v1";

interface McqScore {
  best: number;
  total: number;
  ts: number;
}

function readScores(): Record<string, McqScore> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(MCQ_KEY);
    return raw ? (JSON.parse(raw) as Record<string, McqScore>) : {};
  } catch {
    return {};
  }
}

function saveScore(lessonKey: string, correct: number, total: number) {
  try {
    const all = readScores();
    const prev = all[lessonKey];
    all[lessonKey] = {
      best: Math.max(prev?.best ?? 0, correct),
      total,
      ts: Date.now(),
    };
    window.localStorage.setItem(MCQ_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function Question({
  item,
  index,
  picked,
  onPick,
}: {
  item: McqItem;
  index: number;
  picked: number | null;
  onPick: (option: number) => void;
}) {
  const answered = picked !== null;
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const qId = useId();
  // Move focus to the verdict once it renders, so keyboard and screen-reader users hear it.
  const justPicked = useRef(false);
  useEffect(() => {
    if (justPicked.current && answered) feedbackRef.current?.focus();
    justPicked.current = false;
  }, [answered]);
  const pick = (oi: number) => {
    if (answered) return;
    justPicked.current = true;
    onPick(oi);
  };
  return (
    <li className="pencil-box p-4">
      <p id={qId} className="font-semibold text-graphite">
        <span className="qty me-2 font-normal text-print">Q{index + 1}</span>
        <InlineMarkdown>{item.q}</InlineMarkdown>
      </p>
      <div role="group" aria-labelledby={qId} className="mt-3 grid gap-2.5">
        {item.options.map((opt, oi) => {
          const isAnswer = oi === item.answer;
          const isPicked = oi === picked;
          // The answer is boxed twice in print ink; a wrong pick is struck through in red pen.
          let cls = "border-pencil text-graphite hover-tint";
          if (answered && isAnswer) {
            cls = "answer-frame text-graphite font-semibold";
          } else if (answered && isPicked) {
            cls = "border-pencil text-red-pen line-through decoration-red-pen decoration-2";
          } else if (answered) {
            cls = "border-pencil border-dashed text-muted";
          }
          return (
            <button
              key={oi}
              type="button"
              aria-disabled={answered || undefined}
              aria-pressed={answered ? isPicked : undefined}
              onClick={() => pick(oi)}
              className={`border-[1.2px] bg-sheet px-3 py-2.5 text-start text-body-small ${answered ? "cursor-default" : ""} ${cls}`}
            >
              <span className="qty me-2 font-normal text-print no-underline">
                {String.fromCharCode(65 + oi)}
              </span>
              <InlineMarkdown>{opt}</InlineMarkdown>
              {answered && isAnswer ? <span className="sr-only"> (correct answer)</span> : null}
              {answered && isPicked && !isAnswer ? <span className="sr-only"> (your pick)</span> : null}
              {answered && isAnswer ? " ✓" : ""}
              {answered && isPicked && !isAnswer ? " ✗" : ""}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {answered && (
          <p
            ref={feedbackRef}
            tabIndex={-1}
            className="pen-land mt-4 border-t border-pencil pt-3 text-body-small text-graphite focus:outline-none"
          >
            <span
              className={`font-bold ${picked === item.answer ? "text-graphite" : "text-red-pen"}`}
            >
              {picked === item.answer ? "Correct. " : "Not quite. "}
            </span>
            <InlineMarkdown>{item.explain}</InlineMarkdown>
          </p>
        )}
      </div>
    </li>
  );
}

/**
 * Challenging multiple-choice quiz with instant feedback and explanations —
 * pick, see why, keep score. Best score persists per lesson.
 */
export default function McqQuiz({
  items,
  lessonKey,
}: {
  items: McqItem[];
  lessonKey: string;
}) {
  const [picks, setPicks] = useState<(number | null)[]>(() => items.map(() => null));
  const [best, setBest] = useState<McqScore | null>(null);
  const [saved, setSaved] = useState(false);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    setBest(readScores()[lessonKey] ?? null);
  }, [lessonKey]);

  const total = items.length;
  const answered = picks.filter((p) => p !== null).length;
  const correct = picks.filter((p, i) => p === items[i].answer).length;
  const done = total > 0 && answered === total;

  useEffect(() => {
    if (!done || saved) return;
    saveScore(lessonKey, correct, total);
    setSaved(true);
    if (correct === total) setBurst((b) => b + 1);
  }, [done, saved, correct, total, lessonKey]);

  if (!items.length) return null;

  const reset = () => {
    setBest(readScores()[lessonKey] ?? null);
    setPicks(items.map(() => null));
    setSaved(false);
  };

  return (
    <div>
      <Confetti burst={burst} />
      <p className="mb-3 text-body-small text-muted">
        No partial credit, no reveal button — commit to an answer, then read why.
        {best && !done ? ` Best so far: ${best.best}/${best.total}.` : ""}
      </p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <Question
            key={i}
            item={item}
            index={i}
            picked={picks[i]}
            onPick={(o) => setPicks((ps) => ps.map((v, j) => (j === i ? o : v)))}
          />
        ))}
      </ul>
      {done && (
        <div className="pen-land mt-4 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-print pt-3">
          <span role="status" className="font-semibold text-graphite">
            {correct === total
              ? `Perfect — ${correct}/${total}. You can apply this. 🎉`
              : correct >= Math.ceil(total * 0.6)
                ? `${correct}/${total} — solid. Re-read the explanations you missed.`
                : `${correct}/${total} — the explanations above are the lesson. Take another pass.`}
          </span>
          <button
            type="button"
            onClick={reset}
            className="btn-print btn-sm"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
