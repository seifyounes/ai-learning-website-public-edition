import ReactMarkdown from "react-markdown";

/**
 * Short frontmatter strings (self-check answers, recap steps, quiz explanations, the video's
 * "why") carry inline markdown: *emphasis*, **bold**, `code` and links. Render just those,
 * unwrapping paragraphs so the result can sit inside a <p> or <span>. Lesson links stay in
 * the tab; outside links open a new one.
 */
export default function InlineMarkdown({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <>{children}</>,
        strong: ({ children }) => <strong className="font-semibold text-graphite">{children}</strong>,
        code: ({ children }) => (
          <code className="qty bg-[var(--code-bg)] px-1 py-0.5 text-[0.9em] text-graphite">
            {children}
          </code>
        ),
        a: ({ children, href }) =>
          href?.startsWith("/") ? (
            <a href={href} className="text-print underline decoration-1 underline-offset-[3px]">
              {children}
            </a>
          ) : (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-print underline decoration-1 underline-offset-[3px]"
            >
              {children}
            </a>
          ),
      }}
      disallowedElements={["h1", "h2", "h3", "h4", "h5", "h6", "hr", "img", "pre", "ul", "ol", "li", "blockquote", "table"]}
      unwrapDisallowed
    >
      {children}
    </ReactMarkdown>
  );
}
