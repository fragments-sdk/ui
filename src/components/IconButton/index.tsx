'use client';

import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import styles from './IconButton.module.scss';

/**
 * Compact square button for icon-only affordances — topbar actions, row
 * controls, workspace rails. Where `Button` with an icon is the general-
 * purpose control, `IconButton` is specifically sized and padded for dense
 * chrome: three tight preset sizes, a square shape, and a ghost variant
 * that's transparent at rest.
 *
 * Icon-only buttons need an accessible name — pass `aria-label` describing
 * the action. Runtime dev check warns if both are missing.
 *
 * @see https://usefragments.com/components/icon-button
 */
export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Icon element to render (a Phosphor/Lucide icon, SVG, etc.) */
  children: React.ReactNode;
  /** Visual style variant.
   *
   * - `ghost` (default): transparent at rest, subtle hover. Fits inside
   *   dense topbars and row affordances.
   * - `subtle`: painted with the tertiary surface; use when the affordance
   *   sits on a matching surface and needs a touch more weight.
   * - `outlined`: hairline border; use as a secondary control alongside a
   *   primary `Button`.
   * @default "ghost" */
  variant?: 'ghost' | 'subtle' | 'outlined';
  /** Button size. `sm` (22px) for dense chrome, `md` (28px) for standard
   * affordances, `lg` (32px) when paired with taller inputs.
   * @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Mark as pressed (for toggle-style affordances). Sets `aria-pressed`
   * and applies the active surface styling. */
  pressed?: boolean;
}

const IconButtonRoot = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      children,
      variant = 'ghost',
      size = 'md',
      pressed,
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      type = 'button',
      ...htmlProps
    },
    ref
  ) {
    if (process.env.NODE_ENV !== 'production' && !ariaLabel && !ariaLabelledBy) {
      console.warn(
        '[IconButton] Icon-only buttons need an accessible name. Provide `aria-label` or `aria-labelledby`.'
      );
    }

    const classes = [
      styles.iconButton,
      styles[size],
      styles[variant],
      pressed && styles.pressed,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <BaseButton
        ref={ref}
        type={type}
        className={classes}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-pressed={pressed}
        {...htmlProps}
      >
        {children}
      </BaseButton>
    );
  }
);

export const IconButton = Object.assign(IconButtonRoot, {
  Root: IconButtonRoot,
});
