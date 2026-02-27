import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { ColorPicker } from '.';

function ControlledColorPickerDemo() {
  const [color, setColor] = React.useState('#ef4444');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <ColorPicker
        label="Accent Color"
        value={color}
        onChange={setColor}
      />
      <div style={{ fontSize: '14px', color: 'var(--fui-text-secondary)' }}>
        Selected: {color}
      </div>
    </div>
  );
}

export default defineFragment({
  component: ColorPicker,

  meta: {
    name: 'ColorPicker',
    description: 'Color selection control with hex input and visual picker. Displays a swatch that opens a full color picker on click.',
    category: 'forms',
    status: 'stable',
    tags: ['color', 'picker', 'input', 'hex', 'swatch', 'theme'],
    since: '0.2.0',
    dependencies: [
      { name: 'react-colorful', version: '>=5.0.0', reason: 'Color picker widget' },
    ],
  },

  usage: {
    when: [
      'Theme customization interfaces',
      'Brand color selection',
      'Design tool color inputs',
      'User preference settings for colors',
    ],
    whenNot: [
      'Predefined color options only (use RadioGroup with swatches)',
      'Simple color display without editing (use a colored Badge)',
      'Color indication only (use semantic color tokens)',
    ],
    guidelines: [
      'Always provide a label to describe what the color is for',
      'Use helperText to explain color usage or constraints',
      'Consider providing color presets alongside the picker for common choices',
      'Validate hex format (#RRGGBB) on input',
    ],
    accessibility: [
      'Label is associated with the color input',
      'Swatch button has appropriate aria-label',
      'Color picker popup is keyboard accessible',
      'Hex input allows direct text entry',
    ],
  },

  props: {
    value: {
      type: 'string',
      description: 'Controlled color value in hex format (#RRGGBB)',
    },
    defaultValue: {
      type: 'string',
      description: 'Default color for uncontrolled usage',
      default: '#000000',
    },
    onChange: {
      type: 'function',
      description: 'Called with new color value when changed',
    },
    label: {
      type: 'string',
      description: 'Label text above the picker',
    },
    helperText: {
      type: 'string',
      description: 'Helper text below the picker (preferred)',
    },
    description: {
      type: 'string',
      description: 'Deprecated alias for helperText',
    },
    disabled: {
      type: 'boolean',
      description: 'Disable the color picker',
      default: 'false',
    },
    size: {
      type: 'enum',
      description: 'Size variant',
      values: ['sm', 'md'],
      default: 'md',
    },
    showInput: {
      type: 'boolean',
      description: 'Show the hex input field',
      default: 'true',
    },
  },

  relations: [
    { component: 'Input', relationship: 'sibling', note: 'ColorPicker is a specialized input for colors' },
    { component: 'RadioGroup', relationship: 'alternative', note: 'Use RadioGroup for predefined color choices' },
    { component: 'Field', relationship: 'parent', note: 'ColorPicker uses Field internally for structure' },
  ],

  contract: {
    propsSummary: [
      'value: string - controlled hex color (#RRGGBB)',
      'defaultValue: string - initial color for uncontrolled usage',
      'onChange: (color: string) => void - change handler',
      'label: string - field label',
      'helperText: string - helper text (preferred)',
      'description: string - deprecated alias for helperText',
      'disabled: boolean - disable interaction',
      'size: sm|md - size variant',
      'showInput: boolean - show hex input field',
    ],
    scenarioTags: [
      'forms.color',
      'input.specialized',
      'theme.customization',
    ],
    a11yRules: ['A11Y_LABEL_REQUIRED', 'A11Y_FOCUS_VISIBLE', 'A11Y_TARGET_SIZE_MIN'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic color picker with label',
      render: () => (
        <ColorPicker
          label="Brand Color"
          defaultValue="#3b82f6"
        />
      ),
    },
    {
      name: 'With Helper Text',
      description: 'Color picker with helper text',
      render: () => (
        <ColorPicker
          label="Primary Color"
          defaultValue="#10b981"
          helperText="This color will be used for buttons and links"
        />
      ),
    },
    {
      name: 'Controlled',
      description: 'Controlled color picker that logs changes',
      render: () => <ControlledColorPickerDemo />,
    },
    {
      name: 'Multiple Pickers',
      description: 'Multiple color pickers for theme configuration',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '240px' }}>
          <ColorPicker label="Primary" defaultValue="#3b82f6" />
          <ColorPicker label="Success" defaultValue="#22c55e" />
          <ColorPicker label="Warning" defaultValue="#f59e0b" />
          <ColorPicker label="Danger" defaultValue="#ef4444" />
        </div>
      ),
    },
    {
      name: 'Compact',
      description: 'Small size with swatch only (no input)',
      render: () => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ColorPicker defaultValue="#ef4444" size="sm" showInput={false} />
          <ColorPicker defaultValue="#f59e0b" size="sm" showInput={false} />
          <ColorPicker defaultValue="#22c55e" size="sm" showInput={false} />
          <ColorPicker defaultValue="#3b82f6" size="sm" showInput={false} />
        </div>
      ),
    },
    {
      name: 'Sizes',
      description: 'Different size variants',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '240px' }}>
          <ColorPicker label="Small" defaultValue="#3b82f6" size="sm" />
          <ColorPicker label="Medium (default)" defaultValue="#3b82f6" size="md" />
        </div>
      ),
    },
    {
      name: 'Disabled',
      description: 'Disabled color picker',
      render: () => (
        <ColorPicker
          label="Locked Color"
          defaultValue="#64748b"
          helperText="This color cannot be changed"
          disabled
        />
      ),
    },
  ],
});
