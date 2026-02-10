import * as React from 'react';
import styles from './ButtonGroup.module.scss';
import '../../styles/globals.scss';

export interface ButtonGroupProps {
  children: React.ReactNode;
  gap?: 'none' | 'xs' | 'sm' | 'md';
  wrap?: boolean;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

const ButtonGroupRoot = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(
    {
      children,
      gap = 'sm',
      wrap = false,
      align,
      className,
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
      <div ref={ref} className={classes}>
        {children}
      </div>
    );
  }
);

export const ButtonGroup = Object.assign(ButtonGroupRoot, {
  Root: ButtonGroupRoot,
});
