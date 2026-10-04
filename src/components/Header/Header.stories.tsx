import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Header } from ".";
import { Button } from "../Button";
import { Drawer } from "../Drawer";
import { Input } from "../Input";
import { Sidebar } from "../Sidebar";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Header is the top bar: a canvas band at the header height token with a 16
 * page gutter. Compose Header.Brand, Header.Nav (NavItem and NavMenu),
 * Header.Search, Header.Actions and Header.Trigger inside the root.
 */
const meta = {
  title: "Navigation/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component:
          "The top bar: brand, a horizontal nav with dropdown groups, search, actions and the navigation trigger.",
      },
    },
  },
  argTypes: {
    position: {
      control: "select",
      options: ["static", "sticky"],
      description: "`sticky` keeps the bar at the top of its scroll container.",
    },
    elevatedOnScroll: {
      control: "boolean",
      description: "Draw the bottom hairline once the page scrolls.",
    },
  },
  args: {
    position: "static",
    children: null,
  },
} satisfies Meta<typeof Header>;

export default meta;

// Typed from the component, not the meta: every story renders its own
// children, and JSX stays out of component-level args (Storybook docs).
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  render: (args) => (
    <Header {...args}>
      <Header.SkipLink />
      <Header.Brand href="#">Fragments</Header.Brand>
      <Header.Nav>
        <Header.NavItem href="#overview" active>
          Overview
        </Header.NavItem>
        <Header.NavItem href="#findings">Findings</Header.NavItem>
        <Header.NavItem href="#contract">Contract</Header.NavItem>
      </Header.Nav>
      <Header.Actions>
        <Button variant="soft">Sign in</Button>
      </Header.Actions>
    </Header>
  ),
};

/** A nav group opens a floating list; the current page is marked inside it and on the trigger. */
export const WithNavMenu: Story = {
  render: () => (
    <Header>
      <Header.Brand href="#">Fragments</Header.Brand>
      <Header.Nav>
        <Header.NavItem href="#overview">Overview</Header.NavItem>
        <Header.NavMenu label="Governance" active>
          <Header.NavMenuItem href="#findings">Findings</Header.NavMenuItem>
          <Header.NavMenuItem href="#contract" active>
            Contract
          </Header.NavMenuItem>
          <Header.NavMenuItem disabled>Exceptions</Header.NavMenuItem>
        </Header.NavMenu>
        <Header.NavItem disabled>Billing</Header.NavItem>
      </Header.Nav>
      <Header.Actions>
        <Button variant="soft">Sign in</Button>
      </Header.Actions>
    </Header>
  ),
};

/** Search sits between nav and actions; the Input owns its own fill. */
export const WithSearch: Story = {
  render: () => (
    <Header>
      <Header.Brand href="#">Fragments</Header.Brand>
      <Header.Search>
        <Input placeholder="Search…" aria-label="Search" />
      </Header.Search>
      <Header.Actions>
        <Button variant="ghost">Docs</Button>
        <Button>New check</Button>
      </Header.Actions>
    </Header>
  ),
};

/** Router links: pass `render` and the look and props move onto your element. */
export const RouterLinks: Story = {
  render: () => (
    <Header>
      <Header.Brand render={<a href="#home" />}>Fragments</Header.Brand>
      <Header.Nav>
        <Header.NavItem render={<a href="#overview" />} active>
          Overview
        </Header.NavItem>
        <Header.NavItem render={<a href="#findings" />}>Findings</Header.NavItem>
      </Header.Nav>
    </Header>
  ),
};

/** Sticky with the scroll hairline: the edge appears after 16px of scroll. */
export const StickyWithScrollHairline: Story = {
  render: () => (
    <div style={{ blockSize: 320, overflow: "auto" }}>
      <Header position="sticky" elevatedOnScroll>
        <Header.Brand href="#">Fragments</Header.Brand>
        <Header.Actions>
          <Button variant="soft">Sign in</Button>
        </Header.Actions>
      </Header>
      <div style={{ blockSize: 800 }} />
    </div>
  ),
};

/**
 * Without a sidebar, the trigger shows while the bar is narrower than md. Open a
 * Drawer of `Sidebar.Item` rows from it: the same rows, current marking and
 * hit areas as the rail.
 */
export const MobileNavigation: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: function MobileNavigationStory() {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Header>
          <Header.Trigger aria-expanded={open} onClick={() => setOpen(true)} />
          <Header.Brand href="#">Fragments</Header.Brand>
          <Header.Nav>
            <Header.NavItem href="#overview" active>
              Overview
            </Header.NavItem>
            <Header.NavItem href="#findings">Findings</Header.NavItem>
          </Header.Nav>
        </Header>
        <Drawer open={open} onOpenChange={setOpen}>
          <Drawer.Content side="start">
            <Drawer.Header>
              <Drawer.Title>Navigation</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Sidebar.Nav aria-label="Main navigation">
                <Sidebar.Section>
                  <Sidebar.Item href="#overview" active onClick={() => setOpen(false)}>
                    Overview
                  </Sidebar.Item>
                  <Sidebar.Item href="#findings" onClick={() => setOpen(false)}>
                    Findings
                  </Sidebar.Item>
                </Sidebar.Section>
              </Sidebar.Nav>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      </>
    );
  },
};
