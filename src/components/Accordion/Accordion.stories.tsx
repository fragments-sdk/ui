import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from '.';

/**
 * Accordion presents vertically stacked, collapsible content sections for
 * progressive disclosure. It is a compound component: compose Accordion.Item,
 * Accordion.Trigger, and Accordion.Content inside the root.
 */
const meta = {
  title: 'Layout/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Vertically stacked, collapsible content sections for progressive disclosure.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'Whether one or multiple items can be open',
    },
    collapsible: {
      control: 'boolean',
      description: 'Whether all items can be closed (single mode only)',
    },
    headingLevel: {
      control: 'select',
      options: ['2', '3', '4', '5', '6'],
      description: 'Semantic heading level for accordion triggers',
    },
  },
  args: {
    type: 'single',
    collapsible: true,
    children: (
      <Accordion.Item value="item-1">
        <Accordion.Trigger>Section</Accordion.Trigger>
        <Accordion.Content>Collapsible content.</Accordion.Content>
      </Accordion.Item>
    ),
  },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>What is Fragments UI?</Accordion.Trigger>
        <Accordion.Content>
          A React component library built on Base UI primitives.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Trigger>How do I install it?</Accordion.Trigger>
        <Accordion.Content>Install via pnpm add @fragments-sdk/ui.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
        <Accordion.Content>Yes, all components follow WAI-ARIA guidelines.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={['features', 'pricing']}>
      <Accordion.Item value="features">
        <Accordion.Trigger>Features</Accordion.Trigger>
        <Accordion.Content>Comprehensive components with theming support.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="pricing">
        <Accordion.Trigger>Pricing</Accordion.Trigger>
        <Accordion.Content>Free and open source, MIT licensed.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="support">
        <Accordion.Trigger>Support</Accordion.Trigger>
        <Accordion.Content>Community support via GitHub.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <Accordion type="single" collapsible>
      <Accordion.Item value="available">
        <Accordion.Trigger>Available Section</Accordion.Trigger>
        <Accordion.Content>This section can be expanded and collapsed.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="disabled" disabled>
        <Accordion.Trigger>Disabled Section</Accordion.Trigger>
        <Accordion.Content>This content is not accessible.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};
