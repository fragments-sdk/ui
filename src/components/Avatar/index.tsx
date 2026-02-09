import * as React from 'react';
import styles from './Avatar.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Fallback initials (1-2 characters recommended) */
  initials?: string;
  /** Full name - used to generate initials if not provided */
  name?: string;
  /** Size variant */
  size?: AvatarSize;
  /** Shape variant */
  shape?: 'circle' | 'square';
  /** Custom background color for fallback */
  color?: string;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum number of avatars to display */
  max?: number;
  /** Size for all avatars in the group */
  size?: AvatarSize;
  /** Children (Avatar components) */
  children: React.ReactNode;
}

// ============================================
// Helper Functions
// ============================================

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function stringToColor(str: string): string {
  // Generate a consistent color from a string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 55%, 40%)`;
}

/**
 * Compute a contrast-safe text color (white or black) for a given HSL background.
 * Uses WCAG relative luminance to pick whichever gives higher contrast.
 */
function getContrastTextColor(bgColor: string): string | undefined {
  const match = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return undefined;

  const h = parseInt(match[1]);
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  // HSL → RGB
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  r += m; g += m; b += m;

  // Relative luminance (sRGB → linear)
  const lin = (v: number) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

  return lum > 0.179 ? '#000000' : '#ffffff';
}

// ============================================
// Avatar Component
// ============================================

const AvatarBase = React.forwardRef<HTMLDivElement, AvatarProps>(
  function AvatarBase(
    {
      src,
      alt = '',
      initials,
      name,
      size = 'md',
      shape = 'circle',
      color,
      className,
      style: styleProp,
      ...htmlProps
    },
    ref
  ) {
    const [imageError, setImageError] = React.useState(false);

    // Reset error state when src changes
    React.useEffect(() => {
      setImageError(false);
    }, [src]);

    const showFallback = !src || imageError;
    const displayInitials = initials || (name ? getInitials(name) : '');
    const fallbackColor = color || (name ? stringToColor(name) : undefined);
    const fallbackLabel = alt || name;
    const hasFallbackLabel = showFallback && Boolean(fallbackLabel && fallbackLabel.trim().length > 0);

    const avatarClasses = [
      styles.avatar,
      styles[size],
      shape === 'square' && styles.square,
      className,
    ].filter(Boolean).join(' ');

    const style: React.CSSProperties = { ...styleProp };
    if (showFallback && fallbackColor) {
      style.backgroundColor = fallbackColor;
      const textColor = getContrastTextColor(fallbackColor);
      if (textColor) {
        (style as Record<string, string>)['--avatar-initials-color'] = textColor;
      }
    }

    return (
      <div
        ref={ref}
        {...htmlProps}
        className={avatarClasses}
        style={style}
        role={hasFallbackLabel ? 'img' : undefined}
        aria-label={hasFallbackLabel ? fallbackLabel : undefined}
        aria-hidden={showFallback && !hasFallbackLabel ? true : undefined}
      >
        {!showFallback && (
          <img
            src={src}
            alt={alt}
            className={styles.image}
            onError={() => setImageError(true)}
          />
        )}
        {showFallback && displayInitials && (
          <span className={styles.initials}>{displayInitials}</span>
        )}
        {showFallback && !displayInitials && (
          <svg
            className={styles.fallbackIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </div>
    );
  }
);

// ============================================
// Avatar Group Component
// ============================================

function AvatarGroup({
  max,
  size = 'md',
  children,
  className,
  ...htmlProps
}: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const displayCount = max && max < childArray.length ? max : childArray.length;
  const overflowCount = max && childArray.length > max ? childArray.length - max : 0;

  const groupClasses = [styles.group, className].filter(Boolean).join(' ');

  return (
    <div {...htmlProps} className={groupClasses}>
      {childArray.slice(0, displayCount).map((child, index) => {
        if (React.isValidElement<AvatarProps>(child)) {
          return React.cloneElement(child, {
            key: index,
            size: child.props.size || size,
            className: [styles.groupItem, child.props.className].filter(Boolean).join(' '),
          });
        }
        return child;
      })}
      {overflowCount > 0 && (
        <div className={[styles.avatar, styles[size], styles.overflow].join(' ')}>
          <span className={styles.initials}>+{overflowCount}</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Compound Component Export
// ============================================

export const Avatar = Object.assign(AvatarBase, {
  Group: AvatarGroup,
});
