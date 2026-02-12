import * as React from 'react';
import { useTheme } from '../components/Theme';

export interface FragmentsLogoProps {
  /** Size of the logo in pixels */
  size?: number;
  /** Optional className */
  className?: string;
}

export function FragmentsLogo({ size = 20, className }: FragmentsLogoProps) {
  const { resolvedMode } = useTheme();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Fragments"
      style={{
        display: 'block',
        color: resolvedMode === 'light' ? 'var(--fui-text-primary, #1a1a1a)' : 'var(--fui-text-primary, #fafafa)',
        transition: 'color 0.2s ease',
      }}
    >
      <path
        d="M12 2L14.09 8.26L20.18 8.26L15.45 12.14L17.18 18.74L12 15.06L6.82 18.74L8.55 12.14L3.82 8.26L9.91 8.26L12 2Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}
