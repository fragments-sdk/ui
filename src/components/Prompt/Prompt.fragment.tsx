import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { Prompt } from '.';

export default defineFragment({
  component: Prompt,

  meta: {
    name: 'Prompt',
    description: 'Multi-line input with toolbar for AI/chat interfaces',
    category: 'ai',
    status: 'stable',
    tags: ['prompt', 'chat', 'ai', 'input', 'textarea', 'form'],
  },

  usage: {
    when: [
      'Building chat or AI assistant interfaces',
      'Need multi-line input with submit action',
      'Require toolbar with actions like attachments or model selection',
    ],
    whenNot: [
      'Simple single-line text input (use Input)',
      'Basic multi-line without toolbar (use Textarea)',
      'Search-only interface (use Input with search variant)',
    ],
    guidelines: [
      'Always provide an onSubmit handler',
      'Use loading state during API calls',
      'Consider showing usage/token limits for AI contexts',
    ],
    accessibility: [
      'Enter submits, Shift+Enter for newline',
      'Submit button is keyboard accessible',
      'Loading state prevents duplicate submissions',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Prompt composition using Prompt sub-components',
      required: true,
    },
    value: {
      type: 'string',
      description: 'Controlled input value',
    },
    defaultValue: {
      type: 'string',
      description: 'Uncontrolled default value',
    },
    onChange: {
      type: 'function',
      description: 'Called when value changes',
    },
    onSubmit: {
      type: 'function',
      description: 'Called on form submission',
    },
    placeholder: {
      type: 'string',
      default: '"Ask, Search or Chat..."',
      description: 'Placeholder text for the textarea',
    },
    disabled: {
      type: 'boolean',
      default: 'false',
      description: 'Disable the entire prompt',
    },
    loading: {
      type: 'boolean',
      default: 'false',
      description: 'Show loading state',
    },
    minRows: {
      type: 'number',
      default: '1',
      description: 'Minimum number of visible rows',
    },
    maxRows: {
      type: 'number',
      default: '8',
      description: 'Maximum number of visible rows',
    },
    autoResize: {
      type: 'boolean',
      default: 'true',
      description: 'Enable auto-resize based on content',
    },
    submitOnEnter: {
      type: 'boolean',
      default: 'true',
      description: 'Submit on Enter (Shift+Enter for newline)',
    },
    variant: {
      type: 'enum',
      values: ['default', 'fixed', 'sticky'],
      default: 'default',
      description: 'Visual/positioning variant',
    },
  },

  relations: [
    {
      component: 'Input',
      relationship: 'alternative',
      note: 'Use Input for simple single-line text input',
    },
    {
      component: 'Textarea',
      relationship: 'alternative',
      note: 'Use Textarea for multi-line without toolbar',
    },
  ],

  contract: {
    propsSummary: [
      'value: string - controlled input value',
      'onSubmit: (value: string) => void - submission handler',
      'placeholder: string - hint text (default: "Ask, Search or Chat...")',
      'disabled: boolean - disables interaction',
      'loading: boolean - shows loading state',
      'minRows/maxRows: number - row constraints (default: 1/8)',
      'submitOnEnter: boolean - Enter key behavior (default: true)',
    ],
    scenarioTags: [
      'form.prompt',
      'form.chat',
      'form.ai',
      'ui.chat-input',
    ],
    a11yRules: [
      'A11Y_TEXTAREA_LABEL',
      'A11Y_BUTTON_LABEL',
    ],
    bans: [],
  },

  variants: [
    {
      name: 'Basic',
      description: 'Simple prompt with submit button',
      render: () => (
        <Prompt onSubmit={(value) => console.log(value)}>
          <Prompt.Textarea />
          <Prompt.Toolbar>
            <Prompt.Actions />
            <Prompt.Info>
              <Prompt.Submit />
            </Prompt.Info>
          </Prompt.Toolbar>
        </Prompt>
      ),
    },
    {
      name: 'With Actions',
      description: 'Prompt with attachment and mode buttons',
      render: () => (
        <Prompt onSubmit={(value) => console.log(value)}>
          <Prompt.Textarea />
          <Prompt.Toolbar>
            <Prompt.Actions>
              <Prompt.ActionButton aria-label="Add attachment">
                +
              </Prompt.ActionButton>
              <Prompt.ModeButton>Auto</Prompt.ModeButton>
            </Prompt.Actions>
            <Prompt.Info>
              <Prompt.Submit />
            </Prompt.Info>
          </Prompt.Toolbar>
        </Prompt>
      ),
    },
    {
      name: 'With Usage',
      description: 'Shows token usage indicator',
      render: () => (
        <Prompt onSubmit={(value) => console.log(value)}>
          <Prompt.Textarea />
          <Prompt.Toolbar>
            <Prompt.Actions>
              <Prompt.ActionButton aria-label="Add attachment">
                +
              </Prompt.ActionButton>
              <Prompt.ModeButton active>Auto</Prompt.ModeButton>
            </Prompt.Actions>
            <Prompt.Info>
              <Prompt.Usage>52% used</Prompt.Usage>
              <Prompt.Submit />
            </Prompt.Info>
          </Prompt.Toolbar>
        </Prompt>
      ),
    },
    {
      name: 'Loading State',
      description: 'During API submission',
      render: () => (
        <Prompt
          onSubmit={(value) => console.log(value)}
          loading
          defaultValue="Tell me about the weather..."
        >
          <Prompt.Textarea />
          <Prompt.Toolbar>
            <Prompt.Actions>
              <Prompt.ActionButton aria-label="Add attachment">
                +
              </Prompt.ActionButton>
              <Prompt.ModeButton>Auto</Prompt.ModeButton>
            </Prompt.Actions>
            <Prompt.Info>
              <Prompt.Usage>52% used</Prompt.Usage>
              <Prompt.Submit />
            </Prompt.Info>
          </Prompt.Toolbar>
        </Prompt>
      ),
    },
    {
      name: 'Disabled',
      description: 'Non-interactive prompt',
      render: () => (
        <Prompt onSubmit={(value) => console.log(value)} disabled>
          <Prompt.Textarea />
          <Prompt.Toolbar>
            <Prompt.Actions>
              <Prompt.ActionButton aria-label="Add attachment">
                +
              </Prompt.ActionButton>
            </Prompt.Actions>
            <Prompt.Info>
              <Prompt.Submit />
            </Prompt.Info>
          </Prompt.Toolbar>
        </Prompt>
      ),
    },
  ],
});
