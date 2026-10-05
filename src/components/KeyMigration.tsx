"use client";

import { useEffect } from "react";

// Math & ML moved from a Foundations pillar to its own section (2026-10-05). Saved progress,
// notes and scores are keyed by lesson path, so carry the old paths over once.
const MOVED: Record<string, string> = {
  "linear-algebra-for-ai": "linear-algebra",
  "probability-statistics-for-ai": "probability-statistics",
  "calculus-for-optimization": "calculus",
  "machine-learning-fundamentals": "machine-learning",
  "neural-networks": "neural-networks",
  "transformers-attention": "transformers",
  "evaluation-metrics": "evaluation",
};
const DONE = "ai-learn-migrated:math-section";
const OLD = /foundations\/math-ml-core\/([a-z-]+)/g;
const rename = (s: string) => s.replace(OLD, (m, slug: string) => (MOVED[slug] ? `math/${MOVED[slug]}/${slug}` : m));

export default function KeyMigration() {
  useEffect(() => {
    try {
      if (localStorage.getItem(DONE)) return;
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("ai-learn:")) keys.push(k);
      }
      let changed = false;
      for (const k of keys) {
        const v = localStorage.getItem(k) ?? "";
        const nk = rename(k);
        const nv = rename(v);
        if (nk !== k || nv !== v) {
          localStorage.removeItem(k);
          localStorage.setItem(nk, nv);
          changed = true;
        }
      }
      localStorage.setItem(DONE, "1");
      if (changed) window.dispatchEvent(new Event("ai-learn:progress-change"));
    } catch {
      // Storage blocked: nothing saved to carry over.
    }
  }, []);
  return null;
}
