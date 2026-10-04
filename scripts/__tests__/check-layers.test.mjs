import assert from "node:assert/strict";
import { test } from "node:test";

import { LAYER_ORDER, checkLayers } from "../check-layers.mjs";

const ORDER = `@layer ${LAYER_ORDER.join(", ")};`;

test("a stylesheet with every rule in an fui.* layer passes and counts its rules", () => {
  const css = `/* banner */
${ORDER}
@layer fui.tokens { @property --x { syntax: "*"; inherits: false; } :root { --a: 1; } }
${ORDER}
@layer fui.components {
  .a { color: red; }
  @media (forced-colors: active) { .a { outline-color: Highlight; } }
  .b::after { content: "{;}"; }
}`;
  assert.deepEqual(checkLayers(css), { problems: [], rules: 4 });
});

test("an unlayered rule, media block or at-rule is reported", () => {
  const css = `${ORDER}
.loose { color: red; }
@media (pointer: coarse) { .a { font-size: 16px; } }
@keyframes spin { to { rotate: 1turn; } }`;
  const { problems } = checkLayers(css);
  assert.equal(problems.length, 3);
  assert.match(problems[0], /"\.loose" sits outside any fui\.\* layer/);
  assert.match(problems[1], /"@media \(pointer: coarse\)" sits outside/);
  assert.match(problems[2], /"@keyframes spin" sits outside/);
});

test("a layer outside fui.*, a wrong opening order and a missing order are reported", () => {
  assert.match(
    checkLayers(`${ORDER}\n@layer app { .a { color: red; } }`).problems[0],
    /"@layer app" sits outside any fui\.\* layer/
  );
  assert.match(
    checkLayers(`@layer fui.components, fui.base;\n@layer fui.components { .a { color: red; } }`)
      .problems[0],
    /opens with .* not the library layer order/
  );
  assert.ok(
    checkLayers(`@layer fui.components { .a { color: red; } }`).problems.some((problem) =>
      /comes before the library layer order/.test(problem)
    )
  );
});

test("an unlayered top-level statement such as @import is reported", () => {
  const { problems } = checkLayers(`${ORDER}\n@import url("x.css");`);
  assert.deepEqual(problems, ['"@import url("x.css")" sits outside any fui.* layer']);
});
