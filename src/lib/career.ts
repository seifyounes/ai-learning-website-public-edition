/**
 * The Get-Hired roadmap data: the fast-track lesson subset + the five phases
 * from "studying" to "signed offer". Pure data — the /get-hired page resolves
 * lesson keys against the content on disk and warns (dev-only) on typos.
 *
 * Fast-track selection criterion: "would a 2026 Applied-AI-Engineer hiring
 * loop actually test this?" Sources: 2026 job-posting/skill research —
 * eval design, cost optimization, MCP, agent failure modes, RAG + vector DBs,
 * observability, fine-tuning judgment, prompt-injection defense, system design.
 */

export interface ChecklistItem {
  id: string;
  label: string;
  /** The acceptance criteria — what "done" concretely means. */
  detail?: string;
}

export interface Phase {
  id: string;
  title: string;
  goal: string;
  /** Lesson keys (section/pillar/slug) tracked via useProgress. */
  lessonKeys?: string[];
  /** Non-lesson work tracked via the career checklist store. */
  checklist?: ChecklistItem[];
}

const MM = "foundations/mental-models";
const CC = "foundations/claude-code";
const WA = "foundations/workflows-agents";
const SA = "foundations/shipping-apps";
const AI = "foundations/applied-ai-engineering";
const BP = "applications/building-products";

export const CORE_TRACK_KEYS: string[] = [
  // AI mental models (8)
  `${MM}/what-is-an-llm`,
  `${MM}/tokens-and-context`,
  `${MM}/prompting-in-2026`,
  `${MM}/context-engineering`,
  `${MM}/verification-and-grounding`,
  `${MM}/harness-engineering`,
  `${MM}/loop-engineering`,
  `${MM}/models-and-effort`,
  // AI coding tools — build with AI daily (4)
  `${CC}/core-loop`,
  `${CC}/prompting-claude-code`,
  `${CC}/claude-md-and-memory`,
  `${CC}/mcp-servers`,
  // Agents & automation (4)
  `${WA}/intro-to-agents`,
  `${WA}/webhooks-and-apis`,
  `${WA}/build-a-practical-agent`,
  `${WA}/reliability`,
  // Shipping (3)
  `${SA}/backend-database-with-ai`,
  `${SA}/testing-qa-with-ai`,
  `${SA}/deploying-and-shipping`,
  // Applied AI engineering — the core 11
  `${AI}/calling-an-llm-api`,
  `${AI}/prompt-as-code`,
  `${AI}/structured-outputs-tools`,
  `${AI}/rag-fundamentals`,
  `${AI}/embeddings-vector-databases`,
  `${AI}/build-agent-in-code`,
  `${AI}/mcp-deep`,
  `${AI}/evals-and-testing`,
  `${AI}/cost-latency-caching`,
  `${AI}/choosing-models-providers`,
  `${AI}/capstone-ship-ai-feature`,
  // Product sense (1)
  `${BP}/add-ai-features`,
];

export const EXTRAS_TRACK_KEYS: string[] = [
  `${AI}/fine-tuning-fundamentals`,
  `${AI}/llm-system-design`,
  `${AI}/observability-tracing`,
  `${AI}/llm-security-prompt-injection`,
  `${AI}/local-open-models`,
  `${AI}/orchestration-frameworks`,
];

/** Every lesson a 2026 hiring loop would test — the fast path to job-ready. */
export const FAST_TRACK_KEYS: string[] = [...CORE_TRACK_KEYS, ...EXTRAS_TRACK_KEYS];

