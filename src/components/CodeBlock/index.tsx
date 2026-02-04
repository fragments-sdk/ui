'use client';

import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { codeToHtml, BundledTheme } from 'shiki';
import { TabsRoot, TabsList, Tab, TabsPanel } from '../Tabs';
import styles from './CodeBlock.module.scss';
import '../../styles/globals.scss';

export type CodeBlockLanguage =
  | 'tsx'
  | 'typescript'
  | 'javascript'
  | 'jsx'
  | 'bash'
  | 'shell'
  | 'css'
  | 'scss'
  | 'sass'
  | 'json'
  | 'html'
  | 'xml'
  | 'markdown'
  | 'md'
  | 'yaml'
  | 'yml'
  | 'python'
  | 'py'
  | 'ruby'
  | 'go'
  | 'rust'
  | 'java'
  | 'kotlin'
  | 'swift'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'php'
  | 'sql'
  | 'graphql'
  | 'diff'
  | 'plaintext';

/** Available syntax highlighting themes */
export type CodeBlockTheme =
  | 'synthwave-84'
  | 'github-dark'
  | 'github-light'
  | 'one-dark-pro'
  | 'dracula'
  | 'nord'
  | 'monokai'
  | 'vitesse-dark'
  | 'vitesse-light'
  | 'min-dark'
  | 'min-light';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Code string to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: CodeBlockLanguage;
  /** Syntax highlighting theme */
  theme?: CodeBlockTheme;
  /** Show copy button */
  showCopy?: boolean;
  /** Optional title above code block (external label) */
  title?: string;
  /** Optional filename shown in header bar inside code block */
  filename?: string;
  /** Optional caption below code block */
  caption?: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Starting line number (default: 1) */
  startLineNumber?: number;
  /** Highlight specific lines (e.g., [1, 3, '5-7']) */
  highlightLines?: (number | string)[];
  /** Lines marked as added in diff view */
  addedLines?: (number | string)[];
  /** Lines marked as removed in diff view */
  removedLines?: (number | string)[];
  /** Enable word wrapping for long lines */
  wordWrap?: boolean;
  /** Maximum height in pixels (enables scrolling) */
  maxHeight?: number;
  /** Allow collapsing/expanding the code block */
  collapsible?: boolean;
  /** Initial collapsed state (only applies when collapsible is true) */
  defaultCollapsed?: boolean;
  /** Number of lines to show when collapsed */
  collapsedLines?: number;
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

function ChevronDownIcon({ className }: { className?: string }) {
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
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
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
      <polyline points="18 15 12 9 6 15" />
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
 * Parse line specification into a Set of line numbers.
 * Supports: [1, 3, '5-7'] -> Set {1, 3, 5, 6, 7}
 */
function parseLineSpec(spec?: (number | string)[]): Set<number> {
  const lines = new Set<number>();
  if (!spec) return lines;

  for (const item of spec) {
    if (typeof item === 'number') {
      lines.add(item);
    } else if (typeof item === 'string') {
      const rangeMatch = item.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        for (let i = start; i <= end; i++) {
          lines.add(i);
        }
      } else {
        const num = parseInt(item, 10);
        if (!isNaN(num)) {
          lines.add(num);
        }
      }
    }
  }

  return lines;
}

/** Backwards compatibility alias */
function parseHighlightLines(highlightLines?: (number | string)[]): Set<number> {
  return parseLineSpec(highlightLines);
}

interface ProcessOptions {
  showLineNumbers: boolean;
  startLineNumber: number;
  highlightLines: Set<number>;
  addedLines: Set<number>;
  removedLines: Set<number>;
}

/**
 * Add line numbers, highlight classes, and diff markers to Shiki HTML output.
 */
