"use client";

import { useState } from "react";

/**
 * The lesson video as a framed tool: a 1.5px print frame, square, the player keeping its own
 * colours inside. Nothing from YouTube's player loads until the learner presses play: the frame
 * shows the video's still (from YouTube's image server) and a play button, then swaps in the
 * privacy-enhanced embed. The pending state is a hatched honesty cell.
 */
export default function YouTubeEmbed({
  videoId,
  title,
  start,
}: {
  videoId?: string;
  title?: string;
  /** Start the player at the part of a long video this lesson needs (seconds). */
  start?: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [stillFailed, setStillFailed] = useState(false);

  if (!videoId) {
    return (
      <div className="hatch flex aspect-video w-full flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-print px-4 text-center">
        <span className="label-action text-print">Video coming soon</span>
        <span className="max-w-md text-body-small text-muted">
          This slot holds a free video on the topic once one has been checked for accuracy,
          recency and clarity.
        </span>
      </div>
    );
  }

  const label = title ?? "the lesson video";

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Play video: ${label}`}
        className="group relative block aspect-video w-full overflow-hidden border-[1.5px] border-print bg-print"
      >
        {/* The poster under the still: the video's title in print, so the slot reads as a video
            even before (or without) the image. */}
        <span className="absolute inset-0 flex items-start p-4 text-start sm:p-6">
          <span className="font-print text-[20px] font-bold leading-tight text-sheet [font-variation-settings:'wdth'_80] sm:text-[26px]">
            {label}
          </span>
        </span>
        {!stillFailed && (
          // eslint-disable-next-line @next/next/no-img-element -- a remote still, no optimisation needed
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            onError={() => setStillFailed(true)}
            className="relative h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
        )}
        <span className="absolute inset-0 grid place-items-center">
          <span className="flex items-center gap-2.5 border-[1.5px] border-sheet bg-print px-4 py-2.5 text-sheet">
            <svg aria-hidden viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M4 2.5v11l9-5.5z" />
            </svg>
            <span className="label-action">Play video</span>
          </span>
        </span>
        <span className="absolute inset-x-0 bottom-0 bg-[rgb(0_0_0/0.72)] px-3 py-1.5 text-start text-[13px] text-sheet">
          Loads the YouTube player (youtube-nocookie.com) when you press play
        </span>
      </button>
    );
  }

  const params = new URLSearchParams({ autoplay: "1", rel: "0" });
  if (start) params.set("start", String(start));
  return (
    <div className="aspect-video w-full overflow-hidden border-[1.5px] border-print bg-black">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`}
        title={label}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
