import { getAllLessons, linkLessonPointers } from "@/lib/content";

// Built once at deploy time as a static file; the search page fetches it on first use so the
// full lesson text doesn't weigh down the page HTML.
export const dynamic = "force-static";

/** Characters of running text kept per lesson for result snippets. */
const SNIPPET_TEXT = 2400;

/** Markdown to searchable plain text: no code fences, link targets or markup; pointers as titles. */
function plain(markdown: string | undefined): string {
  return (linkLessonPointers(markdown, { plain: true }) ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    // List markers, numbered steps and table rules would show up as stray symbols in snippets.
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/^\s*\|?[-:| ]+\|?\s*$/gm, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#|]/g, " ")
    .replace(/→/g, " ")
    .replace(/\s+/g, " ")
    // Stripped markup leaves "word ." and "( x )"; close the gaps.
    .replace(/\s+([.,:;!?)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .trim();
}

/**
 * Per lesson: section headings, the opening text (for snippets and phrase matches) and every
 * other distinct word once (so a match anywhere in the lesson still counts). That keeps the
 * index small enough to fetch on a phone.
 */
export function GET() {
  const index = getAllLessons().map((l) => {
    const full = [plain(l.body), plain(l.applyIt), plain(l.task), ...(l.recap ?? []).map((r) => plain(`${r.title}. ${r.text}`))]
      .join(" ")
      .replace(/[*_`]/g, "");
    const text = full.slice(0, SNIPPET_TEXT).replace(/\s\S*$/, "");
    const seen = new Set(text.toLowerCase().split(/[^\p{L}\p{N}+#.]+/u));
    const words = [...new Set(full.slice(text.length).toLowerCase().split(/[^\p{L}\p{N}+#.]+/u))]
      .filter((w) => w.length > 2 && !seen.has(w))
      .join(" ");
    return {
      key: l.key,
      headings: (l.body.match(/^#{1,4} .+$/gm) ?? []).map((h) => h.replace(/^#+\s*/, "")).join(" · "),
      text,
      words,
    };
  });
  return Response.json(index);
}
