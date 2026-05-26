'use client';

import * as React from 'react';
import styles from './Avatar.module.scss';

// ============================================
// Types
// ============================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Avatar for user photos, initials, or placeholder icons.
 * @see https://usefragments.com/components/avatar
 */
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
  /** Custom avatar size (overrides size width/height) */
  customSize?: number | string;
  /** Shape variant */
  shape?: 'circle' | 'square';
  /** Custom background color for fallback */
  color?: string;
  /** Inline style for the underlying image element */
  imageStyle?: React.CSSProperties;
  /** Additional props for the underlying img element */
  imageProps?: Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    'src' | 'alt' | 'className' | 'style'
  >;
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

// Generated identicon backgrounds keep a fixed hue per name but vary lightness
// by theme: deeper in light mode, lighter in dark mode so the fallback never
// reads as a fixed mid-tone against the surrounding surface.
const FALLBACK_SATURATION_LIGHT = 55;
const FALLBACK_LIGHTNESS_LIGHT = 42;
const FALLBACK_SATURATION_DARK = 50;
const FALLBACK_LIGHTNESS_DARK = 62;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
}

function stringToColor(str: string): string {
  // Generate a consistent hue from a string, theme-aware lightness via
  // light-dark() so it isn't a fixed mid-tone in dark mode.
  const hue = hashString(str);
  return (
    `light-dark(` +
    `hsl(${hue} ${FALLBACK_SATURATION_LIGHT}% ${FALLBACK_LIGHTNESS_LIGHT}%), ` +
    `hsl(${hue} ${FALLBACK_SATURATION_DARK}% ${FALLBACK_LIGHTNESS_DARK}%))`
  );
}

/**
 * Compute a contrast-safe text color (white or black) for an HSL background.
 * Uses WCAG relative luminance to pick whichever gives higher contrast.
 */
function contrastForHsl(h: number, s: number, l: number): string {
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

/**
 * Compute a contrast-safe initials color for a generated fallback background.
 * The background uses theme-aware lightness via light-dark(), so the text color
 * is computed for each mode and returned as a matching light-dark() value.
 * Custom (non-generated) colors fall back to the single-color path.
 */
function getContrastTextColor(bgColor: string): string | undefined {
  // Generated identicon background: light-dark(hsl(...), hsl(...))
  const ld = bgColor.match(
    /light-dark\(\s*hsl\((\d+)\s+(\d+)%\s+(\d+)%\)\s*,\s*hsl\((\d+)\s+(\d+)%\s+(\d+)%\)\s*\)/
  );
  if (ld) {
    const lightText = contrastForHsl(
      parseInt(ld[1]),
      parseInt(ld[2]) / 100,
      parseInt(ld[3]) / 100
    );
    const darkText = contrastForHsl(
      parseInt(ld[4]),
      parseInt(ld[5]) / 100,
      parseInt(ld[6]) / 100
    );
    return lightText === darkText
      ? lightText
      : `light-dark(${lightText}, ${darkText})`;
  }

  // Legacy / custom single HSL color
  const match = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return undefined;
  return contrastForHsl(
    parseInt(match[1]),
    parseInt(match[2]) / 100,
    parseInt(match[3]) / 100
  );
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
      customSize,
      shape = 'circle',
      color,
      imageStyle,
      imageProps,
      className,
      style: styleProp,
      ...htmlProps
    },
    ref
  ) {
    const imgRef = React.useRef<HTMLImageElement>(null);
    const [imageError, setImageError] = React.useState(false);

    // Reset error state when src changes; check if already-loaded image failed
    React.useEffect(() => {
      setImageError(false);
      const img = imgRef.current;
      if (img && img.complete && img.naturalWidth === 0) {
        setImageError(true);
      }
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
    if (customSize !== undefined) {
      const resolvedSize = typeof customSize === 'number' ? `${customSize}px` : customSize;
      style.width = resolvedSize;
      style.height = resolvedSize;
      if (style.fontSize === undefined) {
        style.fontSize = `calc(${resolvedSize} * 0.4)`;
      }
    }

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
            ref={imgRef}
            {...imageProps}
            src={src}
            alt={alt}
            className={styles.image}
            onError={(event) => {
              imageProps?.onError?.(event);
              if (!event.defaultPrevented) {
                setImageError(true);
              }
            }}
            style={{ ...imageStyle }}
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
        <div
          className={[styles.avatar, styles[size], styles.overflow].join(' ')}
          role="img"
          aria-label={`${overflowCount} more ${overflowCount === 1 ? 'person' : 'people'}`}
        >
          <span className={styles.initials} aria-hidden="true">+{overflowCount}</span>
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
