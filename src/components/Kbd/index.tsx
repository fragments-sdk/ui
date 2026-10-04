import * as React from "react";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./Kbd.module.scss";

/**
 * Kbd draws one key on a keycap: the press tint sunk into the plane, the
 * indicator corner, the caption step.
 * @see https://usefragments.com/components/kbd
 */
export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** The key as it is printed: a glyph (`⌘`, `↵`) or a short word (`Esc`). */
  children: React.ReactNode;
  /** The key's spoken name, for a glyph a screen reader cannot say
   * (`label="Command"` on `⌘`). The glyph is then hidden from assistive tech. */
  label?: string;
}

export interface KbdGroupProps extends React.HTMLAttributes<HTMLElement> {
  /** The keys of one shortcut, pressed together, as `Kbd` children. */
  children: React.ReactNode;
}

function classes(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

const KbdRoot = React.forwardRef<HTMLElement, KbdProps>(function Kbd(
  { children, label, className, ...htmlProps },
  ref
) {
  return (
    <kbd ref={ref} {...htmlProps} className={classes(styles.kbd, className)}>
      {label ? (
        <>
          <span aria-hidden="true">{children}</span>
          <VisuallyHidden>{label}</VisuallyHidden>
        </>
      ) : (
        children
      )}
    </kbd>
  );
});

/** One shortcut: the keys pressed together, as nested `kbd` elements. */
const KbdGroup = React.forwardRef<HTMLElement, KbdGroupProps>(function KbdGroup(
  { children, className, ...htmlProps },
  ref
) {
  return (
    <kbd ref={ref} {...htmlProps} className={classes(styles.group, className)}>
      {children}
    </kbd>
  );
});

export const Kbd = Object.assign(KbdRoot, {
  Root: KbdRoot,
  Group: KbdGroup,
});
