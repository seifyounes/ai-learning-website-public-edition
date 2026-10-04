"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/use-progress";
import { Tick } from "./TitleBlock";

export interface SearchEntry {
  key: string;
  href: string;
  title: string;
  pillar: string;
  level: string;
  minutes?: number;
  tags: string[];
  summary: string;
}

/** The full-text half of the index, fetched from /search-index.json on first use. */
interface FullText {
  key: string;
  headings: string;
  /** The lesson's opening text, for snippets and phrase matches. */
  text: string;
  /** Every other distinct word in the lesson, once each. */
  words: string;
}

const LEVELS = ["all", "beginner", "intermediate", "advanced"] as const;

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}+#.]+/gu, " ");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Light stemming so word forms meet: "hallucinate", "hallucinating" and "hallucination" all
 * reduce to "hallucinat"; "embeddings" to "embedding". Short words are left alone.
 */
function stem(w: string): string {
  if (w.length < 5) return w;
  for (const suffix of ["ations", "ation", "ions", "ion", "ing", "ies", "ed", "es", "s", "e"]) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 4) return w.slice(0, -suffix.length);
  }
  return w;
}

/** One typo apart: one letter added, dropped or changed, or two neighbours swapped. */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const diff = [...a].flatMap((c, k) => (c === b[k] ? [] : [k]));
    if (diff.length === 2 && diff[1] === diff[0] + 1 && a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]]) {
      return true;
    }
  }
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/**
 * A query term matches at the start of a word ("agent" finds "agents"; "rag" never finds
 * "leverage"). Short terms of one or two letters must match a whole word. A term can carry
 * alternatives (typo corrections), any of which may match.
 */
