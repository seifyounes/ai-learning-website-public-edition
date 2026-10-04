import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

/**
 * The Computation Pad design system, Indigo ink pad. Tailwind's default palette and
 * radii are replaced, not extended: only the pad's tokens exist, so a stray `slate-*` or
 * `rounded-*` class generates nothing. Values live as CSS variables in globals.css.
 */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      desk: "var(--desk)",
      sheet: "var(--sheet)",
      "grid-fine": "var(--grid-fine)",
      "grid-major": "var(--grid-major)",
      print: "var(--print)",
      muted: "var(--muted)",
      graphite: "var(--graphite)",
      pencil: "var(--pencil)",
      "red-pen": "var(--red-pen)",
      black: "#000",
    },
    borderRadius: {
      none: "0px",
      sheet: "2px",
    },
    fontFamily: {
      print: ["var(--font-print)", "Arial Narrow", "sans-serif"],
      prose: ["var(--font-prose)", "system-ui", "sans-serif"],
      quantity: ["var(--font-quantity)", "ui-monospace", "monospace"],
    },
    extend: {
      fontSize: {
        display: ["42px", { lineHeight: "0.95" }],
        "display-phone": ["34px", { lineHeight: "0.95" }],
        headline: ["25px", { lineHeight: "1.1" }],
        title: ["21px", { lineHeight: "1.2" }],
        "sheet-title": ["19px", { lineHeight: "1.2" }],
        body: ["17px", { lineHeight: "1.5" }],
        "body-small": ["15px", { lineHeight: "1.45" }],
        label: ["12px", { lineHeight: "1" }],
        quantity: ["16px", { lineHeight: "1" }],
        "quantity-large": ["26px", { lineHeight: "1" }],
      },
      maxWidth: {
        sheet: "1200px",
        measure: "72ch",
      },
      typography: {
        pad: {
          css: {
            "--tw-prose-body": "var(--graphite)",
            "--tw-prose-headings": "var(--graphite)",
            "--tw-prose-lead": "var(--pencil)",
            "--tw-prose-links": "var(--print)",
            "--tw-prose-bold": "var(--graphite)",
            "--tw-prose-counters": "var(--muted)",
            "--tw-prose-bullets": "var(--print)",
            "--tw-prose-hr": "var(--grid-major)",
            "--tw-prose-quotes": "var(--pencil)",
            "--tw-prose-quote-borders": "var(--print)",
            "--tw-prose-captions": "var(--muted)",
            "--tw-prose-code": "var(--graphite)",
            "--tw-prose-pre-code": "var(--graphite)",
            "--tw-prose-pre-bg": "var(--code-bg)",
            "--tw-prose-th-borders": "var(--pencil)",
            "--tw-prose-td-borders": "var(--grid-major)",
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