export const PHASES: Phase[] = [
  {
    id: "core-skills",
    title: "Phase 1 — Core skills",
    goal: "Speak LLM fluently and ship with AI daily. These fast-track lessons cover the basics an AI engineering interviewer is likely to take for granted.",
    lessonKeys: CORE_TRACK_KEYS,
  },
  {
    id: "job-ready-extras",
    title: "Phase 2 — Job-ready extras",
    goal: "Six topics that come up often in public AI-engineering interview guides and job posts: fine-tuning judgment, system design, observability, security, local models and frameworks.",
    lessonKeys: EXTRAS_TRACK_KEYS,
  },
  {
    id: "portfolio",
    title: "Phase 3 — Portfolio proof",
    goal: "3 runnable projects with eval numbers and live demos. Running code someone can try says more than a line on a resume, and an eval harness shows the judgment a flashy UI can't.",
    checklist: [
      {
        id: "rag-project",
        label: "Project 1 — RAG doc-assistant with an eval harness",
        detail:
          "A real corpus (e.g. docs you actually use), citations in every answer, a golden set of 25+ Q/A pairs, retrieval hit-rate + answer-grade numbers published in the README, live demo URL.",
      },
      {
        id: "agent-project",
        label: "Project 2 — Agent with MCP tools + observability",
        detail:
          "2+ real tools via MCP, Langfuse (or Phoenix) traces, cost-per-run tracked, documented failure modes and the fallback path, live demo or 2-min video.",
      },
      {
        id: "build-write-up",
        label: "Project 3 — An engineering write-up of something you built",
        detail:
          "Pick a real app or feature you built with AI tools and publish a write-up: the architecture, the hardest bug and how you found it, how you tested it, and what you would change. Claim only what you can show (a repo, a demo, numbers you measured).",
      },
      {
        id: "finetune-benchmark",
        label: "(Optional) Fine-tune vs prompt benchmark",
        detail:
          "One narrow task, a small tuned model vs prompting a frontier model, a published metrics table with cost per 1k requests.",
      },
      {
        id: "runnable-5min",
        label: "Every repo runs in under 5 minutes from its README",
        detail: "Fresh-clone test: setup steps, sample .env.example, seed data. No 'works on my machine'.",
      },
      {
        id: "github-polish",
        label: "GitHub profile README + pinned repos",
        detail: "Pin the 3 projects, add a profile README with one line + links per project.",
      },
    ],
  },
  {
    id: "interview-prep",
    title: "Phase 4 — Interview prep",
    goal: "Prepare for the themes that recur in published AI-engineering interview write-ups: system design around a model you don't control, retrieval and eval judgment, hands-on debugging, and cost/latency sense. Loops vary by company, so check each one's own guide.",
    checklist: [
      {
        id: "sd-rep-1",
        label: "System-design rep 1 — support RAG bot, out loud, 30 min",
        detail: "Draw the reference architecture, size it at 10k requests/day, name the fallback chain.",
      },
      {
        id: "sd-rep-2",
        label: "System-design rep 2 — agent with tools on a flaky provider",
        detail: "Focus on failure modes: timeouts, injected tool output, cost blowups, human-in-the-loop.",
      },
      {
        id: "sd-rep-3",
        label: "System-design rep 3 — an AI feature for an app you know, at scale",
        detail: "Reuse the one-pager from the system-design lesson (an AI feature at 10k calls/day for an app you know well). Rehearse presenting it in 10 minutes.",
      },
      {
        id: "tradeoff-drill",
        label: "RAG vs fine-tuning tradeoff drill",
        detail: "Answer 'would you fine-tune here?' for 5 scenarios in under 2 minutes each, using the decision ladder.",
      },
      {
        id: "trace-drill",
        label: "Trace-debugging drill",
        detail: "Take one bad output from your RAG project and walk the trace to the failing span, narrating aloud.",
      },
      {
        id: "cost-drill",
        label: "Cost estimation drill",
        detail: "Given requests/day + tokens/request + model price, produce a monthly bill in under 3 minutes, twice.",
      },
      {
        id: "star-stories",
        label: "5 STAR stories written down",
        detail: "Shipped a project end to end; caught a regression with evals; cut cost with caching; handled a bad-output incident; learned a tool fast.",
      },
      {
        id: "mock-interviews",
        label: "2 mock interviews done",
        detail: "One technical (a friend or AI interviewer), one behavioral. Record and review yourself once.",
      },
    ],
  },
  {
    id: "apply",
    title: "Phase 5 — Apply pipeline",
    goal: "Treat applying like a funnel you can measure: aim for about 10 tailored applications a week, track replies, and adjust what you send.",
    checklist: [
      {
        id: "resume",
        label: "Resume rewritten around 2026 keywords",
        detail:
          "RAG, evals, observability, vector databases, MCP, agents, LangGraph, prompt engineering, cost optimization — each backed by a project bullet with a number in it.",
      },
      {
        id: "linkedin",
        label: "LinkedIn: headline + featured projects",
        detail: "Headline says 'Applied AI Engineer', featured section links the 3 portfolio projects.",
      },
      {
        id: "target-list",
        label: "30-company target list built",
        detail: "Companies actually shipping LLM features; note one specific thing you'd improve for each.",
      },
      {
        id: "referrals",
        label: "Referral outreach template + 10 sent",
        detail: "Short, specific, links one relevant project. A warm introduction usually gets read; a cold portal application often doesn't.",
      },
      {
        id: "cadence",
        label: "10 applications/week cadence for 3 weeks",
        detail: "Tailor the top 3 each week; track everything in a simple sheet (company, role, status, follow-up date).",
      },
      {
        id: "iterate",
        label: "Weekly funnel review",
        detail: "No replies → fix resume/targeting. Screens but no onsites → drill interviews. Adjust, don't grind blindly.",
      },
    ],
  },
];

/** Readiness score weights (sum = 1). Skills dominate, proof close behind. */
export const READINESS_WEIGHTS = {
  skills: 0.5,
  portfolio: 0.3,
  interview: 0.15,
  apply: 0.05,
} as const;
