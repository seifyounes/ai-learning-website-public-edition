"use client";

import { useState } from "react";
import { useProgress } from "@/lib/use-progress";
import Confetti from "./Confetti";
import { Tick } from "./TitleBlock";

/** Mark complete: the view's Next (filled) until done, then a printed button with a drawn tick. */
export default function CompleteButton({ lessonKey }: { lessonKey: string }) {
  const { isComplete, toggle, hydrated } = useProgress();
  const [burst, setBurst] = useState(0);
  const done = hydrated && isComplete(lessonKey);

  return (
    <>
      <Confetti burst={burst} />
      <button
        type="button"
        onClick={() => {
          if (!done) setBurst((b) => b + 1);
          toggle(lessonKey);
        }}
        aria-pressed={done}
        // Hidden (but holding its place) until saved progress is read, so a finished lesson
        // never flashes "Mark complete" first.
        className={`${done ? "btn-print" : "btn-next"} ${hydrated ? "" : "invisible"}`}
      >
        {done ? (
          <Tick draw={burst > 0} className="text-graphite" />
        ) : (
          <span aria-hidden className="inline-block h-3.5 w-3.5 border-[1.5px] border-current" />
        )}
        {done ? "Completed" : "Mark complete"}
      </button>
    </>
  );
}
