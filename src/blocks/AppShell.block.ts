import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'App Shell',
  description: 'Full application layout with sidebar, header, and main content. Supports two layout modes: stacked (header full-width) and sidebar-inset (sidebar full-height).',
  category: 'layout',
  components: ['AppShell', 'Header', 'Sidebar', 'Theme'],
  tags: ['layout', 'app-shell', 'sidebar', 'navigation', 'dashboard'],
  code: `
// App Shell - Stacked Layout (header spans full width)
// Best for apps where the brand should be prominent in the header

import { AppShell, Header, Input, Sidebar, ThemeToggle } from '@fragments-sdk/ui';

function StackedLayout({ children }) {
  return (
    <AppShell layout="stacked">
      <AppShell.Header>
        <Header>
          <Header.SkipLink />
          <Header.Trigger />
          <Header.Brand href="/">MyApp</Header.Brand>
          <Header.Nav>
            <Header.NavItem href="/" active>Dashboard</Header.NavItem>
            <Header.NavItem href="/settings">Settings</Header.NavItem>
          </Header.Nav>
          <Header.Spacer />
          <Header.Actions>
            <ThemeToggle />
          </Header.Actions>
        </Header>
      </AppShell.Header>

      <AppShell.Sidebar width="240px" collapsible="offcanvas">
        <Sidebar.Nav>
          <Sidebar.Section label="Menu">
            <Sidebar.Item icon={<HomeIcon />} href="/" active>
              Home
            </Sidebar.Item>
            <Sidebar.Item icon={<ChartIcon />} href="/analytics">
              Analytics
            </Sidebar.Item>
            <Sidebar.Item icon={<GearIcon />} href="/settings">
              Settings
            </Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </AppShell.Sidebar>

      <AppShell.Main padding="lg">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

// App Shell - Sidebar Inset Layout (sidebar is full height)
// Best for documentation sites or when sidebar branding is preferred

function SidebarInsetLayout({ children }) {
  return (
    <AppShell layout="sidebar-inset">
      <AppShell.Header>
        <Header>
          <Header.SkipLink />
          <Header.Trigger />
          <Header.Search>
            <Input placeholder="Search..." />
          </Header.Search>
          <Header.Spacer />
          <Header.Actions>
            <ThemeToggle />
          </Header.Actions>
        </Header>
      </AppShell.Header>

      <AppShell.Sidebar width="260px" collapsible="offcanvas">
        <Sidebar.Header>
          <a href="/">MyApp</a>
        </Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Section label="Getting Started">
            <Sidebar.Item href="/docs" active>Introduction</Sidebar.Item>
            <Sidebar.Item href="/docs/install">Installation</Sidebar.Item>
          </Sidebar.Section>
          <Sidebar.Section label="Components">
            <Sidebar.Item href="/components">Overview</Sidebar.Item>
            <Sidebar.Item href="/components/button">Button</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer>v1.0.0</Sidebar.Footer>
      </AppShell.Sidebar>

      <AppShell.Main padding="lg">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

// App Shell with Collapsible Icon Sidebar
// Sidebar collapses to icons only - great for dashboards

function CollapsibleLayout({ children }) {
  return (
    <AppShell layout="sidebar-inset">
      <AppShell.Header>
        <Header>
          <Header.Trigger />
          <Header.Spacer />
          <Header.Actions>
            <ThemeToggle />
          </Header.Actions>
        </Header>
      </AppShell.Header>

      <AppShell.Sidebar collapsible="icon" width="240px" collapsedWidth="64px">
        <Sidebar.Header collapsedContent={<Logo />}>
          <Logo /> <span>MyApp</span>
        </Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
            <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
            <Sidebar.Item icon={<GearIcon />}>Settings</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </AppShell.Sidebar>

      <AppShell.Main padding="lg">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

// App Shell with Aside Panel
// Optional right panel for additional context

function LayoutWithAside({ children, aside }) {
  return (
    <AppShell layout="stacked">
      <AppShell.Header>
        <Header>
          <Header.Brand>MyApp</Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ThemeToggle />
          </Header.Actions>
        </Header>
      </AppShell.Header>

      <AppShell.Sidebar width="200px" collapsible="offcanvas">
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item icon={<HomeIcon />} active>Home</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </AppShell.Sidebar>

      <AppShell.Main padding="lg">
        {children}
      </AppShell.Main>

      <AppShell.Aside width="280px">
        {aside}
      </AppShell.Aside>
    </AppShell>
  );
}
`.trim(),
});
