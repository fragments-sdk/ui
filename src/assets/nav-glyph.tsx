import * as React from "react";
import styles from "./nav-glyph.module.scss";

/**
 * The navigation glyph set: one 16px stroke glyph per governance destination.
 * Drawn on a 16-unit grid with a 1.5 stroke, round caps and joins, and
 * `currentColor` ink, so a glyph takes the colour of the row it sits in. The
 * component glyph is the isometric cube the illustrated cards use, so the
 * sidebar and the cards share one object language.
 *
 * Each glyph has one motion verb (see the module stylesheet) that plays when
 * the link or button it sits in is hovered or focused. Parts that move carry
 * `motion` plus their verb class; `--i` staggers siblings.
 */
export type NavGlyphName =
  | "overview"
  | "repository"
  | "pullRequest"
  | "finding"
  | "contract"
  | "adoption"
  | "component"
  | "setup"
  | "settings";

type Part = { className: string; style?: React.CSSProperties };

/** A moving part: `motion` plus its verb class, and its stagger index. */
function part(verb: string, index?: number, vars?: Record<string, string>): Part {
  const style =
    index === undefined && !vars
      ? undefined
      : ({ ...(index === undefined ? {} : { "--i": index }), ...vars } as React.CSSProperties);
  return { className: [styles.motion, styles[verb]].join(" "), style };
}

/** A stroke that draws itself: normalised length so the verb is one keyframe. */
function stroke(verb: string, index?: number): Part & { pathLength: number } {
  return { ...part(verb, index), pathLength: 1 };
}

const GLYPHS: Record<NavGlyphName, React.ReactNode> = {
  // Four tiles; the first is inked — the place you are standing.
  overview: (
    <>
      <rect
        x="2.5"
        y="2.5"
        width="4.5"
        height="4.5"
        rx="1"
        fill="currentColor"
        stroke="none"
        {...part("tile", 0)}
      />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" {...part("tile", 1)} />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1" {...part("tile", 2)} />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" {...part("tile", 3)} />
    </>
  ),
  // A bound volume with its spine.
  repository: (
    <>
      <rect x="3" y="2.5" width="10" height="11" rx="1.5" />
      <path d="M6 2.5v11" {...part("spine")} />
    </>
  ),
  // Two commits on the base branch, one on the branch merging in.
  pullRequest: (
    <>
      <circle cx="4.5" cy="4" r="1.75" />
      <circle cx="4.5" cy="12" r="1.75" />
      <path d="M4.5 5.75v4.5" />
      <path d="M8 4h1.75A1.75 1.75 0 0 1 11.5 5.75v4.5" {...stroke("branch")} />
      <circle cx="11.5" cy="12" r="1.75" {...part("head", 4)} />
    </>
  ),
  // A planted flag with a notched fly.
  finding: (
    <>
      <path d="M4 14V2.5" />
      <path d="M4 3h7.5l-1.75 2.5L11.5 8H4" {...part("fly")} />
    </>
  ),
  // A signed sheet with a folded corner.
  contract: (
    <>
      <path d="M4.5 2.5h5l3 3v7.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z" />
      <path d="M9.5 2.5v3h3" />
      <path d="M6.5 8.5h3" {...stroke("line", 0)} />
      <path d="M6.5 11h3.5" {...stroke("line", 2)} />
    </>
  ),
  // Three bars climbing.
  adoption: (
    <>
      <path d="M2.25 13.5h11.5" />
      <path d="M4 13.5V9.5" {...part("bar", 0)} />
      <path d="M8 13.5V6" {...part("bar", 1)} />
      <path d="M12 13.5V2.75" {...part("bar", 2)} />
    </>
  ),
  // The isometric cube from the card art.
  component: (
    <>
      <path d="M8 1.75l5.5 3.15v6.2L8 14.25l-5.5-3.15v-6.2z" />
      <path d="M8 8.05l5.5-3.15" {...stroke("edge", 0)} />
      <path d="M8 8.05L2.5 4.9" {...stroke("edge", 1)} />
      <path d="M8 8.05v6.2" {...stroke("edge", 2)} />
    </>
  ),
  // A terminal with its prompt.
  setup: (
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <path d="M5 6.75l2 1.5-2 1.5" {...part("caret")} />
      <path d="M8.75 10.25h2.5" {...part("cursor")} />
    </>
  ),
  // Three sliders, each knob somewhere different.
  settings: (
    <>
      <path d="M2.5 4.5h11" />
      <circle
        cx="10"
        cy="4.5"
        r="1.5"
        fill="currentColor"
        stroke="none"
        {...part("knob", 0, { "--dx": "2px" })}
      />
      <path d="M2.5 8h11" />
      <circle
        cx="6"
        cy="8"
        r="1.5"
        fill="currentColor"
        stroke="none"
        {...part("knob", 1, { "--dx": "-2px" })}
      />
      <path d="M2.5 11.5h11" />
      <circle
        cx="9.5"
        cy="11.5"
        r="1.5"
        fill="currentColor"
        stroke="none"
        {...part("knob", 2, { "--dx": "1.5px" })}
      />
    </>
  ),
};

export const NAV_GLYPH_NAMES = Object.keys(GLYPHS) as NavGlyphName[];

export interface NavGlyphProps extends Omit<React.SVGAttributes<SVGSVGElement>, "name"> {
  /** Which glyph to draw. */
  name: NavGlyphName;
  /** Rendered box in px; the glyph inherits `currentColor`. */
  size?: number | string;
}

/**
 * A navigation glyph. Decorative by default (`aria-hidden`): the label beside
 * it names the destination. Pass `aria-label` and `role="img"` when the glyph
 * stands alone. Its verb plays when the enclosing link or button is hovered
 * or focused, and never under `prefers-reduced-motion: reduce`.
 */
export function NavGlyph({ name, size = 16, className, ...rest }: NavGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={[styles.glyph, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {GLYPHS[name]}
    </svg>
  );
}