function wordRegex(w: string | string[]): RegExp {
  const alts = (Array.isArray(w) ? w : [w]).map(stem);
  const body = alts.map((a) => escapeRegExp(a) + (a.length <= 2 ? "(?![\\p{L}\\p{N}])" : "")).join("|");
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${body})`, "iu");
}

/**
 * For each query word, the forms to search for: the word itself, plus (for words of five or more
 * letters that appear nowhere in the course) the course words one typo away.
 */
function expandTerms(words: string[], vocab: Set<string>): string[][] {
  return words.map((w) => {
    if (w.length < 5) return [w];
    const s = stem(w);
    for (const v of vocab) if (v.startsWith(s)) return [w];
    const near = [...vocab].filter((v) => v.length >= 4 && withinOneEdit(w, v));
    return near.length ? [w, ...near.slice(0, 5)] : [w];
  });
}

/** ~180 characters of body text around the first hit, with the hit marked. */
function snippet(text: string, terms: string[][]): { before: string; hit: string; after: string } | null {
  for (const w of terms) {
    const m = wordRegex(w).exec(text);
    if (!m) continue;
    const start = Math.max(0, m.index - 80);
    const end = Math.min(text.length, m.index + m[0].length + 100);
    return {
      before: `${start > 0 ? "…" : ""}${text.slice(start, m.index).replace(/^\S*\s/, start > 0 ? "" : "$&")}`,
      hit: text.slice(m.index, m.index + m[0].length),
      after: `${text.slice(m.index + m[0].length, end).replace(/\s\S*$/, "")}${end < text.length ? "…" : ""}`,
    };
  }
  return null;
}

/**
 * Client-side search over every lesson. Every query word must match somewhere; a match in the
 * title outranks tags and pillar, which outrank section headings, which outrank body text, and
 * the whole phrase appearing together earns a bonus. The query lives in the URL (?q=) so
 * results can be shared and survive a reload.
 */
export default function SearchView({ entries }: { entries: SearchEntry[] }) {
  const { map, hydrated } = useProgress();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("all");
  const [full, setFull] = useState<Map<string, FullText> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetched = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);
    const l = params.get("level");
    if (LEVELS.some((x) => x === l)) setLevel(l as (typeof LEVELS)[number]);
    inputRef.current?.focus();
  }, []);

  // The full-text index loads on the first search, not on page load.
  useEffect(() => {
    if (!query || fetched.current) return;
    fetched.current = true;
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: FullText[]) => setFull(new Map(rows.map((r) => [r.key, r]))))
      // Offline or blocked: titles, tags and summaries still search.
      .catch(() => setFull(new Map()));
  }, [query]);

  // Query and level live in the URL so a search can be shared and survives a reload.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    if (level !== "all") url.searchParams.set("level", level);
    else url.searchParams.delete("level");
    window.history.replaceState(null, "", url);
  }, [query, level]);

  const indexed = useMemo(
    () =>
      entries.map((e) => {
        const f = full?.get(e.key);
        return {
          e,
          title: normalize(e.title),
          meta: normalize(`${e.pillar} ${e.tags.join(" ")}`),
          headings: normalize(f?.headings ?? ""),
          body: normalize(`${e.summary} ${f?.text ?? ""} ${f?.words ?? ""}`),
          raw: f?.text ?? e.summary,
        };
      }),
    [entries, full],
  );

  const words = useMemo(() => normalize(query).split(" ").filter(Boolean), [query]);
  // Every word in the course, for typo correction.
  const vocab = useMemo(() => {
    const v = new Set<string>();
    for (const x of indexed) for (const w of `${x.title} ${x.meta} ${x.headings} ${x.body}`.split(" ")) if (w) v.add(w);
    return v;
  }, [indexed]);
  const terms = useMemo(() => expandTerms(words, vocab), [words, vocab]);

  const results = useMemo(() => {
    const phrase = words.length > 1 ? words.join(" ") : null;
    const res = terms.map(wordRegex);
    return indexed
      .filter((x) => level === "all" || x.e.level === level)
      .map((x) => {
        if (!words.length) return { x, score: 0 };
        let score = 0;
        for (const re of res) {
          if (re.test(x.title)) score += 8;
          else if (re.test(x.meta)) score += 4;
          else if (re.test(x.headings)) score += 3;
          else if (re.test(x.body)) score += 1;
          else return null;
          // A lesson that keeps coming back to the term is about it: up to +3 for frequency.
          const hits = x.body.match(new RegExp(re.source, "giu"))?.length ?? 0;
          score += Math.min(3, Math.floor(hits / 3));
        }
        if (phrase) {
          if (x.title.includes(phrase)) score += 6;
          else if (x.headings.includes(phrase) || x.body.includes(phrase)) score += 3;
        }
        return { x, score };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.score - a.score);
  }, [indexed, words, terms, level]);

  return (
    <div className="mt-6">
      <label htmlFor="lesson-search" className="field-label">
        Search
      </label>
      <input
        ref={inputRef}
        id="lesson-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Topic, tool or skill…"
        autoComplete="off"
        className="pencil-box mt-2 block w-full px-4 py-3 text-body text-graphite focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-print"
      />

      <div role="group" aria-label="Filter by level" className="mt-4 flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={level === l}
            onClick={() => setLevel(l)}
            className={`btn-print btn-sm ${level === l ? "border-graphite bg-[var(--tint-strong)] text-graphite" : ""}`}
          >
            {l === "all" ? "All levels" : l}
          </button>
        ))}
      </div>

      <p className="mt-5 text-body-small text-pencil" aria-live="polite">
        <span className="qty">{results.length}</span>{" "}
        {results.length === 1 ? "lesson" : "lessons"}
        {query ? (
          <>
            {" "}
            for &ldquo;{query}&rdquo;
          </>
        ) : null}
        {query && !full ? " (loading full text…)" : null}
      </p>

      {results.length === 0 ? (
        <div className="hatch mt-3 border-[1.5px] border-dashed border-print p-6 text-body-small text-pencil">
          Nothing matches yet. Try a broader word (&ldquo;agent&rdquo; instead of
          &ldquo;multi-agent orchestration&rdquo;), or browse{" "}
          <Link href="/foundations" className="text-print underline">
            Foundations
          </Link>{" "}
          and{" "}
          <Link href="/applications" className="text-print underline">
            Applications
          </Link>
          .
        </div>
      ) : (
        <ul className="mt-2">
          {results.map(({ x }) => {
            const e = x.e;
            const done = hydrated && Boolean(map[e.key]);
            const hit = words.length && !terms.every((t) => wordRegex(t).test(x.title)) ? snippet(x.raw, terms) : null;
            return (
              <li key={e.key}>
                <Link
                  href={e.href}
                  aria-label={`${e.title}${done ? ", completed" : ""}`}
                  className="rule-row hover-tint group flex gap-3 px-1 py-3"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border-[1.2px] border-pencil text-graphite"
                  >
                    {done ? <Tick className="h-4 w-4" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-snug text-graphite group-hover:underline">
                      {e.title}
                    </span>
                    <span className="mt-0.5 block text-[14px] text-muted">
                      {e.pillar} · <span className="capitalize">{e.level}</span>
                      {e.minutes ? (
                        <>
                          {" "}
                          · <span className="qty">{e.minutes} min</span>
                        </>
                      ) : null}
                    </span>
                    {hit ? (
                      <span className="mt-1 block text-body-small text-pencil">
                        {hit.before}
                        <mark className="bg-transparent font-semibold text-graphite underline decoration-print decoration-2 underline-offset-2">
                          {hit.hit}
                        </mark>
                        {hit.after}
                      </span>
                    ) : e.summary ? (
                      <span className="mt-1 block text-body-small text-pencil">{e.summary}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
