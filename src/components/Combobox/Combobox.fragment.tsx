import React, { useState } from 'react';
import { defineSegment } from '@fragments/core';
import { Combobox } from '.';

// Stateful wrapper for interactive demos
function StatefulCombobox(props: React.ComponentProps<typeof Combobox> & {
  children: React.ReactNode;
  initialValue?: string | string[];
}) {
  const { initialValue, children, ...rest } = props;
  const [value, setValue] = useState<string | string[] | null>(initialValue ?? (props.multiple ? [] : null));
  return (
    <Combobox {...rest} value={value} onValueChange={setValue}>
      {children}
    </Combobox>
  );
}

export default defineSegment({
  component: Combobox,

  meta: {
    name: 'Combobox',
    description: 'Searchable select input that filters a dropdown list of options as you type. Supports single and multiple selection with chips.',
    category: 'forms',
    status: 'stable',
    tags: ['combobox', 'autocomplete', 'search', 'select', 'typeahead', 'form', 'multiselect'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Users need to search/filter through many options',
      'Large option lists where scrolling is impractical',
      'When users might know what they are looking for',
      'Autocomplete or typeahead functionality',
      'Multiple selections from a searchable list',
    ],
    whenNot: [
      'Few options (under 5) - use Select or RadioGroup',
      'Free-form text with no predefined options - use Input',
      'Non-searchable single selection - use Select',
      'Actions, not selection - use Menu',
    ],
    guidelines: [
      'Include a placeholder that explains what to search for',
      'Provide an empty state message when no results match',
      'Group related options with Combobox.Group for large lists',
      'Keep option text concise and searchable',
      'Use multiple prop for multi-select with chip display',
    ],
    accessibility: [
      'Full keyboard navigation support (arrow keys, enter, escape)',
      'Type-ahead filtering within options',
      'Proper ARIA combobox roles and attributes',
      'Screen reader announcements for filtered results',
      'Chip removal via keyboard in multi-select mode',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Combobox input and content',
      required: true,
    },
    value: {
      type: 'string',
      description: 'Controlled selected value (string for single, string[] for multiple)',
    },
    defaultValue: {
      type: 'string',
      description: 'Default selected value (uncontrolled)',
    },
    onValueChange: {
      type: 'function',
      description: 'Called when selection changes',
    },
    multiple: {
      type: 'boolean',
      description: 'Allow multiple selections with chips',
      default: 'false',
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder text for the input',
    },
    disabled: {
      type: 'boolean',
      description: 'Disable the combobox',
      default: 'false',
    },
    autoHighlight: {
      type: 'boolean',
      description: 'Auto-highlight first matching item while filtering',
      default: 'true',
    },
  },

  relations: [
    { component: 'Select', relationship: 'alternative', note: 'Use Select when search/filtering is not needed' },
    { component: 'Input', relationship: 'sibling', note: 'Use Input for free-form text entry' },
    { component: 'Listbox', relationship: 'sibling', note: 'Use Listbox for inline option lists' },
  ],

  contract: {
    propsSummary: [
      'value: string | string[] - controlled selected value',
      'onValueChange: (value) => void - selection handler',
      'multiple: boolean - enable multi-select with chips',
      'placeholder: string - input placeholder text',
      'disabled: boolean - disable combobox',
      'autoHighlight: boolean - auto-highlight first match',
    ],
    scenarioTags: [
      'form.combobox',
      'form.autocomplete',
      'form.multiselect',
      'input.search',
    ],
    a11yRules: ['A11Y_COMBOBOX_KEYBOARD', 'A11Y_COMBOBOX_LABEL'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Input', 'Trigger', 'Content', 'Item', 'ItemIndicator', 'Empty', 'Group', 'GroupLabel'],
    requiredChildren: ['Input', 'Content'],
    commonPatterns: [
      '<Combobox placeholder="Search..."><Combobox.Input /><Combobox.Content><Combobox.Item value="opt1">{label1}</Combobox.Item><Combobox.Item value="opt2">{label2}</Combobox.Item></Combobox.Content></Combobox>',
      '<Combobox multiple placeholder="Select items..."><Combobox.Input /><Combobox.Content><Combobox.Item value="opt1">{label1}</Combobox.Item><Combobox.Item value="opt2">{label2}</Combobox.Item></Combobox.Content></Combobox>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic searchable select',
      render: () => (
        <StatefulCombobox placeholder="Select a fruit">
          <Combobox.Input />
          <Combobox.Content>
            <Combobox.Item value="apple">Apple</Combobox.Item>
            <Combobox.Item value="banana">Banana</Combobox.Item>
            <Combobox.Item value="orange">Orange</Combobox.Item>
            <Combobox.Item value="grape">Grape</Combobox.Item>
          </Combobox.Content>
        </StatefulCombobox>
      ),
    },
    {
      name: 'Multiple Selection',
      description: 'Multi-select with chips',
      render: () => (
        <StatefulCombobox multiple placeholder="Select fruits...">
          <Combobox.Input />
          <Combobox.Content>
            <Combobox.Item value="apple">Apple</Combobox.Item>
            <Combobox.Item value="banana">Banana</Combobox.Item>
            <Combobox.Item value="orange">Orange</Combobox.Item>
            <Combobox.Item value="grape">Grape</Combobox.Item>
            <Combobox.Item value="mango">Mango</Combobox.Item>
            <Combobox.Item value="kiwi">Kiwi</Combobox.Item>
          </Combobox.Content>
        </StatefulCombobox>
      ),
    },
    {
      name: 'With Groups',
      description: 'Options organized into groups',
      render: () => (
        <StatefulCombobox placeholder="Search countries...">
          <Combobox.Input />
          <Combobox.Content>
            <Combobox.Group>
              <Combobox.GroupLabel>North America</Combobox.GroupLabel>
              <Combobox.Item value="us">United States</Combobox.Item>
              <Combobox.Item value="ca">Canada</Combobox.Item>
              <Combobox.Item value="mx">Mexico</Combobox.Item>
            </Combobox.Group>
            <Combobox.Group>
              <Combobox.GroupLabel>Europe</Combobox.GroupLabel>
              <Combobox.Item value="uk">United Kingdom</Combobox.Item>
              <Combobox.Item value="de">Germany</Combobox.Item>
              <Combobox.Item value="fr">France</Combobox.Item>
            </Combobox.Group>
          </Combobox.Content>
        </StatefulCombobox>
      ),
    },
    {
      name: 'With Empty State',
      description: 'Shows message when no results match',
      render: () => (
        <StatefulCombobox placeholder="Search programming languages...">
          <Combobox.Input />
          <Combobox.Content>
            <Combobox.Empty>No results found</Combobox.Empty>
            <Combobox.Item value="js">JavaScript</Combobox.Item>
            <Combobox.Item value="ts">TypeScript</Combobox.Item>
            <Combobox.Item value="py">Python</Combobox.Item>
            <Combobox.Item value="rs">Rust</Combobox.Item>
            <Combobox.Item value="go">Go</Combobox.Item>
          </Combobox.Content>
        </StatefulCombobox>
      ),
    },
    {
      name: 'Disabled',
      description: 'Disabled combobox',
      render: () => (
        <Combobox disabled placeholder="Search...">
          <Combobox.Input />
          <Combobox.Content>
            <Combobox.Item value="1">Option 1</Combobox.Item>
          </Combobox.Content>
        </Combobox>
      ),
    },
  ],
});
