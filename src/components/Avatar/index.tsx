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
  return `hsl(${hue}, 65%, 50%)`;
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

    const avatarClasses = [
      styles.avatar,
      styles[size],
      shape === 'square' && styles.square,
      className,
    ].filter(Boolean).join(' ');

    const style: React.CSSProperties = { ...styleProp };
    if (showFallback && fallbackColor) {
      style.backgroundColor = fallbackColor;
    }

    return (
      <div ref={ref} {...htmlProps} className={avatarClasses} style={style}>
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
