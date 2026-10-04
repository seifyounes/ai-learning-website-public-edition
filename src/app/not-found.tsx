import Link from "next/link";
import type { Metadata } from "next";
import { Arrow } from "@/components/TitleBlock";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <p className="field-label">Error 404</p>
      <h1 className="print-display mt-3 text-graphite">This page isn&rsquo;t in the course.</h1>
      <p className="measure mt-4 text-body text-pencil">
        The link may be old, or the lesson may have moved. Search for the topic, or start from the
        guided path.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/search" className="btn-next">
          Search lessons <Arrow />
        </Link>
        <Link href="/start-here" className="btn-print">
          Start here
        </Link>
      </div>
    </div>
  );
}