function processShikiHtml(html: string, options: ProcessOptions): string {
  const { showLineNumbers, startLineNumber, highlightLines, addedLines, removedLines } = options;
  const hasDiff = addedLines.size > 0 || removedLines.size > 0;

  if (!showLineNumbers && highlightLines.size === 0 && !hasDiff) {
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
    const displayLineNum = startLineNumber + index;
    const isHighlighted = highlightLines.has(lineNum);
    const isAdded = addedLines.has(lineNum);
    const isRemoved = removedLines.has(lineNum);

    const lineClasses = ['line'];
    if (isHighlighted) lineClasses.push('highlighted');
    if (isAdded) lineClasses.push('diff-added');
    if (isRemoved) lineClasses.push('diff-removed');

    const lineClass = lineClasses.join(' ');
    const diffMarker = isAdded ? '+' : isRemoved ? '-' : ' ';

    if (showLineNumbers || hasDiff) {
      const lineNumHtml = showLineNumbers
        ? `<span class="line-number">${displayLineNum}</span>`
        : '';
      const diffMarkerHtml = hasDiff
        ? `<span class="diff-marker">${diffMarker}</span>`
        : '';
      return `<span class="${lineClass}">${lineNumHtml}${diffMarkerHtml}${line}</span>`;
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
      theme = 'synthwave-84',
      showCopy = true,
      title,
      filename,
      caption,
      showLineNumbers = false,
      startLineNumber = 1,
      highlightLines,
      addedLines,
      removedLines,
      wordWrap = false,
      maxHeight,
      collapsible = false,
      defaultCollapsed = false,
      collapsedLines = 5,
      className,
      ...htmlProps
    },
    ref
  ) {
    const [copied, setCopied] = useState(false);
    const [highlightedHtml, setHighlightedHtml] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    const trimmedCode = dedent(code.trim());
    const codeLines = trimmedCode.split('\n');
    const totalLines = codeLines.length;
    const shouldShowCollapse = collapsible && totalLines > collapsedLines;

    // Compute visible code when collapsed
    const visibleCode = shouldShowCollapse && isCollapsed
      ? codeLines.slice(0, collapsedLines).join('\n')
      : trimmedCode;

    const highlightSet = parseLineSpec(highlightLines);
    const addedSet = parseLineSpec(addedLines);
    const removedSet = parseLineSpec(removedLines);
    const hasDiff = addedSet.size > 0 || removedSet.size > 0;

    // Apply syntax highlighting
    useEffect(() => {
      let cancelled = false;
      setIsLoading(true);

      codeToHtml(visibleCode, {
        lang: language,
        theme: theme as BundledTheme,
      })
        .then((html) => {
          if (!cancelled) {
            const processed = processShikiHtml(html, {
              showLineNumbers,
              startLineNumber,
              highlightLines: highlightSet,
              addedLines: addedSet,
              removedLines: removedSet,
            });
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
              `<pre class="shiki"><code>${escapeHtml(visibleCode)}</code></pre>`
            );
            setIsLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [visibleCode, language, theme, showLineNumbers, startLineNumber, highlightSet.size, addedSet.size, removedSet.size]);

    const handleCopy = useCallback(async () => {
      try {
        // Always copy the full code, even when collapsed
        await navigator.clipboard.writeText(trimmedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to copy:', err);
        }
      }
    }, [trimmedCode]);

    const toggleCollapsed = useCallback(() => {
      setIsCollapsed((prev) => !prev);
    }, []);

    const classNames = [
      styles.container,
      showLineNumbers && styles.withLineNumbers,
      hasDiff && styles.withDiff,
      wordWrap && styles.wordWrap,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperClasses = [
      styles.wrapper,
      filename && styles.hasHeader,
    ].filter(Boolean).join(' ');

    const codeContainerStyle: React.CSSProperties = maxHeight
      ? { maxHeight, overflow: 'auto' }
      : {};

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
            <div className={styles.loading} style={codeContainerStyle}>
              <pre>
                <code>{visibleCode}</code>
              </pre>
            </div>
          ) : (
            <div
              className={styles.codeContainer}
              style={codeContainerStyle}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          )}
          {shouldShowCollapse && (
            <button
              type="button"
              onClick={toggleCollapsed}
              className={styles.collapseButton}
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? 'Expand code' : 'Collapse code'}
            >
              {isCollapsed ? (
                <>
                  <ChevronDownIcon className={styles.icon} />
                  <span>Show {totalLines - collapsedLines} more lines</span>
                </>
              ) : (
                <>
                  <ChevronUpIcon className={styles.icon} />
                  <span>Show less</span>
                </>
              )}
            </button>
          )}
        </div>
        {caption && <div className={styles.caption}>{caption}</div>}
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
  /** Syntax highlighting theme (applies to all tabs) */
  theme?: CodeBlockTheme;
  /** Enable word wrapping for long lines */
  wordWrap?: boolean;
  /** Maximum height in pixels (enables scrolling) */
  maxHeight?: number;
  /** Additional class name */
  className?: string;
}

function TabbedCodeBlock({
  tabs,
  defaultTab,
  showCopy = true,
  showLineNumbers = false,
  theme,
  wordWrap,
  maxHeight,
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
              theme={theme}
              showCopy={showCopy}
              showLineNumbers={showLineNumbers}
              wordWrap={wordWrap}
              maxHeight={maxHeight}
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
