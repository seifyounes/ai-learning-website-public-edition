/**
 * The three ways into the course, by goal. Start Here and the home page show them as routes;
 * /path?goal=<id> reorders the Applications tracks for the chosen goal.
 */
export interface Route {
  id: "understand" | "build" | "work";
  goal: string;
  who: string;
  /** Foundations pillars to do first, in order. */
  steps: { label: string; href: string }[];
  /** Applications track slugs, best first, for this goal. */
  trackOrder: string[];
  /** Foundations pillar slugs this goal needs; any other pillar a track builds on is optional. */
  foundations: string[];
}

export const ROUTES: Route[] = [
  {
    id: "understand",
    goal: "I want to understand AI and use it well",
    who: "Students and anyone new: how the models work, then the assistants you already have.",
    steps: [
      { label: "1 · Mental models (lessons 1–6)", href: "/foundations/mental-models" },
      { label: "3 · Chat assistants", href: "/foundations/chat-assistants" },
      { label: "4 · Second brain (optional)", href: "/foundations/obsidian" },
    ],
    trackOrder: ["ai-in-companies", "marketing-content", "building-products", "agency-freelance"],
    foundations: ["mental-models", "chat-assistants", "obsidian"],
  },
  {
    id: "build",
    goal: "I want to build software with AI",
    who: "Developers and CS students: coding agents, then real AI features, then shipping.",
    steps: [
      { label: "1 · Mental models", href: "/foundations/mental-models" },
      { label: "2 · AI coding agents", href: "/foundations/claude-code" },
      { label: "6 · Applied AI engineering", href: "/foundations/applied-ai-engineering" },
      { label: "7 · Shipping apps", href: "/foundations/shipping-apps" },
      { label: "Math & ML tracks (optional depth)", href: "/math" },
    ],
    trackOrder: ["building-products", "agency-freelance", "ai-in-companies", "marketing-content"],
    foundations: ["mental-models", "claude-code", "applied-ai-engineering", "shipping-apps", "chat-assistants", "workflows-agents"],
  },
  {
    id: "work",
    goal: "I want AI to do real work in my job (no code needed)",
    who: "Professionals, founders and freelancers: assistants, automations, then the track for your field.",
    steps: [
      { label: "1 · Mental models (lessons 1–6)", href: "/foundations/mental-models" },
      { label: "3 · Chat assistants", href: "/foundations/chat-assistants" },
      { label: "5 · Workflows & agents", href: "/foundations/workflows-agents" },
    ],
    trackOrder: ["ai-in-companies", "marketing-content", "agency-freelance", "building-products"],
    foundations: ["mental-models", "chat-assistants", "workflows-agents"],
  },
];
