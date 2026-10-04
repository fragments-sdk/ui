import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from ".";
import {
  ChartBar,
  Cube,
  FileText,
  Flag,
  Folder,
  GearSix,
  GitPullRequest,
  SquaresFour,
  TerminalWindow,
} from "@phosphor-icons/react";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Sidebar is the navigation rail: canvas with one hairline edge, 32px rows, the
 * current item marked with the selection wash and ring. On desktop it collapses
 * to its glyphs (or off the canvas); below md it is a modal panel. Put it in a
 * Sidebar.Provider (or AppShell) when a header trigger needs to drive it.
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
          "The navigation rail: collapses to glyphs on desktop and becomes a modal panel below md.",
      },
    },
  },
  argTypes: {
    collapsible: {
      control: "select",
      options: ["icon", "offcanvas", "none"],
      description: "How the rail collapses.",
    },
    defaultCollapsed: { control: "boolean", description: "The rail starts collapsed." },
  },
  args: {
    collapsible: "icon",
    defaultCollapsed: false,
    children: null,
  },
  decorators: [
    (Story) => (
      <div style={{ blockSize: 520, display: "flex" }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Sidebar {...args}>
      <Sidebar.Header>Workspace</Sidebar.Header>
      <Sidebar.Nav>
        <Sidebar.Section label="Workspace">
          <Sidebar.Item icon={<SquaresFour size={16} aria-hidden="true" />} href="#overview" active>
            Overview
          </Sidebar.Item>
          <Sidebar.Item icon={<Folder size={16} aria-hidden="true" />} href="#repositories">
            Repositories
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="web">
          <Sidebar.Item icon={<GitPullRequest size={16} aria-hidden="true" />} href="#pulls">
            Pull requests
          </Sidebar.Item>
          <Sidebar.Item icon={<Flag size={16} aria-hidden="true" />} href="#findings">
            Findings
          </Sidebar.Item>
          <Sidebar.Item icon={<FileText size={16} aria-hidden="true" />} href="#contract">
            Contract
          </Sidebar.Item>
          <Sidebar.Item icon={<Cube size={16} aria-hidden="true" />} href="#components">
            Components
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="Administration">
          <Sidebar.Item icon={<GearSix size={16} aria-hidden="true" />} href="#settings">
            Workspace settings
          </Sidebar.Item>
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

/** Collapsed to the glyphs: labels move into tooltips and stay readable to assistive tech. */
export const Collapsed: Story = {
  args: { defaultCollapsed: true },
};

/** Badges count, `working` shows an agent at work in the row, `disabled` leaves the tab order. */
export const RowStates: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Nav>
        <Sidebar.Section label="Inbox">
          <Sidebar.Item icon={<Flag size={16} aria-hidden="true" />} badge="12" active>
            Findings
          </Sidebar.Item>
          <Sidebar.Item icon={<GitPullRequest size={16} aria-hidden="true" />} badge="3">
            Pull requests
          </Sidebar.Item>
          <Sidebar.Item icon={<TerminalWindow size={16} aria-hidden="true" />} working>
            Setup
          </Sidebar.Item>
          <Sidebar.Item icon={<ChartBar size={16} aria-hidden="true" />} disabled>
            Adoption
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
    </Sidebar>
  ),
};

/** A row opens a nested list; the disclosure is instant. */
export const WithSubmenu: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Nav>
        <Sidebar.Section label="Workspace">
          <Sidebar.Item icon={<SquaresFour size={16} aria-hidden="true" />}>Overview</Sidebar.Item>
          <Sidebar.Item icon={<GearSix size={16} aria-hidden="true" />} hasSubmenu defaultExpanded>
            Settings
          </Sidebar.Item>
          <Sidebar.Submenu>
            <Sidebar.SubItem href="#general" active>
              General
            </Sidebar.SubItem>
            <Sidebar.SubItem href="#members">Members</Sidebar.SubItem>
            <Sidebar.SubItem href="#billing">Billing</Sidebar.SubItem>
          </Sidebar.Submenu>
        </Sidebar.Section>
      </Sidebar.Nav>
    </Sidebar>
  ),
};

/** The section label opens and closes its rows; one action can sit beside it. */
export const CollapsibleSections: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Nav>
        <Sidebar.Section
          label="Repositories"
          collapsible
          action={<Sidebar.SectionAction aria-label="Add repository">+</Sidebar.SectionAction>}
        >
          <Sidebar.Item icon={<Folder size={16} aria-hidden="true" />}>web</Sidebar.Item>
          <Sidebar.Item icon={<Folder size={16} aria-hidden="true" />}>api</Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="Archived" collapsible defaultOpen={false}>
          <Sidebar.Item icon={<Folder size={16} aria-hidden="true" />}>legacy</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
    </Sidebar>
  ),
};

/** Placeholder rows while the navigation loads. */
export const Loading: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Nav>
        <Sidebar.Section label="Workspace">
          <Sidebar.MenuSkeleton count={4} />
        </Sidebar.Section>
      </Sidebar.Nav>
    </Sidebar>
  ),
};

/** Router links: `render` moves the look and props onto your link element. */
export const RouterLinks: Story = {
  render: () => (
    <Sidebar>
      <Sidebar.Nav>
        <Sidebar.Section>
          <Sidebar.Item
            icon={<SquaresFour size={16} aria-hidden="true" />}
            render={<a href="#overview" />}
            active
          >
            Overview
          </Sidebar.Item>
          <Sidebar.Item
            icon={<Flag size={16} aria-hidden="true" />}
            render={<a href="#findings" />}
          >
            Findings
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
    </Sidebar>
  ),
};
