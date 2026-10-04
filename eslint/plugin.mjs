/**
 * Source lint for the library's doctrine: copy rules (rule R7 Plain-Type) and client directives.
 * Rule IDs are `fui/<category>/<rule>`; `RULE-CHECKS.md` maps each one to the rule it enforces.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The banned words live in `src/vocabulary.json` (typed by `src/vocabulary.ts`); read as JSON so
// the lane runs on any supported Node, with no TypeScript loader. A path, not a URL object: test
// environments may replace the global URL.
const VOCABULARY = resolve(dirname(fileURLToPath(import.meta.url)), "../src/vocabulary.json");
/** The words `fui/conventions/banned-word` reports in shipped copy. */
export const { bannedCopyWords: BANNED_COPY_WORDS } = JSON.parse(readFileSync(VOCABULARY, "utf8"));

/** Last words of a name (attribute, property, variable, parameter) whose string value is copy. */
const COPY_WORDS = new Set(
  `alt announcement announcements caption captions copy description descriptions heading headings
  hint hints label labels legend message messages placeholder placeholders roledescription strings
  subtitle subtitles summary text texts title titles tooltip tooltips valuetext`.split(/\s+/)
);

/** True when a name ends in a copy word: `label`, `emptyMessage`, `STATUS_LABELS`, `aria-label`. */
function isCopyName(name) {
  const words = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/[\s_:-]+/);
  return COPY_WORDS.has(words.at(-1)?.toLowerCase() ?? "");
}

