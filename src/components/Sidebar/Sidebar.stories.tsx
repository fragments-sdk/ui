import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from ".";
import { NavGlyph } from "../../assets/nav-glyph";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Sidebar is a responsive navigation sidebar with collapsible desktop mode
 * and mobile drawer behavior. It is a compound component composed from
 * Sidebar.Header, Sidebar.Nav, Sidebar.Section, Sidebar.Item, and more.
 */
const meta = {
  title: "Navigation/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component:
          "Responsive navigation sidebar with collapsible desktop mode and mobile drawer behavior.",
      },
    },
  },
  argTypes: {
    position: {
      control: "select",
      options: ["left", "right"],
      description: "Sidebar position",
    },
    collapsible: {
      control: "select",
      options: ["icon", "offcanvas", "none"],
      description: "Collapse behavior mode",
    },
    activeIndicator: {
      control: "select",
      options: ["start", "end"],
      description: "Placement of the active-item affordance",
    },
    defaultCollapsed: { control: "boolean", description: "Initial collapsed state" },
  },
  args: {
    position: "left",
    collapsible: "icon",
    defaultCollapsed: false,
    children: (
      <>
        <Sidebar.Header>
          <span>Acme App</span>
        </Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item active>Dashboard</Sidebar.Item>
            <Sidebar.Item>Analytics</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </>
    ),
  },
  render: (args) => (
    <Sidebar {...args}>
      <Sidebar.Header>
        <span>Acme App</span>
      </Sidebar.Header>
      <Sidebar.Nav>
        <Sidebar.Section label="Workspace">
          <Sidebar.Item icon={<NavGlyph name="overview" />} active>
            Overview
          </Sidebar.Item>
          <Sidebar.Item icon={<NavGlyph name="repository" />}>Repositories</Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="web">
          <Sidebar.Item icon={<NavGlyph name="pullRequest" />}>Pull requests</Sidebar.Item>
          <Sidebar.Item icon={<NavGlyph name="finding" />}>Findings</Sidebar.Item>
          <Sidebar.Item icon={<NavGlyph name="contract" />}>Contract</Sidebar.Item>
          <Sidebar.Item icon={<NavGlyph name="adoption" />}>Adoption</Sidebar.Item>
          <Sidebar.Item icon={<NavGlyph name="component" />}>Components</Sidebar.Item>
          <Sidebar.Item icon={<NavGlyph name="setup" />}>Setup</Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="Administration">
          <Sidebar.Item icon={<NavGlyph name="settings" />}>Workspace settings</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
      <Sidebar.Footer>
        <Sidebar.CollapseToggle />
      </Sidebar.Footer>
    </Sidebar>
  ),
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EndActiveIndicator: Story = {
  args: { activeIndicator: "end" },
};

export const WithBadges: Story = {
  render: (args) => (
    <Sidebar {...args}>
      <Sidebar.Nav>
        <Sidebar.Section>
          <Sidebar.Item active>Dashboard</Sidebar.Item>
          <Sidebar.Item badge="3">Analytics</Sidebar.Item>
          <Sidebar.Item badge="12">Team</Sidebar.Item>
          <Sidebar.Item>Projects</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
    </Sidebar>
  ),
};

export const WithSubmenu: Story = {
  render: (args) => (
    <Sidebar {...args}>
      <Sidebar.Nav>
        <Sidebar.Section>
          <Sidebar.Item>Dashboard</Sidebar.Item>
          <Sidebar.Item hasSubmenu defaultExpanded>
            Projects
          </Sidebar.Item>
          <Sidebar.Submenu>
            <Sidebar.SubItem active>Website Redesign</Sidebar.SubItem>
            <Sidebar.SubItem>Mobile App</Sidebar.SubItem>
            <Sidebar.SubItem>API Integration</Sidebar.SubItem>
          </Sidebar.Submenu>
        </Sidebar.Section>
      </Sidebar.Nav>
    </Sidebar>
  ),
};

export const Collapsed: Story = {
  args: { defaultCollapsed: true },
};
