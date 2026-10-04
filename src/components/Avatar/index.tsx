"use client";

import * as React from "react";
import { User } from "@phosphor-icons/react";
import styles from "./Avatar.module.scss";

// ============================================
// Types
// ============================================

/** The control tracks: xs 24 (default), sm 28, md 32, lg 40. */
export type AvatarSize = "xs" | "sm" | "md" | "lg";

/**
 * Avatar for a person: a photo, their initials, or a placeholder glyph, on
 * a rounded square at the indicator corner.
 * @see https://usefragments.com/components/avatar
 */
export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Fallback initials (1-2 characters recommended) */
  initials?: string;
  /** Full name - used to generate initials if not provided */
  name?: string;
  /** Visual fallback rendered after initials/name and before the generic glyph */
  fallback?: React.ReactNode;
  /** The control track the avatar sits on: xs 24, sm 28, md 32, lg 40.
   * @default "xs" */
  size?: AvatarSize;
  /** Additional props for the underlying img element */
  imageProps?: Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    "src" | "alt" | "className" | "style"
  >;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum number of avatars to display; the rest collapse into a +N tile */
  max?: number;
  /** Size for all avatars in the group
   * @default "xs" */
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

function classes(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

// ============================================
// Avatar Component
// ============================================

const AvatarBase = React.forwardRef<HTMLDivElement, AvatarProps>(function AvatarBase(
  { src, alt = "", initials, name, fallback, size = "xs", imageProps, className, ...htmlProps },
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
  const displayInitials = initials || (name ? getInitials(name) : "");
  const fallbackLabel = alt || name;
  const hasFallbackLabel =
    showFallback && Boolean(fallbackLabel && fallbackLabel.trim().length > 0);
  const showInitials = showFallback && Boolean(displayInitials);

  return (
    <div
      ref={ref}
      {...htmlProps}
      className={classes(styles.avatar, styles[size], showInitials && styles.named, className)}
      role={hasFallbackLabel ? "img" : undefined}
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
        />
      )}
      {showInitials && <span className={styles.initials}>{displayInitials}</span>}
      {showFallback && !displayInitials && fallback !== undefined && (
        <span className={styles.fallback}>{fallback}</span>
      )}
      {showFallback && !displayInitials && fallback === undefined && (
        <User className={styles.fallbackIcon} aria-hidden="true" />
      )}
    </div>
  );
});

// ============================================
// Avatar Group Component
// ============================================

function AvatarGroup({ max, size = "xs", children, className, ...htmlProps }: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const displayCount = max && max < childArray.length ? max : childArray.length;
  const overflowCount = max && childArray.length > max ? childArray.length - max : 0;

  return (
    <div {...htmlProps} className={classes(styles.group, styles[`group-${size}`], className)}>
      {childArray.slice(0, displayCount).map((child, index) => {
        if (React.isValidElement<AvatarProps>(child)) {
          return React.cloneElement(child, {
            key: index,
            size: child.props.size || size,
            className: classes(styles.groupItem, child.props.className),
          });
        }
        return child;
      })}
      {overflowCount > 0 && (
        <div
          className={classes(styles.avatar, styles[size], styles.groupItem, styles.overflow)}
          role="img"
          aria-label={`${overflowCount} more ${overflowCount === 1 ? "person" : "people"}`}
        >
          <span className={styles.initials} aria-hidden="true">
            +{overflowCount}
          </span>
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
