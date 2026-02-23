'use client';

import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import styles from './Button.module.scss';

/**
 * Button props.
 * @see https://usefragments.com/components/button
 */
type ButtonBaseProps = {
  children: React.ReactNode;
  /** Visual style variant. `"outline"` is an alias for `"outlined"`. `"icon"` is a convenience alias for a ghost icon-only button.
   * @default "primary"
   * @see https://usefragments.com/components/button#variants */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outlined' | 'outline' | 'icon';
  /** Button size.
   * @default "md"
   * @see https://usefragments.com/components/button#sizes */
  size?: 'sm' | 'md' | 'lg';
  /** Render as icon-only button (square aspect ratio). Prefer `variant="icon"` for the default ghost icon button. */
  icon?: boolean;
  /** Make button full width of container */
  fullWidth?: boolean;
  /** Merge props onto child element instead of rendering a button. Useful for composition with Link components.
   * @see https://usefragments.com/components/button#aschild */
  asChild?: boolean;
};

// Button as native button element
export interface ButtonAsButtonProps
  extends ButtonBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  as?: 'button';
}

// Button as anchor element
export interface ButtonAsAnchorProps
  extends ButtonBaseProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  as: 'a';
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

const ButtonRoot = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(props, ref) {
  const {
    children,
    variant: variantProp = 'primary',
    size = 'md',
    icon = false,
    fullWidth = false,
    asChild = false,
    className,
    ...rest
  } = props;

  const iconOnly = icon || variantProp === 'icon';

  // Resolve aliases:
  // "outline" → "outlined"
  // "icon" → visual "ghost" + icon-only sizing
  const variant = variantProp === 'outline'
    ? 'outlined'
    : variantProp === 'icon'
      ? 'ghost'
      : variantProp;

  const classNames = [
    styles.button,
    styles[size],
    styles[variant],
    iconOnly && styles.icon,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // asChild: merge button styling onto child element (e.g. Next.js Link)
  if (asChild && React.isValidElement(children)) {
    const { as: _as, ...childProps } = rest as ButtonProps & { as?: 'a' | 'button' };
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      ...childProps,
      className: [classNames, (children.props as Record<string, unknown>).className].filter(Boolean).join(' '),
      ref,
    });
  }

  // Render as anchor
  if (props.as === 'a') {
    const { as: _as, ...anchorProps } = rest as ButtonAsAnchorProps & { as?: 'a' };
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classNames}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  // Render as button (default)
  const { as: _as, ...buttonProps } = rest as ButtonAsButtonProps;
  return (
    <BaseButton
      ref={ref as React.Ref<HTMLButtonElement>}
      type={(buttonProps as ButtonAsButtonProps).type || 'button'}
      disabled={(buttonProps as ButtonAsButtonProps).disabled || false}
      className={classNames}
      {...buttonProps}
    >
      {children}
    </BaseButton>
  );
});

export const Button = Object.assign(ButtonRoot, {
  Root: ButtonRoot,
});
