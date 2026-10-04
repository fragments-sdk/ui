import type { Meta, StoryObj } from "@storybook/react";
import { AppShell } from ".";
import { Button } from "../Button";
import { Header } from "../Header";
import { Input } from "../Input";
import { Main } from "../Main";
import { Sidebar } from "../Sidebar";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * AppShell is the application frame: header, sidebar, main and an optional
 * aside on one grid that fills the viewport. It holds the sidebar state, so
 * Header.Trigger and useSidebar read it. Put a Main inside AppShell.Main: Main
 * owns the gutter and the `<main>` landmark.
 */
const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component:
          "The application frame: header, sidebar, main and an optional aside, with the sidebar state.",
      },
    },
  },
  argTypes: {
    layout: {
      control: "select",
      options: ["default", "sidebar"],
      description: "Where the header sits.",
    },
    collapsible: {
      control: "select",
      options: ["icon", "offcanvas", "none"],
      description: "How the rail collapses.",
    },
  },
  args: {
    layout: "default",
    children: null,
  },
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

function Glyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
    </svg>
  );
}

function Nav() {
  return (
    <Sidebar.Nav>
      <Sidebar.Section label="Workspace">
        <Sidebar.Item icon={<Glyph />} href="#overview" active>
          Overview
        </Sidebar.Item>
        <Sidebar.Item icon={<Glyph />} href="#findings" badge="12">
          Findings
        </Sidebar.Item>
        <Sidebar.Item icon={<Glyph />} href="#contract">
          Contract
        </Sidebar.Item>
      </Sidebar.Section>
      <Sidebar.Section label="Settings">
        <Sidebar.Item icon={<Glyph />} href="#members">
          Members
        </Sidebar.Item>
      </Sidebar.Section>
    </Sidebar.Nav>
  );
}

function Page() {
  return (
    <Main>
      <Main.Header>
        <Main.Title>Overview</Main.Title>
        <Main.Description>
          <p>Every repository passed its last check.</p>
        </Main.Description>
      </Main.Header>
    </Main>
  );
}

/** Header across the top, the rail below it. */
export const DefaultLayout: Story = {
  render: (args) => (
    <AppShell {...args} style={{ blockSize: 480 }}>
      <AppShell.Header>
        <Header>
          <Header.SkipLink />
          <Header.Trigger />
          <Header.Brand href="#">Fragments</Header.Brand>
          <Header.Actions>
            <Button variant="soft">Invite</Button>
          </Header.Actions>
        </Header>
      </AppShell.Header>
      <AppShell.Sidebar>
        <Nav />
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </AppShell.Sidebar>
      <AppShell.Main>
        <Page />
      </AppShell.Main>
    </AppShell>
  ),
};

/** The rail runs the full height and carries the brand; the header sits beside it. */
export const SidebarLayout: Story = {
  render: () => (
    <AppShell layout="sidebar" style={{ blockSize: 480 }}>
      <AppShell.Header>
        <Header>
          <Header.SkipLink />
          <Header.Trigger />
          <Header.Search>
            <Input placeholder="Search…" aria-label="Search" />
          </Header.Search>
          <Header.Actions>
            <Button>New check</Button>
          </Header.Actions>
        </Header>
      </AppShell.Header>
      <AppShell.Sidebar>
        <Sidebar.Header>Fragments</Sidebar.Header>
        <Nav />
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </AppShell.Sidebar>
      <AppShell.Main>
        <Page />
      </AppShell.Main>
    </AppShell>
  ),
};

/** The aside is the surface plane at the wide sidebar width; below lg it drops under main. */
export const WithAside: Story = {
  render: () => (
    <AppShell style={{ blockSize: 480 }}>
      <AppShell.Header>
        <Header>
          <Header.Brand href="#">Fragments</Header.Brand>
        </Header>
      </AppShell.Header>
      <AppShell.Sidebar>
        <Nav />
      </AppShell.Sidebar>
      <AppShell.Main>
        <Page />
      </AppShell.Main>
      <AppShell.Aside aria-label="Details">
        <Main as="div">
          <Main.Header>
            <Main.Title as="h2">Details</Main.Title>
          </Main.Header>
        </Main>
      </AppShell.Aside>
    </AppShell>
  ),
};

/** Collapsed to the glyphs; labels move into tooltips. The column follows at once. */
export const CollapsedRail: Story = {
  render: () => (
    <AppShell defaultCollapsed style={{ blockSize: 480 }}>
      <AppShell.Header>
        <Header>
          <Header.Brand href="#">Fragments</Header.Brand>
        </Header>
      </AppShell.Header>
      <AppShell.Sidebar>
        <Nav />
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </AppShell.Sidebar>
      <AppShell.Main>
        <Page />
      </AppShell.Main>
    </AppShell>
  ),
};

/** Offcanvas: collapsing takes the rail off the canvas and Header.Trigger brings it back. */
export const OffcanvasRail: Story = {
  render: () => (
    <AppShell collapsible="offcanvas" style={{ blockSize: 480 }}>
      <AppShell.Header>
        <Header>
          <Header.Trigger />
          <Header.Brand href="#">Fragments</Header.Brand>
        </Header>
      </AppShell.Header>
      <AppShell.Sidebar>
        <Nav />
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </AppShell.Sidebar>
      <AppShell.Main>
        <Page />
      </AppShell.Main>
    </AppShell>
  ),
};
