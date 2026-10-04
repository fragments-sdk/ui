import { readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";

import ts from "typescript";

export interface DesignPropViolation {
  component: string;
  part: string;
  prop: string;
  type: string;
  reason: string;
}

export interface DesignPropAudit {
  declarations: number;
  publicProps: number;
  designProps: number;
  violations: DesignPropViolation[];
}

// These names describe presentation. Native HTML properties are considered only
// when a component authors its own declaration; data, events and tag selection
// are outside this audit.
const DESIGN_AXES = new Set([
  "align",
  "alignItems",
  "alignSelf",
  "appearance",
  "aspectRatio",
  "border",
  "bordered",
  "collapseBelow",
  "colSpan",
  "color",
  "controlSize",
  "density",
  "direction",
  "dot",
  "fill",
  "fullWidth",
  "gap",
  "height",
  "inset",
  "justify",
  "justifyContent",
  "justifyItems",
  "layout",
  "length",
  "lineClamp",
  "marker",
  "maxHeight",
  "maxRows",
  "maxVisibleItems",
  "maxWidth",
  "measure",
  "minChildWidth",
  "minHeight",
  "minRows",
  "minWidth",
  "objectFit",
  "orientation",
  "padding",
  "paddingX",
  "paddingY",
  "placement",
  "plane",
  "position",
  "positionMethod",
  "radius",
  "resize",
  "rowSpan",
  "rows",
  "shape",
  "side",
  "size",
  "strong",
  "tabularNums",
  "thumbAlignment",
  "tone",
  "truncate",
  "variant",
  "weight",
  "width",
  "wrap",
]);

const COMPONENT_AXES: Record<string, readonly string[]> = {
  Grid: ["columns", "subgrid"],
  Header: ["elevatedOnScroll"],
  Skeleton: ["lines", "lastLineWidth"],
  Table: ["columns", "colSpan", "rows"],
  Text: ["type"],
  Theme: [
    "brand",
    "neutral",
    "font",
    "scale",
    "pressScale",
    "primaryChrome",
    "mode",
    "defaultMode",
    "danger",
    "success",
    "warning",
    "info",
  ],
};

export function isDesignProp(component: string, prop: string): boolean {
  return DESIGN_AXES.has(prop) || (COMPONENT_AXES[component]?.includes(prop) ?? false);
}

type Manifest = { exports: Record<string, string | object> };

function sourceEntrypoints(packageRoot: string): string[] {
  const manifest = JSON.parse(
    readFileSync(resolve(packageRoot, "package.json"), "utf8")
  ) as Manifest;
  return [...new Set(Object.values(manifest.exports))]
    .filter((path): path is string => typeof path === "string" && /\.tsx?$/.test(path))
    .map((path) => resolve(packageRoot, path));
}

function declarationPath(source: string, packageRoot: string, outputRoot: string): string {
  return resolve(outputRoot, relative(resolve(packageRoot, "src"), source)).replace(
    /\.tsx?$/,
    ".d.ts"
  );
}

// The emitting Program is scoped to this function and released before creating
// the declaration checker. Nothing reads or writes a possibly stale dist tree.
function emitDeclarations(packageRoot: string, entrypoints: string[], outputRoot: string) {
  const configPath = resolve(packageRoot, "tsconfig.build.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error)
    throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, packageRoot);
  if (parsed.errors.length) {
    throw new Error(
      parsed.errors
        .map((error) => ts.flattenDiagnosticMessageText(error.messageText, "\n"))
        .join("\n")
    );
  }
  const options: ts.CompilerOptions = {
    ...parsed.options,
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
    declarationMap: false,
    rootDir: resolve(packageRoot, "src"),
    outDir: outputRoot,
    skipLibCheck: true,
  };
  const declarations = new Map<string, string>();
  const program = ts.createProgram(
    [...entrypoints, resolve(packageRoot, "src/scss.d.ts")],
    options
  );
  const result = program.emit(undefined, (path, text) => declarations.set(resolve(path), text));
  const missingDeclarations = program
    .getSourceFiles()
    .filter(
      (source) =>
        !source.isDeclarationFile &&
        source.fileName.startsWith(resolve(packageRoot, "src") + sep) &&
        /\.tsx?$/.test(source.fileName)
    )
    .filter(
      (source) => !declarations.has(declarationPath(source.fileName, packageRoot, outputRoot))
    );
  // Imported JSON has no declaration output and can set emitSkipped. Require
  // every package TypeScript module instead of treating that flag as failure.
  if (missingDeclarations.length || result.diagnostics.length) {
    throw new Error(
      result.diagnostics
        .map((error) => ts.flattenDiagnosticMessageText(error.messageText, "\n"))
        .join("\n") ||
        `Missing public declarations: ${missingDeclarations.map((source) => relative(packageRoot, source.fileName)).join(", ")}`
    );
  }
  return { declarations, options };
}

function declarationProgram(
  packageRoot: string,
  entrypoints: string[],
  outputRoot: string,
  declarations: Map<string, string>,
  emitOptions: ts.CompilerOptions
): ts.Program {
  const options = {
    ...emitOptions,
    rootDir: outputRoot,
    noEmit: true,
    emitDeclarationOnly: false,
  };
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile;
  const fileExists = host.fileExists;
  const getSourceFile = host.getSourceFile;
  const directoryExists = host.directoryExists;
  const sourcePath = (path: string) => {
    const absolute = resolve(path);
    return absolute.startsWith(outputRoot + sep)
      ? resolve(packageRoot, "src", relative(outputRoot, absolute))
      : absolute;
  };
  const supportFilePath = (path: string) =>
    /(?:\.json|\.d\.ts)$/.test(path) ? sourcePath(path) : path;
  const directories = new Set<string>();
  for (const path of declarations.keys()) {
    for (
      let directory = dirname(path);
      directory.startsWith(outputRoot);
      directory = dirname(directory)
    ) {
      directories.add(directory);
    }
  }
  host.readFile = (path) => declarations.get(resolve(path)) ?? readFile(supportFilePath(path));
  host.fileExists = (path) => declarations.has(resolve(path)) || fileExists(supportFilePath(path));
  host.directoryExists = (path) =>
    directories.has(resolve(path)) || (directoryExists?.(sourcePath(path)) ?? false);
  host.getSourceFile = (path, languageVersion, onError, shouldCreateNewSourceFile) => {
    const text =
      declarations.get(resolve(path)) ??
      (supportFilePath(path) !== path ? readFile(supportFilePath(path)) : undefined);
    return text === undefined
      ? getSourceFile(path, languageVersion, onError, shouldCreateNewSourceFile)
      : ts.createSourceFile(path, text, languageVersion, true);
  };
  const program = ts.createProgram(
    [
      ...entrypoints.map((path) => declarationPath(path, packageRoot, outputRoot)),
      resolve(packageRoot, "src/scss.d.ts"),
    ],
    options,
    host
  );
  const diagnostics = [
    ...program.getOptionsDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...program.getSemanticDiagnostics(),
  ];
  if (diagnostics.length) {
    throw new Error(
      diagnostics
        .map((error) => ts.flattenDiagnosticMessageText(error.messageText, "\n"))
        .join("\n")
    );
  }
  // skipLibCheck intentionally omits declaration semantic diagnostics. Resolve
  // their imports explicitly so a broken virtual host cannot create any types.
  const unresolved: string[] = [];
  for (const source of program.getSourceFiles()) {
    if (!declarations.has(resolve(source.fileName))) continue;
    const imports = new Set<string>();
    const visit = (node: ts.Node) => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        imports.add(node.moduleSpecifier.text);
      } else if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      ) {
        imports.add(node.argument.literal.text);
      } else if (
        ts.isExternalModuleReference(node) &&
        node.expression &&
        ts.isStringLiteral(node.expression)
      ) {
        imports.add(node.expression.text);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    for (const name of imports) {
      if (!ts.resolveModuleName(name, source.fileName, options, host).resolvedModule) {
        unresolved.push(`${relative(outputRoot, source.fileName)}: ${name}`);
      }
    }
  }
  if (unresolved.length)
    throw new Error(`Unresolved public declaration imports:\n${unresolved.join("\n")}`);
  return program;
}

