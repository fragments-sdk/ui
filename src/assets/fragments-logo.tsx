import * as React from "react";
import symbol from "./fragments-symbol.json";

export interface FragmentsLogoProps {
  /** Size in pixels. Sizes at or below 24 use the tightly framed mark. */
  size?: number;
  className?: string;
  /** Solid for small UI; outline for larger brand applications. */
  variant?: "solid" | "outline";
}

/** The three-piece Fragments symbol. Inherits its surrounding text color. */
export function FragmentsLogo({ size = 20, className, variant = "solid" }: FragmentsLogoProps) {
  const compact = size <= 24;
  return (
    <svg
      width={size}
      height={size}
      viewBox={compact && variant === "solid" ? symbol.compactViewBox : symbol.viewBox}
      fill={variant === "solid" ? "currentColor" : "none"}
      stroke={variant === "outline" ? "currentColor" : undefined}
      strokeWidth={compact ? 16 : 8}
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Fragments"
      style={{ display: "block" }}
    >
      {symbol.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/** Standalone vector for integrations that cannot render React. */
export const fragmentsLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${symbol.viewBox}" fill="currentColor" role="img" aria-label="Fragments">${symbol.paths.map((d) => `<path d="${d}"/>`).join("")}</svg>`;
