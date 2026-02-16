'use client';

import * as React from 'react';

// ============================================
// Types
// ============================================

export interface DashboardLayoutProps {
  /** Dashboard content (typically Card or StatsCard components) */
  children: React.ReactNode;
  /** Number of grid columns */
  columns?: 1 | 2 | 3 | 4;
  /** Gap size between grid items */
  gap?: 'sm' | 'md' | 'lg';
  /** Additional CSS class name */
  className?: string;
}

// ============================================
// Gap map
// ============================================

const gapMap = {
  sm: 'var(--fui-space-2)',
  md: 'var(--fui-space-4)',
  lg: 'var(--fui-space-6)',
} as const;

// ============================================
// Component
// ============================================

export const DashboardLayout = React.forwardRef<
  HTMLDivElement,
  DashboardLayoutProps
>(function DashboardLayout(
  { children, columns = 3, gap = 'md', className },
  ref
) {
  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: gapMap[gap],
        width: '100%',
      }}
    >
      {children}
    </div>
  );
});
