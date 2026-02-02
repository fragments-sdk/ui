'use client';

import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { codeToHtml } from 'shiki';
import { TabsRoot, TabsList, Tab, TabsPanel } from '../Tabs';
import styles from './CodeBlock.module.scss';
import '../../styles/globals.scss';

export type CodeBlockLanguage =
  | 'tsx'
  | 'typescript'
  | 'javascript'
  | 'bash'
  | 'css'
  | 'scss'
  | 'json'
  | 'html';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Code string to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: CodeBlockLanguage;
  /** Show copy button */
  showCopy?: boolean;
  /** Optional title above code block (external label) */
  title?: string;
  /** Optional filename shown in header bar inside code block */
  filename?: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Highlight specific lines (e.g., [1, 3, '5-7']) */
  highlightLines?: (number | string)[];
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Remove common leading whitespace from all lines (dedent).
 * This handles template literals that have extra indentation from code formatting.
 */
function dedent(str: string): string {
  const lines = str.split('\n');

  // Find the minimum indentation (ignoring empty lines)
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim() === '') continue;
    const match = line.match(/^(\s*)/);
    if (match) {
      minIndent = Math.min(minIndent, match[1].length);
    }
  }

  // If no indentation found, return as-is
  if (minIndent === Infinity || minIndent === 0) {
    return str;
  }

  // Remove the common indentation from all lines
  return lines
    .map(line => line.slice(minIndent))
    .join('\n');
}

/**
 * Parse highlight lines specification into a Set of line numbers.
 * Supports: [1, 3, '5-7'] -> Set {1, 3, 5, 6, 7}
 */
function parseHighlightLines(
  highlightLines?: (number | string)[]
): Set<number> {
  const lines = new Set<number>();
  if (!highlightLines) return lines;

  for (const spec of highlightLines) {
    if (typeof spec === 'number') {
      lines.add(spec);
    } else if (typeof spec === 'string') {
      const rangeMatch = spec.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        for (let i = start; i <= end; i++) {
          lines.add(i);
        }
      } else {
        const num = parseInt(spec, 10);
        if (!isNaN(num)) {
          lines.add(num);
        }
      }
    }
  }

  return lines;
}

/**
 * Add line numbers and highlight classes to Shiki HTML output.
 */
function processShikiHtml(
  html: string,
  showLineNumbers: boolean,
  highlightLines: Set<number>
): string {
  if (!showLineNumbers && highlightLines.size === 0) {
    return html;
  }

  // Extract the code content from Shiki output
  // Shiki outputs: <pre class="shiki ..."><code>...lines...</code></pre>
  const codeMatch = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
  if (!codeMatch) return html;

  const codeContent = codeMatch[1];
  const lines = codeContent.split('\n');

  // Process each line
  const processedLines = lines.map((line, index) => {
    const lineNum = index + 1;
    const isHighlighted = highlightLines.has(lineNum);
    const lineClass = isHighlighted ? 'line highlighted' : 'line';

    if (showLineNumbers) {
      return `<span class="${lineClass}"><span class="line-number">${lineNum}</span>${line}</span>`;
    }
    return `<span class="${lineClass}">${line}</span>`;
  });

  // Reconstruct the HTML
  return html.replace(
    /<code[^>]*>[\s\S]*?<\/code>/,
    `<code>${processedLines.join('\n')}</code>`
  );
}

const CodeBlockBase = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  function CodeBlock(
    {
      code,
      language = 'tsx',
      showCopy = true,
      title,
      filename,
      showLineNumbers = false,
      highlightLines,
      className,
      ...htmlProps
    },
    ref
  ) {
    const [copied, setCopied] = useState(false);
    const [highlightedHtml, setHighlightedHtml] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    const trimmedCode = dedent(code.trim());
    const highlightSet = parseHighlightLines(highlightLines);

    // Apply syntax highlighting
    useEffect(() => {
      let cancelled = false;
      setIsLoading(true);

      codeToHtml(trimmedCode, {
        lang: language,
        theme: 'one-dark-pro',
      })
        .then((html) => {
          if (!cancelled) {
            const processed = processShikiHtml(
              html,
              showLineNumbers,
              highlightSet
            );
            setHighlightedHtml(processed);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Syntax highlighting failed:', err);
          }
          if (!cancelled) {
            // Fallback to plain text
            setHighlightedHtml(
              `<pre class="shiki"><code>${escapeHtml(trimmedCode)}</code></pre>`
            );
            setIsLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [trimmedCode, language, showLineNumbers, highlightSet.size]);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(trimmedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to copy:', err);
        }
      }
    }, [trimmedCode]);

    const classNames = [
      styles.container,
      showLineNumbers && styles.withLineNumbers,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperClasses = [
      styles.wrapper,
      filename && styles.hasHeader,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} {...htmlProps} className={classNames}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={wrapperClasses}>
          {filename && (
            <div className={styles.header}>
              <span className={styles.filename}>{filename}</span>
            </div>
          )}
          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
              aria-label={copied ? 'Copied!' : 'Copy code'}
            >
              {copied ? (
                <>
                  <CheckIcon className={styles.icon} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon className={styles.icon} />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
          {isLoading ? (
            <div className={styles.loading}>
              <pre>
                <code>{trimmedCode}</code>
              </pre>
            </div>
          ) : (
            <div
              className={styles.codeContainer}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          )}
        </div>
      </div>
    );
  }
);

// ============================================
// Tabbed Code Block
// ============================================

export interface CodeBlockTab {
  /** Label shown in the tab */
  label: string;
  /** Code string to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: CodeBlockLanguage;
}

export interface TabbedCodeBlockProps {
  /** Array of code tabs */
  tabs: CodeBlockTab[];
  /** Default selected tab (by label) */
  defaultTab?: string;
  /** Show copy button */
  showCopy?: boolean;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Additional class name */
  className?: string;
}

function TabbedCodeBlock({
  tabs,
  defaultTab,
  showCopy = true,
  showLineNumbers = false,
  className,
}: TabbedCodeBlockProps) {
  const defaultValue = defaultTab || tabs[0]?.label || '';

  return (
    <div className={className}>
      <TabsRoot defaultValue={defaultValue}>
        <TabsList variant="pills">
          {tabs.map((tab) => (
            <Tab key={tab.label} value={tab.label}>
              {tab.label}
            </Tab>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsPanel key={tab.label} value={tab.label} flush className={styles.tabbedPanel}>
            <CodeBlockBase
              code={tab.code}
              language={tab.language}
              showCopy={showCopy}
              showLineNumbers={showLineNumbers}
            />
          </TabsPanel>
        ))}
      </TabsRoot>
    </div>
  );
}

// ============================================
// Export compound component
// ============================================

export const CodeBlock = Object.assign(CodeBlockBase, {
  Tabbed: TabbedCodeBlock,
});

export { TabbedCodeBlock };
