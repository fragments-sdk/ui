import * as React from "react";

import { fragmentsWordmarkAspect, fragmentsWordmarkSvg } from "./fragments-wordmark-artwork";

const WORDMARK_MASK = `data:image/svg+xml,${encodeURIComponent(fragmentsWordmarkSvg)}`;

export interface FragmentsWordmarkProps {
  /** Rendered height in px; width follows the lockup aspect ratio. */
  height?: number;
  /** Optional className */
  className?: string;
}

/**
 * The Fragments logo lockup — star + wordmark as one image. Use this anywhere
 * the brand is shown with its name, instead of the icon beside a text label.
 * Lettering is outlined from Fragments Sans, so it never depends on font loading.
 * Themeable: the vector artwork is a CSS mask filled with currentColor.
 */
export function FragmentsWordmark({ height = 20, className }: FragmentsWordmarkProps) {
  return (
    <span
      role="img"
      aria-label="Fragments"
      className={className}
      style={{
        display: "inline-block",
        height,
        width: height * fragmentsWordmarkAspect,
        backgroundColor: "currentColor",
        maskImage: `url("${WORDMARK_MASK}")`,
        WebkitMaskImage: `url("${WORDMARK_MASK}")`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "left center",
        WebkitMaskPosition: "left center",
      }}
    />
  );
}
