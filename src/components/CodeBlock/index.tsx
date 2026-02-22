"use client";

import * as React from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
// ============================================
// Lazy-loaded dependency (shiki)
// ============================================

let _codeToHtml:
  | ((code: string, options: { lang: string; theme: string }) => Promise<string>)
  | null = null;
let _shikiLoadPromise: Promise<void> | null = null;
let _shikiFailed = false;

async function loadShikiDeps() {
  if (_codeToHtml) return;
  if (_shikiFailed) return;
  if (!_shikiLoadPromise) {
    _shikiLoadPromise = (async () => {
      try {
        const shiki = await import("shiki");
        _codeToHtml = shiki.codeToHtml;
      } catch {
        _shikiFailed = true;
      }
    })();
  }
  await _shikiLoadPromise;
}
import { TabsRoot, TabsList, Tab, TabsPanel } from "../Tabs";
import { Button } from "../Button";
import styles from "./CodeBlock.module.scss";
import "../../styles/globals.scss";

export type CodeBlockLanguage =
  | "tsx"
  | "typescript"
  | "ts"
  | "javascript"
  | "js"
  | "jsx"
  | "bash"
  | "shell"
  | "css"
  | "scss"
  | "sass"
  | "json"
  | "html"
  | "xml"
  | "markdown"
  | "md"
  | "yaml"
  | "yml"
  | "python"
  | "py"
  | "ruby"
  | "go"
  | "rust"
  | "java"
  | "kotlin"
  | "swift"
  | "c"
  | "cpp"
  | "csharp"
  | "php"
  | "sql"
  | "graphql"
  | "diff"
  | "plaintext"
  | "text";

/** Resolves language aliases to their canonical Shiki names */
const LANGUAGE_ALIASES: Partial<Record<CodeBlockLanguage, string>> = {
  ts: "typescript",
  js: "javascript",
  text: "plaintext",
};

/** Available syntax highlighting themes */
export type CodeBlockTheme =
  | "synthwave-84"
  | "github-dark"
  | "github-light"
  | "one-dark-pro"
  | "dracula"
  | "nord"
  | "monokai"
  | "vitesse-dark"
  | "vitesse-light"
  | "min-dark"
  | "min-light";

export type CodeBlockCopyPlacement = "auto" | "header" | "overlay";

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
  /** Compact mode with reduced padding */
  compact?: boolean;
  /** Show a persistent copy button (always visible, uses Button component) */
  persistentCopy?: boolean;
  /** Placement of copy button when not using persistent copy */
  copyPlacement?: CodeBlockCopyPlacement;
  /** Callback fired when the copy button is clicked and copy succeeds */
  onCopy?: () => void;
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Remove common leading whitespace from all lines (dedent).
 * This handles template literals that have extra indentation from code formatting.
 */
function dedent(str: string): string {
  const lines = str.split("\n");

  // Find the minimum indentation (ignoring empty lines)
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim() === "") continue;
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
  return lines.map((line) => line.slice(minIndent)).join("\n");
}

/**
 * Normalize indentation while handling JSX where first line is already at column 0.
 */
function normalizeIndentation(str: string): string {
  const lines = str.split("\n");
  if (lines.length <= 1) return str;

  let minIndent = Infinity;
  const firstLineIndent = lines[0].match(/^(\s*)/)?.[1].length ?? 0;

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim().length === 0) continue;
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
    minIndent = Math.min(minIndent, indent);
  }

  if (firstLineIndent > 0) {
    minIndent = Math.min(minIndent, firstLineIndent);
  }

  if (minIndent === Infinity || minIndent === 0) return str;

  return lines
    .map((line) => line.slice(Math.min(minIndent, line.match(/^(\s*)/)?.[1].length ?? 0)))
    .join("\n");
}

function trimTrailingWhitespace(str: string): string {
  return str
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n");
}

