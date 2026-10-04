"use client";

import Link from "next/link";
import { useProgress } from "@/lib/use-progress";
import type { FoundationRef } from "@/lib/nav";
import { Gauge } from "./TitleBlock";

/**
 * "Builds on these foundations" block shown on an Applications track page: the pillars everyone
 * should do first (readiness counts only these), then the ones only the track's code paths use.
 */
export default function BuildsOn({ pillars: all }: { pillars: FoundationRef[] }) {
  const { map, hydrated } = useProgress();
  if (all.length === 0) return null;
  const pillars = all.filter((p) => !p.optional);
  const optional = all.filter((p) => p.optional);

  const allKeys = pillars.flatMap((p) => p.lessonKeys);
  const total = allKeys.length;
  const done = allKeys.filter((k) => map[k]).length;
  const overall = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="pad-box mb-8 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="print-title text-print">Builds on these foundations</h2>
        <span className="qty text-[15px] text-graphite">
          {hydrated ? `${overall}% ready` : "—"}
        </span>
      </div>
      <p className="mt-1 text-body-small text-muted">
        Do these first. This track puts them to work, and none of them needs code.
      </p>
      <ul className="mt-3">
        {pillars.map((p) => {
          const pdone = p.lessonKeys.filter((k) => map[k]).length;
          const pct = p.count ? Math.round((pdone / p.count) * 100) : 0;
          return (
            <li key={p.slug}>
              <Link
                href={p.href}
                className="rule-row hover-tint group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-1 py-2.5 sm:grid-cols-[minmax(0,1fr)_160px_auto]"
              >
                <span className="min-w-0 truncate text-graphite group-hover:underline">{p.title}</span>
                <span className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
                  <Gauge pct={hydrated ? pct : 0} label={`${p.title} progress`} />
                </span>
                <span className="qty text-[14px] text-pencil sm:order-last">
                  {hydrated ? `${pdone}/${p.count}` : `0/${p.count}`}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {optional.length > 0 && (
        <p className="mt-3 text-body-small text-pencil">
          <span className="field-label me-2">Optional</span>
          Only the lessons&rsquo; code paths use{" "}
          {optional.map((p, i) => (
            <span key={p.slug}>
              {i > 0 ? (i === optional.length - 1 ? " and " : ", ") : ""}
              <Link href={p.href} className="text-print underline decoration-1 underline-offset-[3px]">
                {p.title}
              </Link>
            </span>
          ))}
          . If you don&rsquo;t code, skip {optional.length === 1 ? "it" : "them"}; every lesson here has a
          no-code path.
        </p>
      )}
    </div>
  );
}
