import type { Section } from "./types";

export interface PillarMeta {
  slug: string;
  /** Foundations are numbered 1–8; Applications tracks are lettered A–D so the two never clash. */
  number: number | string;
  section: Section;
  title: string;
  blurb: string;
  /** What a learner must already be able to do, shown on the pillar page. Omit when nothing. */
  needs?: string;
  /** Applications only: the Foundations pillar slugs this track builds on (needed and optional). */
  buildsOn?: string[];
  /** Applications only: the subset of buildsOn that only the track's code paths use. */
  optional?: string[];
  /** Applications only: one-line "best when your goal is …". */
  goalFit?: string;
  /** Applications only: recommended order to work the tracks (1 = do this first). */
  recommendedOrder?: number;
}

export const FOUNDATIONS: PillarMeta[] = [
  {
    slug: "mental-models",
    number: 1,
    section: "foundations",
    title: "AI mental models",
    blurb: "How LLMs work and how to get reliable results from them: prompts, context, checks and loops. Everyone starts here.",
  },
  {
    slug: "claude-code",
    number: 2,
    section: "foundations",
    title: "AI coding agents (Claude Code in depth)",
    needs:
      "A terminal you can type commands into, a code editor, and a small project in git. No prior AI experience. If you've never used a terminal, the first lesson's setup steps get you there in about 30 minutes.",
    blurb: "How coding agents work, taught hands-on in Claude Code, with the equivalents in Cursor, Codex and Copilot named as you go.",
  },
  {
    slug: "chat-assistants",
    number: 3,
    section: "foundations",
    title: "Chat assistants: use them like a pro",
    blurb: "ChatGPT, Claude and Gemini for study, writing, research and analysis: which to use when, and how to set them up safely.",
  },
  {
    slug: "obsidian",
    number: 4,
    section: "foundations",
    title: "Second brain with Obsidian",
    blurb: "Notes you actually reuse: an Obsidian vault that you and an AI assistant keep organised together.",
  },
  {
    slug: "workflows-agents",
    number: 5,
    section: "foundations",
    title: "Automated workflows & AI agents",
    blurb: "Wire tools into pipelines that run without you.",
  },
  {
    slug: "applied-ai-engineering",
    number: 6,
    section: "foundations",
    title: "Applied AI engineering",
    needs:
      "Basic Python or JavaScript (variables, functions, a loop), running a script from a terminal, and keeping an API key in a .env file. Set a spending limit on your API account before the first lesson. New to code? Do a free beginner course first, such as freeCodeCamp's JavaScript or Python course, then come back.",
    blurb: "APIs, RAG, embeddings, agents, MCP & evals — vendor-neutral.",
  },
  {
    slug: "shipping-apps",
    number: 7,
    section: "foundations",
    title: "Shipping real apps with AI",
    needs:
      "Comfort running commands in a terminal and a free GitHub account. You don't need to write code from scratch (an AI coding agent or app builder does most of it), but you do need to read errors and follow setup steps.",
    blurb: "From idea to a deployed web or mobile app.",
  },
];

/**
 * The Math & ML section: one track per subject, every core lecture of the subject's series a
 * lesson of its own. Optional depth for anyone who wants the maths under the models.
 */
export const MATH: PillarMeta[] = [
  {
    slug: "linear-algebra",
    number: "M1",
    section: "math",
    title: "Linear algebra",
    blurb: "Vectors, matrices, dot products and eigenvectors: the shapes every model computes with.",
    needs: "School algebra. No calculus needed.",
  },
  {
    slug: "probability-statistics",
    number: "M2",
    section: "math",
    title: "Probability & statistics",
    blurb: "Distributions, sampling, uncertainty and Bayes: how to read noisy AI results.",
    needs: "School algebra.",
  },
  {
    slug: "calculus",
    number: "M3",
    section: "math",
    title: "Calculus for optimization",
    blurb: "Derivatives, gradients and optimizers: how a model learns from its mistakes.",
    needs: "School algebra; the linear algebra track helps for gradients.",
  },
  {
    slug: "machine-learning",
    number: "M4",
    section: "math",
    title: "Machine learning fundamentals",
    blurb: "Fitting, overfitting, validation and the classic models every AI engineer should know.",
    needs: "The probability & statistics track; calculus helps for gradient descent.",
  },
  {
    slug: "neural-networks",
    number: "M5",
    section: "math",
    title: "Neural networks",
    blurb: "Layers, activations and backpropagation, then building and training one from scratch.",
    needs: "Linear algebra and calculus tracks. Basic Python for the build-along lectures.",
  },
  {
    slug: "transformers",
    number: "M6",
    section: "math",
    title: "Transformers & attention",
    blurb: "Attention, embeddings, the KV cache and a GPT built in code: the architecture behind LLMs.",
    needs: "The neural networks track. Python for the GPT build.",
  },
  {
    slug: "evaluation",
    number: "M7",
    section: "math",
    title: "Evaluation",
    blurb: "Metrics for classifiers, then benchmarks, judges and eval sets for LLMs.",
    needs: "The probability & statistics track.",
  },
];

