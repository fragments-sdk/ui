import type { Meta, StoryObj } from '@storybook/react';
import { Header } from '.';
import { Button } from '../Button';

/**
 * Header is a composable header with slots for brand, navigation, search, and
 * actions. It is a compound component: compose Header.Brand, Header.Nav,
 * Header.NavItem, Header.Spacer, and Header.Actions inside the root. Designed
 * for use within AppShell with responsive mobile support.
 */
const meta = {
  title: 'Navigation/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Composable header with slots for brand, navigation, search, and actions.',
      },
    },
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['static', 'fixed', 'sticky'],
      description: 'Position behavior (usually controlled by AppShell)',
    },
  },
  args: {
    position: 'static',
    children: (
      <>
        <Header.Brand href="/">MyApp</Header.Brand>
        <Header.Nav>
          <Header.NavItem href="/dashboard" active>
            Dashboard
          </Header.NavItem>
          <Header.NavItem href="/projects">Projects</Header.NavItem>
        </Header.Nav>
        <Header.Spacer />
        <Header.Actions>
          <Button variant="secondary" size="sm">
            Sign In
          </Button>
        </Header.Actions>
      </>
    ),
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Header>
      <Header.SkipLink />
      <Header.Brand href="/">MyApp</Header.Brand>
      <Header.Nav>
        <Header.NavItem href="/dashboard" active>
          Dashboard
        </Header.NavItem>
        <Header.NavItem href="/projects">Projects</Header.NavItem>
        <Header.NavItem href="/settings">Settings</Header.NavItem>
      </Header.Nav>
      <Header.Spacer />
      <Header.Actions>
        <Button variant="secondary" size="sm">
          Sign In
        </Button>
      </Header.Actions>
    </Header>
  ),
};

export const WithDropdownNav: Story = {
  render: () => (
    <Header>
      <Header.Brand href="/">MyApp</Header.Brand>
      <Header.Nav>
        <Header.NavItem href="/components" active>
          Components
        </Header.NavItem>
        <Header.NavItem href="/blocks">Blocks</Header.NavItem>
        <Header.NavMenu label="Docs">
          <Header.NavMenuItem href="/getting-started">
            Getting Started
          </Header.NavMenuItem>
          <Header.NavMenuItem href="/cli">CLI Reference</Header.NavMenuItem>
          <Header.NavMenuItem href="/mcp">MCP Tools</Header.NavMenuItem>
        </Header.NavMenu>
        <Header.NavItem href="/blog">Blog</Header.NavItem>
      </Header.Nav>
      <Header.Spacer />
      <Header.Actions>
        <Button variant="primary" size="sm">
          Sign Up
        </Button>
      </Header.Actions>
    </Header>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Header>
      <Header.Brand href="/">MyApp</Header.Brand>
      <Header.Spacer />
      <Header.Actions>
        <Button variant="secondary" size="sm">
          Account
        </Button>
      </Header.Actions>
    </Header>
  ),
};

export const Sticky: Story = {
  render: () => (
    <Header position="sticky">
      <Header.Brand href="/">MyApp</Header.Brand>
      <Header.Nav>
        <Header.NavItem href="/" active>
          Home
        </Header.NavItem>
        <Header.NavItem href="/about">About</Header.NavItem>
      </Header.Nav>
      <Header.Spacer />
    </Header>
  ),
};
