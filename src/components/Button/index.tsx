"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { useResolvedControlSize } from "../ComponentDefaults";
import { fragmentsCanonicalStampProps } from "../../utils/canonical-stamp";
import styles from "./Button.module.scss";

function composeEventHandlers<T extends (...args: any[]) => void>(
  childHandler: T | undefined,
  parentHandler: T | undefined
) {
  if (!childHandler) return parentHandler;
  if (!parentHandler) return childHandler;
  return ((...args: Parameters<T>) => {
    childHandler(...args);
    parentHandler(...args);
  }) as T;
}

/**
 * Button props.
 * @see https://usefragments.com/components/button
 */
export type ButtonVariant = "solid" | "soft" | "outline" | "ghost" | "link";
export type ButtonTone = "neutral" | "accent" | "info" | "success" | "warning" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  children: React.ReactNode;
  /** Chrome family.
   * @default "solid"
   * @see https://usefragments.com/components/button#variants
   * @remarks
   * - `"solid"` — filled; the one action you want taken here
   * - `"soft"` — tinted fill, no border; supporting actions
   * - `"outline"` — hairline border on a transparent surface
   * - `"ghost"` — no fill, no border; dense toolbars and repeated rows
   * - `"link"` — reads like a link, behaves like an action; tertiary CTAs */
  variant?: ButtonVariant;
  /** Colour. Defaults to `"accent"` on `solid` and `link`, `"neutral"` on
   * `soft`, `outline` and `ghost`.
   * @see https://usefragments.com/components/button#tones */
  tone?: ButtonTone;
  /** Control height.
   * @default "md"
   * @see https://usefragments.com/components/button#sizes */
  size?: ButtonSize;
  /** Render as icon-only button (square aspect ratio). Always pass `aria-label`. */
  icon?: boolean;
  /** Make button full width of container */
  fullWidth?: boolean;
  /** Merge props onto child element instead of rendering a button. Useful for composition with Link components.
   * @see https://usefragments.com/components/button#aschild */
  asChild?: boolean;
};

const DEFAULT_TONE: Record<ButtonVariant, ButtonTone> = {
  solid: "accent",
  link: "accent",
  soft: "neutral",
  outline: "neutral",
  ghost: "neutral",
};

const TONE_CLASS: Record<ButtonTone, string> = {
  neutral: styles.toneNeutral,
  accent: styles.toneAccent,
  info: styles.toneInfo,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
};

// Button as native button element
export interface ButtonAsButtonProps
  extends ButtonBaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  as?: "button";
}

// Button as anchor element
export interface ButtonAsAnchorProps
  extends ButtonBaseProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  as: "a";
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

const ButtonRoot = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      children,
      variant = "solid",
      tone: toneProp,
      size: sizeProp,
      icon = false,
      fullWidth = false,
      asChild = false,
      className,
      ...rest
    } = props;

    const size = useResolvedControlSize(sizeProp);
    const tone = toneProp ?? DEFAULT_TONE[variant];
    const canonicalStamp = fragmentsCanonicalStampProps("Button");

    const classNames = [
      styles.button,
      styles[size],
      styles[variant],
      TONE_CLASS[tone],
      icon && styles.icon,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // asChild: merge button styling onto child element (e.g. Next.js Link)
    if (asChild && React.isValidElement(children)) {
      const {
        as: _as,
        disabled,
        style,
        onClick,
        onKeyDown,
        ...childProps
      } = rest as React.ButtonHTMLAttributes<HTMLButtonElement> &
        React.AnchorHTMLAttributes<HTMLAnchorElement> & { as?: "a" | "button"; disabled?: boolean };
      const childElement = children as React.ReactElement<Record<string, unknown>>;
      const childElementProps = childElement.props as Record<string, unknown>;
      const isIntrinsicButton =
        typeof childElement.type === "string" && childElement.type === "button";
      const isDisabled = Boolean(disabled);

      const mergedProps: Record<string, unknown> = {
        ...childProps,
        ...canonicalStamp,
        className: [classNames, childElementProps.className].filter(Boolean).join(" "),
        style: {
          ...(style as React.CSSProperties | undefined),
          ...(childElementProps.style as React.CSSProperties | undefined),
        },
        ref,
      };

      if (isIntrinsicButton) {
        mergedProps.disabled = isDisabled;
      } else if (isDisabled) {
        mergedProps["aria-disabled"] = true;
        mergedProps["data-disabled"] = "";
        mergedProps.tabIndex = -1;
        mergedProps.onClick = (event: React.MouseEvent<HTMLElement>) => {
          event.preventDefault();
          event.stopPropagation();
        };
        mergedProps.onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
          }
        };
      } else {
        mergedProps.onClick = composeEventHandlers(
          childElementProps.onClick as ((event: React.MouseEvent<HTMLElement>) => void) | undefined,
          onClick as ((event: React.MouseEvent<HTMLElement>) => void) | undefined
        );
        mergedProps.onKeyDown = composeEventHandlers(
          childElementProps.onKeyDown as
            | ((event: React.KeyboardEvent<HTMLElement>) => void)
            | undefined,
          onKeyDown as ((event: React.KeyboardEvent<HTMLElement>) => void) | undefined
        );
      }

      return React.cloneElement(childElement, mergedProps);
    }

    // Render as anchor
    if (props.as === "a") {
      const { as: _as, ...anchorProps } = rest as ButtonAsAnchorProps & { as?: "a" };
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classNames}
          {...anchorProps}
          {...canonicalStamp}
        >
          {children}
        </a>
      );
    }

    // Render as button (default)
    const { as: _as, ...buttonProps } = rest as ButtonAsButtonProps;
    return (
      <BaseButton
        ref={ref as React.Ref<HTMLButtonElement>}
        type={(buttonProps as ButtonAsButtonProps).type || "button"}
        disabled={(buttonProps as ButtonAsButtonProps).disabled || false}
        className={classNames}
        {...buttonProps}
        {...canonicalStamp}
      >
        {children}
      </BaseButton>
    );
  }
);

export const Button = Object.assign(ButtonRoot, {
  Root: ButtonRoot,
});
