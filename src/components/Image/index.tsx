"use client";

import * as React from "react";
import { ImageBroken } from "@phosphor-icons/react";
import { Icon } from "../Icon";
import styles from "./Image.module.scss";

/** The media frames products use. `auto` keeps the image's own ratio. */
export type ImageAspectRatio = "1:1" | "4:3" | "16:9" | "auto";
/** The two fits that keep proportions. */
export type ImageObjectFit = "cover" | "contain";
/** Corner role. `none` (the default) leaves the corner to the container that
 * clips it; `control`, `nested` and `surface` are the radius roles. */
export type ImageRadius = "none" | "control" | "nested" | "surface";
/** Where the image is: loading (a pulsing band), loaded, or failed. */
export type ImageStatus = "loading" | "loaded" | "error";

export interface ImageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Image source URL. */
  src: string;
  /** What the image shows. It is also the words the built-in error fallback
   * prints when the image fails. */
  alt: string;
  /** The frame's aspect ratio. @default "auto" */
  aspectRatio?: ImageAspectRatio;
  /** How the image fills the frame. @default "cover" */
  objectFit?: ImageObjectFit;
  /** Frame width. */
  width?: string | number;
  /** Frame height. */
  height?: string | number;
  /** Corner role. @default "none" */
  radius?: ImageRadius;
  /** Replaces the built-in error fallback (band, glyph, the alt words). */
  fallback?: React.ReactNode;
  /** Props for the underlying `img`. */
  imgProps?: Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    "src" | "alt" | "width" | "height" | "className" | "style" | "onLoad" | "onError"
  >;
  /** Called when the image finishes loading. */
  onImageLoad?: React.ReactEventHandler<HTMLImageElement>;
  /** Called when the image fails to load. */
  onImageError?: React.ReactEventHandler<HTMLImageElement>;
}

function toLength(value: string | number | undefined) {
  return typeof value === "number" ? `${value}px` : value;
}

const ImageRoot = React.forwardRef<HTMLDivElement, ImageProps>(function Image(
  {
    src,
    alt,
    aspectRatio = "auto",
    objectFit = "cover",
    width,
    height,
    radius = "none",
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
  const [status, setStatus] = React.useState<ImageStatus>("loading");

  // A new source starts over; an image already in the cache before hydration
  // reports its state at once.
  React.useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) setStatus(img.naturalWidth > 0 ? "loaded" : "error");
    else setStatus("loading");
  }, [src]);

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = (event) => {
    setStatus("loaded");
    onImageLoad?.(event);
  };
  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    setStatus("error");
    onImageError?.(event);
  };

  const classes = [
    styles.frame,
    aspectRatio !== "auto" && styles[`aspect-${aspectRatio.replace(":", "-")}`],
    radius !== "none" && styles[`radius-${radius}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const frameStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined && { inlineSize: toLength(width) }),
    ...(height !== undefined && { blockSize: toLength(height) }),
  };

  return (
    <div
      ref={ref}
      {...htmlProps}
      className={classes}
      style={frameStyle}
      data-state={status}
      aria-busy={status === "loading" || undefined}
    >
      {status === "error" ? (
        <div className={styles.fallback}>
          {fallback ?? (
            <>
              <Icon icon={ImageBroken} size="md" />
              <span className={styles.fallbackWords}>{alt}</span>
            </>
          )}
        </div>
      ) : (
        <img
          ref={imgRef}
          {...imgProps}
          src={src}
          alt={alt}
          className={[styles.image, styles[`fit-${objectFit}`]].join(" ")}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
});

export const Image = Object.assign(ImageRoot, {
  Root: ImageRoot,
});
