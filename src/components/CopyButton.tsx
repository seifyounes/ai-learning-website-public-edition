"use client";

import { useState } from "react";

/** One-click copy for code & prompt blocks. */
export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Fallback for contexts where the async clipboard API is blocked.
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
          } finally {
            document.body.removeChild(ta);
          }
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={[
        "btn-print btn-sm absolute end-2 top-2 min-h-[30px] text-[12px]",
        copied ? "text-graphite" : "",
      ].join(" ")}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
