import type { Meta, StoryObj } from "@storybook/react";
import { Header } from ".";
import { Button } from "../Button";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Header is a composable header with slots for brand, navigation, search, and
 * actions. It is a compound component: compose Header.Brand, Header.Nav,
 * Header.NavItem, Header.Spacer, and Header.Actions inside the root. Designed
 * for use within AppShell with responsive mobile support.
 */
const meta = {
  title: "Navigation/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Composable header with slots for brand, navigation, search, and actions.",
      },
    },
  },
  argTypes: {
    position: {
      control: "select",
      options: ["static", "fixed", "sticky"],
      description: "Position behavior (usually controlled by AppShell)",
    },
  },
  args: {
    position: "static",
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
        <Button variant="soft" size="sm">
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
          <Header.NavMenuItem href="/getting-started">Getting Started</Header.NavMenuItem>
          <Header.NavMenuItem href="/cli">CLI Reference</Header.NavMenuItem>
          <Header.NavMenuItem href="/mcp">MCP Tools</Header.NavMenuItem>
        </Header.NavMenu>
        <Header.NavItem href="/blog">Blog</Header.NavItem>
      </Header.Nav>
      <Header.Spacer />
      <Header.Actions>
        <Button variant="solid" size="sm">
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
        <Button variant="soft" size="sm">
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

/**
 * Mobile navigation drawer. Header.Trigger only renders below the `md`
 * breakpoint, so view this story in a mobile viewport. The drawer is an
 * overlay panel — it renders the same inset floating surface as Drawer
 * (UIR-D41).
 */
export const MobileNav: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => (
    <Header>
      <Header.Trigger />
      <Header.Brand href="/">MyApp</Header.Brand>
      <Header.Spacer />
      <Header.Actions>
        <Button variant="soft" size="sm">
          Sign In
        </Button>
      </Header.Actions>
      <Header.MobileNav>
        <Header.MobileNavLink href="/dashboard" active>
          Dashboard
        </Header.MobileNavLink>
        <Header.MobileNavLink href="/projects">Projects</Header.MobileNavLink>
        <Header.MobileNavLink href="/settings">Settings</Header.MobileNavLink>
        <Header.MobileNavActions>
          <Button variant="solid" size="sm">
            Sign Up
          </Button>
        </Header.MobileNavActions>
      </Header.MobileNav>
    </Header>
  ),
};
