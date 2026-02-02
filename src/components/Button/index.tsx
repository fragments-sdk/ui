import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import styles from './Button.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

type ButtonBaseProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Render as icon-only button (square aspect ratio) */
  icon?: boolean;
  /** Make button full width of container */
  fullWidth?: boolean;
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

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(props, ref) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    icon = false,
    fullWidth = false,
    className,
    ...rest
  } = props;

  const classNames = [
    styles.button,
    styles[size],
    styles[variant],
    icon && styles.icon,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

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
