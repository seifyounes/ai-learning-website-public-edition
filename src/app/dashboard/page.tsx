import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";
import { getNav } from "@/lib/nav";
import ProgressBackup from "@/components/ProgressBackup";

export const metadata: Metadata = {
  alternates: { canonical: "/dashboard" },
  title: "Your progress",
  description: "Your rank, streak, badges and progress through every pillar, saved in this browser.",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="print-display text-graphite">Your progress</h1>
      <p className="mb-6 mt-2 text-body text-pencil">
        Tracked in this browser. Mark lessons complete as you finish them.
      </p>
      <Dashboard nav={getNav()} />
      <div className="mt-10">
        <ProgressBackup />
      </div>
    </div>
  );
}
