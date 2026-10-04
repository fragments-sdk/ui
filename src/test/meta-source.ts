import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import scss from "postcss-scss";
import valueParser from "postcss-value-parser";
import ts from "typescript";

export function componentStyleModules(directory: string): string[] {
  const styles = new Set<string>();
  for (const entry of readdirSync(directory)) {
    if (!/\.[jt]sx?$/.test(entry) || /\.(test|states|stories|fragment)\./.test(entry)) continue;
    const file = join(directory, entry);
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest);
    for (const statement of source.statements) {
      if (
        ts.isImportDeclaration(statement) &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.moduleSpecifier.text.endsWith(".module.scss")
      ) {
        const path = resolve(dirname(file), statement.moduleSpecifier.text);
        if (dirname(path) !== resolve(directory))
          throw new Error(`Non-local style module: ${path}`);
        styles.add(path);
      }
    }
  }
  return [...styles].sort();
}

/** Parse declarations rather than comments, declarations of vars, or string substrings. */
export function cssVariableReads(source: string): string[] {
  const reads = new Set<string>();
  scss.parse(source).walkDecls((declaration) => {
    valueParser(declaration.value).walk((node) => {
      if (node.type !== "function" || node.value !== "var") return;
      const argument = node.nodes.find((child) => child.type === "word");
      if (argument?.type === "word" && /^--fui-[\w-]+$/.test(argument.value)) {
        reads.add(argument.value);
      }
    });
  });
  return [...reads].sort();
}

export function componentCssVariables(directory: string): string[] {
  return [
    ...new Set(
      componentStyleModules(directory).flatMap((file) =>
        cssVariableReads(readFileSync(file, "utf8"))
      )
    ),
  ].sort();
}

/** Attribute names declared in runtime JSX, excluding fixture-only attributes. */
export function componentAttributeNames(directory: string): string[] {
  const names = new Set<string>();
  for (const entry of readdirSync(directory)) {
    if (!entry.endsWith(".tsx") || /\.(test|states|stories|fragment)\./.test(entry)) continue;
    const file = join(directory, entry);
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest);
    const visit = (node: ts.Node): void => {
      if (ts.isJsxAttribute(node) && /^(data-|aria-|role$)/.test(node.name.getText(source))) {
        names.add(node.name.getText(source));
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return [...names].sort();
}
