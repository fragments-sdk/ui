import * as React from "react";
import styles from "./DataTable.module.scss";

// Expand/collapse chevron for sub-rows.
export function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={[styles.expandIcon, expanded && styles.expandIconOpen]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.5 2.5L8 6L4.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Neutral (unsorted) sort indicator. Sized via `.sortIndicator svg`
// (--fui-icon-xs) in CSS so all sort glyphs share the icon ladder.
export function SortIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 2L8.5 5H3.5L6 2Z" fill="currentColor" opacity="0.3" />
      <path d="M6 10L3.5 7H8.5L6 10Z" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function SortAscIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 2L8.5 5H3.5L6 2Z" fill="currentColor" />
    </svg>
  );
}

export function SortDescIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 10L3.5 7H8.5L6 10Z" fill="currentColor" />
    </svg>
  );
}
