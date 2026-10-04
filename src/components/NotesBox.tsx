"use client";

import { useEffect, useRef, useState } from "react";

export default function NotesBox({ lessonKey }: { lessonKey: string }) {
  const storageKey = `ai-learn:notes:v1:${lessonKey}`;
  const [value, setValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  // Only what the learner types is saved: opening a lesson never writes an empty note.
  const stored = useRef("");

  useEffect(() => {
    try {
      stored.current = window.localStorage.getItem(storageKey) ?? "";
      setValue(stored.current);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded || value === stored.current) return;
    const id = setTimeout(() => {
      try {
        if (value) window.localStorage.setItem(storageKey, value);
        else window.localStorage.removeItem(storageKey);
        stored.current = value;
        setSavedAt(new Date().toLocaleTimeString());
      } catch {
        /* ignore */
      }
    }, 500);
    return () => clearTimeout(id);
  }, [value, loaded, storageKey]);

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Capture your own takeaways, questions, and links here. Saved automatically in this browser."
        className="pencil-box block min-h-[160px] w-full resize-y p-4 text-body text-graphite focus:border-print focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-print"
        aria-label="Your notes"
      />
      <p className="mt-2 text-[14px] text-muted">
        {savedAt ? `Saved at ${savedAt} · this browser only` : "Saved locally in this browser only."}
      </p>
    </div>
  );
}
