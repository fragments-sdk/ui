import * as React from "react";
import { isProductionBuild } from "../../utils/env";
import styles from "./ButtonGroup.module.scss";

/** A fused group is one control to assistive tech too: it needs a name. */
type ButtonGroupLabel =
  | {
      /** Names the group for assistive tech ("Save options"). */
      "aria-label": string;
      "aria-labelledby"?: string;
    }
  | {
      "aria-label"?: string;
      /** ID of the element that names the group. */
      "aria-labelledby": string;
    };

/**
 * One job: fuse two actions into one control, a split button (a Button and an
 * IconButton menu trigger). Spacing between separate buttons is Stack's job.
 * @see https://usefragments.com/components/button-group
 */
export type ButtonGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "role" | "aria-label" | "aria-labelledby"
> &
  ButtonGroupLabel & {
    /** The fused actions: at most two; a third verb goes in a Menu. */
    children: React.ReactNode;
  };

const ButtonGroupRoot = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { children, className, ...htmlProps },
  ref
) {
  if (!isProductionBuild() && !htmlProps["aria-label"] && !htmlProps["aria-labelledby"]) {
    console.warn(
      "[ButtonGroup] A fused group needs an accessible name. Provide `aria-label` or `aria-labelledby`."
    );
  }

  return (
    <div
      ref={ref}
      {...htmlProps}
      role="group"
      className={[styles.group, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
});

export const ButtonGroup = Object.assign(ButtonGroupRoot, {
  Root: ButtonGroupRoot,
});
