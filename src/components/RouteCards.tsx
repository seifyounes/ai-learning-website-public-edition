import Link from "next/link";
import { APPLICATIONS } from "@/lib/curriculum";
import { ROUTES } from "@/lib/routes";
import { Arrow } from "./TitleBlock";

/** The three goal routes as ruled rows: who it's for, the pillars in order, and its path. */
export default function RouteCards() {
  return (
    <ul>
      {ROUTES.map((r) => {
        const track = APPLICATIONS.find((t) => t.slug === r.trackOrder[0]);
        return (
          <li key={r.id} className="rule-row px-4 py-4 last:border-b-0 sm:px-5">
            <p className="font-semibold text-graphite">{r.goal}</p>
            <p className="mt-1 text-body-small text-pencil">{r.who}</p>
            <ol className="mt-2 flex flex-wrap items-center gap-2">
              {r.steps.map((st, i) => (
                <li key={st.href} className="flex items-center gap-2">
                  {i > 0 && <Arrow className="text-print" />}
                  <Link href={st.href} className="btn-print btn-sm normal-case tracking-normal">
                    {st.label}
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <Arrow className="text-print" />
                <Link href={`/path?goal=${r.id}`} className="btn-print btn-sm normal-case tracking-normal">
                  Then track {track ? `${track.number} · ${track.title}` : "of your choice"}
                </Link>
              </li>
            </ol>
          </li>
        );
      })}
    </ul>
  );
}