function findTagEnd(line: string): number {
  let quote: '"' | "'" | "`" | null = null;
  let escaped = false;
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;

  for (let i = 1; i < line.length; i += 1) {
    const char = line[i];

    if (quote) {
      if (char === "\\" && !escaped) {
        escaped = true;
        continue;
      }
      if (char === quote && !escaped) {
        quote = null;
      }
      escaped = false;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") braceDepth += 1;
    else if (char === "}") braceDepth = Math.max(0, braceDepth - 1);
    else if (char === "[") bracketDepth += 1;
    else if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    else if (char === "(") parenDepth += 1;
    else if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
    else if (char === ">" && braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
      return i;
    }
  }

  return -1;
}

function splitJsxAttributes(attrs: string): string[] {
  const parts: string[] = [];
  let current = "";
  let quote: '"' | "'" | "`" | null = null;
  let escaped = false;
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;

  for (const char of attrs) {
    if (quote) {
      current += char;
      if (char === "\\" && !escaped) {
        escaped = true;
        continue;
      }
      if (char === quote && !escaped) {
        quote = null;
      }
      escaped = false;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "{") braceDepth += 1;
    else if (char === "}") braceDepth = Math.max(0, braceDepth - 1);
    else if (char === "[") bracketDepth += 1;
    else if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    else if (char === "(") parenDepth += 1;
    else if (char === ")") parenDepth = Math.max(0, parenDepth - 1);

    if (/\s/.test(char) && braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
      if (current.trim().length > 0) {
        parts.push(current.trim());
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current.trim().length > 0) {
    parts.push(current.trim());
  }

  return parts;
}

function formatLongJsxTagLine(line: string): string {
  const maxInlineLength = 110;
  if (line.length <= maxInlineLength) return line;

  const indent = line.match(/^(\s*)/)?.[1] ?? "";
  const trimmed = line.trimStart();

  if (
    !trimmed.startsWith("<") ||
    trimmed.startsWith("</") ||
    trimmed.startsWith("<!") ||
    trimmed.startsWith("<?")
  ) {
    return line;
  }

  const tagEnd = findTagEnd(trimmed);
  if (tagEnd === -1) return line;
  if (trimmed.slice(tagEnd + 1).trim().length > 0) return line;

  const rawTagBody = trimmed.slice(1, tagEnd).trim();
  const isSelfClosing = rawTagBody.endsWith("/");
  const tagBody = isSelfClosing ? rawTagBody.slice(0, -1).trimEnd() : rawTagBody;
  const firstSpace = tagBody.search(/\s/);
  if (firstSpace === -1) return line;

  const tagName = tagBody.slice(0, firstSpace);
  if (!/^[A-Za-z][\w.:-]*$/.test(tagName)) return line;

  const attrsSource = tagBody.slice(firstSpace).trim();
  if (!attrsSource.includes("=") && !attrsSource.includes("{...")) return line;

  const attrs = splitJsxAttributes(attrsSource);
  if (attrs.length === 0) return line;

  const attrIndent = `${indent}  `;
  const close = isSelfClosing ? "/>" : ">";

  return [
    `${indent}<${tagName}`,
    ...attrs.map((attr) => `${attrIndent}${attr}`),
    `${indent}${close}`,
  ].join("\n");
}

function formatLongJsxTags(code: string): string {
  return code
    .split("\n")
    .flatMap((line) => formatLongJsxTagLine(line).split("\n"))
    .join("\n");
}

function normalizeCode(code: string): string {
  const trimmed = code.trim();
  if (trimmed.length === 0) return "";

  const normalized = normalizeIndentation(trimmed);
  const dedented = dedent(normalized);
  const withoutTrailingWhitespace = trimTrailingWhitespace(dedented);
  return formatLongJsxTags(withoutTrailingWhitespace);
}

/**
 * Parse line specification into a Set of line numbers.
 * Supports: [1, 3, '5-7'] -> Set {1, 3, 5, 6, 7}
 */
function parseLineSpec(spec?: (number | string)[]): Set<number> {
  const lines = new Set<number>();
  if (!spec) return lines;

  for (const item of spec) {
    if (typeof item === "number") {
      lines.add(item);
    } else if (typeof item === "string") {
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
  const lines = codeContent.split("\n");

  // Process each line
  const processedLines = lines.map((line, index) => {
    const lineNum = index + 1;
    const displayLineNum = startLineNumber + index;
    const isHighlighted = highlightLines.has(lineNum);
    const isAdded = addedLines.has(lineNum);
    const isRemoved = removedLines.has(lineNum);

    const lineClasses = ["line"];
    if (isHighlighted) lineClasses.push("highlighted");
    if (isAdded) lineClasses.push("diff-added");
    if (isRemoved) lineClasses.push("diff-removed");

    const lineClass = lineClasses.join(" ");
    const diffMarker = isAdded ? "+" : isRemoved ? "-" : " ";

    if (showLineNumbers || hasDiff) {
      const lineNumHtml = showLineNumbers
        ? `<span class="line-number">${displayLineNum}</span>`
        : "";
      const diffMarkerHtml = hasDiff ? `<span class="diff-marker">${diffMarker}</span>` : "";
      return `<span class="${lineClass}">${lineNumHtml}${diffMarkerHtml}${line}</span>`;
    }
    return `<span class="${lineClass}">${line}</span>`;
  });

  // Reconstruct the HTML
  return html.replace(/<code[^>]*>[\s\S]*?<\/code>/, `<code>${processedLines.join("\n")}</code>`);
}

const CodeBlockBase = React.forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  {
    code,
    language = "tsx",
    theme = "one-dark-pro",
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
    compact = false,
    persistentCopy = false,
    copyPlacement = "auto",
    onCopy,
    className,
    ...htmlProps
  },
  ref
) {
  const [copied, setCopied] = useState(false);
  const [highlight, setHighlight] = useState<{ html: string; loading: boolean }>({ html: '', loading: true });
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const trimmedCode = useMemo(() => normalizeCode(code), [code]);
  const codeLines = trimmedCode.split("\n");
  const totalLines = codeLines.length;
  const shouldShowCollapse = collapsible && totalLines > collapsedLines;

  // Compute visible code when collapsed
  const visibleCode =
    shouldShowCollapse && isCollapsed ? codeLines.slice(0, collapsedLines).join("\n") : trimmedCode;

  const highlightSet = useMemo(() => parseLineSpec(highlightLines), [highlightLines]);
  const addedSet = useMemo(() => parseLineSpec(addedLines), [addedLines]);
  const removedSet = useMemo(() => parseLineSpec(removedLines), [removedLines]);
  const hasDiff = addedSet.size > 0 || removedSet.size > 0;
  const resolvedCopyPlacement =
    copyPlacement === "auto" ? (filename ? "header" : "overlay") : copyPlacement;
  const shouldShowHeaderCopy = showCopy && !persistentCopy && resolvedCopyPlacement === "header";
  const shouldShowOverlayCopy = showCopy && !persistentCopy && resolvedCopyPlacement === "overlay";
  const shouldRenderHeader = Boolean(filename) || shouldShowHeaderCopy;

  // Apply syntax highlighting
  useEffect(() => {
    let cancelled = false;
    setHighlight((prev) => ({ ...prev, loading: true }));

    const run = async () => {
      await loadShikiDeps();

      const fallbackHtml = `<pre class="shiki"><code>${escapeHtml(visibleCode)}</code></pre>`;

      if (_shikiFailed || !_codeToHtml) {
        if (_shikiFailed && process.env.NODE_ENV === "development") {
          console.warn(
            "[@fragments-sdk/ui] CodeBlock: shiki is not installed. " +
              "Install it with: npm install shiki"
          );
        }
        return fallbackHtml;
      }

      try {
        const resolvedLang = LANGUAGE_ALIASES[language] || language;
        const html = await _codeToHtml(visibleCode, { lang: resolvedLang, theme });
        return processShikiHtml(html, {
          showLineNumbers,
          startLineNumber,
          highlightLines: highlightSet,
          addedLines: addedSet,
          removedLines: removedSet,
        });
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Syntax highlighting failed:", err);
        }
        return fallbackHtml;
      }
    };

    run().then((html) => {
      if (!cancelled) {
        setHighlight({ html, loading: false });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    visibleCode,
    language,
    theme,
    showLineNumbers,
    startLineNumber,
    highlightSet,
    addedSet,
    removedSet,
  ]);

  const handleCopy = useCallback(async () => {
    try {
      // Always copy the full code, even when collapsed
      await navigator.clipboard.writeText(trimmedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to copy:", err);
      }
    }
  }, [trimmedCode, onCopy]);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const classNames = [
    styles.container,
    showLineNumbers && styles.withLineNumbers,
    hasDiff && styles.withDiff,
    wordWrap && styles.wordWrap,
    compact && styles.compact,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const wrapperClasses = [
    styles.wrapper,
    persistentCopy && styles.persistentCopyWrapper,
    shouldShowOverlayCopy && styles.withCopyOverlay,
  ]
    .filter(Boolean)
    .join(" ");

  const codeContainerStyle: React.CSSProperties = maxHeight ? { maxHeight, overflow: "auto" } : {};

  return (
    <div ref={ref} {...htmlProps} className={classNames} data-theme="dark">
      {title && <div className={styles.title}>{title}</div>}
      <div className={wrapperClasses}>
        {shouldRenderHeader && (
          <div className={styles.header}>
            <span className={styles.filename}>{filename ?? ""}</span>
            {shouldShowHeaderCopy && (
              <button
                type="button"
                onClick={handleCopy}
                className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
                aria-label={copied ? "Copied!" : "Copy code"}
              >
                {copied ? (
                  <CheckIcon className={styles.icon} />
                ) : (
                  <CopyIcon className={styles.icon} />
                )}
              </button>
            )}
          </div>
        )}
        {shouldShowOverlayCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className={`${styles.copyButton} ${styles.copyOverlay} ${copied ? styles.copied : ""}`}
            aria-label={copied ? "Copied!" : "Copy code"}
          >
            {copied ? <CheckIcon className={styles.icon} /> : <CopyIcon className={styles.icon} />}
          </button>
        )}
        {highlight.loading ? (
          <div className={styles.loading} style={codeContainerStyle}>
            <pre>
              <code>{visibleCode}</code>
            </pre>
          </div>
        ) : (
          <div
            className={styles.codeContainer}
            style={codeContainerStyle}
            dangerouslySetInnerHTML={{ __html: highlight.html }}
          />
        )}
        {persistentCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className={`${styles.persistentCopy} ${styles.copyButton} ${styles.copyOverlay} ${copied ? styles.copied : ""}`}
            aria-label={copied ? "Copied!" : "Copy code"}
          >
            {copied ? <CheckIcon className={styles.icon} /> : <CopyIcon className={styles.icon} />}
          </button>
        )}
        {shouldShowCollapse && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className={styles.collapseButton}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Expand code" : "Collapse code"}
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
});

// ============================================
// Tabbed Code Block
// ============================================

export interface CodeBlockTab {
  /** Label shown in the tab */
  label: string;
  /** Stable tab value (defaults to label) */
  value?: string;
  /** Code string to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: CodeBlockLanguage;
}

export interface TabbedCodeBlockProps {
  /** Array of code tabs */
  tabs: CodeBlockTab[];
  /** Default selected tab (by tab value, or label when value is omitted) */
  defaultTab?: string;
  /** Controlled selected tab value */
  value?: string;
  /** Called when the selected tab changes */
  onValueChange?: (value: string) => void;
  /** Show copy button */
  showCopy?: boolean;
  /** Placement of copy button when not using persistent copy */
  copyPlacement?: CodeBlockCopyPlacement;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Syntax highlighting theme (applies to all tabs) */
  theme?: CodeBlockTheme;
  /** Tab list visual style */
  tabsVariant?: "underline" | "pills";
  /** Enable word wrapping for long lines */
  wordWrap?: boolean;
  /** Maximum height in pixels (enables scrolling) */
  maxHeight?: number;
  /** Additional class name */
  className?: string;
  /** Callback fired when a tab's copy button is clicked. Receives the tab label. */
  onCopy?: (tabLabel: string) => void;
}

function TabbedCodeBlock({
  tabs,
  defaultTab,
  value,
  onValueChange,
  showCopy = true,
  copyPlacement = "auto",
  showLineNumbers = false,
  theme,
  tabsVariant = "pills",
  wordWrap,
  maxHeight,
  className,
  onCopy,
}: TabbedCodeBlockProps) {
  const defaultValue = defaultTab || tabs[0]?.value || tabs[0]?.label || "";

  return (
    <div className={className}>
      <TabsRoot defaultValue={defaultValue} value={value} onValueChange={onValueChange}>
        <TabsList variant={tabsVariant}>
          {tabs.map((tab, index) => {
            const tabValue = tab.value ?? tab.label;
            return (
            <Tab key={`${tabValue}-${index}`} value={tabValue}>
              {tab.label}
            </Tab>
            );
          })}
        </TabsList>
        {tabs.map((tab, index) => {
          const tabValue = tab.value ?? tab.label;
          return (
          <TabsPanel key={`${tabValue}-panel-${index}`} value={tabValue} flush className={styles.tabbedPanel}>
            <CodeBlockBase
              code={tab.code}
              language={tab.language}
              theme={theme}
              showCopy={showCopy}
              copyPlacement={copyPlacement}
              showLineNumbers={showLineNumbers}
              wordWrap={wordWrap}
              maxHeight={maxHeight}
              onCopy={onCopy ? () => onCopy(tab.label) : undefined}
            />
          </TabsPanel>
          );
        })}
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