/** Two or more capitals with no lower case: an all-caps word, unless it is an acronym. */
const ALL_CAPS_WORD = /(?<![\p{L}\p{N}])\p{Lu}[\p{Lu}'-]*\p{Lu}(?![\p{L}\p{N}])/gu;

const ACRONYMS = new Set(
  `AI ALT AM API ARIA CD CI CLI CMD CPU CSS CSV CTRL DNS DOM ESC EU EUR FAQ GB GBP GIF GMT GPU HEX
  HSL HTML HTTP HTTPS ID IP ISO JPEG JPG JS JSON JSX KB LCH MB MCP MD MDX MIT NPM OK OKLCH OTP PDF PIN
  PM PNG PNPM PR QR RAM RGB RGBA RSS SDK SMS SQL SSH SSL SSO SVG TAB TB TLS TOML TS TSX TV UI UK URI
  URL US USD UTC UUID UX VAT XML YAML`.split(/\s+/)
);

/** `...` written as three dots in prose: after a word or space, not spread syntax or a range. */
const THREE_DOTS = /(^|[\p{L}\p{N}\s)])\.\.\.(?![\p{L}\p{N}_$.{[(])/u;

const WRAPPERS = new Set([
  "ConditionalExpression",
  "LogicalExpression",
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSNonNullExpression",
  "ParenthesizedExpression",
  "TemplateLiteral",
]);

function keyName(key) {
  if (!key) return null;
  if (key.type === "Identifier") return key.name;
  if (key.type === "Literal") return String(key.value);
  return null;
}

function attributeName(attribute) {
  const { name } = attribute;
  if (name.type === "JSXNamespacedName") return `${name.namespace.name}:${name.name.name}`;
  return name.name;
}

/** The name a value is bound to, if any: `label = …`, `{ label: … }`, `label="…"`. */
function bindingName(node) {
  const parent = node.parent;
  if (!parent) return null;
  if (parent.type === "Property" && parent.value === node) return keyName(parent.key);
  if (parent.type === "AssignmentPattern" && parent.right === node) {
    return parent.left.type === "Identifier" ? parent.left.name : null;
  }
  if (parent.type === "VariableDeclarator" && parent.init === node) {
    return parent.id.type === "Identifier" ? parent.id.name : null;
  }
  if (parent.type === "JSXAttribute") return attributeName(parent);
  if (parent.type === "JSXExpressionContainer" && parent.parent?.type === "JSXAttribute") {
    return attributeName(parent.parent);
  }
  if (parent.type === "TSAsExpression" || parent.type === "TSSatisfiesExpression") {
    return bindingName(parent);
  }
  return null;
}

/** True when a string node is shipped copy: JSX text, a copy attribute, or a copy-named binding. */
export function isCopy(node) {
  let current = node;
  while (current.parent && WRAPPERS.has(current.parent.type)) {
    if (current.parent.type === "ConditionalExpression" && current.parent.test === current) {
      return false;
    }
    current = current.parent;
  }
  const parent = current.parent;
  if (!parent) return false;
  if (
    parent.type === "JSXExpressionContainer" &&
    (parent.parent?.type === "JSXElement" || parent.parent?.type === "JSXFragment")
  ) {
    return true;
  }
  const name = bindingName(current);
  if (name && isCopyName(name)) return true;
  // A value inside an object of copy: `const STATUS_LABELS = { saving: "…" }`.
  if (parent.type === "Property" && parent.value === current) {
    const object = parent.parent;
    const objectName = object ? bindingName(object) : null;
    return Boolean(objectName && isCopyName(objectName));
  }
  return false;
}

function isModuleSpecifier(node) {
  const parent = node.parent;
  return (
    parent &&
    (parent.type === "ImportDeclaration" ||
      parent.type === "ExportAllDeclaration" ||
      parent.type === "ExportNamedDeclaration" ||
      parent.type === "ImportExpression" ||
      parent.type === "TSExternalModuleReference" ||
      parent.type === "TSImportType" ||
      (parent.type === "CallExpression" && parent.callee.name === "require"))
  );
}

/** Calls `visit(node, text)` for every string literal, template quasi and JSX text in the file. */
function stringVisitors(visit) {
  return {
    Literal(node) {
      if (typeof node.value !== "string" || node.directive || isModuleSpecifier(node)) return;
      const parent = node.parent;
      // Object keys and literal types are names, not copy.
      if (parent?.type === "Property" && parent.key === node && !parent.computed) return;
      if (parent?.type === "TSLiteralType" || parent?.type === "TSPropertySignature") return;
      visit(node, node.value);
    },
    TemplateLiteral(node) {
      if (node.parent?.type === "TaggedTemplateExpression") return;
      const text = node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join(" ");
      visit(node, text);
    },
    JSXText(node) {
      if (node.value.trim()) visit(node, node.value);
    },
  };
}

function copyRule({ description, check }) {
  return {
    meta: { type: "suggestion", docs: { description }, schema: [] },
    create(context) {
      return stringVisitors((node, text) => {
        check(context, node, text, node.type === "JSXText" || isCopy(node));
      });
    },
  };
}

const ellipsisGlyph = copyRule({
  description: "Shipped strings write the ellipsis glyph, never three dots.",
  check(context, node, text) {
    if (THREE_DOTS.test(text)) {
      context.report({ node, message: 'Write "…" (U+2026), not "..."' });
    }
  },
});

const noAllCapsString = copyRule({
  description: "Copy is sentence case; no all-caps words outside acronyms.",
  check(context, node, text, copy) {
    if (!copy) return;
    const word = [...text.matchAll(ALL_CAPS_WORD)]
      .map((match) => match[0])
      .find((candidate) => !ACRONYMS.has(candidate.replace(/'S$/, "")));
    if (word) {
      context.report({
        node,
        message: `"${word}" is all caps; copy is sentence case`,
      });
    }
  },
});

const BANNED = BANNED_COPY_WORDS.map((word) => ({
  word,
  pattern: new RegExp(
    `(?<![\\p{L}\\p{N}])${word.replace(/\s+/g, "\\s+")}s?(?![\\p{L}\\p{N}])`,
    "iu"
  ),
}));

const bannedWord = copyRule({
  description: 'Shipped copy says "check"; the banned words never appear.',
  check(context, node, text, copy) {
    if (!copy) return;
    const hit = BANNED.find(({ pattern }) => pattern.test(text));
    if (hit) {
      context.report({
        node,
        message: `"${hit.word}" is a banned copy word; say what the user does`,
      });
    }
  },
});

function hasDirective(program, value) {
  return program.body.some(
    (statement) => statement.type === "ExpressionStatement" && statement.directive === value
  );
}

/** Walks the module and records what makes it client-only. */
function clientEvidence() {
  const evidence = { hook: null, jsx: false, client: null };
  const note = (kind, node) => {
    if (!evidence[kind]) evidence[kind] = node;
  };
  return {
    evidence,
    visitors: {
      CallExpression(node) {
        const callee = node.callee;
        const name =
          callee.type === "Identifier"
            ? callee.name
            : callee.type === "MemberExpression" && !callee.computed
              ? callee.property.name
              : null;
        if (name && /^use[A-Z]/.test(name)) note("hook", node);
        if (name === "createContext") note("client", node);
      },
      JSXElement() {
        evidence.jsx = true;
      },
      JSXFragment() {
        evidence.jsx = true;
      },
      JSXAttribute(node) {
        const name = attributeName(node);
        const value = node.value;
        if (
          value?.type === "JSXExpressionContainer" &&
          (/^on[A-Z]/.test(name) ||
            value.expression.type === "ArrowFunctionExpression" ||
            value.expression.type === "FunctionExpression")
        ) {
          note("client", node);
        }
      },
      ClassDeclaration(node) {
        if (node.superClass) note("client", node);
      },
    },
  };
}

const missingClientDirective = {
  meta: {
    type: "problem",
    docs: { description: 'A component module that calls a hook starts with "use client".' },
    schema: [],
  },
  create(context) {
    const { evidence, visitors } = clientEvidence();
    return {
      ...visitors,
      "Program:exit"(program) {
        if (hasDirective(program, "use client")) return;
        if (evidence.jsx && evidence.hook) {
          context.report({
            node: evidence.hook,
            message: 'This module renders and calls a hook without "use client"',
          });
        }
      },
    };
  },
};

const needlessClientDirective = {
  meta: {
    type: "problem",
    docs: { description: 'A "use client" module needs the client: hooks, context or handlers.' },
    schema: [],
  },
  create(context) {
    const { evidence, visitors } = clientEvidence();
    return {
      ...visitors,
      "Program:exit"(program) {
        const directive = program.body.find(
          (statement) =>
            statement.type === "ExpressionStatement" && statement.directive === "use client"
        );
        if (!directive || evidence.hook || evidence.client) return;
        context.report({
          node: directive,
          message: '"use client" with no hook, context, handler or class; drop the directive',
        });
      },
    };
  },
};

const DISABLE_COMMENT = /^\s*eslint-disable(-next-line|-line)?(\s|$)/;

const disableReason = {
  meta: {
    type: "suggestion",
    docs: { description: "Every lint disable says why, after `--`." },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (DISABLE_COMMENT.test(comment.value) && !/\s--\s*\S/.test(comment.value)) {
            context.report({
              loc: comment.loc,
              message: "This lint disable gives no reason; add `-- why`",
            });
          }
        }
      },
    };
  },
};

/** Every rule this plugin implements, by its full `fui/<category>/<rule>` ID. */
const RULES = {
  "fui/feedback/ellipsis-glyph": ellipsisGlyph,
  "fui/typography/no-all-caps-string": noAllCapsString,
  "fui/conventions/banned-word": bannedWord,
  "fui/conventions/missing-client-directive": missingClientDirective,
  "fui/conventions/needless-client-directive": needlessClientDirective,
  "fui/conventions/disable-reason": disableReason,
};

export const ESLINT_RULE_IDS = Object.keys(RULES);

/** The ESLint plugin, registered as `fui`; its rule names drop the `fui/` prefix. */
export const doctrineEslintPlugin = {
  meta: { name: "fui" },
  rules: Object.fromEntries(
    Object.entries(RULES).map(([id, rule]) => [id.slice("fui/".length), rule])
  ),
};
