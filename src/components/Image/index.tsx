'use client';

import * as React from 'react';
import styles from './Image.module.scss';

export interface ImageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
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
  /** Additional props for the underlying img element */
  imgProps?: Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    'src' | 'alt' | 'width' | 'height' | 'className' | 'style' | 'onLoad' | 'onError'
  >;
  /** Called when the image finishes loading */
  onImageLoad?: React.ReactEventHandler<HTMLImageElement>;
  /** Called when the image fails to load */
  onImageError?: React.ReactEventHandler<HTMLImageElement>;
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
      imgProps,
      onImageLoad,
      onImageError,
      ...htmlProps
    },
    ref
  ) {
    const imgRef = React.useRef<HTMLImageElement>(null);
    const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');

    // Handle images that are already cached/loaded before hydration
    React.useEffect(() => {
      const img = imgRef.current;
      if (img && img.complete) {
        setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
      }
    }, [src]);

    const handleLoad: React.ReactEventHandler<HTMLImageElement> = (event) => {
      setStatus('loaded');
      onImageLoad?.(event);
    };
    const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
      setStatus('error');
      onImageError?.(event);
    };

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
      <div ref={ref} {...htmlProps} className={classes} style={containerStyle}>
        {status === 'error' && fallback ? (
          <div className={styles.fallback}>{fallback}</div>
        ) : (
          <>
            {status === 'loading' && fallback && (
              <div className={styles.fallback}>{fallback}</div>
            )}
            <img
              ref={imgRef}
              {...imgProps}
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
