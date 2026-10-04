# Public voice: how every lesson speaks to any learner

The course began as one person's private study site, so its "apply it", task and setup blocks
pointed at the author's own app, projects, tools and job search. The public edition keeps **all
of the teaching** and rewrites that personal layer so it works for **anyone who opens the
site**.

## Who the reader is

Assume any of these, and write so all of them can act:

- **Students** (CS or not) learning AI for their degree, projects or first job.
- **Developers** upskilling into AI engineering, with a repo or side project of their own.
- **Working professionals** (PMs, analysts, marketers, founders, freelancers) who want AI to do
  real work, some of whom do not code yet.

Second person, direct, encouraging, no hype. Never "the owner", never a named private person.

## Field by field

### `applyIt` → shown as "Apply it to your work"

Turn the lesson into one concrete action on **the learner's own project or work**: their repo,
side project, coursework, a document or workflow from their job.

- Open with one sentence that frames the move ("Run the four moves on a real session of your
  own…").
- Give the concrete steps or a ```prompt card that works on **any** project. Say "your project",
  "your repo", "a feature you're building", "a report you write every week". No `<placeholders>`
  in angle brackets inside prose; inside prompt cards, short bracketed slots like `[your
  project]` are fine.
- When the move differs by situation, add short tailored lines, e.g. **If you code:** … /
  **If you don't code yet:** … / **At work:** …. Two or three, never more.
- If a running example helps, use a neutral and clearly hypothetical one ("a small to-do app", "a
  support chatbot for an online shop", "a weekly sales report"). Never a real company or person
  from the original.
- End with a `Success:` line, as the originals do.
- Keep roughly the original length (±30%).

### `toolkit` (renamed from `claudeOs`) → shown as "Upgrade your AI setup"

3–5 bullets that turn the lesson into a **durable improvement to the learner's own AI working
setup**: assistant instruction files (CLAUDE.md, AGENTS.md, `.cursor/rules`, Copilot
instructions, ChatGPT/Gemini custom instructions or Projects), saved prompts and skills, a notes
or memory file, small automations, review habits. Each bullet is a **bold lead** + 1–2
actionable sentences. Be vendor-neutral: when a bullet names one tool's feature, name the
equivalent in the others where one exists. Point to the owning lesson with `(→ lesson-slug)`
where the original did.

### `task` → shown as "Do this now"

A hands-on task of 15–45 minutes that anyone can do with free tools. If the lesson needs code,
give a no-code path or a tiny starter suggestion too. End with `Success:`.

### `selfCheck`, `mcq`, `recap`, body, `video.why`

Keep the teaching exactly. Only replace author-specific references (a private app, a personal
workspace, private projects, a job plan) with neutral examples that make the same point. A
self-check that asked about "my app's stack" now asks about "an app you know well" or a concrete
neutral scenario.

### Fields to remove

- `mentor` (private review stamps) and `applyTo` (private project keys): delete them.
- Do not change `reviewedOn`, `video.videoId`, links, `order`, `level`, `estMinutes`, `tags`.

## Hard bans (the validator fails on these)

`node scripts/check-public.js` fails on personal file paths, "the owner" framing, internal
curation notes and unfinished markers. When the gitignored `scripts/private-terms.local.json` is
present (it is on the author's machine), it also fails on the author's private names: private
apps, projects, clients, skills, reviewer personas and locations. Contextual words (RevenueCat,
Codemagic, "testers", "habit tracker") only warn: they are fine when used generically.

## Facts and IP

- Never invent numbers, statistics, quotes, prices or product features. Keep the original's
  sourced facts; if a fact only existed to describe the private app, drop it.
- Lesson text is original. No verbatim quote longer than ~20 words from any source; any quote
  must be attributed. If you find a longer one, paraphrase it.
- Keep every markdown convention: `> 💡 **Try it:**` callouts, ```prompt cards, `(→ slug)`
  pointers, `**bold**` leads.

## Worked example

`content/foundations/mental-models/context-engineering.mdx` is the reference: its `applyIt`,
`toolkit`, `task` and last self-check show the patterns above.
