import postcssScss from "postcss-scss";

import { doctrineStylePlugins } from "./plugin.mjs";
import { TOKEN_FILES } from "./rules/utils.mjs";

/** Text-entry classes that do not name their element, by module. `fui/target/field-font` reads it. */
export const TEXT_ENTRY = [
  { file: "**/src/components/Input/Input.module.scss", selector: ".inner" },
  { file: "**/src/components/Textarea/Textarea.module.scss", selector: ".textarea" },
  { file: "**/src/components/Combobox/Combobox.module.scss", selector: ".input" },
  { file: "**/src/components/Command/Command.module.scss", selector: ".input" },
  { file: "**/src/components/Prompt/Prompt.module.scss", selector: ".textarea" },
  { file: "**/src/components/Editor/Editor.module.scss", selector: ".contentTextarea" },
  { file: "**/src/components/Field/Field.module.scss", selector: ".control" },
];

const literal = { exempt: TOKEN_FILES };

/** The doctrine stylelint config. Token sources are exempt from the literal rules. */
export const doctrineStyleConfig = {
  customSyntax: postcssScss,
  plugins: doctrineStylePlugins,
  reportNeedlessDisables: true,
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  rules: {
    "fui/color/no-literal": [true, literal],
    "fui/color/opaque-hairline": true,
    "fui/shape/radius-role": [true, literal],
    "fui/legacy/no-second-height-family": [true, literal],
    "fui/legacy/no-removed-weight": [true, literal],
    "fui/legacy/no-removed-token": [true, literal],
    "fui/space/no-literal": [true, literal],
    "fui/typography/no-literal": [true, literal],
    "fui/typography/no-font-face": [true, { brandFamilies: ["Fragments Sans"] }],
    "fui/typography/no-uppercase": true,
    "fui/motion/no-layout-transition": true,
    "fui/motion/no-literal-duration": [true, literal],
    "fui/motion/no-literal-easing": [true, literal],
    "fui/motion/background-position-scope": [
      true,
      {
        allow: ["**/src/recipes/_working.scss", "**/src/recipes/_skeleton.scss"],
      },
    ],
    "fui/motion/no-popup-keyframes": true,
    "fui/motion/popup-roles": true,
    "fui/media-queries/reduced-motion": true,
    "fui/elevation/shadow-allowlist": [
      true,
      {
        exempt: TOKEN_FILES,
        allow: ["**/src/recipes/_overlay.scss", "**/src/recipes/_popup.scss"],
        thumbFiles: [
          "**/Switch.module.scss",
          "**/Slider.module.scss",
          "**/ToggleGroup.module.scss",
          "**/ColorPicker.module.scss",
          "**/Tabs.module.scss",
          "**/src/recipes/_segmented.scss",
          "**/src/recipes/_selection.scss",
        ],
      },
    ],
    "fui/elevation/no-border-with-shadow": true,
    "fui/elevation/background-planes": [
      true,
      { exempt: [...TOKEN_FILES, "**/*.states.module.scss", "**/*.consumer-fixture.module.scss"] },
    ],
    "fui/layer/no-raw-z-index": true,
    "fui/layer/no-seed-read": true,
    "fui/layer/components-layer": [
      true,
      { exempt: ["**/*.states.module.scss", "**/*.consumer-fixture.module.scss"] },
    ],
    "fui/focus/no-outline-removal": [true, { focusRecipe: ["**/src/recipes/_focus.scss"] }],
    "fui/focus/no-focus-shadow": true,
    "fui/state/hover-keeps-ring": true,
    "fui/state/disabled-once": true,
    "fui/target/field-font": [
      true,
      { textEntry: TEXT_ENTRY, fieldRecipe: ["**/src/recipes/_field.scss"] },
    ],
  },
};
