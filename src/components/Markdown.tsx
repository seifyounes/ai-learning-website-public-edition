import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyButton from "./CopyButton";

/** Recursively pull the plain text out of rendered markdown children. */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node === "object" && "props" in node) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

/**
 * Blockquotes starting with 💡 become "Try it" callouts — small do-it-now
 * moments inside the reading flow. All other blockquotes render normally.
 */
function Blockquote({ children }: { children?: ReactNode }) {
  const text = textOf(children).trim();
  if (text.startsWith("💡")) {
    return (
      <div className="pad-box not-prose my-5 px-4 pb-3.5 pt-3">
        <p className="field-label mb-2">Try it now</p>
        <div className="text-body-small text-graphite [&>p]:m-0 [&>p+p]:mt-2 [&_a]:text-print [&_a]:underline [&_code]:qty">
          {stripLeadingEmoji(children)}
        </div>
      </div>
    );
  }
  return <blockquote>{children}</blockquote>;
}

/** Remove the leading 💡 (and following space) from the first text node. */
function stripLeadingEmoji(node: ReactNode): ReactNode {
  if (typeof node === "string") return node.replace(/^\s*💡\s*/, "");
  if (Array.isArray(node)) {
    const [first, ...rest] = node;
    return [stripLeadingEmoji(first), ...rest];
  }
  if (node != null && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: ReactNode };
    return { ...node, props: { ...props, children: stripLeadingEmoji(props.children) } };
  }
  return node;
}

/**
 * Fenced code blocks get a copy button; ```prompt blocks render as a
 * ready-to-paste prompt card.
 */
function Pre({ children }: { children?: ReactNode }) {
  const text = textOf(children).replace(/\n$/, "");
  const lang =
    children != null && typeof children === "object" && "props" in children
      ? String((children.props as { className?: string }).className ?? "")
      : "";
  const isPrompt = /language-prompt/.test(lang);

  // ```diagram blocks are figures, not code: no Copy button, drawn small enough to fit a phone
  // (the content gate caps them at 34 columns), focusable so a keyboard user can scroll if needed.
  if (/language-diagram/.test(lang)) {
    return (
      <figure className="not-prose my-5">
        <pre
          tabIndex={0}
          aria-label="Diagram"
          className="qty overflow-x-auto border-[1.2px] border-pencil bg-[var(--code-bg)] px-3 py-3 text-[12px] leading-[1.45] text-graphite sm:px-4 sm:text-[14px]"
        >
          {text}
        </pre>
      </figure>
    );
  }

  if (isPrompt) {
    return (
      <div className="pencil-box not-prose relative my-5 bg-[var(--code-bg)] px-4 pb-4 pt-3">
        <p className="field-label mb-3">Prompt — copy &amp; use</p>
        <CopyButton text={text} />
        <pre className="qty whitespace-pre-wrap break-words bg-transparent p-0 text-[15px] leading-relaxed text-graphite">
          {text}
        </pre>
      </div>
    );
  }

  return (
    <div className="relative">
      <CopyButton text={text} />
      <pre>{children}</pre>
    </div>
  );
}

/** Renders a markdown string with our study-friendly typography. Server-safe. */
export default function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={[
        // Paper prose: graphite text, print links and bullets, code on faintly tinted paper in a
        // pencil box. Headings are the printed condensed voice; the measure is held to ~60ch of
        // this face (about 70 characters of running text) for comfortable reading.
        "prose prose-pad max-w-[60ch] text-[17px] leading-[1.6]",
        "prose-headings:font-print prose-headings:font-bold prose-headings:text-graphite",
        "prose-headings:[font-variation-settings:'wdth'_80] prose-h3:text-[23px] prose-h4:text-[20px]",
        "prose-a:underline prose-a:decoration-1 prose-a:underline-offset-[3px] hover:prose-a:decoration-2",
        "prose-code:qty prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",
        "prose-code:bg-[var(--code-bg)] prose-code:px-1 prose-code:py-0.5",
        "prose-pre:rounded-none prose-pre:border-[1.2px] prose-pre:border-pencil prose-pre:text-[14.5px]",
        "prose-pre:qty prose-pre:pe-20",
        "prose-blockquote:border-s-[1.5px] prose-blockquote:font-normal prose-blockquote:not-italic",
        "prose-th:field-label prose-table:text-[15px]",
        "prose-hr:border-print",
        className ?? "",
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          blockquote: Blockquote,
          pre: Pre,
          // Lesson blocks own the <h2>; markdown headings nest one level below them.
          h1: ({ children }) => <h3>{children}</h3>,
          h2: ({ children }) => <h3>{children}</h3>,
          h3: ({ children }) => <h4>{children}</h4>,
          h4: ({ children }) => <h5>{children}</h5>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
