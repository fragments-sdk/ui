"use client";

import * as React from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { CaretDown, CaretUp, Check, Copy } from "@phosphor-icons/react";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { Tabs } from "../Tabs";
import { FUI_CSS_VARIABLES_THEME } from "./css-variables-theme";
import styles from "./CodeBlock.module.scss";
import { isDevelopmentBuild, isProductionBuild } from "../../utils/env";

// ============================================
// Lazy-loaded dependency (shiki)
// ============================================

type ShikiTheme = typeof FUI_CSS_VARIABLES_THEME;
type CodeToHtml = (code: string, options: { lang: string; theme: ShikiTheme }) => Promise<string>;

let _codeToHtml: CodeToHtml | null = null;
let _shikiLoadPromise: Promise<void> | null = null;
let _shikiFailed = false;

async function loadShikiDeps() {
  if (_codeToHtml) return;
  if (_shikiFailed) return;
  if (!_shikiLoadPromise) {
    _shikiLoadPromise = (async () => {
      try {
        const shiki = await import("shiki");
        _codeToHtml = shiki.codeToHtml as unknown as CodeToHtml;
      } catch {
        _shikiFailed = true;
      }
    })();
  }
  await _shikiLoadPromise;
}

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

/** One step of the code type: `md` for documents and replies, `sm` for dense panels. */
export type CodeBlockSize = "sm" | "md";

export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Code string to display */
  code: string;
  /** Programming language for syntax highlighting. @default "tsx" */
  language?: CodeBlockLanguage;
  /** A file name or label, shown in a header inside the block beside the copy action. */
  title?: React.ReactNode;
  /** Code type step. @default "md" */
  size?: CodeBlockSize;
  /** Show the copy action. @default true */
  showCopy?: boolean;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Starting line number. @default 1 */
  startLineNumber?: number;
  /** Highlight specific lines (e.g., [1, 3, '5-7']) */
  highlightLines?: (number | string)[];
  /** Lines marked as added in diff view */
  addedLines?: (number | string)[];
  /** Lines marked as removed in diff view */
  removedLines?: (number | string)[];
  /** Wrap long lines instead of scrolling sideways */
  wordWrap?: boolean;
  /** Maximum height in pixels; the code scrolls past it */
  maxHeight?: number;
  /** Fold long code to `collapsedLines` with a "Show N more lines" bar */
  collapsible?: boolean;
  /** Start folded (only with `collapsible`) */
  defaultCollapsed?: boolean;
  /** Lines shown while folded. @default 5 */
  collapsedLines?: number;
  /** Called after the code reaches the clipboard */
  onCopy?: () => void;
}

type CopyState = "idle" | "copied" | "failed";

/** How long the copy result stays on screen. */
const COPY_RESULT_MS = 2000;

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
 * Languages where leading whitespace carries meaning, so the first line has to
 * take part in the common-indent calculation like any other.
 */
const INDENTATION_SIGNIFICANT_LANGUAGES = new Set<CodeBlockLanguage>([
  "yaml",
  "yml",
  "json",
  "python",
  "py",
]);

/**
 * Normalize indentation while handling JSX where first line is already at column 0.
 *
 * The JSX case this exists for is a snippet authored inline, where the body
 * carries the source file's indentation but the opening tag does not:
 *
 *     code={`<Card>
 *           <Card.Header>Title</Card.Header>
 *         </Card>`}
 *
 * Excluding line 0 from the minimum is what renders that correctly. But
 * `normalizeCode` trims first, so line 0 has always had its indentation removed
 * by the time we get here — which means the same rule strips one real level off
 * any snippet with a single root and an indented body:
 *
 *     job:              job:
 *       image: node  →  image: node   (now a sibling key, not a child)
 *
 * For YAML, JSON and Python that is not cosmetic: the rendered snippet is
 * invalid, and copying it gives you a broken file. Those languages count line 0,
 * which is plain dedent. Everything else keeps the JSX-friendly heuristic.
 */
