'use client';

import * as React from 'react';
import styles from './Markdown.module.scss';

// ============================================
// Types
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarkdownComponentMap = Record<string, React.ComponentType<any>>;

export interface MarkdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Markdown string to render */
  content: string;
  /** Override map for markdown element components */
  components?: MarkdownComponentMap;
  /** Additional class name */
  className?: string;
}

// ============================================
// Lazy-loaded react-markdown
// ============================================

type ReactMarkdownType = React.ComponentType<{
  children: string;
  remarkPlugins?: unknown[];
  components?: MarkdownComponentMap;
}>;

let ReactMarkdown: ReactMarkdownType | null = null;
let remarkGfm: unknown = null;
let loadPromise: Promise<void> | null = null;
let loadFailed = false;

/**
 * Resolve react-markdown, once per page.
 *
 * `import()` rather than `require()`: this component is bundled into browser
 * apps, where `require` is not defined, so a synchronous require throws a
 * ReferenceError that this function's own catch would swallow — turning every
 * render into the plain-text fallback with no way to tell that from a genuinely
 * missing dependency. The same lazy-ESM shape as CodeBlock's shiki loader.
 */
function loadDeps(): Promise<void> {
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const mod = await import('react-markdown');
        ReactMarkdown = ((mod as { default?: ReactMarkdownType }).default ??
          mod) as ReactMarkdownType;
      } catch {
        loadFailed = true;
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[@usefragments/ui] Markdown: react-markdown is not installed. ' +
            'Install it with: npm install react-markdown remark-gfm'
          );
        }
        return;
      }

      try {
        const mod = await import('remark-gfm');
        remarkGfm = (mod as { default?: unknown }).default ?? mod;
      } catch {
        // remark-gfm is optional; markdown still works without it
      }
    })();
  }
  return loadPromise;
}

// ============================================
// Fallback renderer (plain text with paragraphs)
// ============================================

function FallbackRenderer({ content }: { content: string }) {
  const paragraphs = content.split(/\n{2,}/);
  return (
    <div>
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}

// ============================================
// Component
// ============================================

const MarkdownRoot = React.forwardRef<HTMLDivElement, MarkdownProps>(
  function Markdown({ content, components: componentOverrides, className, ...htmlProps }, ref) {
    // The parser resolves asynchronously, so the first mount on a page renders
    // the fallback and then swaps. Both module-level results are cached, so
    // every later mount is synchronous; an app that knows prose is coming can
    // skip even the first swap by calling Markdown.preload() up front.
    const [, rerender] = React.useReducer((n: number) => n + 1, 0);

    React.useEffect(() => {
      if (ReactMarkdown || loadFailed) return;
      let active = true;
      void loadDeps().then(() => {
        if (active) rerender();
      });
      return () => {
        active = false;
      };
    }, []);

    const classes = [styles.markdown, className].filter(Boolean).join(' ');

    if (!ReactMarkdown) {
      return (
        <div ref={ref} {...htmlProps} className={classes}>
          <FallbackRenderer content={content} />
        </div>
      );
    }

    const plugins = remarkGfm ? [remarkGfm] : [];

    return (
      <div ref={ref} {...htmlProps} className={classes}>
        <ReactMarkdown
          remarkPlugins={plugins}
          components={componentOverrides}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

export const Markdown = Object.assign(MarkdownRoot, {
  Root: MarkdownRoot,
  /**
   * Start resolving the markdown parser before anything renders. Optional —
   * for apps that know prose is imminent (a chat transcript, a docs route) and
   * would rather not show the plain-text fallback for a frame.
   */
  preload: loadDeps,
});
