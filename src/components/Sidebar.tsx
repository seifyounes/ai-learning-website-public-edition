"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavSection } from "@/lib/nav";
import { useProgress } from "@/lib/use-progress";
import { Tick } from "./TitleBlock";

export default function Sidebar({ nav }: { nav: NavSection[] }) {
  const pathname = usePathname();
  const { map, hydrated } = useProgress();

  return (
    <nav aria-label="Course contents" className="space-y-7 text-body-small">
      {nav.map((section) => (
        <div key={section.slug}>
          <Link
            href={`/${section.slug}`}
            className="mb-2 block border-b-2 border-print pb-1 font-print text-[19px] font-bold leading-tight text-print [font-variation-settings:'wdth'_75] hover:underline"
          >
            {section.title}
          </Link>
          <ul>
            {section.pillars.map((pillar) => {
              const activePillar = pathname.startsWith(pillar.href);
              return (
                <li key={pillar.slug}>
                  <Link
                    href={pillar.href}
                    aria-current={pathname === pillar.href ? "page" : undefined}
                    className={[
                      "rule-row hover-tint flex items-baseline gap-2 px-1.5 py-1.5",
                      activePillar ? "bg-[var(--tint)] font-semibold text-graphite" : "text-pencil",
                    ].join(" ")}
                  >
                    <span className="qty w-5 shrink-0 text-[13px] text-print">{pillar.number}</span>
                    <span className="min-w-0 flex-1 leading-snug">{pillar.title}</span>
                    <span className="qty shrink-0 text-[13px] text-muted">{pillar.count}</span>
                  </Link>
                  {activePillar && pillar.lessons.length > 0 && (
                    <ul className="my-1.5 ms-3 border-s border-print ps-2">
                      {pillar.lessons.map((lesson) => {
                        const active = pathname === lesson.href;
                        const done = hydrated && Boolean(map[lesson.key]);
                        return (
                          <li key={lesson.key}>
                            <Link
                              href={lesson.href}
                              aria-current={active ? "page" : undefined}
                              className={[
                                "hover-tint flex items-start gap-1.5 px-1.5 py-1 text-[14px] leading-snug",
                                active
                                  ? "font-semibold text-graphite underline decoration-red-pen decoration-2"
                                  : "text-muted hover:text-graphite",
                              ].join(" ")}
                            >
                              <span className="mt-[3px] grid h-3.5 w-3.5 shrink-0 place-items-center" aria-hidden>
                                {done ? <Tick className="h-3.5 w-3.5 text-graphite" /> : null}
                              </span>
                              <span className="min-w-0">
                                {lesson.title}
                                {done ? <span className="sr-only"> (completed)</span> : null}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
