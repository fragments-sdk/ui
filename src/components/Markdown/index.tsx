"use client";

import * as React from "react";
import styles from "./Markdown.module.scss";
import { isDevelopmentBuild } from "../../utils/env";
import { CodeBlock } from "../CodeBlock";

// ============================================
// Types
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- markdown element overrides take any element props
type MarkdownComponentMap = Record<string, React.ComponentType<any>>;

export interface MarkdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Markdown string to render */
  content: string;
  /** Override map for markdown element components; overrides win over the built-in fences and tables */
  components?: MarkdownComponentMap;
  /**
   * The text is still arriving: an unclosed fence is closed for display, a
   * still caret follows the last block, and the region is busy.
   */
  streaming?: boolean;
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
        const mod = await import("react-markdown");
        ReactMarkdown = ((mod as { default?: ReactMarkdownType }).default ??
          mod) as ReactMarkdownType;
      } catch {
        loadFailed = true;
        if (isDevelopmentBuild()) {
          console.warn(
            "[@usefragments/ui] Markdown: react-markdown is not installed. " +
              "Install it with: npm install react-markdown remark-gfm"
          );
        }
        return;
      }

      try {
        const mod = await import("remark-gfm");
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
    <>
      {paragraphs.map((p, index) => (
        <p key={index}>{p}</p>
      ))}
    </>
  );
}

// ============================================
// Built-in elements: fences through CodeBlock, tables in a focusable region
// ============================================

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node))
    return textOf(node.props.children);
  return "";
}

function MarkdownFence({ children }: { children?: React.ReactNode }) {
  const code = React.Children.toArray(children).find(React.isValidElement) as
    | React.ReactElement<{ className?: string; children?: React.ReactNode }>
    | undefined;
  const language = /language-([\w-]+)/.exec(code?.props.className ?? "")?.[1];
  const text = textOf(code?.props.children ?? children).replace(/\n$/, "");
  return <CodeBlock code={text} language={language as never} />;
}

function MarkdownTable({
  children,
  node: _node,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement> & { node?: unknown }) {
  return (
    <div className={styles.tableRegion} role="region" aria-label="Table" tabIndex={0}>
      <table {...props}>{children}</table>
    </div>
  );
}

const BUILT_IN_COMPONENTS: MarkdownComponentMap = {
  pre: MarkdownFence,
  table: MarkdownTable,
};

/** While text streams, close an unclosed fence so the partial reply renders as code. */
export function closeOpenFence(content: string): string {
  const fences = content.match(/^\s{0,3}(```|~~~)/gm) ?? [];
  if (fences.length % 2 === 0) return content;
  const marker = fences[fences.length - 1].trim();
  return `${content}${content.endsWith("\n") ? "" : "\n"}${marker}`;
}

// ============================================
// Component
// ============================================

const MarkdownRoot = React.forwardRef<HTMLDivElement, MarkdownProps>(function Markdown(
  { content, components: componentOverrides, streaming = false, className, ...htmlProps },
  ref
) {
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

  const classes = [styles.markdown, streaming && styles.streaming, className]
    .filter(Boolean)
    .join(" ");
  const text = streaming ? closeOpenFence(content) : content;
  const components = React.useMemo(
    () => ({ ...BUILT_IN_COMPONENTS, ...componentOverrides }),
    [componentOverrides]
  );

  if (!ReactMarkdown) {
    return (
      <div ref={ref} aria-busy={streaming || undefined} {...htmlProps} className={classes}>
        <FallbackRenderer content={text} />
      </div>
    );
  }

  const plugins = remarkGfm ? [remarkGfm] : [];

  return (
    <div ref={ref} aria-busy={streaming || undefined} {...htmlProps} className={classes}>
      <ReactMarkdown remarkPlugins={plugins} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
});

export const Markdown = Object.assign(MarkdownRoot, {
  Root: MarkdownRoot,
  /**
   * Start resolving the markdown parser before anything renders. Optional —
   * for apps that know prose is imminent (a chat transcript, a docs route) and
   * would rather not show the plain-text fallback for a frame.
   */
  preload: loadDeps,
});
