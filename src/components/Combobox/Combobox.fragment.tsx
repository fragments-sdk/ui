import React, { useState } from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Combobox, type ComboboxMultipleProps, type ComboboxSingleProps } from '.';
// Stateful wrapper for interactive demos
function StatefulCombobox(
  props:
    | (Omit<React.ComponentProps<typeof Combobox>, 'value' | 'onValueChange'> & {
        children: React.ReactNode;
        multiple: true;
        initialValue?: string[];
      })
    | (Omit<React.ComponentProps<typeof Combobox>, 'value' | 'onValueChange'> & {
        children: React.ReactNode;
        multiple?: false;
        initialValue?: string;
      })
) {
  const { initialValue, children, ...rest } = props;

  if (props.multiple) {
    const [value, setValue] = useState<string[]>(
      Array.isArray(initialValue) ? initialValue : []
    );
    const multiProps = rest as Omit<React.ComponentProps<typeof Combobox>, 'value' | 'onValueChange'> & {
      multiple: true;
    };
    const MultiCombobox = Combobox as unknown as (props: ComboboxMultipleProps) => React.JSX.Element;
    return (
      <MultiCombobox {...(multiProps as ComboboxMultipleProps)} multiple value={value} onValueChange={setValue}>
        {children}
      </MultiCombobox>
    );
  }

  const [value, setValue] = useState<string | null>(
    typeof initialValue === 'string' ? initialValue : null
  );
  const singleProps = rest as Omit<React.ComponentProps<typeof Combobox>, 'value' | 'onValueChange'> & {
    multiple?: false;
  };
  const SingleCombobox = Combobox as unknown as (props: ComboboxSingleProps) => React.JSX.Element;
  return (
    <SingleCombobox {...(singleProps as ComboboxSingleProps)} value={value} onValueChange={setValue}>
      {children}
    </SingleCombobox>
  );
}

