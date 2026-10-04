import { colorRules } from "./rules/color.mjs";
import { elevationRules } from "./rules/elevation.mjs";
import { focusRules } from "./rules/focus.mjs";
import { layerRules } from "./rules/layer.mjs";
import { legacyRules } from "./rules/legacy.mjs";
import { mediaQueryRules } from "./rules/media-queries.mjs";
import { motionRules } from "./rules/motion.mjs";
import { shapeRules } from "./rules/shape.mjs";
import { spaceRules } from "./rules/space.mjs";
import { stateRules } from "./rules/state.mjs";
import { targetRules } from "./rules/target.mjs";
import { typographyRules } from "./rules/typography.mjs";

/** Every doctrine style rule, one stylelint plugin each. */
export const doctrineStylePlugins = [
  ...colorRules,
  ...shapeRules,
  ...legacyRules,
  ...spaceRules,
  ...typographyRules,
  ...motionRules,
  ...mediaQueryRules,
  ...elevationRules,
  ...layerRules,
  ...focusRules,
  ...stateRules,
  ...targetRules,
];

/** Every rule ID the style plugins implement, as `fui/<category>/<rule>`. */
export const STYLE_RULE_IDS = doctrineStylePlugins.map((plugin) => plugin.ruleName);