function componentOf(node: ts.Node, outputRoot: string): string | undefined {
  const path = relative(outputRoot, node.getSourceFile().fileName).split(sep);
  return path[0] === "components" ? path[1] : undefined;
}

function literalValues(type: ts.Type, checker: ts.TypeChecker) {
  const values = (type.isUnion() ? type.types : [type]).filter(
    (value) => !(value.flags & ts.TypeFlags.Undefined)
  );
  const nonLiteral = values.filter(
    (value) =>
      !(
        value.flags &
        (ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral | ts.TypeFlags.BooleanLiteral)
      )
  );
  const names = values
    .map((value) => checker.typeToString(value, undefined, ts.TypeFormatFlags.NoTruncation))
    .sort();
  const reason = nonLiteral.length
    ? `non-literal value${nonLiteral.length === 1 ? "" : "s"}: ${nonLiteral
        .map((value) => checker.typeToString(value, undefined, ts.TypeFormatFlags.NoTruncation))
        .sort()
        .join(", ")}`
    : values.length < 2 || values.length > 12
      ? `${values.length} literal value${values.length === 1 ? "" : "s"}; expected 2–12`
      : undefined;
  return { type: names.join(" | "), reason };
}

export function auditPublicDesignProps(packageRoot: string): DesignPropAudit {
  const entrypoints = sourceEntrypoints(packageRoot);
  const outputRoot = resolve(packageRoot, ".design-prop-declarations");
  const { declarations, options } = emitDeclarations(packageRoot, entrypoints, outputRoot);
  const program = declarationProgram(packageRoot, entrypoints, outputRoot, declarations, options);
  const checker = program.getTypeChecker();
  const violations: DesignPropViolation[] = [];
  const seenProps = new Set<string>();
  const coveredFields = new Set<string>();
  const seenRuntimeTypes = new Set<ts.Type>();
  let publicProps = 0;
  let designProps = 0;

  const fieldKey = (component: string, field: ts.Symbol, type: string) =>
    `${component}:${field.declarations?.map((node) => `${node.getSourceFile().fileName}:${node.pos}`).join(",")}:${field.name}:${type}`;

  function inspectProps(component: string, part: string, type: ts.Type, runtime = false) {
    const key = `${component}:${part}`;
    if (seenProps.has(key)) return;
    seenProps.add(key);
    publicProps++;
    for (const field of checker.getPropertiesOfType(type)) {
      if (!isDesignProp(component, field.name)) continue;
      const authored = field.declarations?.find(
        (node) => ts.isPropertySignature(node) && componentOf(node, outputRoot)
      );
      if (!authored) continue;
      const value = literalValues(checker.getTypeOfSymbolAtLocation(field, authored), checker);
      const identity = fieldKey(component, field, value.type);
      if (runtime && coveredFields.has(identity)) continue;
      coveredFields.add(identity);
      designProps++;
      if (value.reason) {
        violations.push({
          component,
          part,
          prop: field.name,
          type: value.type,
          reason: value.reason,
        });
      }
    }
  }

  function inspectRuntime(component: string, part: string, type: ts.Type) {
    if (seenRuntimeTypes.has(type)) return;
    seenRuntimeTypes.add(type);
    for (const signature of checker.getSignaturesOfType(type, ts.SignatureKind.Call)) {
      const props = signature.parameters[0];
      const declaration = props?.valueDeclaration ?? props?.declarations?.[0];
      if (props && declaration) {
        inspectProps(component, part, checker.getTypeOfSymbolAtLocation(props, declaration), true);
      }
    }
    for (const field of checker.getPropertiesOfType(type)) {
      if (!/^[A-Z]/.test(field.name)) continue;
      const declaration = field.valueDeclaration ?? field.declarations?.[0];
      if (declaration) {
        inspectRuntime(
          component,
          `${part}.${field.name}`,
          checker.getTypeOfSymbolAtLocation(field, declaration)
        );
      }
    }
  }

  const publicExports: ts.Symbol[] = [];
  for (const entrypoint of entrypoints) {
    const source = program.getSourceFile(declarationPath(entrypoint, packageRoot, outputRoot));
    const module = source && checker.getSymbolAtLocation(source);
    if (!module)
      throw new Error(`Missing public declaration module for ${relative(packageRoot, entrypoint)}`);
    for (const exported of checker.getExportsOfModule(module)) {
      publicExports.push(
        exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
      );
    }
  }
  // First record explicit public Props types, then cover callable component
  // members whose part props have no separate named export.
  for (const exported of publicExports) {
    const declaration = exported.declarations?.[0];
    const component = declaration && componentOf(declaration, outputRoot);
    if (component && exported.name.endsWith("Props") && exported.flags & ts.SymbolFlags.Type) {
      inspectProps(component, exported.name, checker.getDeclaredTypeOfSymbol(exported));
    }
  }
  for (const exported of publicExports) {
    const declaration = exported.valueDeclaration ?? exported.declarations?.[0];
    const component = declaration && componentOf(declaration, outputRoot);
    if (
      component &&
      declaration &&
      /^[A-Z]/.test(exported.name) &&
      exported.flags & ts.SymbolFlags.Value
    ) {
      inspectRuntime(
        component,
        exported.name,
        checker.getTypeOfSymbolAtLocation(exported, declaration)
      );
    }
  }
  violations.sort((a, b) =>
    `${a.component}.${a.part}.${a.prop}`.localeCompare(`${b.component}.${b.part}.${b.prop}`)
  );
  return { declarations: declarations.size, publicProps, designProps, violations };
}

export function formatDesignPropViolations(violations: DesignPropViolation[]): string {
  const escape = (value: string) => value.replaceAll("|", "&#124;").replaceAll("\n", " ");
  return [
    "| Component | Public props or part | Prop | Resolved type | Reason |",
    "| --- | --- | --- | --- | --- |",
    ...violations.map(
      ({ component, part, prop, type, reason }) =>
        `| ${escape(component)} | ${escape(part)} | ${escape(prop)} | ${escape(type)} | ${escape(reason)} |`
    ),
  ].join("\n");
}
