import Link from "next/link";
import type { Metadata } from "next";
import { getLessonCounts } from "@/lib/content";
import { ALL_PILLARS } from "@/lib/curriculum";
import { Arrow } from "@/components/TitleBlock";
import { REPO_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About this course",
  description:
    "What AI Learning is, who it's for, how lessons are chosen and written, and what happens to your data (nothing leaves your browser).",
};

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-6">
      <h2 className="group-heading">{title}</h2>
      <div className="measure mt-4 space-y-3 text-body text-graphite">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  const counts = getLessonCounts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="print-display text-graphite">About this course</h1>
      <p className="measure mt-4 text-body text-pencil">
        AI Learning is a free course that takes you from near-beginner to applied AI engineer:{" "}
        <span className="qty">{counts.total}</span> lessons across{" "}
        <span className="qty">{ALL_PILLARS.length}</span> pillars, studied one at a time.
      </p>

      <Section title="Who it's for">
        <p>
          <strong>Students</strong> learning AI for a degree, a project or a first job.{" "}
          <strong>Developers</strong> moving into AI engineering. <strong>Professionals</strong>{" "}
          (product, marketing, operations, founders, freelancers) who want AI to do real work,
          including people who don&rsquo;t code yet.
        </p>
        <p>
          New to all of it? Begin with{" "}
          <Link href="/start-here" className="text-print underline">
            Start Here
          </Link>
          . Already comfortable with prompting? Jump to the pillar you need, or{" "}
          <Link href="/search" className="text-print underline">
            search
          </Link>{" "}
          for a topic.
        </p>
      </Section>

      <Section title="How a lesson works">
        <p>
          Every lesson has the same shape, so you always know where you are: a hand-picked free
          video on the topic, a recap you recall from memory, an original breakdown with a worked
          example and common failure modes, a block that applies the idea to your own project or
          work, one that upgrades your everyday AI setup, a hands-on task, and a self-check. The
          lesson header shows the video, reading and task time separately, and the earlier lessons
          to do first. Your notes live beside each lesson.
        </p>
        <p>
          <strong>Foundations</strong> (7 pillars) teach the tools and the engineering.{" "}
          <strong>Applications</strong> (4 tracks) put them to work: building products,
          marketing, AI inside organizations, and freelance services.{" "}
          <strong>Math &amp; ML</strong> (7 tracks) is the optional depth: one full lecture series
          per subject, from linear algebra to transformers and evaluation, with every lecture a
          lesson of its own.{" "}
          <Link href="/path" className="text-print underline">
            Not sure where to go after Foundations?
          </Link>
        </p>
      </Section>

      <Section title="How the videos are chosen">
        <p>
          Each lesson embeds one primary video, picked after comparing candidates on accuracy,
          clarity, recency and the creator&rsquo;s track record. A video only gets the slot if
          the <em>method</em> it teaches is still the best way to do the thing today; an older
          video is fine when it still is. Every topic has one home lesson, so you don&rsquo;t
          watch the same idea twice.
        </p>
        <p>
          The course is <strong>vendor-neutral</strong>: lessons name the tool that is genuinely
          best for each job (OpenAI, Anthropic, Google, open-source and local models, Cursor,
          Copilot, n8n, Zapier, Make and more). One pillar goes deep on Claude Code because
          agentic coding tools are a skill of their own; the ideas transfer to the others.
        </p>
      </Section>

      <Section title="How the lessons are written">
        <p>
          The breakdowns, recaps, tasks and quizzes are original writing, not transcripts. They
          were drafted with AI assistance and checked against the sources each lesson links, and
          every lesson shows when it was last reviewed. AI tools change quickly: if a detail has
          moved on, trust the official docs linked in the lesson.
        </p>
      </Section>

      <Section title="Your data">
        <p>
          There are no accounts, cookies or analytics. Your progress, notes, quiz scores and
          checklist live only in this browser&rsquo;s local storage, so they stay on this
          device and disappear if you clear your browser data. No YouTube player loads until you press
          play on a video; then it plays through YouTube&rsquo;s privacy-enhanced embed
          (youtube-nocookie.com). Before that, only the video&rsquo;s still image is fetched from
          YouTube&rsquo;s image server.
        </p>
      </Section>

      <Section title="What a review covers" id="review">
        <p>
          The <strong>Reviewed</strong> date on a lesson is the last time its whole page was
          checked: the facts and claims in the breakdown against the sources it links, every link
          and the video (still public, still the right pick for how the topic is done today), and
          the task and quiz answers. Each video also shows the year it was published, so you can
          judge its age yourself. Many lessons share the same date because the whole course was
          re-checked together before launch.
        </p>
      </Section>

      <Section title="Found a mistake?">
        <p>
          AI tools change every month, so some detail will eventually go stale. Every lesson has
          a <strong>Report it on GitHub</strong> link at the bottom that opens a prefilled issue;
          you can also{" "}
          <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer" className="text-print underline">
            browse open reports
          </a>
          . Reports are checked against the sources and the lesson&rsquo;s review date is updated
          when it changes. Every video and external link is also re-checked automatically every week
          and before each release, by a script in the source repository.
        </p>
      </Section>

      <Section title="Who made it">
        <p>
          AI Learning was designed and built by Seif Younes, with AI coding agents. He is a
          developer who builds web and mobile apps with AI tools. He made it to learn the field properly and to share the
          path with anyone starting out. The source code is{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-print underline">
            on GitHub
          </a>
          .
        </p>
      </Section>

      <Section title="Credits">
        <p>
          Videos belong to their creators and are embedded from YouTube; each lesson names the
          channel and links follow-up reading from the original publishers. Type is set in
          Archivo and Atkinson Hyperlegible (SIL Open Font License).
        </p>
        <p>Built with Next.js, TypeScript and Tailwind CSS.</p>
        <p>
          The lesson text is licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by-nc/4.0/"
            target="_blank"
            rel="noreferrer"
            className="text-print underline"
          >
            CC BY-NC 4.0
          </a>
          : share and adapt it for non-commercial use with credit. The site&rsquo;s code is
          MIT-licensed.
        </p>
      </Section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/start-here" className="btn-next">
          Start the course <Arrow />
        </Link>
        <Link href="/search" className="btn-print">
          Search lessons
        </Link>
      </div>
    </div>
  );
}
