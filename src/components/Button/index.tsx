"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { useRender } from "@base-ui/react/use-render";
import { CONTROL_SIZES, useResolvedControlSize, type ControlSize } from "../ComponentDefaults";
import { fragmentsCanonicalStampProps } from "../../utils/canonical-stamp";
import styles from "./Button.module.scss";

/**
 * Button props.
 * @see https://usefragments.com/components/button
 */
export type ButtonVariant = "solid" | "soft" | "ghost" | "link";
export type ButtonTone = "neutral" | "accent" | "danger";
export type ButtonSize = ControlSize;

/**
 * The tone matrix: each variant takes only the tones it can paint honestly.
 * `solid` fills with the accent or danger; `soft` and `ghost` stay neutral and
 * show danger as ink only; `link` reads in the link ink or the neutral ink.
 */
type ButtonLook =
  | {
      /** Chrome family.
       * @default "solid"
       * @see https://usefragments.com/components/button#variants
       * @remarks
       * - `"solid"` — filled; the one action you want taken here
       * - `"soft"` — the neutral secondary: a quiet tint, no border
       * - `"ghost"` — no fill, no border; dense toolbars and repeated rows
       * - `"link"` — reads like a link, behaves like an action; tertiary CTAs */
      variant?: "solid";
      /** Colour. `solid` takes `accent` (default) or `danger`.
       * @see https://usefragments.com/components/button#tones */
      tone?: "accent" | "danger";
    }
  | {
      variant: "soft" | "ghost";
      /** Colour. `soft` and `ghost` take `neutral` (default) or `danger`, shown as ink. */
      tone?: "neutral" | "danger";
    }
  | {
      variant: "link";
      /** Colour. `link` takes `accent` (default, the link ink) or `neutral`. */
      tone?: "accent" | "neutral";
    };

type ButtonOwnProps = {
  /** The label. Optional only so a Button can be the `render` element of a
   * trigger (`<Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>`),
   * where the trigger's children become the label. */
  children?: React.ReactNode;
  /** Control height on the one track: xs 24, sm 28, md 32, lg 40.
   * @default "md"
   * @see https://usefragments.com/components/button#sizes */
  size?: ButtonSize;
  /** Make button full width of container */
  fullWidth?: boolean;
  /** Work started by this button is running. The button sets `aria-busy`
   * and ignores further presses at once; after a second (`--fui-pending-delay`)
   * its label fades and a spinner takes its place, and its width holds.
   * @default false
   * @see https://usefragments.com/components/button#pending */
  pending?: boolean;
  /** Keep a disabled button in the tab order (`aria-disabled` instead of
   * `disabled`), so keyboard and screen reader users can still reach it and
   * read why it is unavailable.
   * @default false */
  focusableWhenDisabled?: boolean;
  /** Replace the rendered element, e.g. `render={<a href="/docs" />}` or a
   * router link. A rendered anchor keeps its link semantics (no button role);
   * the button's look, pending and disabled behaviour move onto it.
   * @see https://usefragments.com/components/button#render */
  render?: useRender.RenderProp;
  /** Whether the rendered element is a native `<button>`. Inferred from an
   * element passed to `render` (a `<button>`, or a component without `href`);
   * pass it when `render` is a function or a component that renders an anchor
   * without an `href` prop. */
  nativeButton?: boolean;
};

export type ButtonProps = ButtonOwnProps &
  ButtonLook &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "color">;

const TONES: Record<ButtonVariant, readonly ButtonTone[]> = {
  solid: ["accent", "danger"],
  soft: ["neutral", "danger"],
  ghost: ["neutral", "danger"],
  link: ["accent", "neutral"],
};

const TONE_CLASS: Record<ButtonTone, string> = {
  neutral: styles.toneNeutral,
  accent: styles.toneAccent,
  danger: styles.toneDanger,
};

/** A `<button>`, or a component without an `href`, renders a native button. */
function rendersNativeButton(render: useRender.RenderProp | undefined): boolean {
  if (!React.isValidElement(render)) return true;
  if (typeof render.type === "string") return render.type === "button";
  return (render.props as Record<string, unknown>).href == null;
}

const ButtonRoot = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const {
    children,
    variant = "solid",
    tone: toneProp,
    size: sizeProp,
    fullWidth = false,
    pending,
    focusableWhenDisabled = false,
    render,
    nativeButton: nativeButtonProp,
    className,
    onClick,
    disabled,
    type,
    ...rest
  } = props;

  const size = useResolvedControlSize(sizeProp, CONTROL_SIZES);
  const tones = TONES[variant] ?? TONES.solid;
  const tone = toneProp && tones.includes(toneProp) ? toneProp : tones[0];
  const isPending = Boolean(pending);
  const isDisabled = Boolean(disabled);
  const nativeButton = nativeButtonProp ?? rendersNativeButton(render);
  const rendersElement = render !== undefined && !nativeButton;

  const classNames = [
    styles.button,
    styles[size],
    styles[variant],
    TONE_CLASS[tone],
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(" ");

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

  // A pending button swallows every further press, including a form submit.
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isPending) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  // A disabled or pending anchor stops the press before any handler on the
  // rendered element (a router link's own navigation) sees it.
  const blockPress = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const sharedProps = {
    ...rest,
    className: classNames,
    onClick: handleClick,
    "aria-busy": isPending || rest["aria-busy"] || undefined,
    "data-pending": isPending ? "" : undefined,
    ...fragmentsCanonicalStampProps("Button"),
  };

  // A rendered anchor (or any non-button element) keeps its own semantics: no
  // button role, so a link still reads as a link.
  const element = useRender({
    render: render ?? <a />,
    ref,
    enabled: rendersElement,
    props: {
      ...sharedProps,
      "aria-disabled": isDisabled || undefined,
      "data-disabled": isDisabled ? "" : undefined,
      tabIndex: isDisabled && !focusableWhenDisabled ? -1 : rest.tabIndex,
      onClickCapture: isDisabled || isPending ? blockPress : rest.onClickCapture,
      children: content,
    },
  });

  if (rendersElement) return element;

  return (
    <BaseButton
      ref={ref}
      type={type ?? "button"}
      disabled={isDisabled}
      focusableWhenDisabled={focusableWhenDisabled}
      render={render as React.ComponentProps<typeof BaseButton>["render"]}
      nativeButton={render === undefined ? undefined : nativeButton}
      {...sharedProps}
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

export const Button = Object.assign(ButtonRoot, {
  Root: ButtonRoot,
});
