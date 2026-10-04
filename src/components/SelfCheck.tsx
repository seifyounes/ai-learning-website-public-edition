"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { SelfCheckItem } from "@/lib/types";
import Confetti from "./Confetti";
import InlineMarkdown from "./InlineMarkdown";
import { Tick } from "./TitleBlock";

const QUIZ_KEY = "ai-learn:quiz:v1";

type Grade = "got" | "missed";

interface QuizScore {
  got: number;
  total: number;
  ts: number;
}

function readScores(): Record<string, QuizScore> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(QUIZ_KEY);
    return raw ? (JSON.parse(raw) as Record<string, QuizScore>) : {};
  } catch {
    return {};
  }
}

function saveScore(lessonKey: string, score: QuizScore) {
  try {
    const all = readScores();
    all[lessonKey] = score;
    window.localStorage.setItem(QUIZ_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function scoreLine(got: number, total: number): string {
  if (got === total) return `Perfect — ${got}/${total}. 🎉`;
  if (got >= Math.ceil(total / 2)) return `${got}/${total} — solid. Re-read what you missed.`;
  return `${got}/${total} — worth another pass through the breakdown.`;
}

function Item({
  item,
  revealed,
  grade,
  onReveal,
  onGrade,
}: {
  item: SelfCheckItem;
  revealed: boolean;
  grade: Grade | null;
  onReveal: () => void;
  onGrade: (g: Grade) => void;
}) {
  const answerId = useId();
  const answerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLButtonElement>(null);
  // Where focus goes after the next render: keyboard and screen-reader users land on the answer
  // they just opened, then back on the question (which shows the grade) once they grade it.
  const focusNext = useRef<"answer" | "question" | null>(null);
  useEffect(() => {
    if (focusNext.current === "answer") answerRef.current?.focus();
    if (focusNext.current === "question") questionRef.current?.focus();
    focusNext.current = null;
  }, [revealed, grade]);
  const reveal = () => {
    if (revealed) return;
    focusNext.current = "answer";
    onReveal();
  };
  const gradeAs = (g: Grade) => {
    focusNext.current = "question";
    onGrade(g);
  };
  // Graded by mark, not colour: a graphite tick for "got it", the red pen for "missed".
  // The question stays a focusable button (never disabled) so focus is never dropped.
  return (
    <li className="pencil-box">
      <button
        ref={questionRef}
        type="button"
        onClick={reveal}
        aria-expanded={revealed}
        aria-controls={revealed ? answerId : undefined}
        className={`flex w-full flex-col items-start gap-1.5 px-4 py-3 text-start font-semibold text-graphite sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${revealed ? "cursor-default" : "hover-tint"}`}
      >
        <span>
          <InlineMarkdown>{item.q}</InlineMarkdown>
        </span>
        {!revealed && <span className="label-action shrink-0 text-[13px] text-print">Reveal</span>}
        {grade === "got" && (
          <span className="flex shrink-0 items-center gap-1 text-[14px] text-graphite">
            <Tick draw /> got it
          </span>
        )}
        {grade === "missed" && (
          <span className="shrink-0 text-[14px] font-semibold text-red-pen">✗ missed</span>
        )}
      </button>
      {revealed && (
        <div
          id={answerId}
          ref={answerRef}
          tabIndex={-1}
          className="pen-land border-t border-pencil px-4 py-3 focus:outline-none"
        >
          <span className="field-label">Answer</span>
          <p className="mt-1.5 text-body-small text-graphite">
            <InlineMarkdown>{item.a}</InlineMarkdown>
          </p>
          {!grade && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => gradeAs("got")} className="btn-print btn-sm">
                ✓ I got it
              </button>
              <button
                type="button"
                onClick={() => gradeAs("missed")}
                className="btn-print btn-sm border-red-pen text-red-pen"
              >
                ✗ I missed it
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default function SelfCheck({
  items,
  lessonKey,
}: {
  items: SelfCheckItem[];
  lessonKey: string;
}) {
  const [revealed, setRevealed] = useState<boolean[]>(() => items.map(() => false));
  const [grades, setGrades] = useState<(Grade | null)[]>(() => items.map(() => null));
  const [last, setLast] = useState<QuizScore | null>(null);
  const [saved, setSaved] = useState(false);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    setLast(readScores()[lessonKey] ?? null);
  }, [lessonKey]);

  const total = items.length;
  const got = grades.filter((g) => g === "got").length;
  const done = total > 0 && grades.every(Boolean);

  useEffect(() => {
    if (!done || saved) return;
    saveScore(lessonKey, { got, total, ts: Date.now() });
    setSaved(true);
    if (got === total) setBurst((b) => b + 1);
  }, [done, saved, got, total, lessonKey]);

  if (!items.length) return null;

  const reset = () => {
    setLast(readScores()[lessonKey] ?? null);
    setRevealed(items.map(() => false));
    setGrades(items.map(() => null));
    setSaved(false);
  };

  return (
    <div>
      <Confetti burst={burst} />
      <p className="mb-3 text-body-small text-muted">
        Answer each one in your head first, then reveal and grade yourself honestly.
        {last && !done ? ` Last time: ${last.got}/${last.total}.` : ""}
      </p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <Item
            key={i}
            item={item}
            revealed={revealed[i]}
            grade={grades[i]}
            onReveal={() =>
              setRevealed((r) => r.map((v, j) => (j === i ? true : v)))
            }
            onGrade={(g) =>
              setGrades((gs) => gs.map((v, j) => (j === i ? g : v)))
            }
          />
        ))}
      </ul>
      {done && (
        <div className="pen-land mt-4 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-print pt-3">
          <span role="status" className="font-semibold text-graphite">
            {scoreLine(got, total)}
          </span>
          <button type="button" onClick={reset} className="btn-print btn-sm">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
