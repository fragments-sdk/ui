"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import styles from "./Link.module.scss";

export type LinkTone = "accent" | "neutral";

/**
 * Inline navigation. Always underlined, one hairline at the shared link offset.
 * @see https://usefragments.com/components/link
 */
export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  children: React.ReactNode;
  /** Colour. `accent` (default) is the link ink; `neutral` reads in ink 1, for
   * links in dense copy and footers where the underline alone marks the link.
   * @default "accent" */
  tone?: LinkTone;
  /** Open in a new tab (adds `target="_blank"` and `rel="noopener noreferrer"`). */
  external?: boolean;
  /** Replace the rendered element, e.g. a router link:
   * `render={<RouterLink to="/settings" />}`. The look and props move onto it. */
  render?: useRender.RenderProp;
}

const TONE_CLASS: Record<LinkTone, string> = {
  accent: styles.toneAccent,
  neutral: styles.toneNeutral,
};

const LinkRoot = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { children, tone = "accent", external = false, render, className, target, rel, ...props },
  ref
) {
  const classes = [styles.link, TONE_CLASS[tone] ?? styles.toneAccent, className]
    .filter(Boolean)
    .join(" ");

  return useRender({
    render,
    ref,
    defaultTagName: "a",
    props: {
      ...props,
      className: classes,
      target: external ? (target ?? "_blank") : target,
      rel: external ? (rel ?? "noopener noreferrer") : rel,
      children,
    },
  });
});

export const Link = Object.assign(LinkRoot, {
  Root: LinkRoot,
});
