"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { useRender } from "@base-ui/react/use-render";
import { CONTROL_SIZES, useResolvedControlSize, type ControlSize } from "../ComponentDefaults";
import styles from "./IconButton.module.scss";
import { isProductionBuild } from "../../utils/env";

/**
 * The one icon-only control: a square button whose width is its track height,
 * for toolbars, row actions and workspace rails.
 *
 * Icon-only buttons need an accessible name — pass `aria-label` describing
 * the action. Runtime dev check warns if both are missing.
 *
 * @see https://usefragments.com/components/icon-button
 */
export interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onChange" | "value"
> {
  /** Icon element to render (a Phosphor icon, an SVG, etc.) */
  children: React.ReactNode;
  /** Visual style variant.
   *
   * - `ghost` (default): transparent at rest, the hover tint on hover. Fits
   *   inside dense toolbars and row affordances.
   * - `soft`: the neutral secondary, the same quiet tint as `Button soft`.
   * @default "ghost" */
  variant?: "ghost" | "soft";
  /** Size on the one track: xs 24, sm 28, md 32, lg 40. xs still reaches the
   * hit-area floor.
   * @default "md" */
  size?: ControlSize;
  /** Controlled pressed state. Passing `pressed`, `defaultPressed` or
   * `onPressedChange` makes the button a toggle: it sets `aria-pressed` and
   * paints the selection wash and ring while pressed. */
  pressed?: boolean;
  /** Initial pressed state of an uncontrolled toggle. */
  defaultPressed?: boolean;
  /** Called with the next pressed state when the toggle is pressed. */
  onPressedChange?: (pressed: boolean) => void;
  /** Work started by this button is running: `aria-busy`, presses ignored,
   * and after a second the icon gives way to a spinner. */
  pending?: boolean;
  /** Form value of the button, or the toggle's value inside a group. */
  value?: string;
  /** Replace the rendered element, e.g. `render={<a href="/settings" />}` or a
   * router link. A rendered anchor keeps its link semantics (no button role);
   * the look, pending and disabled behaviour move onto it. */
  render?: useRender.RenderProp;
  /** Whether the rendered element is a native `<button>`. Inferred from an
   * element passed to `render` (a `<button>`, or a component without `href`). */
  nativeButton?: boolean;
}

/** A `<button>`, or a component without an `href` or a router's `to`, renders a native button. */
function rendersNativeButton(render: useRender.RenderProp | undefined): boolean {
  if (!React.isValidElement(render)) return true;
  if (typeof render.type === "string") return render.type === "button";
  const props = render.props as Record<string, unknown>;
  // A router's link takes `to` (React Router, TanStack Router) where a plain link takes `href`.
  return props.href == null && props.to == null;
}

type PressEvent = React.MouseEvent<HTMLButtonElement> & { preventBaseUIHandler?: () => void };

const IconButtonRoot = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    children,
    variant = "ghost",
    size: sizeProp,
    pressed,
    defaultPressed,
    onPressedChange,
    pending,
    className,
    onClick,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    type = "button",
    render,
    nativeButton: nativeButtonProp,
    disabled,
    ...htmlProps
  },
  ref
) {
  if (!isProductionBuild() && !ariaLabel && !ariaLabelledBy) {
    console.warn(
      "[IconButton] Icon-only buttons need an accessible name. Provide `aria-label` or `aria-labelledby`."
    );
  }

  const size = useResolvedControlSize(sizeProp, CONTROL_SIZES);
  const isPending = Boolean(pending);
  const isToggle =
    pressed !== undefined || defaultPressed !== undefined || onPressedChange !== undefined;
  const classes = [styles.iconButton, styles[size], styles[variant], className]
    .filter(Boolean)
    .join(" ");

  // A pending button swallows every further press; a pending toggle keeps its state.
  const handleClick = (event: PressEvent) => {
    if (isPending) {
      event.preventDefault();
      event.preventBaseUIHandler?.();
      return;
    }
    onClick?.(event);
  };

  const nativeButton = nativeButtonProp ?? rendersNativeButton(render);
  const rendersElement = render !== undefined && !nativeButton;
  const isDisabled = Boolean(disabled);

  const sharedProps = {
    ...htmlProps,
    onClick: handleClick,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-busy": isPending || htmlProps["aria-busy"] || undefined,
    "data-pending": isPending ? "" : undefined,
  };

  const content =
    pending === undefined ? (
      children
    ) : (
      <>
        <span className={styles.label}>{children}</span>
        <span className={styles.spinner} aria-hidden="true">
          <PendingSpinner />
        </span>
      </>
    );

  // A disabled or pending anchor stops the press before any handler on the
  // rendered element (a router link's own navigation) sees it.
  const blockPress = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // A rendered anchor keeps its own semantics: no button role, so a link still
  // reads as a link.
  const element = useRender({
    render: render ?? <a />,
    ref,
    enabled: rendersElement,
    props: {
      ...sharedProps,
      className: classes,
      "aria-disabled": isDisabled || undefined,
      "data-disabled": isDisabled ? "" : undefined,
      tabIndex: isDisabled ? -1 : htmlProps.tabIndex,
      onClickCapture: isDisabled || isPending ? blockPress : htmlProps.onClickCapture,
      children: content,
    },
  });

  if (rendersElement) return element;

  const nativeRender = render as React.ComponentProps<typeof BaseButton>["render"];

  if (isToggle) {
    return (
      <BaseToggle
        ref={ref}
        {...sharedProps}
        type={type}
        disabled={isDisabled}
        render={nativeRender}
        pressed={pressed}
        defaultPressed={defaultPressed}
        onPressedChange={onPressedChange ? (next) => onPressedChange(next) : undefined}
        className={(state) => [classes, state.pressed && styles.pressed].filter(Boolean).join(" ")}
      >
        {content}
      </BaseToggle>
    );
  }

  return (
    <BaseButton
      ref={ref}
      {...sharedProps}
      type={type}
      disabled={isDisabled}
      render={nativeRender}
      nativeButton={render === undefined ? undefined : nativeButton}
      className={classes}
    >
      {content}
    </BaseButton>
  );
});

function PendingSpinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export const IconButton = Object.assign(IconButtonRoot, {
  Root: IconButtonRoot,
});