function normalizeIndentation(str: string, language: CodeBlockLanguage): string {
  const lines = str.split("\n");
  if (lines.length <= 1) return str;

  const firstLineCounts = INDENTATION_SIGNIFICANT_LANGUAGES.has(language);
  let minIndent = Infinity;
  const firstLineIndent = lines[0].match(/^(\s*)/)?.[1].length ?? 0;

  for (let i = firstLineCounts ? 0 : 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim().length === 0) continue;
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
    minIndent = Math.min(minIndent, indent);
  }

  if (!firstLineCounts && firstLineIndent > 0) {
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

function normalizeCode(code: string, language: CodeBlockLanguage): string {
  const trimmed = code.trim();
  if (trimmed.length === 0) return "";

  const normalized = normalizeIndentation(trimmed, language);
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

    const lineNumHtml =
      showLineNumbers || hasDiff
        ? `${showLineNumbers ? `<span class="line-number">${displayLineNum}</span>` : ""}${
            hasDiff ? `<span class="diff-marker">${diffMarker}</span>` : ""
          }`
        : "";

    // Shiki already wraps each row in <span class="line">; merge into that span
    // instead of nesting a second .line (which breaks the inline-block row layout).
    if (/^<span class="line([^"]*)">/.test(line)) {
      return line.replace(
        /^<span class="line([^"]*)">/,
        `<span class="${lineClass}$1">${lineNumHtml}`
      );
    }
    return `<span class="${lineClass}">${lineNumHtml}${line}</span>`;
  });

  // Reconstruct the HTML
  return html.replace(/<code[^>]*>[\s\S]*?<\/code>/, `<code>${processedLines.join("\n")}</code>`);
}

