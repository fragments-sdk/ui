import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import type * as React from "react";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { isComposingEnter } from "./isComposingEnter";

const SRC = resolve(process.cwd(), "src");
const HELPER = "isComposingEnter";
const ENTER_KEY = /^(numpad)?enter$/i;
const KEY_CODE_PROPERTIES = new Set(["keyCode", "which", "charCode"]);
const EQUALITY_OPERATORS = new Set([
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
]);

function keyEvent(init: KeyboardEventInit & { keyCode?: number }): KeyboardEvent {
  const event = new KeyboardEvent("keydown", init);
  if (init.keyCode !== undefined) {
    Object.defineProperty(event, "keyCode", { value: init.keyCode });
  }
  return event;
}

describe("isComposingEnter", () => {
  it("is true for the Enter that commits an IME candidate", () => {
    expect(isComposingEnter(keyEvent({ key: "Enter", isComposing: true }))).toBe(true);
  });

  it("is true for the keyCode 229 keydown Safari sends after compositionend", () => {
    expect(isComposingEnter(keyEvent({ key: "Enter", keyCode: 229 }))).toBe(true);
  });

  it("is false for a plain Enter", () => {
    expect(isComposingEnter(keyEvent({ key: "Enter", keyCode: 13 }))).toBe(false);
    expect(isComposingEnter(keyEvent({ key: "Enter" }))).toBe(false);
  });

  it("reads the native event behind a React keyboard event", () => {
    const composing = { nativeEvent: keyEvent({ key: "Enter", isComposing: true }) };
    const plain = { nativeEvent: keyEvent({ key: "Enter" }) };
    expect(isComposingEnter(composing as unknown as React.KeyboardEvent)).toBe(true);
    expect(isComposingEnter(plain as unknown as React.KeyboardEvent)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Scan: every Enter key check in src/** goes through the helper.
// ---------------------------------------------------------------------------

type EnterCheck = { file: string; line: number; text: string };
type ScanResult = { checks: EnterCheck[]; violations: EnterCheck[] };

function isFunctionLike(node: ts.Node): node is ts.SignatureDeclaration {
  return (
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node)
  );
}

function callsHelper(node: ts.Node): boolean {
  let found = false;
  const visit = (child: ts.Node) => {
    if (found) return;
    if (
      ts.isCallExpression(child) &&
      ts.isIdentifier(child.expression) &&
      child.expression.text === HELPER
    ) {
      found = true;
      return;
    }
    ts.forEachChild(child, visit);
  };
  visit(node);
  return found;
}

function isKeyCodeAccess(node: ts.Expression): boolean {
  return ts.isPropertyAccessExpression(node) && KEY_CODE_PROPERTIES.has(node.name.text);
}

/** A string or keyCode literal used to test which key was pressed. */
function isEnterKeyCheck(node: ts.Node): boolean {
  const parent = node.parent;
  if (!parent) return false;

  if (ts.isStringLiteralLike(node) && ENTER_KEY.test(node.text)) {
    if (ts.isBinaryExpression(parent)) return EQUALITY_OPERATORS.has(parent.operatorToken.kind);
    if (ts.isCaseClause(parent)) return parent.expression === node;
    // ["Enter", " "].includes(event.key), new Set(["Enter"])
    return ts.isArrayLiteralExpression(parent);
  }

  if (ts.isNumericLiteral(node) && node.text === "13" && ts.isBinaryExpression(parent)) {
    if (!EQUALITY_OPERATORS.has(parent.operatorToken.kind)) return false;
    const other = parent.left === node ? parent.right : parent.left;
    return isKeyCodeAccess(other);
  }

  return false;
}

function scanSource(file: string, text: string): ScanResult {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const result: ScanResult = { checks: [], violations: [] };

  const visit = (node: ts.Node) => {
    if (isEnterKeyCheck(node)) {
      let scope: ts.Node | undefined = node.parent;
      while (scope && !isFunctionLike(scope)) scope = scope.parent;
      const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
      const entry = { file, line: line + 1, text: node.parent.getText(source).slice(0, 80) };
      result.checks.push(entry);
      if (!scope || !callsHelper(scope)) result.violations.push(entry);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return result;
}

function sourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "test") continue;
      files.push(...sourceFiles(path));
    } else if (/\.tsx?$/.test(entry.name) && !/\.(test|d)\.tsx?$/.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}

describe("Enter key checks in src", () => {
  const scans = sourceFiles(SRC).map((path) =>
    scanSource(relative(SRC, path), readFileSync(path, "utf8"))
  );
  const checks = scans.flatMap((scan) => scan.checks);
  const violations = scans.flatMap((scan) => scan.violations);

  it("finds the known Enter handlers, so the scan is not vacuous", () => {
    const files = new Set(checks.map((check) => check.file));
    expect(files).toContain(join("components", "Prompt", "index.tsx"));
    expect(files).toContain(join("components", "Command", "index.tsx"));
  });

  it("guards every Enter key check with isComposingEnter", () => {
    expect(violations.map((v) => `${v.file}:${v.line} ${v.text}`)).toEqual([]);
  });

  it("flags an unguarded handler and accepts a guarded one", () => {
    const unguarded = scanSource(
      "fixture.tsx",
      `const a = (e) => { if (e.key === "Enter") submit(); };
       const b = (e) => { switch (e.key) { case "Enter": submit(); } };
       const c = (e) => { if (["Enter", " "].includes(e.key)) submit(); };
       const d = (e) => { if (e.keyCode === 13) submit(); };`
    );
    expect(unguarded.violations).toHaveLength(4);

    const guarded = scanSource(
      "fixture.tsx",
      `const a = (e) => { if (e.key === "Enter" && !isComposingEnter(e)) submit(); };
       const shortcuts = { submit: { key: "Enter", label: "Enter" } };`
    );
    expect(guarded.checks).toHaveLength(1);
    expect(guarded.violations).toEqual([]);
  });
});
