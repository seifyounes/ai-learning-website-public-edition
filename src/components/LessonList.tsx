"use client";

import Link from "next/link";
import { useProgress } from "@/lib/use-progress";
import { Tick } from "./TitleBlock";

export interface LessonListItem {
  title: string;
  href: string;
  key: string;
  level?: string;
  estMinutes?: number;
  /** Optional module label — items sharing one are grouped under a heading. */
  module?: string;
  /** "builders": marked so non-coders know they can skip it for now. */
  audience?: string;
}

export default function LessonList({
  items,
  highlightNext = false,
}: {
  items: LessonListItem[];
  highlightNext?: boolean;
}) {
  const { map, hydrated } = useProgress();

  // The single next lesson across ALL groups (first not-done in order).
  const nextKey = highlightNext && hydrated ? items.find((l) => !map[l.key])?.key : undefined;

  // Group by module, preserving item order; unlabeled lessons come as they are.
  const groups: { label: string; items: { item: LessonListItem; index: number }[] }[] = [];
  items.forEach((item, index) => {
    const label = item.module ?? "";
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push({ item, index });
    } else {
      groups.push({ label, items: [{ item, index }] });
    }
  });
  const grouped = groups.length > 1;

  return (
    <div className="space-y-6">
      {groups.map((group, gi) => (
        <div key={`${group.label}-${gi}`}>
          {grouped && group.label && (
            <h3 className="print-sheet-title border-b-[1.5px] border-print pb-1 text-print">
              {group.label}
            </h3>
          )}
          <ol>
            {group.items.map(({ item: l, index: i }) => {
              const done = hydrated && Boolean(map[l.key]);
              const isNext = l.key === nextKey;
              return (
                <li key={l.key}>
                  <Link
                    href={l.href}
                    className="rule-row hover-tint group flex items-center gap-3 px-1 py-2.5"
                  >
                    <span
                      className={[
                        "step-box",
                        done ? "border-graphite text-graphite" : "",
                        isNext ? "outline outline-2 outline-offset-[3px] outline-red-pen" : "",
                      ].join(" ")}
                    >
                      {done ? <Tick draw /> : i + 1}
                    </span>
                    <span
                      className={[
                        "min-w-0 flex-1 leading-snug group-hover:underline",
                        done ? "text-muted" : "text-graphite",
                      ].join(" ")}
                    >
                      {l.title}
                      {l.audience === "builders" ? (
                        <span className="ms-2 whitespace-nowrap text-[14px] text-muted">· for builders</span>
                      ) : null}
                      {/* Phones get level and time under the title; wider screens show them at the end. */}
                      {(l.level || l.estMinutes) && (
                        <span className="mt-0.5 block text-[14px] text-muted sm:hidden">
                          {l.level ? <span className="capitalize">{l.level}</span> : null}
                          {l.level && l.estMinutes ? " · " : ""}
                          {l.estMinutes ? <span className="qty">{l.estMinutes} min</span> : ""}
                        </span>
                      )}
                    </span>
                    {isNext && (
                      <span className="shrink-0 font-print text-[14px] font-bold uppercase tracking-[0.08em] text-red-pen [font-variation-settings:'wdth'_80]">
                        Next up
                      </span>
                    )}
                    {(l.level || l.estMinutes) && (
                      <span className="hidden shrink-0 text-[14px] text-muted sm:inline">
                        {l.level ? <span className="capitalize">{l.level}</span> : null}
                        {l.level && l.estMinutes ? " · " : ""}
                        {l.estMinutes ? <span className="qty">{l.estMinutes}m</span> : ""}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
