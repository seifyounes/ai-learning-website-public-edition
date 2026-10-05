import type { Metadata } from "next";
import Link from "next/link";
import { getNav } from "@/lib/nav";
import { getLessonCounts } from "@/lib/content";
import { ALL_PILLARS, SECTIONS } from "@/lib/curriculum";
import HomeContents from "@/components/HomeContents";
import HomeDoneCount from "@/components/HomeDoneCount";
import RouteCards from "@/components/RouteCards";
import { Arrow, Cell, TitleBlock } from "@/components/TitleBlock";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const ANATOMY = [
  ["The video", "A free video on the topic, picked against the alternatives for clarity and currency, with the docs to read after it right underneath."],
  ["Video recap", "Recall the video's key ideas from a cue, flip each card to check, and see how many you had."],
  ["Breakdown", "The key ideas in plain language, a worked example, the common failure modes and the details the video skips."],
  ["Apply it to your work", "Concrete steps and ready-to-paste prompts to use the idea on your own project, coursework or job."],
  ["Upgrade your AI setup", "Small, lasting changes to the AI tools you use every day, whichever ones they are."],
  ["Do this now", "A 15–45 minute hands-on task that turns watching into doing."],
  ["Self-check", "Scenario questions to prove it stuck, plus scored challenge quizzes in the math and career-track lessons."],
  ["Your notes", "Your own space for each lesson, saved in your browser."],
];

export default function Home() {
  const nav = getNav();
  const counts = getLessonCounts();

  return (
    <div className="px-4 pb-16 pt-5 min-[760px]:px-10 min-[760px]:pb-20 min-[760px]:pt-10">
      {/* Phones read the headline and Start Here first; wider screens open with the title block. */}
      <div className="flex flex-col">
        {/* Title block: the course cell plus the pad's counts. */}
        {/* On phones it shrinks to course, lessons and progress, so the headline is on the first screen. */}
        <TitleBlock className="order-2 mt-8 min-[760px]:order-1 min-[760px]:mt-0 grid-cols-2 min-[760px]:grid-cols-[2.6fr_1fr_1fr_1fr_1fr]">
          <Cell label="Course" as="header" className="col-span-2 min-[760px]:col-span-1">
            <span className="print-display block pb-1 pt-1 text-graphite min-[760px]:pt-3">AI Learning</span>
          </Cell>
          <Cell label="Sections" className="hidden min-[760px]:flex">
            <span className="qty text-[21px] text-graphite min-[760px]:text-quantity-large">{Object.keys(SECTIONS).length}</span>
          </Cell>
          <Cell label="Pillars & tracks" className="hidden min-[760px]:flex">
            <span className="qty text-[21px] text-graphite min-[760px]:text-quantity-large">{ALL_PILLARS.length}</span>
          </Cell>
          <Cell label="Lessons">
            <span className="qty text-[21px] text-graphite min-[760px]:text-quantity-large">{counts.total}</span>
          </Cell>
          <Cell label="Done">
            <HomeDoneCount total={counts.total} />
          </Cell>
        </TitleBlock>
  
        {/* Notes block: the method on the left, the review key on the right. */}
        <section className="order-1 grid min-[760px]:order-2 min-[760px]:mt-8 gap-6 min-[900px]:grid-cols-[2.3fr_1fr] min-[900px]:gap-10">
          <div>
            <h1 className="font-print text-[30px] font-bold leading-[1.05] text-graphite [font-variation-settings:'wdth'_80] min-[760px]:text-[38px]">
              Learn AI and AI tools, one studied lesson at a time.
            </h1>
            <p className="measure mt-4 text-body text-pencil min-[760px]:text-[19px]">
              A free, vendor-neutral course from near-beginner to applied AI engineer, for students,
              developers moving into AI, and professionals who don&rsquo;t code. Each lesson pairs a
              hand-picked free video with an original breakdown, a hands-on task and a self-check.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/start-here" className="btn-next">
                Start here <Arrow />
              </Link>
              <Link href="/get-hired" className="btn-print">
                Get hired as an AI engineer <Arrow />
              </Link>
              <Link href="/dashboard" className="btn-print">
                Your progress
              </Link>
            </div>
          </div>
          <div className="pencil-box self-start px-4 pb-4 pt-3">
            <span className="field-label">Free · no sign-up</span>
            <ul className="mt-2 space-y-1.5 text-body-small text-pencil">
              <li>Vendor-neutral: the best tool for each job, not one company&rsquo;s.</li>
              <li>Every lesson pairs a creator&rsquo;s video with original notes and practice.</li>
              <li>
                Your progress stays in this browser. No account, no tracking.{" "}
                <Link href="/about" className="text-print underline">
                  How it works
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Three ways in, by goal. */}
      <section className="pad-box mt-10" aria-labelledby="routes-heading">
        <div className="border-b border-print px-4 py-3 sm:px-5">
          <h2 id="routes-heading" className="print-title">
            Pick your route
          </h2>
          <p className="mt-1 text-body-small text-muted">
            Everyone starts with pillar 1. Then follow the route that matches your goal.
          </p>
        </div>
        <RouteCards />
      </section>

      {/* Contents: the pillars as ruled lines, with the red-pen resume note in the margin. */}
      <div className="mt-12">
        <HomeContents nav={nav} />
      </div>

      {/* How a lesson works: the anatomy as a numbered key. */}
      <section className="mt-14 min-[760px]:ms-[184px] min-[1000px]:ms-[216px]">
        <h2 className="group-heading">How every lesson works</h2>
        <ol className="grid gap-x-10 min-[760px]:grid-cols-2">
          {ANATOMY.map(([title, desc], i) => (
            <li key={title} className="rule-row flex gap-4 py-4">
              <span className="step-box">{i + 1}</span>
              <span>
                <span className="block font-semibold text-graphite">{title}</span>
                <span className="mt-1 block text-body-small text-muted">{desc}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
