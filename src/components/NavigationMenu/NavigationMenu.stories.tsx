import type { Meta, StoryObj } from '@storybook/react';
import { NavigationMenu } from '.';

/**
 * Rich header navigation menu with dropdown content panels, animated viewport
 * transitions, and an automatic mobile drawer. Compose with `NavigationMenu.List`,
 * `NavigationMenu.Item`, `NavigationMenu.Trigger`, `NavigationMenu.Content`,
 * `NavigationMenu.Link`, and `NavigationMenu.Viewport`.
 */
const meta = {
  title: 'Navigation/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Header navigation menu with dropdown panels and responsive drawer.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Menu orientation',
    },
  },
  args: {
    orientation: 'horizontal',
    children: (
      <>
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Viewport />
      </>
    ),
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenu.List>
        <NavigationMenu.Item value="products">
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link
              href="/analytics"
              title="Analytics"
              description="Track your metrics and KPIs."
            />
            <NavigationMenu.Link
              href="/automation"
              title="Automation"
              description="Automate your workflows."
            />
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="resources">
          <NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link
              href="/docs"
              title="Documentation"
              description="Comprehensive API reference."
            />
            <NavigationMenu.Link
              href="/blog"
              title="Blog"
              description="Latest news and updates."
            />
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Viewport />
    </NavigationMenu>
  ),
};

export const WithSimpleLinks: Story = {
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenu.List>
        <NavigationMenu.Item value="company">
          <NavigationMenu.Trigger>Company</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '4px',
                minWidth: '160px',
              }}
            >
              <NavigationMenu.Link href="/about">About</NavigationMenu.Link>
              <NavigationMenu.Link href="/careers">Careers</NavigationMenu.Link>
              <NavigationMenu.Link href="/contact">Contact</NavigationMenu.Link>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/blog">Blog</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Viewport />
    </NavigationMenu>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenu.List>
        <NavigationMenu.Item value="overview">
          <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <div style={{ padding: '8px', minWidth: '200px' }}>
              <NavigationMenu.Link
                href="/intro"
                title="Introduction"
                description="Learn the basics."
              />
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="guides">
          <NavigationMenu.Trigger>Guides</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <div style={{ padding: '8px', minWidth: '200px' }}>
              <NavigationMenu.Link
                href="/install"
                title="Installation"
                description="Get started quickly."
              />
              <NavigationMenu.Link
                href="/config"
                title="Configuration"
                description="Customize your setup."
              />
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Viewport />
    </NavigationMenu>
  ),
};
