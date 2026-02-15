import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { Slider } from '.';

export default defineFragment({
  component: Slider,

  meta: {
    name: 'Slider',
    description: 'Range input control for selecting a numeric value within a defined range. Supports labels, value display, and custom step intervals.',
    category: 'forms',
    status: 'stable',
    tags: ['slider', 'range', 'input', 'number', 'control'],
    since: '0.2.0',
  },

  usage: {
    when: [
      'Selecting a value from a continuous range',
      'Volume or brightness controls',
      'Price range filters',
      'Settings that benefit from visual feedback',
    ],
    whenNot: [
      'Precise numeric input (use Input type="number")',
      'Discrete options (use RadioGroup or Select)',
      'Yes/no choices (use Switch)',
    ],
    guidelines: [
      'Always provide a label describing what the slider controls',
      'Show the current value when precision matters',
      'Use appropriate min/max values for the context',
      'Consider step size for usability',
    ],
    accessibility: [
      'Label is associated with the slider',
      'Keyboard accessible with arrow keys',
      'Current value is announced to screen readers',
      'Uses native slider semantics',
    ],
  },

  props: {
    value: {
      type: 'number',
      description: 'Controlled value',
    },
    defaultValue: {
      type: 'number',
      description: 'Default value for uncontrolled usage',
    },
    onChange: {
      type: 'function',
      description: 'Called with new value when changed',
    },
    min: {
      type: 'number',
      description: 'Minimum value',
      default: '0',
    },
    max: {
      type: 'number',
      description: 'Maximum value',
      default: '100',
    },
    step: {
      type: 'number',
      description: 'Step interval',
      default: '1',
    },
    label: {
      type: 'string',
      description: 'Label text',
    },
    showValue: {
      type: 'boolean',
      description: 'Display current value',
      default: 'false',
    },
    valueSuffix: {
      type: 'string',
      description: 'Suffix after value (e.g., "%", "px")',
    },
    disabled: {
      type: 'boolean',
      description: 'Disable the slider',
      default: 'false',
    },
  },

  relations: [
    { component: 'Input', relationship: 'alternative', note: 'Use Input for precise numeric entry' },
    { component: 'Progress', relationship: 'sibling', note: 'Similar visual, but Progress is read-only' },
  ],

  contract: {
    propsSummary: [
      'value: number - controlled value',
      'defaultValue: number - initial value',
      'onChange: (value: number) => void - change handler',
      'min/max: number - range bounds',
      'step: number - increment size',
      'label: string - field label',
      'showValue: boolean - display value',
      'valueSuffix: string - unit suffix',
    ],
    scenarioTags: [
      'forms.range',
      'input.numeric',
      'control.slider',
    ],
    a11yRules: ['A11Y_LABEL_REQUIRED', 'A11Y_KEYBOARD_ACCESSIBLE', 'A11Y_TARGET_SIZE_MIN'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic slider with label',
      render: () => (
        <div style={{ width: '300px' }}>
          <Slider label="Volume" defaultValue={50} />
        </div>
      ),
    },
    {
      name: 'With Value Display',
      description: 'Shows current value alongside the slider',
      render: () => (
        <div style={{ width: '300px' }}>
          <Slider
            label="Brightness"
            defaultValue={75}
            showValue
            valueSuffix="%"
          />
        </div>
      ),
    },
    {
      name: 'Custom Range',
      description: 'Custom min, max, and step values',
      render: () => (
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Slider
            label="Temperature"
            min={60}
            max={80}
            step={1}
            defaultValue={72}
            showValue
            valueSuffix="°F"
          />
          <Slider
            label="Font Size"
            min={12}
            max={32}
            step={2}
            defaultValue={16}
            showValue
            valueSuffix="px"
          />
        </div>
      ),
    },
    {
      name: 'Controlled',
      description: 'Controlled slider with external state',
      render: () => {
        const [value, setValue] = React.useState(50);
        return (
          <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Slider
              label="Opacity"
              value={value}
              onChange={setValue}
              showValue
              valueSuffix="%"
            />
            <div style={{ fontSize: '14px', color: 'var(--fui-text-secondary)' }}>
              Current value: {value}%
            </div>
          </div>
        );
      },
    },
    {
      name: 'Disabled',
      description: 'Disabled slider',
      render: () => (
        <div style={{ width: '300px' }}>
          <Slider
            label="Locked Setting"
            defaultValue={30}
            showValue
            disabled
          />
        </div>
      ),
    },
  ],
});
