import type { Meta, StoryObj } from "@storybook/react";
import { AppShell } from ".";
import { Header } from "../Header";
import { Sidebar } from "../Sidebar";

/**
 * AppShell is the full application layout wrapper integrating header, sidebar,
 * main content, and an optional aside panel. It is a compound component:
 * compose AppShell.Header, AppShell.Sidebar, AppShell.Main, and AppShell.Aside.
 */
const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Full layout wrapper integrating sidebar, header, main content, and optional aside panel.",
      },
    },
  },
  argTypes: {
    layout: {
      control: "select",
      options: ["default", "sidebar", "sidebar-floating", "floating"],
      description: "Structural layout for CSS grid areas",
    },
    bg: {
      control: "text",
      description: "Background color override for the shell container",
    },
  },
  args: {
    layout: "default",
    children: (
      <>
        <AppShell.Header>
          <Header>
            <Header.Brand>MyApp</Header.Brand>
          </Header>
        </AppShell.Header>
        <AppShell.Sidebar width="200px">
          <Sidebar.Nav>
            <Sidebar.Section label="Menu">
              <Sidebar.Item active>Home</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Nav>
        </AppShell.Sidebar>
        <AppShell.Main padding="md">Content</AppShell.Main>
      </>
    ),
  },
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultLayout: Story = {
  render: () => (
    <div style={{ height: "360px", overflow: "hidden" }}>
      <AppShell layout="default">
        <AppShell.Header>
          <Header>
            <Header.Brand>MyApp</Header.Brand>
          </Header>
        </AppShell.Header>
        <AppShell.Sidebar width="200px" collapsible="offcanvas">
          <Sidebar.Nav>
            <Sidebar.Section label="Menu">
              <Sidebar.Item active>Home</Sidebar.Item>
              <Sidebar.Item>Analytics</Sidebar.Item>
              <Sidebar.Item>Settings</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Nav>
        </AppShell.Sidebar>
        <AppShell.Main padding="md">Header spans full width. Logo is in the header.</AppShell.Main>
      </AppShell>
    </div>
  ),
};

export const SidebarLayout: Story = {
  render: () => (
    <div style={{ height: "360px", overflow: "hidden" }}>
      <AppShell layout="sidebar">
        <AppShell.Header>
          <Header>
            <Header.Trigger />
          </Header>
        </AppShell.Header>
        <AppShell.Sidebar width="200px" collapsible="offcanvas">
          <Sidebar.Header>MyApp</Sidebar.Header>
          <Sidebar.Nav>
            <Sidebar.Section label="Menu">
              <Sidebar.Item active>Home</Sidebar.Item>
              <Sidebar.Item>Analytics</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Nav>
        </AppShell.Sidebar>
        <AppShell.Main padding="md">Sidebar is full height. Logo is in the sidebar.</AppShell.Main>
      </AppShell>
    </div>
  ),
};

export const WithAside: Story = {
  render: () => (
    <div style={{ height: "360px", overflow: "hidden" }}>
      <AppShell layout="default">
        <AppShell.Header>
          <Header>
            <Header.Brand>App</Header.Brand>
          </Header>
        </AppShell.Header>
        <AppShell.Sidebar width="180px" collapsible="offcanvas">
          <Sidebar.Nav>
            <Sidebar.Section>
              <Sidebar.Item active>Home</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Nav>
        </AppShell.Sidebar>
        <AppShell.Main padding="md">Content with an aside panel on the right.</AppShell.Main>
        <AppShell.Aside width="180px">
          Additional context, filters, or quick actions.
        </AppShell.Aside>
      </AppShell>
    </div>
  ),
};

export const FloatingMain: Story = {
  render: () => (
    <div style={{ height: "360px", overflow: "hidden" }}>
      <AppShell layout="sidebar">
        <AppShell.Header>
          <Header>
            <Header.Trigger />
          </Header>
        </AppShell.Header>
        <AppShell.Sidebar width="200px" collapsible="offcanvas" variant="floating">
          <Sidebar.Header>MyApp</Sidebar.Header>
          <Sidebar.Nav>
            <Sidebar.Section label="Menu">
              <Sidebar.Item active>Home</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Nav>
        </AppShell.Sidebar>
        <AppShell.Main padding="md" variant="floating">
          Main content has rounded corners and visual separation from the sidebar.
        </AppShell.Main>
      </AppShell>
    </div>
  ),
};
