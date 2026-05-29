import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from '.';

/**
 * Sidebar is a responsive navigation sidebar with collapsible desktop mode
 * and mobile drawer behavior. It is a compound component composed from
 * Sidebar.Header, Sidebar.Nav, Sidebar.Section, Sidebar.Item, and more.
 */
const meta = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Responsive navigation sidebar with collapsible desktop mode and mobile drawer behavior.',
      },
    },
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Sidebar position',
    },
    collapsible: {
      control: 'select',
      options: ['icon', 'offcanvas', 'none'],
      description: 'Collapse behavior mode',
    },
    defaultCollapsed: { control: 'boolean', description: 'Initial collapsed state' },
  },
  args: {
    position: 'left',
    collapsible: 'icon',
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
        <Sidebar.Section>
          <Sidebar.Item active>Dashboard</Sidebar.Item>
          <Sidebar.Item>Analytics</Sidebar.Item>
          <Sidebar.Item>Team</Sidebar.Item>
          <Sidebar.Item>Projects</Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="Settings">
          <Sidebar.Item>Preferences</Sidebar.Item>
          <Sidebar.Item>Help</Sidebar.Item>
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
