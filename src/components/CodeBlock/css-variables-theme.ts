/**
 * Shiki theme whose token colors are CSS variables from the kit palette.
 *
 * Bundled shiki themes (including the old `css-variables` theme) were removed
 * from shiki 3; this object is the replacement. `codeToHtml` accepts it as the
 * `theme` option and writes `color: var(--fui-code-token-*)` onto spans.
 */
export const FUI_CSS_VARIABLES_THEME = {
  name: "css-variables",
  type: "dark" as const,
  colors: {
    "editor.foreground": "var(--fui-code-text)",
    "editor.background": "var(--fui-code-bg)",
  },
  tokenColors: [
    { settings: { foreground: "var(--fui-code-text)" } },
    {
      scope: [
        "comment",
        "punctuation.definition.comment",
        "string.comment",
        "string.quoted.docstring.multi",
      ],
      settings: { foreground: "var(--fui-code-token-comment)" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.other",
        "storage",
        "storage.type",
        "storage.modifier",
        "storage.control.clojure",
      ],
      settings: { foreground: "var(--fui-code-token-keyword)" },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "string.interpolated",
        "string.regexp",
        "string.unquoted.plain.out.yaml",
        "markup.inline",
      ],
      settings: { foreground: "var(--fui-code-token-string)" },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.other",
        "constant.character.format.placeholder",
        "constant.other.placeholder",
      ],
      settings: { foreground: "var(--fui-code-token-number)" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call",
        "meta.instance.constructor",
        "entity.other.attribute-name",
      ],
      settings: { foreground: "var(--fui-code-token-function)" },
    },
    {
      scope: [
        "punctuation",
        "punctuation.separator",
        "punctuation.definition.arguments",
        "punctuation.definition.dict",
        "punctuation.definition.string",
        "punctuation.definition.template-expression",
        "meta.brace",
        "keyword.operator",
        "keyword.operator.accessor",
      ],
      settings: { foreground: "var(--fui-code-token-punctuation)" },
    },
    {
      scope: [
        "variable",
        "variable.other",
        "variable.parameter",
        "variable.language",
        "entity.name",
        "support.variable",
        "support.type",
        "meta.property-name",
        "meta.property-value",
      ],
      settings: { foreground: "var(--fui-code-token-variable)" },
    },
  ],
};
