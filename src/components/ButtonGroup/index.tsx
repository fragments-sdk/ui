import * as React from 'react';
import styles from './ButtonGroup.module.scss';

export interface ButtonGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactNode;
  gap?: 'none' | 'xs' | 'sm' | 'md';
  wrap?: boolean;
  align?: 'start' | 'center' | 'end';
}

const ButtonGroupRoot = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(
    {
      children,
      gap = 'sm',
      wrap = false,
      align,
      className,
      ...htmlProps
    },
    ref
  ) {
    const classes = [
      styles.group,
      gap !== 'none' && styles[`gap-${gap}`],
      wrap && styles.wrap,
      align && styles[`align-${align}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} {...htmlProps} className={classes}>
        {children}
      </div>
    );
  }
);

export const ButtonGroup = Object.assign(ButtonGroupRoot, {
  Root: ButtonGroupRoot,
});
