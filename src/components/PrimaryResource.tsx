import InlineMarkdown from "./InlineMarkdown";
import type { VideoRef } from "@/lib/types";
import YouTubeEmbed from "./YouTubeEmbed";

const KIND_LABELS: Record<NonNullable<VideoRef["kind"]>, string> = {
  video: "Video",
  course: "Free course",
  docs: "Official docs",
  article: "Article",
  interactive: "Interactive",
};

/**
 * The why-blurb renders inline markdown — several lessons lean on **bold** to carry
 * load-bearing warnings (a Windows-only video half, the exact timestamp range to watch).
 */
/** 4325 seconds → "1:12:05". */
function clock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

function WhyBox({ why }: { why?: string }) {
  if (!why) return null;
  return (
    <p className="pencil-box measure mt-3 px-4 pb-3 pt-2.5 text-body-small text-pencil">
      <span className="field-label me-2">Why this one</span>
      <InlineMarkdown>{why}</InlineMarkdown>
    </p>
  );
}

/**
 * Block 2 of every lesson: the single best free explanation. YouTube primaries
 * embed; non-YouTube primaries (courses, docs, articles) render a resource
 * card with an open-in-new-tab CTA; unvetted lessons keep the placeholder.
 */
export default function PrimaryResource({ video }: { video?: VideoRef | null }) {
  if (video?.videoId) {
    return (
      <>
        <YouTubeEmbed videoId={video.videoId} title={video.title} start={video.start} />
        {(video.title || video.channel) && (
          <p className="mt-3 text-body-small text-pencil">
            {video.title}
            {video.channel ? ` — ${video.channel}` : ""}
            {video.year ? <span className="qty text-muted"> · {video.year}</span> : null}
          </p>
        )}
        {video.start !== undefined && video.watchMinutes ? (
          <p className="mt-1 text-body-small text-muted">
            The player starts at <span className="qty">{clock(video.start)}</span>: watch about{" "}
            <span className="qty">{video.watchMinutes} min</span> from there
            {video.minutes ? <> (the full video runs <span className="qty">{video.minutes} min</span>)</> : null}.
          </p>
        ) : null}
        {video.short ? (
          <p className="pencil-box mt-3 px-4 py-2.5 text-body-small text-pencil">
            <span className="field-label me-2">Short on time?</span>
            Watch{" "}
            <a href={video.short.url} target="_blank" rel="noreferrer" className="text-print underline">
              {video.short.label}
            </a>{" "}
            (<span className="qty">{video.short.minutes} min</span>) now, and come back for the full video
            when you have the hour. The lesson below works with either.
          </p>
        ) : null}
        <WhyBox why={video.why} />
        {video.notes?.length ? (
          <div className="mt-3 text-body-small text-pencil">
            <p className="field-label">Watch notes</p>
            <ul className="mt-1.5 list-disc space-y-1 ps-5 marker:text-print">
              {video.notes.map((n) => (
                <li key={n}>
                  <InlineMarkdown>{n}</InlineMarkdown>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </>
    );
  }

  if (video?.url) {
    const kindLabel = video.kind ? KIND_LABELS[video.kind] : "Resource";
    return (
      <>
        <div className="border-[1.5px] border-print p-5 sm:p-6">
          <span className="field-label">{kindLabel} · free</span>
          <p className="print-sheet-title mt-3">{video.title}</p>
          {video.channel && <p className="mt-1 text-body-small text-pencil">{video.channel}</p>}
          <a
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="btn-next mt-4"
          >
            Open the resource
            <span aria-hidden>↗</span>
          </a>
        </div>
        <WhyBox why={video.why} />
      </>
    );
  }

  return <YouTubeEmbed />;
}