export default defineFragment({
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
      'Use label prop for accessible field labeling',
      'Use helperText for guidance and error for validation messages',
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
      type: 'union',
      description: 'Controlled selected value (string for single, string[] for multiple)',
    },
    defaultValue: {
      type: 'union',
      description: 'Default selected value (uncontrolled)',
    },
    onValueChange: {
      type: 'function',
      description: 'Called when selection changes',
    },
    onChange: {
      type: 'function',
      description: 'Alias for onValueChange',
    },
    multiple: {
      type: 'boolean',
      description: 'Allow multiple selections with chips',
      default: 'false',
    },
    open: {
      type: 'boolean',
      description: 'Controlled open state of the dropdown',
    },
    defaultOpen: {
      type: 'boolean',
      description: 'Initial open state for uncontrolled usage',
      default: 'false',
    },
    onOpenChange: {
      type: 'function',
      description: 'Called when dropdown open state changes',
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder text for the input',
    },
    label: {
      type: 'string',
      description: 'Visible label text above the combobox',
    },
    helperText: {
      type: 'string',
      description: 'Helper text shown below the combobox',
    },
    error: {
      type: 'union',
      description: 'Show error styling. When a string is provided, it is displayed as an error message.',
    },
    disabled: {
      type: 'boolean',
      description: 'Disable the combobox',
      default: 'false',
    },
    size: {
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: 'Size variant',
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
      'onChange: (value) => void - alias for onValueChange',
      'multiple: boolean - enable multi-select with chips',
      'When multiple=true, value/defaultValue must be string[] (single mode uses string|null)',
      'placeholder: string - input placeholder text',
      'label: string - visible label text',
      'helperText: string - helper text below field',
      'error: boolean | string - error styling and message',
      'disabled: boolean - disable combobox',
      'size: sm|md|lg (default: md)',
      'autoHighlight: boolean - auto-highlight first match',
      'Combobox.Input showTrigger: boolean - hide built-in trigger when using Combobox.Trigger explicitly',
      'maxVisibleItems: number - max visible options before scrolling (default 4)',
    ],
    scenarioTags: [
      'form.combobox',
      'form.autocomplete',
      'form.multiselect',
      'input.search',
    ],
    a11yRules: ['A11Y_COMBOBOX_KEYBOARD', 'A11Y_COMBOBOX_LABEL', 'A11Y_TARGET_SIZE_MIN'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Input', 'Trigger', 'Content', 'Item', 'ItemIndicator', 'Empty', 'Group', 'GroupLabel'],
    requiredChildren: ['Input', 'Content'],
    commonPatterns: [
      '<Combobox placeholder="Search..."><Combobox.Input /><Combobox.Content><Combobox.Item value="opt1">{label1}</Combobox.Item><Combobox.Item value="opt2">{label2}</Combobox.Item></Combobox.Content></Combobox>',
      '<Combobox multiple placeholder="Select items..."><Combobox.Input /><Combobox.Content><Combobox.Item value="opt1">{label1}</Combobox.Item><Combobox.Item value="opt2">{label2}</Combobox.Item></Combobox.Content></Combobox>',
      '<Combobox placeholder="Search..."><Combobox.Input showTrigger={false} /><Combobox.Trigger aria-label="Open" /><Combobox.Content>...</Combobox.Content></Combobox>',
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
      name: 'With Label and Helper Text',
      description: 'Combobox with built-in label and helper text',
      render: () => (
        <StatefulCombobox
          label="Assignee"
          placeholder="Search assignees..."
          helperText="Type to filter the list of available assignees."
        >
          <Combobox.Input />
          <Combobox.Content>
            <Combobox.Empty>No matches</Combobox.Empty>
            <Combobox.Item value="alice">Alice Johnson</Combobox.Item>
            <Combobox.Item value="bob">Bob Chen</Combobox.Item>
            <Combobox.Item value="carol">Carol Smith</Combobox.Item>
          </Combobox.Content>
        </StatefulCombobox>
      ),
    },
    {
      name: 'Error State',
      description: 'Validation error with message',
      render: () => (
        <Combobox
          label="Reviewer"
          placeholder="Search reviewers..."
          error="Please select a reviewer"
          disabled
        >
          <Combobox.Input />
          <Combobox.Content>
            <Combobox.Item value="alice">Alice</Combobox.Item>
          </Combobox.Content>
        </Combobox>
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
      name: 'Scrollable List',
      description: 'Long list with scroll hint — shows 4 items with half-peek of the 5th',
      render: () => (
        <StatefulCombobox placeholder="Search languages...">
          <Combobox.Input />
          <Combobox.Content>
            <Combobox.Empty>No results found</Combobox.Empty>
            <Combobox.Item value="js">JavaScript</Combobox.Item>
            <Combobox.Item value="ts">TypeScript</Combobox.Item>
            <Combobox.Item value="py">Python</Combobox.Item>
            <Combobox.Item value="rs">Rust</Combobox.Item>
            <Combobox.Item value="go">Go</Combobox.Item>
            <Combobox.Item value="rb">Ruby</Combobox.Item>
            <Combobox.Item value="java">Java</Combobox.Item>
            <Combobox.Item value="swift">Swift</Combobox.Item>
            <Combobox.Item value="kt">Kotlin</Combobox.Item>
            <Combobox.Item value="cpp">C++</Combobox.Item>
          </Combobox.Content>
        </StatefulCombobox>
      ),
    },
    {
      name: 'Custom Max Visible Items',
      description: 'Show 6 items before scrolling with half-peek scroll hint',
      render: () => (
        <StatefulCombobox placeholder="Search cities...">
          <Combobox.Input />
          <Combobox.Content maxVisibleItems={6}>
            <Combobox.Empty>No results found</Combobox.Empty>
            <Combobox.Item value="nyc">New York</Combobox.Item>
            <Combobox.Item value="lon">London</Combobox.Item>
            <Combobox.Item value="tok">Tokyo</Combobox.Item>
            <Combobox.Item value="par">Paris</Combobox.Item>
            <Combobox.Item value="syd">Sydney</Combobox.Item>
            <Combobox.Item value="ber">Berlin</Combobox.Item>
            <Combobox.Item value="tor">Toronto</Combobox.Item>
            <Combobox.Item value="sin">Singapore</Combobox.Item>
            <Combobox.Item value="dub">Dubai</Combobox.Item>
            <Combobox.Item value="sao">São Paulo</Combobox.Item>
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
    {
      name: 'Explicit Trigger',
      description: 'Hide the built-in input trigger when rendering a separate Combobox.Trigger',
      render: () => (
        <StatefulCombobox placeholder="Search assignees...">
          <Combobox.Input showTrigger={false} />
          <Combobox.Trigger aria-label="Open assignee list" />
          <Combobox.Content>
            <Combobox.Item value="alice">Alice</Combobox.Item>
            <Combobox.Item value="bob">Bob</Combobox.Item>
            <Combobox.Item value="carol">Carol</Combobox.Item>
          </Combobox.Content>
        </StatefulCombobox>
      ),
    },
  ],
});
