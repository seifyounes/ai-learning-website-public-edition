"use client";

import { useProgress } from "@/lib/use-progress";

/** The DONE count in the home title block — read from this browser's progress. */
export default function HomeDoneCount({ total }: { total: number }) {
  const { hydrated, completedCount } = useProgress();
  // "3 of 175" reads the same to everyone; a bare "3" beside "3%" was read aloud as "33%".
  return (
    <span className="qty text-[21px] text-graphite min-[760px]:text-quantity-large">
      {hydrated ? completedCount : "–"}
      {hydrated ? <span className="text-[14px] text-muted"> of {total}</span> : null}
    </span>
  );
}
