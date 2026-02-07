import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Dashboard Navigation',
  description: 'Sidebar navigation pattern for dashboard applications with user profile, sections, and nested menus',
  category: 'navigation',
  components: ['Sidebar', 'Avatar'],
  tags: ['navigation', 'sidebar', 'dashboard', 'admin', 'menu'],
  code: `
// Dashboard Navigation with User Profile
// A complete sidebar navigation for admin/dashboard interfaces

function DashboardNav({ user, currentPath }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [projectsExpanded, setProjectsExpanded] = React.useState(false);

  return (
    <Sidebar
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
    >
      {/* Brand header */}
      <Sidebar.Header>
        <svg width="32" height="32" viewBox="0 0 256 256" fill="var(--fui-color-accent)">
          <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
        </svg>
        {!collapsed && (
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Dashboard</span>
        )}
        <Sidebar.CollapseToggle />
      </Sidebar.Header>

      {/* Main navigation */}
      <Sidebar.Nav aria-label="Dashboard navigation">
        {/* Primary section */}
        <Sidebar.Section>
          <Sidebar.Item
            icon={<HomeIcon />}
            href="/dashboard"
            active={currentPath === '/dashboard'}
          >
            Overview
          </Sidebar.Item>
          <Sidebar.Item
            icon={<ChartIcon />}
            href="/analytics"
            active={currentPath === '/analytics'}
            badge="New"
          >
            Analytics
          </Sidebar.Item>
          <Sidebar.Item
            icon={<InboxIcon />}
            href="/inbox"
            active={currentPath === '/inbox'}
            badge="5"
          >
            Inbox
          </Sidebar.Item>
        </Sidebar.Section>

        {/* Projects section with nested items */}
        <Sidebar.Section label="Workspace">
          <Sidebar.Item
            icon={<FolderIcon />}
            hasSubmenu
            expanded={projectsExpanded}
            onExpandedChange={setProjectsExpanded}
          >
            Projects
          </Sidebar.Item>
          <Sidebar.Submenu>
            <Sidebar.SubItem
              href="/projects/website"
              active={currentPath === '/projects/website'}
            >
              Website Redesign
            </Sidebar.SubItem>
            <Sidebar.SubItem
              href="/projects/mobile"
              active={currentPath === '/projects/mobile'}
            >
              Mobile App
            </Sidebar.SubItem>
            <Sidebar.SubItem
              href="/projects/api"
              active={currentPath === '/projects/api'}
            >
              API Integration
            </Sidebar.SubItem>
          </Sidebar.Submenu>
          <Sidebar.Item
            icon={<UsersIcon />}
            href="/team"
            active={currentPath === '/team'}
          >
            Team Members
          </Sidebar.Item>
          <Sidebar.Item
            icon={<CalendarIcon />}
            href="/calendar"
            active={currentPath === '/calendar'}
          >
            Calendar
          </Sidebar.Item>
        </Sidebar.Section>

        {/* Settings section */}
        <Sidebar.Section label="Account">
          <Sidebar.Item
            icon={<GearIcon />}
            href="/settings"
            active={currentPath === '/settings'}
          >
            Settings
          </Sidebar.Item>
          <Sidebar.Item
            icon={<HelpIcon />}
            href="/help"
            active={currentPath === '/help'}
          >
            Help & Support
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>

      {/* Footer with user profile */}
      <Sidebar.Footer>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: collapsed ? '0' : '8px',
          borderRadius: '8px',
          cursor: 'pointer',
        }}>
          <Avatar
            src={user.avatar}
            name={user.name}
            size="sm"
          />
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 500,
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user.name}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--fui-text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user.email}
              </div>
            </div>
          )}
        </div>
      </Sidebar.Footer>
    </Sidebar>
  );
}

// Usage example:
// <DashboardNav
//   user={{ name: 'Jane Doe', email: 'jane@example.com', avatar: '/avatar.jpg' }}
//   currentPath="/dashboard"
// />

// Icon components (use your preferred icon library)
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8H96a8,8,0,0,0,8-8V160h48v56a8,8,0,0,0,8,8h56a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68Z" />
  </svg>
);
`.trim(),
});