const CodeBlockBase = React.forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  {
    code,
    language = "tsx",
    title,
    size = "md",
    showCopy = true,
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
    onCopy,
    className,
    style,
    ...htmlProps
  },
  ref
) {
  const codeId = React.useId();
  const [copyState, setCopyState] = useState<CopyState>("idle");
  // Bumped on every copy, so a second copy while the words show restarts their clock.
  const [copyRun, setCopyRun] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [highlighted, setHighlighted] = useState<{ key: string; html: string } | null>(null);

  const trimmedCode = useMemo(() => normalizeCode(code, language), [code, language]);
  const codeLines = trimmedCode.split("\n");
  const totalLines = codeLines.length;
  const shouldShowCollapse = collapsible && totalLines > collapsedLines;
  const hiddenLines = totalLines - collapsedLines;

  // Folded code shows only its first lines; copy always takes the whole thing.
  const visibleCode =
    shouldShowCollapse && isCollapsed ? codeLines.slice(0, collapsedLines).join("\n") : trimmedCode;

  const highlightSet = useMemo(() => parseLineSpec(highlightLines), [highlightLines]);
  const addedSet = useMemo(() => parseLineSpec(addedLines), [addedLines]);
  const removedSet = useMemo(() => parseLineSpec(removedLines), [removedLines]);
  const hasDiff = addedSet.size > 0 || removedSet.size > 0;

  // Everything that changes the highlighted markup; a stale result never shows.
  const highlightKey = [
    language,
    showLineNumbers,
    startLineNumber,
    [...highlightSet].join(","),
    [...addedSet].join(","),
    [...removedSet].join(","),
    visibleCode,
  ].join("|");

  // Plain code until the highlighter resolves: same text, same box, no shift.
  const plainHtml = useMemo(
    () => `<pre><code>${escapeHtml(visibleCode)}</code></pre>`,
    [visibleCode]
  );
  const isHighlighted = highlighted?.key === highlightKey;
  const html = isHighlighted ? highlighted.html : plainHtml;

  useEffect(() => {
    let cancelled = false;

    const run = async (): Promise<string | null> => {
      await loadShikiDeps();
      if (_shikiFailed || !_codeToHtml) {
        if (_shikiFailed && isDevelopmentBuild()) {
          console.warn(
            "[@usefragments/ui] CodeBlock: shiki is not installed. " +
              "Install it with: npm install shiki"
          );
        }
        return null;
      }
      try {
        const resolvedLang = LANGUAGE_ALIASES[language] || language;
        const markup = await _codeToHtml(visibleCode, {
          lang: resolvedLang,
          theme: FUI_CSS_VARIABLES_THEME,
        });
        return processShikiHtml(markup, {
          showLineNumbers,
          startLineNumber,
          highlightLines: highlightSet,
          addedLines: addedSet,
          removedLines: removedSet,
        });
      } catch (err) {
        if (!isProductionBuild()) {
          console.error("Syntax highlighting failed:", err);
        }
        return null;
      }
    };

    void run().then((markup) => {
      if (!cancelled && markup !== null) {
        setHighlighted({ key: highlightKey, html: markup });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    highlightKey,
    visibleCode,
    language,
    showLineNumbers,
    startLineNumber,
    highlightSet,
    addedSet,
    removedSet,
  ]);

  // The result clears itself after COPY_RESULT_MS. The timer lives in an effect so it comes
  // back whenever the effects reconnect (hidden then shown again, or a development remount);
  // a timer set in the click handler would be cleared there and leave the words up for good.
  useEffect(() => {
    if (copyState === "idle") return;
    const timer = window.setTimeout(() => setCopyState("idle"), COPY_RESULT_MS);
    return () => window.clearTimeout(timer);
  }, [copyState, copyRun]);

  const handleCopy = useCallback(async () => {
    let result: CopyState = "copied";
    try {
      await navigator.clipboard.writeText(trimmedCode);
      onCopy?.();
    } catch {
      // The refusal is said on screen ("Couldn’t copy"), so nothing goes to the console.
      result = "failed";
    }
    setCopyState(result);
    setCopyRun((run) => run + 1);
  }, [trimmedCode, onCopy]);

  const classNames = [
    styles.root,
    showLineNumbers && styles.withLineNumbers,
    hasDiff && styles.withDiff,
    wordWrap && styles.wordWrap,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const copyResult =
    copyState === "copied" ? "Copied" : copyState === "failed" ? "Couldn’t copy" : "";

  const copy = showCopy ? (
    <div className={styles.copy} data-slot="code-block-copy">
      <span className={styles.copyStatus} role="status" data-state={copyState}>
        {copyResult}
      </span>
      <IconButton variant="ghost" size="sm" aria-label="Copy code" onClick={handleCopy}>
        <Icon icon={copyState === "copied" ? Check : Copy} size="sm" />
      </IconButton>
    </div>
  ) : null;

  return (
    <div
      ref={ref}
      {...htmlProps}
      className={classNames}
      style={style}
      data-slot="code-block"
      data-language={language}
      data-size={size}
      data-copy={showCopy ? (title ? "header" : "overlay") : undefined}
      data-highlighted={isHighlighted ? "" : undefined}
    >
      {title ? (
        <div className={styles.header} data-slot="code-block-header">
          <span className={styles.title}>{title}</span>
          {copy}
        </div>
      ) : (
        copy
      )}
      <div
        id={codeId}
        className={styles.code}
        data-slot="code-block-code"
        role="region"
        aria-label={typeof title === "string" ? title : "Code"}
        tabIndex={0}
        style={maxHeight ? { maxBlockSize: maxHeight } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {shouldShowCollapse && (
        <button
          type="button"
          className={styles.collapse}
          aria-expanded={!isCollapsed}
          aria-controls={codeId}
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          <Icon icon={isCollapsed ? CaretDown : CaretUp} size="sm" />
          <span>
            {isCollapsed
              ? `Show ${hiddenLines} more ${hiddenLines === 1 ? "line" : "lines"}`
              : "Show less"}
          </span>
        </button>
      )}
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

export interface TabbedCodeBlockProps extends Pick<
  CodeBlockProps,
  | "size"
  | "showCopy"
  | "showLineNumbers"
  | "wordWrap"
  | "maxHeight"
  | "collapsible"
  | "defaultCollapsed"
  | "collapsedLines"
> {
  /** Array of code tabs */
  tabs: CodeBlockTab[];
  /** Default selected tab (by tab value, or label when value is omitted) */
  defaultTab?: string;
  /** Controlled selected tab value */
  value?: string;
  /** Called when the selected tab changes */
  onValueChange?: (value: string) => void;
  /** Additional class name */
  className?: string;
  /** Called after a tab's code reaches the clipboard. Receives the tab label. */
  onCopy?: (tabLabel: string) => void;
}

function TabbedCodeBlock({
  tabs,
  defaultTab,
  value,
  onValueChange,
  className,
  onCopy,
  ...blockProps
}: TabbedCodeBlockProps) {
  const defaultValue = defaultTab || tabs[0]?.value || tabs[0]?.label || "";

  return (
    <div className={className}>
      <Tabs defaultValue={defaultValue} value={value} onValueChange={onValueChange}>
        <Tabs.List>
          {tabs.map((tab, index) => {
            const tabValue = tab.value ?? tab.label;
            return (
              <Tabs.Tab key={`${tabValue}-${index}`} value={tabValue}>
                {tab.label}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
        {tabs.map((tab, index) => {
          const tabValue = tab.value ?? tab.label;
          return (
            <Tabs.Panel
              key={`${tabValue}-panel-${index}`}
              value={tabValue}
              className={styles.tabbedPanel}
            >
              <CodeBlockBase
                {...blockProps}
                code={tab.code}
                language={tab.language}
                onCopy={onCopy ? () => onCopy(tab.label) : undefined}
              />
            </Tabs.Panel>
          );
        })}
      </Tabs>
    </div>
  );
}

// ============================================
// Export compound component
// ============================================

export const CodeBlock = Object.assign(CodeBlockBase, {
  Tabbed: TabbedCodeBlock,
});
