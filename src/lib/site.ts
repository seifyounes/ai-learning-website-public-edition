/**
 * Where the site lives. Absolute URLs (share cards, canonical links, sitemap, robots) need
 * the real domain:
 *   1. NEXT_PUBLIC_SITE_URL, set it once you have a custom domain;
 *   2. VERCEL_PROJECT_PRODUCTION_URL, the project's production domain, which Vercel sets on
 *      every deployment (never the per-deployment hash URL);
 *   3. localhost for local builds.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3200")
).replace(/\/$/, "");

/**
 * The public source repository, where learners report errors and outdated lessons as issues.
 * Override with NEXT_PUBLIC_REPO_URL if the repository lives somewhere else.
 */
export const REPO_URL = (process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/seifyounes/ai-learning-website-public-edition").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "AI Learning";

/** A "report a problem" issue for one page: the lesson-problem form with the page filled in. */
export function reportIssueUrl(title: string, path: string): string {
  const params = new URLSearchParams({
    template: "lesson-problem.yml",
    title: `Lesson issue: ${title}`,
    page: `${SITE_URL}${path}`,
  });
  return `${REPO_URL}/issues/new?${params.toString()}`;
}