export const APPLICATIONS: PillarMeta[] = [
  {
    slug: "marketing-content",
    number: "A",
    section: "applications",
    title: "Marketing & content",
    blurb: "Copy, SEO, social, and video/editing with AI.",
    buildsOn: ["mental-models", "chat-assistants", "workflows-agents"],
    goalFit: "Growing a product or audience.",
    recommendedOrder: 2,
  },
  {
    slug: "building-products",
    number: "B",
    section: "applications",
    title: "Building products",
    blurb: "Apps, SaaS and MVPs — idea to launch.",
    buildsOn: ["mental-models", "chat-assistants", "shipping-apps", "claude-code", "applied-ai-engineering"],
    optional: ["shipping-apps", "claude-code", "applied-ai-engineering"],
    goalFit: "Building your own app, or adding AI features to one you already have.",
    recommendedOrder: 1,
  },
  {
    slug: "ai-in-companies",
    number: "C",
    section: "applications",
    title: "AI inside companies",
    blurb: "Automating departments and adopting AI at scale.",
    buildsOn: ["mental-models", "chat-assistants", "workflows-agents", "applied-ai-engineering"],
    optional: ["applied-ai-engineering"],
    goalFit: "Bringing AI into a team or organization — as an employee, a manager or a consultant.",
    recommendedOrder: 4,
  },
  {
    slug: "agency-freelance",
    number: "D",
    section: "applications",
    title: "Agency / freelance services",
    blurb: "Packaging and selling AI services to clients.",
    buildsOn: [
      "mental-models",
      "chat-assistants",
      "workflows-agents",
      "claude-code",
      "shipping-apps",
      "applied-ai-engineering",
    ],
    optional: ["claude-code", "shipping-apps", "applied-ai-engineering"],
    goalFit: "Turning the skill into paid client work.",
    recommendedOrder: 3,
  },
];

export interface SectionMeta {
  slug: Section;
  title: string;
  blurb: string;
  pillars: PillarMeta[];
}

export const SECTIONS: Record<Section, SectionMeta> = {
  foundations: {
    slug: "foundations",
    title: "Foundations",
    blurb: "Master the tools & skills.",
    pillars: FOUNDATIONS,
  },
  applications: {
    slug: "applications",
    title: "Applications",
    blurb: "AI by use-case.",
    pillars: APPLICATIONS,
  },
  math: {
    slug: "math",
    title: "Math & ML",
    blurb: "The maths under the models, one full lecture track per subject.",
    pillars: MATH,
  },
};

export const ALL_PILLARS: PillarMeta[] = [...FOUNDATIONS, ...APPLICATIONS, ...MATH];

export function isSection(value: string): value is Section {
  return value === "foundations" || value === "applications" || value === "math";
}

export function getPillar(section: Section, slug: string): PillarMeta | undefined {
  return SECTIONS[section].pillars.find((p) => p.slug === slug);
}

/** Learning order used by the "Start Here" path: foundations, applications, then the math depth. */
export const LEARNING_ORDER: PillarMeta[] = ALL_PILLARS;

/** Applications tracks sorted by recommended order (the one to do first comes first). */
export function getTracksInRecommendedOrder(): PillarMeta[] {
  return [...APPLICATIONS].sort(
    (a, b) => (a.recommendedOrder ?? 99) - (b.recommendedOrder ?? 99),
  );
}

/** Applications tracks whose `buildsOn` includes the given Foundations pillar. */
export function appsUsingPillar(pillarSlug: string): PillarMeta[] {
  return APPLICATIONS.filter((t) => t.buildsOn?.includes(pillarSlug)).sort(
    (a, b) => (a.recommendedOrder ?? 99) - (b.recommendedOrder ?? 99),
  );
}
