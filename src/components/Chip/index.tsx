import * as React from 'react';
import styles from './Chip.module.scss';
import '../../styles/globals.scss';

export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: React.ReactNode;
  /** Visual style variant */
  variant?: 'filled' | 'outlined' | 'soft';
  /** Size of the chip */
  size?: 'sm' | 'md';
  /** Whether the chip is selected */
  selected?: boolean;
  /** Icon element rendered before the label */
  icon?: React.ReactNode;
  /** Avatar element rendered before the label */
  avatar?: React.ReactNode;
  /** Makes chip removable. Called when X is clicked. */
  onRemove?: () => void;
  /** Value identifier used by Chip.Group */
  value?: string;
}

export interface ChipGroupProps {
  children: React.ReactNode;
  /** Controlled selected values */
  value?: string[];
  /** Default selected values (uncontrolled) */
  defaultValue?: string[];
  /** Called when selection changes */
  onChange?: (value: string[]) => void;
  className?: string;
}

const ChipBase = React.forwardRef<HTMLButtonElement, ChipProps>(
  function Chip(
    {
      children,
      variant = 'filled',
      size = 'md',
      selected = false,
      disabled = false,
      icon,
      avatar,
      onRemove,
      className,
      onClick,
      value: _value,
      ...htmlProps
    },
    ref
  ) {
    const classes = [
      styles.chip,
      styles[size],
      styles[variant],
      selected && styles.selected,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={selected}
        disabled={disabled}
        className={classes}
        onClick={onClick}
        {...htmlProps}
      >
        {avatar && (
          <span className={styles.avatar} aria-hidden="true">
            {avatar}
          </span>
        )}
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <span>{children}</span>
        {onRemove && (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Remove ${typeof children === 'string' ? children : 'chip'}`}
            className={styles.remove}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }
            }}
          >
            &times;
          </span>
        )}
      </button>
    );
  }
);

function ChipGroupInner(
  { children, value: controlledValue, defaultValue = [], onChange, className }: ChipGroupProps,
  ref: React.Ref<HTMLDivElement>
) {
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const toggle = React.useCallback(
    (chipValue: string) => {
      const next = currentValue.includes(chipValue)
        ? currentValue.filter((v) => v !== chipValue)
        : [...currentValue, chipValue];

      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [currentValue, isControlled, onChange]
  );

  const classes = [styles.group, className].filter(Boolean).join(' ');

  return (
    <div ref={ref} role="listbox" aria-multiselectable="true" className={classes}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<ChipProps>(child)) return child;
        const chipValue = child.props.value ?? (typeof child.props.children === 'string' ? child.props.children : '');
        return React.cloneElement(child, {
          selected: currentValue.includes(chipValue),
          onClick: () => toggle(chipValue),
        } as Partial<ChipProps>);
      })}
    </div>
  );
}

const ChipGroup = React.forwardRef<HTMLDivElement, ChipGroupProps>(ChipGroupInner);

// Compose Chip with static Group property
export const Chip = Object.assign(ChipBase, { Group: ChipGroup });
