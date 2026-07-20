import ReactMarkdown, { type Components } from 'react-markdown'

/**
 * Case descriptions rendered with our own design system styling, no external
 * prose theme. Space Grotesk for headings, Manrope for body, JetBrains Mono
 * for code. Raw HTML is not enabled, so the markdown is safe to render.
 */
const components: Components = {
  h1: ({ node, ...props }) => (
    <h2
      className="mt-8 font-display text-2xl font-semibold tracking-tight text-foreground first:mt-0"
      {...props}
    />
  ),
  h2: ({ node, ...props }) => (
    <h3
      className="mt-8 font-display text-xl font-semibold tracking-tight text-foreground first:mt-0"
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h4 className="mt-6 font-display text-lg font-semibold text-foreground first:mt-0" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mt-4 text-sm leading-relaxed text-muted first:mt-0 sm:text-base" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-muted sm:text-base" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm text-muted sm:text-base" {...props} />
  ),
  li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
  a: ({ node, ...props }) => (
    <a
      className="font-medium text-accent underline underline-offset-2"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="mt-4 border-l-2 border-border pl-4 text-sm text-muted sm:text-base"
      {...props}
    />
  ),
  code: ({ node, ...props }) => (
    <code
      className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
      {...props}
    />
  ),
  pre: ({ node, ...props }) => (
    <pre
      className="mt-4 overflow-x-auto rounded border border-border bg-surface p-4 font-mono text-sm text-foreground [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
  hr: ({ node, ...props }) => <hr className="my-8 border-border" {...props} />,
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="font-sans text-foreground">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  )
}
