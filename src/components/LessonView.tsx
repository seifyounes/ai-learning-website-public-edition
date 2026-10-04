import Link from "next/link";
import type { Lesson } from "@/lib/types";
import type { PillarMeta } from "@/lib/curriculum";
import Markdown from "./Markdown";
import McqQuiz from "./McqQuiz";
import PrimaryResource from "./PrimaryResource";
import ReadAfter from "./ReadAfter";
import SelfCheck from "./SelfCheck";
import NotesBox from "./NotesBox";
import CompleteButton from "./CompleteButton";
import VideoRecap from "./VideoRecap";
import InlineMarkdown from "./InlineMarkdown";
import LectureTrack from "./LectureTrack";
import { Arrow, BackCell, Cell, TitleBlock } from "./TitleBlock";
import { reportIssueUrl } from "@/lib/site";

/** "3 Oct 2026": when the video pick, links and facts were last checked. */
function reviewedLabel(reviewedOn?: string): string {
  if (!reviewedOn) return "–";
  const t = new Date(`${reviewedOn}T00:00:00`);
  if (Number.isNaN(t.getTime())) return reviewedOn;
  return t.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export interface LessonTime {
  video?: number;
  read: number;
  task?: number;
  total?: number;
}

export interface LessonNavRef {
  title: string;
  href: string;
}

/** One lesson block: a ruled print box on solid paper (prose stays off the grid). */
function Block({
  step,
  title,
  id,
  children,
}: {
  step: number;
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="pad-box scroll-mt-6">
      <div className="flex items-center gap-3 border-b border-print px-4 py-3 sm:px-6">
        <span className="step-box">{step}</span>
        <h2 className="print-title">{title}</h2>
      </div>
      <div className="px-4 py-5 sm:px-6">{children}</div>
    </section>
  );
}

/**
 * The lesson's on-page outline: printed jump links, one per block. On phones it folds into a
 * single "Jump to" row so it doesn't push the lesson off the first screen.
 */
function Outline({ items }: { items: { href: string; label: string }[] }) {
  const links = items.map((i) => (
    <a key={i.href} href={i.href} className="btn-print btn-sm">
      {i.label}
    </a>
  ));
  return (
    <nav aria-label="On this page">
      <div className="hidden flex-wrap gap-2 sm:flex">{links}</div>
      <details className="group pencil-box sm:hidden">
        <summary className="hover-tint flex cursor-pointer list-none items-center justify-between px-3 py-2.5 [&::-webkit-details-marker]:hidden">
          <span className="label-action text-[13px] text-print">Jump to a section</span>
          <Arrow dir="down" className="text-print" />
        </summary>
        <div className="flex flex-wrap gap-2 border-t border-pencil p-3">{links}</div>
      </details>
    </nav>
  );
}

export default function LessonView({
  lesson,
  pillar,
  position,
  time,
  prerequisites = [],
  prev,
  next,
}: {
  lesson: Lesson;
  pillar: PillarMeta;
  time: LessonTime;
  /** Earlier lessons to do first. */
  prerequisites?: LessonNavRef[];
  /** This lesson's place in its pillar, 1-based. */
  position: { index: number; total: number };
  prev?: LessonNavRef;
  next?: LessonNavRef;
}) {
  // Blocks number themselves in reading order, whichever optional ones this lesson has.
  let n = 0;
  const step = () => ++n;

  return (
    <article className="space-y-6">
      {/* 1. Header — the lesson's title block */}
      <header className="space-y-4">
        <TitleBlock className="grid-cols-2 sm:grid-cols-4">
          <BackCell
            href={`/${lesson.section}/${lesson.pillar}`}
            className="col-span-2 sm:col-span-1"
            label={
              <>
                {/* Phones hide the Pillar cell, so Back names the pillar it returns to. */}
                <span className="sm:hidden">{pillar.title}</span>
                <span className="hidden sm:inline">Back</span>
              </>
            }
          />
          <Cell label="Pillar" className="hidden sm:col-span-3 sm:flex">
            <Link
              href={`/${lesson.section}/${lesson.pillar}`}
              className="text-body-small text-pencil hover:underline"
            >
              {pillar.title}
            </Link>
          </Cell>
          <Cell label="Lesson" as="header" className="col-span-2 sm:col-span-4">
            <h1 className="font-print text-[26px] font-bold leading-[1.05] text-graphite [font-variation-settings:'wdth'_80] sm:text-[32px]">
              {lesson.title}
              {lesson.subtitle ? <span className="sr-only">: </span> : null}
              {lesson.subtitle ? (
                <span className="mt-1.5 block font-prose text-[17px] font-normal leading-snug text-pencil [font-variation-settings:normal] sm:text-[19px]">
                  {lesson.subtitle}
                </span>
              ) : null}
            </h1>
          </Cell>
          <Cell label="Level" align="top">
            <span className="capitalize text-graphite">{lesson.level}</span>
          </Cell>
          <Cell label="Time" align="top">
            <span className="qty text-quantity text-graphite">
              {time.total ? `${time.total} min` : "–"}
            </span>
            <span className="mt-0.5 block text-[13px] leading-snug text-muted">
              {[
                time.video ? `video ${time.video}` : null,
                `read ${time.read}`,
                time.task ? `task ${time.task}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </Cell>
          <Cell label="Reviewed" align="top">
            <Link
              href="/about#review"
              className="qty inline-flex min-h-[24px] items-center text-[15px] text-graphite underline decoration-pencil decoration-1 underline-offset-[3px] hover:decoration-2"
              title="What a review covers"
            >
              {reviewedLabel(lesson.reviewedOn)}
            </Link>
          </Cell>
          <Cell label="In pillar" align="top">
            <span className="qty text-quantity text-graphite">
              {position.index}
              <span className="text-[14px] text-muted"> / {position.total}</span>
            </span>
          </Cell>
        </TitleBlock>
        {lesson.audience === "builders" && (
          <p className="pencil-box px-4 py-2.5 text-body-small text-pencil">
            <span className="field-label me-2">For builders</span>
            This lesson is for people who build software or run coding agents. If that isn&rsquo;t
            you yet, skip it for now and come back once you do; nothing later depends on it.
          </p>
        )}
        {lesson.shortPath && (
          <p className="pencil-box px-4 py-2.5 text-body-small text-pencil">
            <span className="field-label me-2">Short on time</span>
            <InlineMarkdown>{lesson.shortPath}</InlineMarkdown>
          </p>
        )}
        {prerequisites.length > 0 && (
          <p className="pencil-box px-4 py-2.5 text-body-small text-pencil">
            <span className="field-label me-2">Do these first</span>
            {prerequisites.map((p, i) => (
              <span key={p.href}>
                {i > 0 ? " · " : ""}
                <Link
                  href={p.href}
                  className="inline-flex min-h-[28px] items-center text-print underline decoration-1 underline-offset-[3px]"
                >
                  {p.title}
                </Link>
              </span>
            ))}
          </p>
        )}
        <Outline
          items={[
            { href: "#resource", label: "Watch" },
            ...(lesson.lectureTrack?.length ? [{ href: "#lectures", label: "Lectures" }] : []),
            ...(lesson.recap?.length ? [{ href: "#recap", label: "Recap" }] : []),
            ...(lesson.body ? [{ href: "#breakdown", label: "Breakdown" }] : []),
            ...(lesson.applyIt ? [{ href: "#apply", label: "Apply" }] : []),
            ...(lesson.toolkit ? [{ href: "#toolkit", label: "Your setup" }] : []),
            ...(lesson.task ? [{ href: "#task", label: "Do now" }] : []),
            ...(lesson.selfCheck?.length ? [{ href: "#quiz", label: "Self-check" }] : []),
            ...(lesson.mcq?.length ? [{ href: "#challenge", label: "Challenge" }] : []),
            { href: "#notes", label: "Notes" },
          ]}
        />
      </header>

      {/* 2. The video — picked against the alternatives, follow-up reading under it */}
      <Block step={step()} title="Watch: the explanation" id="resource">
        <PrimaryResource video={lesson.video} />
        <ReadAfter items={lesson.readAfter} />
      </Block>

      {/* 2a. Math & ML subjects: the full lecture series, in watching order */}
      {lesson.lectureTrack && lesson.lectureTrack.length > 0 && (
        <Block step={step()} title="Lecture track: the full series" id="lectures">
          <LectureTrack
            lectures={lesson.lectureTrack}
            lessonKey={lesson.key}
            primaryId={lesson.video?.videoId}
          />
        </Block>
      )}

      {/* 2b. Gamified recap — replay the video's ideas one card at a time */}
      {lesson.recap && lesson.recap.length > 0 && (
        <Block step={step()} title="Video recap: recall it" id="recap">
          <VideoRecap steps={lesson.recap} lessonKey={lesson.key} />
        </Block>
      )}

      {/* 3. Expert breakdown (the markdown body) */}
      {lesson.body && (
        <Block step={step()} title="Breakdown" id="breakdown">
          <Markdown>{lesson.body}</Markdown>
        </Block>
      )}

      {/* 4. Apply it to your work */}
      {lesson.applyIt && (
        <Block step={step()} title="Apply it to your work" id="apply">
          <Markdown>{lesson.applyIt}</Markdown>
        </Block>
      )}

      {/* 4b. Upgrade your AI setup — turn the lesson into a lasting change to your tools */}
      {lesson.toolkit && (
        <Block step={step()} title="Upgrade your AI setup" id="toolkit">
          <Markdown>{lesson.toolkit}</Markdown>
        </Block>
      )}

      {/* 5. Do this now */}
      {lesson.task && (
        <Block step={step()} title="Do this now" id="task">
          <Markdown>{lesson.task}</Markdown>
        </Block>
      )}

      {/* 6. Self-check */}
      {lesson.selfCheck && lesson.selfCheck.length > 0 && (
        <Block step={step()} title="Self-check" id="quiz">
          <SelfCheck items={lesson.selfCheck} lessonKey={lesson.key} />
        </Block>
      )}

      {/* 6b. Challenge quiz — MCQs that connect the math to the AI you build */}
      {lesson.mcq && lesson.mcq.length > 0 && (
        <Block step={step()} title="Challenge quiz" id="challenge">
          <McqQuiz items={lesson.mcq} lessonKey={lesson.key} />
        </Block>
      )}

      {/* 7. Your notes */}
      <Block step={step()} title="Your notes" id="notes">
        <NotesBox lessonKey={lesson.key} />
      </Block>

      {/* 8. Backup resources — collapsed by default to keep the page calm */}
      {lesson.backupResources && lesson.backupResources.length > 0 && (
        <details className="group pad-box">
          <summary className="hover-tint flex cursor-pointer list-none items-center gap-3 px-4 py-3 sm:px-6 [&::-webkit-details-marker]:hidden">
            <span className="step-box">{step()}</span>
            <h2 className="print-title">
              Backup resources{" "}
              <span className="qty text-[17px] font-normal text-muted">
                ({lesson.backupResources.length})
              </span>
            </h2>
            <span className="label-action ms-auto text-[13px] text-print group-open:hidden">
              Show
            </span>
            <span className="label-action ms-auto hidden text-[13px] text-print group-open:inline">
              Hide
            </span>
          </summary>
          <ul className="border-t border-print px-4 py-3 sm:px-6">
            {lesson.backupResources.map((r) => (
              <li key={r.url} className="rule-row flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-print underline decoration-1 hover:decoration-2"
                >
                  {r.label}
                </a>
                {r.type ? <span className="text-[14px] text-muted">{r.type}</span> : null}
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-print pt-5">
        <CompleteButton lessonKey={lesson.key} />
        <Link href={`/${lesson.section}/${lesson.pillar}`} className="btn-print">
          <Arrow dir="back" /> Back to pillar
        </Link>
      </div>

      {lesson.changeNote && (
        <details className="group pencil-box text-body-small text-pencil">
          <summary className="hover-tint flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 [&::-webkit-details-marker]:hidden">
            <span className="label-action text-[13px] text-print">What changed in the last review</span>
            <span className="qty text-[13px] text-muted">{reviewedLabel(lesson.reviewedOn)}</span>
          </summary>
          <p className="border-t border-pencil px-4 py-3">
            {lesson.changeNote}{" "}
            <Link href="/about#review" className="text-print underline decoration-1 underline-offset-[3px]">
              What a review covers
            </Link>
          </p>
        </details>
      )}

      <p className="text-body-small text-muted">
        Spotted a mistake, a dead link or something out of date?{" "}
        <a
          href={reportIssueUrl(lesson.title, lesson.href)}
          target="_blank"
          rel="noreferrer"
          className="text-print underline decoration-1 underline-offset-[3px]"
        >
          Report it on GitHub
        </a>
        . Every report is checked against the sources.
      </p>

      {/* Previous / next lesson in course order */}
      {(prev || next) && (
        <nav aria-label="Lesson navigation" className="grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link href={prev.href} className="pencil-box hover-tint block p-4">
              <span className="label-action flex items-center gap-2 text-[13px] text-print">
                <Arrow dir="back" /> Previous lesson
              </span>
              <span className="mt-1.5 block text-body-small text-graphite">{prev.title}</span>
            </Link>
          ) : (
            <span aria-hidden />
          )}
          {next && (
            <Link href={next.href} className="pencil-box hover-tint block p-4 sm:text-end">
              <span className="label-action flex items-center gap-2 text-[13px] text-print sm:justify-end">
                Next lesson <Arrow />
              </span>
              <span className="mt-1.5 block text-body-small text-graphite">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
