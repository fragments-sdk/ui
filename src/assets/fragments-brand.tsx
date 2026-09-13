import * as React from "react";

import { FragmentsLogo } from "./fragments-logo";
import { FragmentsWordmark } from "./fragments-wordmark";
import { fragmentsWordmarkSymbol } from "./fragments-wordmark-artwork";
import styles from "./fragments-brand.module.scss";

export interface FragmentsBrandProps {
  /** Lockup height in px. The symbol-only rendering keeps the symbol at the size it has inside the lockup. */
  height?: number;
  /**
   * `below-md` drops the wordmark under the md breakpoint and shows the symbol alone;
   * `never` keeps the full lockup at every width (footers, brand pages, print).
   */
  collapse?: "below-md" | "never";
  className?: string;
}

/**
 * The brand as apps should show it: symbol + wordmark lockup that collapses to the symbol on
 * narrow viewports. Wrap it in the app's home link; it renders one accessible image at a time.
 */
export function FragmentsBrand({
  height = 20,
  collapse = "below-md",
  className,
}: FragmentsBrandProps) {
  const symbolSize = Math.round(height * fragmentsWordmarkSymbol.height);
  const classes = [styles.brand, collapse === "below-md" && styles.collapsible, className]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={classes} data-collapse={collapse}>
      <span className={styles.lockup}>
        <FragmentsWordmark height={height} />
      </span>
      <span className={styles.symbol}>
        <FragmentsLogo size={symbolSize} />
      </span>
    </span>
  );
}
