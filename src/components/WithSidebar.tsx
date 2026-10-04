import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { getNav } from "@/lib/nav";

/**
 * Two-column catalog/lesson layout on the sheet: the sidebar is the sheet's margin column,
 * divided from the body by a 1px print margin line. The content comes first in the page order
 * (the grid places the sidebar on the left), so "Skip to content" and the Tab key reach the
 * lesson before the course's 100-odd sidebar links.
 */
export default function WithSidebar({ children }: { children: ReactNode }) {
  const nav = getNav();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="min-w-0 px-4 py-6 sm:px-8 sm:py-8 lg:col-start-2 lg:row-start-1">{children}</div>
      <aside className="hidden border-e border-print lg:col-start-1 lg:row-start-1 lg:block">
        <div className="sticky top-0 max-h-screen overflow-y-auto px-5 py-8">
          <Sidebar nav={nav} />
        </div>
      </aside>
    </div>
  );
}
