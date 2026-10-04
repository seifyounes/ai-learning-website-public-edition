"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import StreakChip from "./StreakChip";

const LINKS = [
  { href: "/start-here", label: "Start Here" },
  { href: "/foundations", label: "Foundations" },
  { href: "/applications", label: "Applications" },
  { href: "/get-hired", label: "Get Hired" },
  { href: "/dashboard", label: "Progress" },
  { href: "/search", label: "Search" },
  { href: "/about", label: "About" },
];

/**
 * The nav lies on the desk above the sheet: printed tabs, the current one taking the sheet's
 * paper so it reads as the tab of the page below. Below 1080px the seven tabs don't fit, so a
 * Menu button opens them as a ruled list instead of hiding half of them off-screen.
 */
export default function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const menuButton = useRef<HTMLButtonElement>(null);

  // Close the phone menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes the open menu and hands focus back to its button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="min-[760px]:px-6">
      <div className="mx-auto flex max-w-sheet flex-wrap items-end gap-x-4 px-4 pt-4 min-[1080px]:flex-nowrap min-[760px]:px-0">
        <div className="flex w-full items-center justify-between gap-3 pb-2 min-[1080px]:w-auto min-[1080px]:pb-2.5">
          <Link href="/" className="flex items-center gap-2.5 text-graphite">
            <span
              aria-hidden
              className="qty grid h-8 w-8 place-items-center border-[1.5px] border-print bg-print text-[14px] font-medium text-sheet"
            >
              AI
            </span>
            <span className="label-action text-print">AI Learning</span>
          </Link>
          <span className="flex items-center gap-3 min-[1080px]:hidden">
            {/* The streak gives way on the narrowest phones so the Menu button always fits. */}
            <span className="max-[359px]:hidden">
              <StreakChip />
            </span>
            <button
              ref={menuButton}
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((o) => !o)}
              className="btn-print btn-sm min-h-[40px]"
            >
              {open ? "Close" : "Menu"}
            </button>
          </span>
        </div>

        {/* Phones: the full list, one destination per ruled row. */}
        <nav
          id={menuId}
          aria-label="Main"
          hidden={!open}
          className="pen-land mb-3 w-full border-[1.5px] border-print bg-sheet min-[1080px]:hidden"
        >
          <ul>
            {LINKS.map((link) => (
              <li key={link.href} className="rule-row last:border-b-0">
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`hover-tint label-action flex min-h-[44px] items-center px-4 text-[14px] ${
                    isActive(link.href)
                      ? "text-graphite underline decoration-2 underline-offset-4"
                      : "text-print"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Wider screens: printed tabs. */}
        <nav aria-label="Main" className="hidden min-w-0 flex-1 items-end min-[1080px]:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className="pad-tab label-action text-[14px]"
            >
              {link.label}
            </Link>
          ))}
          <span className="ms-auto pb-1.5 ps-3">
            <StreakChip />
          </span>
        </nav>
      </div>
    </header>
  );
}
