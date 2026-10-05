# CLAUDE.md — AI Learning (public edition)

Inherits the global standards in `../CLAUDE.md` when present. Private context (origin, banned
names, owner rules) lives in the gitignored `CLAUDE.local.md`.

## What this is

A free, vendor-neutral course site that takes any learner from near-beginner to applied AI
engineer, one studied lesson at a time: the best free video on the topic, an original
breakdown, a recap, an "apply it" block, an "upgrade your AI setup" block, a hands-on task and
a self-check. Static Next.js site for Vercel.

## The rules that override everything

1. **Written for anyone.** No author-specific content. Apply-it, toolkit and task blocks work for
   any learner's own project, coursework or job. Voice and patterns: `docs/public-voice.md`.
   Run `node scripts/check-public.js` before every commit that touches `content/`.
2. **Vendor-neutral.** Name the tool that is genuinely best for each job. Claude Code is one
   pillar, not the default answer.
3. **IP.** Re-host nothing. Videos are YouTube embeds of their creators' work; lesson text is
   original (no transcript copying, no quote over ~20 words, quotes attributed). Every lesson
   links its sources.
4. **No backend, no tracking.** Progress, notes and quiz scores live in the visitor's browser
   (`localStorage`, keys `ai-learn:*`). No analytics, cookies or accounts.

## Stack

Next.js 15 App Router + TypeScript + Tailwind v3, lessons as markdown with YAML frontmatter
(gray-matter + react-markdown), fully static. Design system: **the Computation Pad**, Indigo ink
pad, light only. Tokens are CSS variables in `src/app/globals.css`; `tailwind.config.ts`
replaces Tailwind's palette and radii with them. Shared pieces live in
`src/components/TitleBlock.tsx`. Red pen is a stroke or text only, with no rounded corners or
chips, only the sheet casts a shadow, and nothing renders under 12px.

## Content model

`content/<section>/<pillar>/<slug>.mdx`. Frontmatter: `title, section, pillar, module, order,
level, estMinutes, taskMinutes, prerequisites[], reviewedOn, video{videoId,minutes,title,channel,why},
readAfter[], applyIt, toolkit, recap[], task, selfCheck[], mcq[], backupResources[], tags[]`,
plus `shortPath` (required over 90 min). The **Math & ML** section (`content/math/<track>/`) has one
track per subject and one lesson per core lecture; there `toolkit` is optional and `mcq` (3+) and
`recap` (4+) are required. A video is the main video of one lesson only; slugs are unique course-wide.
Adding a lesson needs no code. Cross-lesson pointers are written `(→ lesson-slug)` and render as
links; any other bare slug fails `npm run check`. `video.minutes` is written by
`node scripts/check-links.js --durations --write <file>`. Recap titles are cues (the text is
hidden until the learner flips the card). MCQ options must be similar in length, with the
reasoning in `explain`.

## Quality bar

An independent reviewer agent (no project context) rates the site as a public learner would,
using `docs/review/RUBRIC.md` and the brief in `docs/review/REVIEWER-BRIEF.md`. Ship bar: **every
criterion ≥ 9/10**. Rounds are logged in `docs/review/`.

## Definition of done

`npm run typecheck`, `npm run lint`, `npm run check`, `npm run check:links`, `npm run build` all
clean; checked at 320px,
375px and desktop; mark-complete persists across reload.
