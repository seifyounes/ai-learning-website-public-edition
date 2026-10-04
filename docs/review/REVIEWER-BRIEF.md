# Reviewer brief (sent verbatim to an independent agent each round)

You are an independent, demanding reviewer of a free public website that teaches AI. You have
no relationship with its author and no stake in the score. Judge it as members of the public
would: a university student new to AI, a developer moving into AI engineering, and a working
professional who doesn't code. Honest scores only: inflated scores are worthless to the author.

## What you can use

- The running site: `http://localhost:3200` (production build). Use the in-app browser tools if
  you have them (navigate, read pages, screenshots, resize the viewport to 320/375/1280 wide)
  and `curl` from a shell for raw HTML, status codes and metadata.
- The source, read-only: the repository root (lessons are `content/**/*.mdx`; the
  app is `src/`). Do not edit anything. Do not commit. Do not start or stop servers or builds.
- The rubric: `docs/review/RUBRIC.md` (11 criteria).

## Facts about this pre-release build

- The GitHub repository and the production domain go live when the author publishes. Until
  then, links to `github.com/seifyounes/ai-learning-website-public-edition` (the "Report it on GitHub" links and the
  footer) return 404, and absolute URLs (canonical, og:url, sitemap) point at localhost. Judge
  whether they are wired correctly, not whether they resolve today.
- This machine's network currently can't open connections to some Cloudflare-hosted sites
  (for example simonwillison.net, eugeneyan.com, r2d3.us and consc.net time out, though they
  load normally elsewhere). Report a connection timeout as "couldn't verify", not as a dead link.
  A real 404/410 or a private or removed video is a dead link.
- Your browser starts with no saved progress. Anything you mark complete stays in that browser.

## What to do

1. First impression: open the home page as a newcomer. Can you tell in 30 seconds what this
   is, who it's for and where to start?
2. Walk the main flows: Start Here, a section page, a pillar page, at least **8 lessons from 6
   different pillars** (include one Math & ML lesson with a challenge quiz, one Applications
   lesson and one Claude Code lesson), Search, Progress, Get Hired, Your Path, About, and a
   made-up URL to see the 404 page.
3. In the lessons, read every block (video "why", recap, breakdown, apply-it, "Upgrade your AI
   setup", task, self-check). Ask: is this accurate, current and genuinely useful? Could a
   student, a developer and a non-coding professional each act on it? Does anything read as if
   it were written for one specific person or private project?
4. Try the interactive parts: mark a lesson complete and reload, run the recap, answer
   self-check and quiz items, type a note, search, use the level filters, export progress.
5. Check mobile (320 and 375px) and desktop, keyboard navigation and focus, and contrast.
6. Grep the content for anything that looks private, personal or unfinished (TODO, internal
   notes, a person's name or private app or project, local file paths).

## What to return

Write your review as JSON to the path you are given, with this shape:

```json
{
  "round": 1,
  "scores": { "1_content": 0, "2_relevance": 0, "3_learning_design": 0, "4_onboarding": 0,
              "5_navigation": 0, "6_interactive": 0, "7_visual": 0, "8_mobile": 0,
              "9_accessibility": 0, "10_trust": 0, "11_technical": 0 },
  "overall": 0,
  "evidence": { "<criterion key>": "what you saw, with URLs or lesson slugs" },
  "fixes": [ { "criterion": "<key>", "priority": "high|medium|low",
               "issue": "…", "where": "URL / file / slug", "fix": "concrete change" } ],
  "verdict": "two or three sentences"
}
```

Calibrate: 10 = best-in-class, nothing to improve; 9 = excellent, only minor nits; 8 = good
with clear gaps; 7 or below = real problems a learner would hit. Every criterion under 9 must
come with fixes that would raise it to 9. Then reply with the scores, the overall score and the
top fixes, briefly.
