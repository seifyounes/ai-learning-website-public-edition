import type { ReadAfterItem } from "@/lib/types";

const KIND_LABELS: Record<NonNullable<ReadAfterItem["kind"]>, string> = {
  docs: "Official docs",
  course: "Free course",
  article: "Article",
  interactive: "Interactive",
  repo: "Code repo",
};

/**
 * The "Read after the video" strip — follow-up reading rendered directly under
 * the primary video embed. The video teaches the mental model first; these are
 * the deeper references to work from afterwards.
 */
export default function ReadAfter({ items }: { items?: ReadAfterItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="pencil-box mt-3 px-4 pb-2 pt-2.5">
      <p className="field-label">Read after the video</p>
      <ul className="mt-1.5">
        {items.map((item) => (
          <li key={item.url} className="rule-row flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2 last:border-b-0">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-body-small text-print underline decoration-1 hover:decoration-2"
            >
              {item.label}
              <span aria-hidden> ↗</span>
            </a>
            {item.kind && (
              <span className="text-[14px] text-muted">{KIND_LABELS[item.kind]}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
