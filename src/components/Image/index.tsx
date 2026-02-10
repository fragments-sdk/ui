'use client';

import * as React from 'react';
import styles from './Image.module.scss';
import '../../styles/globals.scss';

export interface ImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Aspect ratio of the image container */
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9' | 'auto';
  /** How the image should fit within its container */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Width of the image */
  width?: string | number;
  /** Height of the image */
  height?: string | number;
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Fallback content to show while loading or on error */
  fallback?: React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const ImageRoot = React.forwardRef<HTMLDivElement, ImageProps>(
  function Image(
    {
      src,
      alt,
      aspectRatio = 'auto',
      objectFit = 'cover',
      width,
      height,
      rounded = 'none',
      fallback,
      className,
      style,
    },
    ref
  ) {
    const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');

    const handleLoad = () => setStatus('loaded');
    const handleError = () => setStatus('error');

    const classes = [
      styles.imageContainer,
      aspectRatio !== 'auto' && styles[`aspect-${aspectRatio.replace(':', '-')}`],
      rounded !== 'none' && styles[`rounded-${rounded}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const imgClasses = [
      styles.image,
      styles[`fit-${objectFit}`],
    ]
      .filter(Boolean)
      .join(' ');

    const containerStyle: React.CSSProperties = {
      ...style,
      ...(width !== undefined && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height !== undefined && { height: typeof height === 'number' ? `${height}px` : height }),
    };

    return (
      <div ref={ref} className={classes} style={containerStyle}>
        {status === 'error' && fallback ? (
          <div className={styles.fallback}>{fallback}</div>
        ) : (
          <>
            {status === 'loading' && fallback && (
              <div className={styles.fallback}>{fallback}</div>
            )}
            <img
              src={src}
              alt={alt}
              className={imgClasses}
              onLoad={handleLoad}
              onError={handleError}
              style={{ opacity: status === 'loaded' ? 1 : 0 }}
            />
          </>
        )}
      </div>
    );
  }
);

export const Image = Object.assign(ImageRoot, {
  Root: ImageRoot,
});
