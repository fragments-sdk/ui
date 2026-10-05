import * as sass from "sass";
import { describe, expect, it } from "vitest";

function compile(source: string): string {
  return sass.compileString(source, { loadPaths: [`${process.cwd()}/src`], style: "expanded" }).css;
}

function textWrapValues(css: string, selector: string) {
  const match = css.match(new RegExp(`\\.${selector}\\s*\\{([^}]*)\\}`, "s"));
  expect(match, `missing .${selector} in compiled CSS`).not.toBeNull();
  return [...(match?.[1] ?? "").matchAll(/text-wrap:\s*([^;]+);/g)].map((result) => result[1]);
}

describe("geometry recipes", () => {
  it("keeps prose body elements on normal wrapping while balancing prose titles", () => {
    const css = compile(`
      @use "recipes/prose";
      .root { @include prose.root; }
      .paragraph { @include prose.paragraph; }
      .list { @include prose.list("disc"); }
      .blockquote { @include prose.blockquote; }
      .table { @include prose.table; }
      .heading { @include prose.heading(2); }
    `);

    for (const selector of ["root", "paragraph", "list", "blockquote", "table"]) {
      expect(textWrapValues(css, selector).at(-1), selector).toBe("auto");
    }
    expect(textWrapValues(css, "heading")).toEqual(["balance"]);
  });

  it("compiles the fixed action ladder and governed typography", () => {
    const css = compile(`
      @use "recipes/action";
      .micro { @include action.size("micro"); }
      .sm { @include action.icon-only("sm"); }
      .md svg { @include action.glyph("md"); }
      .lg { @include action.size("lg"); }
    `);

    expect(css).toContain("--_fui-action-track: var(--fui-control-height-xs, 24px)");
    expect(css).toContain("--_fui-action-track: var(--fui-control-height-sm, 28px)");
    expect(css).toContain("inline-size: var(--fui-icon-md, 16px)");
    expect(css).toContain("--_fui-action-track: var(--fui-control-height-lg, 40px)");
    // The control label: 11 at every step but lg, which takes 12, at the role's regular weight
    // (the component opts into strong); md insets 10, as every default control on the product
    // screen does.
    expect(css).toContain("--_fui-action-type-size: var(--fui-type-ui-compact-size, 11px)");
    expect(css).toContain("--_fui-action-type-size: var(--fui-type-body-compact-size, 12px)");
    expect(css).toContain("--_fui-action-type-weight: var(--fui-type-ui-compact-weight, 400)");
    expect(css).toContain("--_fui-action-type-weight: var(--fui-type-body-compact-weight, 400)");
    expect(css).not.toContain("ui-standard-weight");
    expect(css).not.toContain("--_fui-action-inline-inset: var(--fui-raw-space-12");
  });

  it("leaves the label weight to the component: regular unless it asks for strong", () => {
    const css = compile(`
      @use "recipes/action";
      .base { @include action.base; }
      .strong { @include action.size("md"); @include action.weight("strong"); }
      .regular { @include action.weight("regular"); }
    `);

    expect(css).toContain(
      "font-weight: var(--_fui-action-type-weight, var(--fui-type-ui-compact-weight, 400))"
    );
    expect(css.slice(0, css.indexOf(".strong"))).not.toContain("semibold");
    expect(css.slice(css.indexOf(".strong"))).toContain(
      "--_fui-action-type-weight: var(--fui-font-weight-semibold, 600)"
    );
    expect(css).toContain("--_fui-action-type-weight: var(--fui-font-weight-normal, 400)");
  });

  it("moves hover and press in the micro role on the standard easing, gated to hover pointers", () => {
    const css = compile(`
      @use "recipes/action";
      .button {
        @include action.motion;
        @include action.hover { color: red; }
      }
      .pending { @include action.pending(".label", ".spinner"); }
    `);

    expect(css).toContain("transition-duration: var(--fui-duration-micro, 100ms)");
    expect(css).toContain(
      "transition-timing-function: var(--fui-ease-standard, cubic-bezier(0.2, 0, 0, 1))"
    );
    expect(css).toContain(
      "transition-property: background-color, border-color, color, box-shadow, opacity, scale"
    );
    expect(css).toContain(
      "transition: opacity var(--fui-duration-micro, 100ms) var(--fui-ease-standard, cubic-bezier(0.2, 0, 0, 1))"
    );
    expect(css).not.toContain("--fui-transition-fast");
    expect(css).toMatch(/@media \(hover: hover\) \{\s*\.button:hover:not\(/);
  });

  it("sets the page gutter to 16", () => {
    const css = compile(`@use "recipes/layout"; .page { padding: layout.page-gutter(); }`);
    expect(css).toContain("padding: var(--fui-raw-space-16, 16px)");
  });

  it("compiles fixed field tracks, insets, stroke, and type roles", () => {
    const css = compile(`
      @use "recipes/field";
      .sm { @include field.size("sm"); @include field.shell; }
      .md { @include field.size("md"); @include field.shell; }
      .lg { @include field.size("lg"); @include field.shell; }
    `);

    expect(css).toContain("--_fui-field-track: var(--fui-control-height-sm, 28px)");
    expect(css).toContain("--_fui-field-inline-inset: var(--fui-field-inline-inset-md, 10px)");
    expect(css).toContain("--_fui-field-track: var(--fui-control-height-lg, 40px)");
    expect(css).toContain("--_fui-field-stroke: var(--fui-stroke-hairline, 1px)");
  });

  it("keeps typed text at 16px or the role's own size under a coarse pointer", () => {
    const css = compile(`
      @use "recipes/field";
      .sm { @include field.size("sm"); }
      .md { @include field.size("md"); }
      .shown { @include field.size("md", false); }
      .relaxed { @include field.coarse-typed-text("body-relaxed"); }
    `);
    const coarse = [...css.matchAll(/@media \(pointer: coarse\) \{\s*\.(\w+) \{\s*([^}]*)\}/g)];
    const rules = Object.fromEntries(coarse.map(([, name, body]) => [name, body.trim()]));
    expect(rules.sm).toMatch(/^font-size: max\(16px, var\(--fui-type-ui-compact-size, [^)]+\)\);$/);
    expect(rules.md).toMatch(
      /^font-size: max\(16px, var\(--fui-type-body-compact-size, [^)]+\)\);$/
    );
    expect(rules.relaxed).toMatch(/^font-size: max\(16px, var\(--fui-type-body-relaxed-size, /);
    expect(rules.shown).toBeUndefined();
  });

  it("compiles non-layout hit areas and popup rows on the hit-area floor", () => {
    const css = compile(`
      @use "recipes/target";
      @use "recipes/popup";
      .target { @include target.hit-area("compact"); }
      .popup { @include popup.container; @include popup.viewport; }
      .row { @include popup.row; }
    `);

    expect(css).toContain(
      "inline-size: max(100%, var(--fui-control-height-md, 32px), var(--fui-hit-area, 24px))"
    );
    expect(css).toContain("pointer-events: auto");
    expect(css).toContain("--fui-popup-row-pitch: var(--fui-raw-space-32, 32px)");
    // The row takes the hit-area floor (44px under a coarse pointer) when it is taller than the
    // pitch, so the recipe needs no pointer query of its own.
    expect(css).not.toContain("@media (pointer: coarse)");
    expect(css.replace(/\s+/g, " ")).toContain(
      "--_fui-popup-effective-row-pitch: max( var(--fui-popup-row-pitch, 32px), var(--fui-hit-area, 24px) );"
    );
  });

  it("compiles boolean marks, card rows, switches, and range anatomy", () => {
    const css = compile(`
      @use "recipes/boolean-range" as boolean;
      .checkbox { @include boolean.row("sm"); @include boolean.mark("sm"); }
      .switch { @include boolean.switch-track("md"); }
      .rail { @include boolean.slider-track; }
      .thumb { @include boolean.slider-thumb; }
    `);

    expect(css).toContain("--_fui-boolean-mark-size: var(--fui-icon-sm, 14px)");
    expect(css).toContain("--_fui-switch-inline-size: var(--fui-control-height-md, 32px)");
    expect(css).toContain(
      "--_fui-switch-block-size: calc(var(--fui-raw-space-16, 16px) + var(--fui-raw-space-2, 2px))"
    );
    expect(css).toContain("--_fui-switch-thumb-size: var(--fui-icon-sm, 14px)");
    expect(css).toContain("block-size: var(--fui-raw-space-4, 4px)");
    expect(css).toContain("inline-size: var(--fui-icon-md, 16px)");
  });

  it("compiles fixed navigation rows and optical anatomy", () => {
    const css = compile(`
      @use "recipes/navigation";
      .row { @include navigation.row; }
      .section { @include navigation.section-row; }
      .leading { @include navigation.leading; }
    `);

    expect(css).toContain("--fui-navigation-row-track: var(");
    expect(css).toContain("--fui-control-height-md");
    expect(css).toContain("--fui-navigation-gutter: var(--fui-navigation-sidebar-gutter, 8px)");
    // A stacked nav row takes the hit-area floor: 44px under a coarse pointer.
    expect(css).toContain(
      "min-block-size: max(var(--fui-navigation-row-track, 32px), var(--fui-hit-area, 24px))"
    );
    expect(css).toContain(
      "inline-size: var(--fui-navigation-leading-box, var(--fui-navigation-sidebar-leading-box, 16px))"
    );
  });

  it("compiles the closed surface inset roles", () => {
    const css = compile(`
      @use "recipes/surface";
      .panel { @include surface.apply-inset("panel"); }
      .compact { @include surface.apply-inset("compact"); }
      .default { @include surface.apply-inset("default"); }
      .roomy { @include surface.apply-inset("roomy"); }
    `);

    expect(css).toContain("padding: var(--fui-surface-inset-panel, 0)");
    expect(css).toContain("padding: var(--fui-surface-inset-compact, 12px)");
    expect(css).toContain("padding: var(--fui-surface-inset-default, 16px)");
    expect(css).toContain("padding: var(--fui-surface-inset-roomy, 24px)");
  });

  it("compiles feedback, disclosure and viewport geometry", () => {
    const css = compile(`
      @use "recipes/feedback";
      .alert { @include feedback.contextual; }
      .toast { @include feedback.transient; }
      .row { @include feedback.disclosure-row; }
      .panel { @include feedback.disclosure-panel; }
      .close { @include feedback.close; }
      .viewport { @include feedback.viewport-stack("bottom-right"); }
    `);

    expect(css).toContain("padding: var(--fui-surface-inset-default, 16px)");
    expect(css).toContain("padding: var(--fui-surface-inset-compact, 12px)");
    expect(css).toContain("min-block-size: var(--fui-control-height-md, 32px)");
    expect(css).toContain(
      "inline-size: max(100%, var(--fui-control-height-md, 32px), var(--fui-hit-area, 24px))"
    );
    expect(css).toContain("bottom: var(--fui-feedback-viewport-inset-bottom");
  });

  it("compiles the modal sheet, anchored, tooltip, and safe viewport geometry", () => {
    const css = compile(`
      @use "recipes/overlay";
      .viewport { @include overlay.safe-viewport; }
      .modal { @include overlay.modal-shell; }
      .header { @include overlay.header; }
      .body { @include overlay.body; }
      .footer { @include overlay.footer; }
      .close { @include overlay.close; }
      .anchored { @include overlay.anchored-surface("lg"); }
      .arrow { @include overlay.arrow-box; }
      .tooltip { @include overlay.tooltip; }
    `);

    expect(css).toContain("--_fui-overlay-safe-inline: calc(");
    // The modal sheet: a flex column on the 8 block pad, sections at the 16 inline pad, the
    // body the only scroll region, the footer on the panel with no band.
    expect(css).toMatch(
      /\.modal \{[^}]*flex-direction: column;[^}]*padding-block: var\(--fui-raw-space-8, 8px\);/
    );
    expect(css).toMatch(/\.header \{[^}]*padding-inline: var\(--fui-raw-space-16, 16px\);/);
    expect(css).toMatch(/\.body \{[^}]*overflow: auto;/);
    expect(css).toMatch(/\.footer \{[^}]*justify-content: flex-end;/);
    expect(css).not.toContain("--fui-surface-inset-roomy");
    expect(css).toContain("--_fui-action-track: var(--fui-control-height-sm, 28px)");
    expect(css).toContain("max-inline-size: var(--fui-overlay-popover-lg, 512px)");
    expect(css).toContain(
      "inline-size: var(--fui-overlay-arrow-size, var(--fui-raw-space-10, 10px))"
    );
    expect(css).toContain("max-inline-size: var(--fui-overlay-tooltip-max, 320px)");
  });

  it("compiles the shared drawer, inline-popup and invalid-focus grammars", () => {
    const css = compile(`
      @use "recipes/overlay";
      @use "recipes/popup";
      @use "recipes/field";
      .backdrop { @include overlay.backdrop; }
      .panelStart { @include overlay.side-panel("start"); }
      .panelEnd { @include overlay.side-panel("end"); }
      .geometry { @include overlay.side-panel-geometry("start"); }
      .parkStart { transform: translateX(overlay.side-panel-offscreen("start")); }
      .parkEnd { transform: translateX(overlay.side-panel-offscreen("end")); }
      .parkTop { transform: translateY(overlay.side-panel-offscreen("top")); }
      .parkBottom { transform: translateY(overlay.side-panel-offscreen("bottom")); }
      .inlinePopup { @include popup.inline-container; }
      .invalidFocus { @include field.invalid-focus-state; }
    `);

    // The scrim and the panel sit on their own layers, never a raw z-index.
    expect(css).toContain("z-index: var(--fui-overlay-layer-backdrop, 50)");
    expect(css).toContain("z-index: var(--fui-overlay-layer-modal, 51)");
    expect(css).toContain("background-color: var(--fui-backdrop");

    // The panel is inset by the safe-area frame on the side it is anchored to.
    expect(css).toContain("inset-inline-start: var(--_fui-overlay-safe-left");
    expect(css).toContain("inset-inline-end: var(--_fui-overlay-safe-right");
    expect(css).toContain("inset-block: var(--_fui-overlay-safe-top");

    // side-panel is the surface on that geometry, so it carries the elevated fill.
    expect(css).toContain("background-color: var(--fui-bg-elevated");

    // Parking a panel off-screen has to clear its own width AND the inset the
    // geometry just applied, or the inset stays painted at the viewport edge.
    expect(css).toContain("translateX(calc(-100% - var(--_fui-overlay-safe-left");
    expect(css).toContain("translateX(calc(100% + var(--_fui-overlay-safe-right");
    expect(css).toContain("translateY(calc(-100% - var(--_fui-overlay-safe-top");
    expect(css).toContain("translateY(calc(100% + var(--_fui-overlay-safe-bottom");

    // An inline pick list is the static surface plane at the popup radius: no elevation.
    const inlinePopup = css.slice(css.indexOf(".inlinePopup"));
    const inlineBlock = inlinePopup.slice(0, inlinePopup.indexOf("}"));
    expect(inlineBlock).toContain("background-color: var(--fui-bg-primary");
    expect(inlineBlock).toContain("border-radius: var(--fui-radius-popup");
    expect(inlineBlock).not.toContain("box-shadow");

    // Invalid + focused keeps the danger edge; the ring is the one focus ring.
    expect(css).toContain("border-color: var(--fui-color-danger-text");
    expect(css).toContain("outline: var(--fui-focus-ring-width");
  });

  it.each([
    ['@use "recipes/action"; .x { @include action.size("xl"); }', "Unknown action role"],
    ['@use "recipes/field"; .x { @include field.size("xs"); }', "Unknown field size"],
    ['@use "recipes/target"; .x { @include target.hit-area("small"); }', "Unknown hit-target role"],
    [
      '@use "recipes/boolean-range" as boolean; .x { @include boolean.mark("xl"); }',
      "Unknown boolean size",
    ],
    [
      '@use "recipes/surface"; .x { @include surface.apply-inset("hero"); }',
      "Unknown surface inset role",
    ],
    [
      '@use "recipes/feedback"; .x { @include feedback.viewport-stack("middle"); }',
      "Unknown feedback viewport position",
    ],
    [
      '@use "recipes/overlay"; .x { @include overlay.anchored-surface("xl"); }',
      "Unknown anchored overlay size",
    ],
    [
      '@use "recipes/overlay"; .x { max-width: overlay.dialog-max("full"); }',
      "Unknown dialog overlay size",
    ],
    [
      '@use "recipes/overlay"; .x { @include overlay.side-panel-geometry("middle"); }',
      "Unknown side panel side",
    ],
    [
      '@use "recipes/overlay"; .x { transform: translateX(overlay.side-panel-offscreen("middle")); }',
      "Unknown side panel side",
    ],
    ['@use "recipes/action"; .x { @include action.weight("bold"); }', "Unknown action weight"],
    [
      '@use "recipes/selection"; .x { @include selection.selected($edge: "double"); }',
      "Unknown selection edge",
    ],
    ['@use "recipes/choice-card"; .x { @include choice-card.size("xs"); }', "Unknown field size"],
  ])("rejects an unsupported closed recipe role", (source, message) => {
    expect(() => compile(source)).toThrow(message);
  });
});

describe("motion and feedback recipes", () => {
  /** The declarations of the first rule whose selector is exactly `selector`. */
  function block(css: string, selector: string) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = css.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`));
    expect(match, `missing ${selector} in compiled CSS`).not.toBeNull();
    return match?.[1] ?? "";
  }

  /** Every rule whose selector is exactly `selector`, joined: Sass splits a rule around a nested
   * at-rule into several blocks with one selector. */
  function blocks(css: string, selector: string) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const found = [...css.matchAll(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`, "g"))];
    expect(found.length, `missing ${selector} in compiled CSS`).toBeGreaterThan(0);
    return found.map((match) => match[1]).join("\n");
  }

  it("moves a small popup on Base UI's starting and ending styles, in 0ms roles, never by keyframes", () => {
    const css = compile(`@use "recipes/popup"; .popup { @include popup.motion; }`);
    expect(css).not.toContain("@keyframes");
    expect(css).not.toMatch(/scale\(0\.9/);
    expect(block(css, ".popup")).toContain("transition-duration: var(--fui-duration-enter, 0ms);");
    expect(block(css, ".popup")).toContain(
      "transition-timing-function: var(--fui-ease-standard, cubic-bezier(0.2, 0, 0, 1));"
    );
    expect(block(css, ".popup[data-starting-style], .popup[data-ending-style]")).toContain(
      "scale: var(--fui-popup-from, 1);"
    );
    expect(block(css, ".popup[data-ending-style]")).toContain(
      "transition-duration: var(--fui-duration-exit, 0ms);"
    );
    // The only durations a popup reads are the two popup roles.
    const durations = [...css.matchAll(/var\(--fui-duration-([a-z-]+)/g)].map((m) => m[1]);
    expect(new Set(durations)).toEqual(new Set(["enter", "exit"]));
  });

  it("fades a large overlay in 200ms and out 100ms with no transform, and drops extras under reduced motion", () => {
    const css = compile(`
      @use "recipes/overlay";
      .dialog { @include overlay.motion; }
      .drawer { @include overlay.motion($also: transform); }
    `);
    expect(css).not.toContain("@keyframes");
    expect(css).not.toMatch(/transform:/);
    expect(block(css, ".dialog")).toContain("transition-property: opacity;");
    expect(block(css, ".drawer")).toContain("transition-property: opacity, transform;");
    expect(block(css, ".dialog")).toContain(
      "transition-duration: var(--fui-duration-enter-lg, 200ms);"
    );
    expect(block(css, ".dialog[data-ending-style]")).toContain(
      "transition-duration: var(--fui-duration-exit-lg, 100ms);"
    );
    const reduced = css.slice(css.lastIndexOf("prefers-reduced-motion: reduce"));
    expect(block(reduced, ".drawer")).toContain("transition-property: opacity;");
  });

  it("pulses the skeleton band toward the press tint with no gradient, still under reduced motion, and keeps the spinner turning", () => {
    const css = compile(`
      @use "recipes/skeleton";
      @use "recipes/loading";
      @include skeleton.keyframes;
      @include loading.keyframes;
      .bar { @include skeleton.band; }
      .spin { @include loading.spinner; }
    `);
    expect(css).not.toContain("gradient");
    expect(css).not.toContain("background-position");
    expect(block(css, ".bar")).toContain("background-color: var(--fui-bg-secondary, ");
    const tint = block(css, ".bar::after");
    expect(tint).toContain("background-color: var(--fui-bg-active, ");
    expect(tint).toContain(
      "animation: fui-skeleton-pulse var(--fui-duration-shimmer, 1600ms) var(--fui-ease-standard, cubic-bezier(0.2, 0, 0, 1)) infinite alternate;"
    );
    expect(block(css, "to")).toContain("opacity: 1;");
    expect(block(css, ".spin")).toContain(
      "animation: fui-loading-spin var(--fui-duration-spin, 700ms)"
    );
    const reduced = css.slice(css.indexOf("prefers-reduced-motion: reduce"));
    expect(block(reduced, ".bar::after")).toContain("animation: none;");
    expect(block(reduced, ".bar::after")).toContain("opacity: 0;");
    expect(block(reduced, ".spin")).not.toContain("animation: none");
  });

  it("draws one segmented look: a band track with one hairline, regular segments, a lifted strong thumb", () => {
    const css = compile(`
      @use "recipes/segmented";
      .track { @include segmented.track("sm"); }
      .segment { @include segmented.segment("[data-pressed]"); }
    `);
    const track = blocks(css, ".track");
    expect(track).toContain("--_fui-segmented-track: var(--fui-control-height-sm, 28px);");
    expect(track).toContain("background-color: var(--fui-bg-secondary, ");
    expect(track).toContain("border: var(--fui-stroke-hairline, 1px) solid var(--fui-border, ");
    expect(track).toContain("border-radius: var(--fui-radius-control, ");
    expect(track).toContain("padding: var(--fui-raw-space-2, 2px);");
    expect(track).toContain("gap: var(--fui-raw-space-2, 2px);");
    expect(track).not.toMatch(/(^|\s)box-shadow:/);

    const segment = blocks(css, ".segment");
    expect(segment).toContain("border-radius: var(--fui-radius-segment, ");
    expect(segment).toContain("color: var(--fui-text-secondary, ");
    expect(segment).toContain("background-color: transparent;");
    expect(segment).toContain("transition-duration: var(--fui-duration-micro, 100ms);");
    expect(segment).toContain(
      "min-block-size: calc(var(--_fui-segmented-track, var(--fui-control-height-md, 32px)) - 2 * var(--fui-raw-space-2, 2px) - 2 * var(--fui-stroke-hairline, 1px));"
    );

    const thumb = blocks(css, ".segment[data-pressed]");
    expect(thumb).toContain("background-color: var(--fui-bg-primary, ");
    expect(thumb).toMatch(
      /box-shadow: inset 0 0 0 var\(--fui-stroke-hairline, 1px\) var\(--fui-border, /
    );
    expect(thumb).toContain("var(--fui-shadow-sm, ");
    expect(thumb).toContain("color: var(--fui-text-primary, ");
    expect(thumb).toContain("--_fui-action-type-weight: var(--fui-font-weight-semibold, 600);");

    // Hover only where the pointer can hover, painted over the thumb so it never removes it.
    expect(css).toMatch(/@media \(hover: hover\) \{\s*\.segment:hover:not\(/);
    expect(block(css, ".segment:focus-visible")).toContain("outline: var(--fui-focus-ring-width");
  });

  it("draws a choice card as a surface with one hairline that turns into the selection ring when chosen", () => {
    const css = compile(`
      @use "recipes/choice-card";
      .card { @include choice-card.root; }
      .lg { @include choice-card.size("lg"); }
    `);
    const card = blocks(css, ".card");
    expect(card).toContain("background-color: var(--fui-bg-primary, ");
    expect(card).toContain("border: var(--fui-stroke-hairline, 1px) solid var(--fui-border, ");
    expect(card).toContain("border-radius: var(--fui-radius-control, ");
    expect(card).not.toMatch(/(^|\s)box-shadow:/);

    const chosen = block(css, ".card:has([data-checked], [data-indeterminate])");
    expect(chosen).toContain("background-color: var(--fui-control-selected-bg, ");
    expect(chosen).toContain("border-color: var(--fui-control-selected-border, ");
    expect(chosen).not.toMatch(/(^|\s)box-shadow:/);

    expect(block(css, ".card:has(:focus-visible)")).toContain(
      "outline: var(--fui-focus-ring-width"
    );
    expect(css).toMatch(/@media \(hover: hover\) \{\s*\.card:hover:not\(/);
    expect(block(css, ".lg")).toContain("min-block-size: var(--fui-control-height-lg, 40px);");
    expect(block(css, ".lg")).toContain("padding: var(--fui-field-inline-inset-lg, ");
  });

  it("marks the current nav item with the selection wash alone: no ring, regular weight", () => {
    const css = compile(`
      @use "recipes/selection";
      .current { @include selection.current; }
      .selected { @include selection.selected; }
    `);
    expect(block(css, ".current")).toContain("background-color: var(--fui-control-selected-bg, ");
    expect(block(css, ".current")).not.toContain("box-shadow");
    expect(block(css, ".selected")).toContain(
      "box-shadow: inset 0 0 0 var(--fui-stroke-hairline, 1px) var(--fui-control-selected-border, "
    );
    expect(block(css, ".current")).not.toContain("font-weight");
    expect(block(css, ".current")).not.toContain("--fui-bg-active");
  });

  it("works with a wash, a 1px inset edge, a 1.8s sweep and a 2.4s sheen, and keeps the wash under reduced motion", () => {
    const css = compile(`
      @use "recipes/working";
      @include working.keyframes;
      .row[data-working] { @include working.area; }
      .words { @include working.text; }
    `);
    const after = block(css, ".row[data-working]::after");
    expect(after).toContain("var(--fui-working-wash, ");
    expect(after).toMatch(
      /box-shadow: inset 0 0 0 var\(--fui-stroke-hairline, 1px\) var\(--fui-working-edge, /
    );
    expect(after).toContain(
      "animation: fui-working-sweep var(--fui-working-sweep-duration, 1800ms)"
    );
    expect(block(css, ".words")).toContain(
      "animation: fui-working-sheen var(--fui-working-sheen-duration, 2400ms) linear infinite;"
    );
    const reduced = css.slice(css.indexOf("prefers-reduced-motion: reduce"));
    const still = block(reduced, ".row[data-working]::after");
    expect(still).toContain("animation: none;");
    expect(still).toContain("background: var(--fui-working-wash, ");
  });

  it("draws an errbox: danger tint, nested radius, pad 12, danger-text icon, ink-1 words", () => {
    const css = compile(`
      @use "recipes/feedback";
      .box { @include feedback.errbox; }
      .icon { @include feedback.errbox-icon; }
      .words { @include feedback.errbox-words; }
    `);
    const box = block(css, ".box");
    expect(box).toContain("background-color: var(--fui-color-danger-tint, ");
    expect(box).toContain("padding: var(--fui-raw-space-12, 12px);");
    expect(box).toMatch(
      /border-radius: calc\(max\(0px, \(var\(--fui-radius-surface, [^)]+\) - var\(--fui-raw-space-12, 12px\)\)\)/
    );
    expect(block(css, ".icon")).toContain("color: var(--fui-color-danger-text, ");
    expect(block(css, ".words")).toContain("color: var(--fui-text-primary, ");
  });
});
