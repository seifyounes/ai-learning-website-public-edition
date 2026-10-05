import type { Metadata } from "next";
import { Archivo, Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import KeyMigration from "@/components/KeyMigration";
import { REPO_URL, SITE_NAME, SITE_URL } from "@/lib/site";
import { getAllLessons } from "@/lib/content";

const LESSON_COUNT = getAllLessons().length;

// The pad's three hands: printed condensed labels, hyperlegible prose, mono quantities.
const print = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-print" });
const prose = Atkinson_Hyperlegible_Next({ subsets: ["latin"], variable: "--font-prose" });
const quantity = Atkinson_Hyperlegible_Mono({ subsets: ["latin"], variable: "--font-quantity" });

export const metadata: Metadata = {
  // Absolute share-card, canonical and sitemap URLs resolve against the real domain
  // (see src/lib/site.ts).
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI Learning — a free, vendor-neutral course in AI tools and engineering",
    template: "%s · AI Learning",
  },
  description:
    "A free course from near-beginner to applied AI engineer: a hand-picked free video on every topic, original breakdowns, hands-on tasks and self-checks. No sign-up.",
  // The share image itself comes from src/app/opengraph-image.tsx via Next's
  // file convention; these just supply the text that sits beside it.
  openGraph: {
    title: "AI Learning — from near-beginner to applied AI engineer",
    description:
      `${LESSON_COUNT} lessons: a hand-picked free video on each topic, an original breakdown, and a task you apply to your own work.`,
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Learning — from near-beginner to applied AI engineer",
    description:
      `${LESSON_COUNT} lessons: a hand-picked free video on each topic, an original breakdown, and a task you apply to your own work.`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${print.variable} ${prose.variable} ${quantity.variable}`}>
      <body className="min-h-screen">
        <a
          href="#main"
          className="label-action sr-only bg-sheet px-4 py-3 text-print focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:border-2 focus:border-print"
        >
          Skip to content
        </a>
        <TopNav />
        <KeyMigration />
        {/* The desk with one sheet on it; full-bleed on phones. */}
        <main id="main" className="min-[760px]:px-6">
          <div className="sheet min-h-[70vh]">{children}</div>
        </main>
        <footer className="mx-auto max-w-sheet px-4 py-8 text-body-small text-muted min-[760px]:px-6">
          <p>
            AI Learning · a free, vendor-neutral AI course · built by Seif Younes.
          </p>
          <p className="mt-1">
            Videos are embedded from YouTube and belong to their creators; lesson notes are
            original. Progress is saved only in your browser.{" "}
          </p>
          <p className="mt-2 flex flex-wrap gap-x-5">
            <Link href="/about" className="inline-flex min-h-[24px] items-center text-print underline">
              About this course
            </Link>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-[24px] items-center text-print underline">
              Source on GitHub
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
