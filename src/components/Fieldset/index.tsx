"use client";

import * as React from "react";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import styles from "./Fieldset.module.scss";

// ============================================
// Types
// ============================================

/**
 * Groups related fields under one legend, on a surface. Disabling the
 * fieldset disables, and dims once, everything inside it.
 * @see https://usefragments.com/components/fieldset
 */
export interface FieldsetProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  children: React.ReactNode;
  disabled?: boolean;
}

export interface FieldsetLegendProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export interface FieldsetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

// ============================================
// Context: the description's id, so the group is described by it
// ============================================

interface FieldsetContextValue {
  descriptionId: string;
  registerDescription: () => () => void;
}

const FieldsetContext = React.createContext<FieldsetContextValue | null>(null);

// ============================================
// Components
// ============================================

function FieldsetRoot({
  children,
  disabled,
  className,
  "aria-describedby": describedBy,
  ...htmlProps
}: FieldsetProps) {
  const classes = [styles.root, className].filter(Boolean).join(" ");
  const descriptionId = React.useId();
  const [descriptionCount, setDescriptionCount] = React.useState(0);
  const registerDescription = React.useCallback(() => {
    setDescriptionCount((count) => count + 1);
    return () => setDescriptionCount((count) => Math.max(0, count - 1));
  }, []);
  const context = React.useMemo(
    () => ({ descriptionId, registerDescription }),
    [descriptionId, registerDescription]
  );
  const describedByIds =
    [describedBy, descriptionCount > 0 ? descriptionId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <FieldsetContext.Provider value={context}>
      <BaseFieldset.Root
        {...htmlProps}
        aria-describedby={describedByIds}
        disabled={disabled}
        className={classes}
      >
        {children}
      </BaseFieldset.Root>
    </FieldsetContext.Provider>
  );
}

function FieldsetLegend({ children, className, ...htmlProps }: FieldsetLegendProps) {
  const classes = [styles.legend, className].filter(Boolean).join(" ");
  return (
    <BaseFieldset.Legend {...htmlProps} className={classes}>
      {children}
    </BaseFieldset.Legend>
  );
}

function FieldsetDescription({ children, className, id, ...htmlProps }: FieldsetDescriptionProps) {
  const context = React.useContext(FieldsetContext);
  const registerDescription = context?.registerDescription;
  React.useEffect(() => registerDescription?.(), [registerDescription]);
  const classes = [styles.description, className].filter(Boolean).join(" ");
  return (
    <p {...htmlProps} id={id ?? context?.descriptionId} className={classes}>
      {children}
    </p>
  );
}

// ============================================
// Export compound component
// ============================================

export const Fieldset = Object.assign(FieldsetRoot, {
  Legend: FieldsetLegend,
  Description: FieldsetDescription,
});
