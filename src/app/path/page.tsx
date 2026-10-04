import type { Metadata } from "next";
import PathView from "@/components/PathView";
import { getTrackPaths } from "@/lib/nav";

export const metadata: Metadata = {
  alternates: { canonical: "/path" },
  title: "Your Path",
  description: "The four Applications tracks ordered for your goal, with how ready you are for each.",
};

export default function PathPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="print-display text-graphite">Your path</h1>
      <p className="measure mt-4 text-body text-pencil">
        Pick your goal and the four Applications tracks reorder for it. Each one lists the
        Foundations it builds on and how ready you already are, from the lessons you&apos;ve
        completed in this browser.
      </p>
      <div className="mt-8">
        <PathView tracks={getTrackPaths()} />
      </div>
    </div>
  );
}
