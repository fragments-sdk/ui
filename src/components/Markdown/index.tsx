'use client';

import * as React from 'react';
import styles from './Markdown.module.scss';
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface MarkdownProps {
  /** Markdown string to render */
  content: string;
  /** Override map for markdown element components */
  components?: Record<string, React.ComponentType<React.HTMLAttributes<HTMLElement>>>;
  /** Additional class name */
  className?: string;
}

// ============================================
// Lazy-loaded react-markdown
// ============================================

type ReactMarkdownType = React.ComponentType<{
  children: string;
  remarkPlugins?: unknown[];
  components?: Record<string, React.ComponentType<unknown>>;
}>;

let ReactMarkdown: ReactMarkdownType | null = null;
let remarkGfm: unknown = null;
let loadAttempted = false;
let loadFailed = false;

function loadDeps() {
  if (loadAttempted) return;
  loadAttempted = true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ReactMarkdown = require('react-markdown').default || require('react-markdown');
  } catch {
    loadFailed = true;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    remarkGfm = require('remark-gfm').default || require('remark-gfm');
  } catch {
    // remark-gfm is optional; markdown still works without it
  }
}

// ============================================
// Fallback renderer (plain text with paragraphs)
// ============================================

function FallbackRenderer({ content, className }: { content: string; className?: string }) {
  const paragraphs = content.split(/\n{2,}/);
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

// ============================================
// Component
// ============================================

const MarkdownRoot = React.forwardRef<HTMLDivElement, MarkdownProps>(
  function Markdown({ content, components: componentOverrides, className }, ref) {
    loadDeps();

    const classes = [styles.markdown, className].filter(Boolean).join(' ');

    if (loadFailed || !ReactMarkdown) {
      if (loadFailed && process.env.NODE_ENV === 'development') {
        console.warn(
          '[@fragments-sdk/ui] Markdown: react-markdown is not installed. ' +
          'Install it with: npm install react-markdown remark-gfm'
        );
      }
      return (
        <div ref={ref} className={classes}>
          <FallbackRenderer content={content} />
        </div>
      );
    }

    const plugins = remarkGfm ? [remarkGfm] : [];

    return (
      <div ref={ref} className={classes}>
        <ReactMarkdown
          remarkPlugins={plugins}
          components={componentOverrides as Record<string, React.ComponentType<unknown>>}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

export const Markdown = Object.assign(MarkdownRoot, {
  Root: MarkdownRoot,
});
