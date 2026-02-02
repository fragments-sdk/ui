import React from 'react';
import { defineSegment } from '@fragments/core';
import { AppShell } from './index.js';
import { Header } from '../Header/index.js';
import { Sidebar } from '../Sidebar/index.js';
import { ThemeToggle } from '../Theme/index.js';

// Demo icons
function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
      <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
      <path d="M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16ZM160,48h40V200H160ZM104,96h40V200H104ZM56,144H88v56H56Z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
      <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
    </svg>
  );
}

export default defineSegment({
  component: AppShell,

  meta: {
    name: 'AppShell',
    description: 'Full layout wrapper integrating sidebar, header, main content, and optional aside panel. Supports two layout modes: stacked (header on top) and sidebar-inset (sidebar full height).',
    category: 'layout',
    status: 'stable',
    tags: ['layout', 'shell', 'scaffold', 'dashboard', 'app-layout'],
    since: '0.5.0',
  },

  usage: {
    when: [
      'Building dashboard-style applications',
      'Apps with persistent sidebar navigation',
      'Layouts requiring header, sidebar, and main content areas',
      'Responsive layouts that need mobile drawer behavior',
    ],
    whenNot: [
      'Simple marketing pages (use standard layout)',
      'Content-first sites without navigation (use simpler layout)',
      'Single-page apps with minimal UI (use minimal layout)',
    ],
    guidelines: [
      'Use layout="stacked" when header should span full width (logo in header)',
      'Use layout="sidebar-inset" when sidebar should be full height (logo in sidebar)',
      'AppShell automatically wraps with SidebarProvider',
      'Use AppShell.Sidebar to configure sidebar width and collapse behavior',
      'Main content responds to sidebar collapsed state',
      'Aside panel is hidden on mobile automatically',
    ],
    accessibility: [
      'Main content area has id="main-content" for skip links',
      'Use Header.SkipLink for keyboard navigation',
      'Sidebar drawer has proper focus trap on mobile',
      'Keyboard navigation supported throughout',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Layout content (use AppShell.Header, AppShell.Sidebar, AppShell.Main, AppShell.Aside)',
      required: true,
    },
    layout: {
      type: 'enum',
      description: 'Layout mode for header/sidebar positioning',
      values: ['stacked', 'sidebar-inset', 'inset'],
      default: 'stacked',
    },
  },

  relations: [
    { component: 'ThemeProvider', relationship: 'parent', note: 'AppShell should be wrapped in ThemeProvider' },
    { component: 'Header', relationship: 'child', note: 'Header is placed inside AppShell.Header' },
    { component: 'Sidebar', relationship: 'child', note: 'Sidebar content goes inside AppShell.Sidebar' },
  ],

  variants: [
    {
      name: 'Stacked Layout',
      description: 'Header spans full width above sidebar (default). Best when brand/logo should be prominent in header.',
      render: () => (
        <div style={{ height: '400px', position: 'relative', overflow: 'hidden', border: '1px solid var(--fui-border)', borderRadius: '8px' }}>
          <AppShell layout="stacked">
            <AppShell.Header>
              <Header>
                <Header.Trigger />
                <Header.Brand>MyApp</Header.Brand>
                <Header.Nav>
                  <Header.NavItem active>Dashboard</Header.NavItem>
                  <Header.NavItem>Settings</Header.NavItem>
                </Header.Nav>
                <Header.Spacer />
                <Header.Actions>
                  <ThemeToggle size="sm" />
                </Header.Actions>
              </Header>
            </AppShell.Header>

            <AppShell.Sidebar width="200px" collapsible="offcanvas">
              <Sidebar.Nav>
                <Sidebar.Section label="Menu">
                  <Sidebar.Item icon={<HomeIcon />} active>Home</Sidebar.Item>
                  <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
                  <Sidebar.Item icon={<GearIcon />}>Settings</Sidebar.Item>
                </Sidebar.Section>
              </Sidebar.Nav>
            </AppShell.Sidebar>

            <AppShell.Main padding="md">
              <h2 style={{ margin: '0 0 8px' }}>Stacked Layout</h2>
              <p style={{ margin: 0, color: 'var(--fui-text-secondary)' }}>
                Header spans full width. Logo is in the header.
              </p>
            </AppShell.Main>
          </AppShell>
        </div>
      ),
    },
    {
      name: 'Sidebar Inset Layout',
      description: 'Sidebar is full height, header sits next to it. Best for documentation sites or when sidebar branding is preferred.',
      render: () => (
        <div style={{ height: '400px', position: 'relative', overflow: 'hidden', border: '1px solid var(--fui-border)', borderRadius: '8px' }}>
          <AppShell layout="sidebar-inset">
            <AppShell.Header>
              <Header>
                <Header.Trigger />
                <Header.Search>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--fui-bg-secondary)', borderRadius: '6px', color: 'var(--fui-text-tertiary)', fontSize: '14px' }}>
                    <SearchIcon /> Search...
                  </div>
                </Header.Search>
                <Header.Spacer />
                <Header.Actions>
                  <ThemeToggle size="sm" />
                </Header.Actions>
              </Header>
            </AppShell.Header>

            <AppShell.Sidebar width="200px" collapsible="offcanvas">
              <Sidebar.Header>
                <span style={{ fontWeight: 600 }}>MyApp</span>
              </Sidebar.Header>
              <Sidebar.Nav>
                <Sidebar.Section label="Menu">
                  <Sidebar.Item icon={<HomeIcon />} active>Home</Sidebar.Item>
                  <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
                  <Sidebar.Item icon={<GearIcon />}>Settings</Sidebar.Item>
                </Sidebar.Section>
              </Sidebar.Nav>
              <Sidebar.Footer>v1.0.0</Sidebar.Footer>
            </AppShell.Sidebar>

            <AppShell.Main padding="md">
              <h2 style={{ margin: '0 0 8px' }}>Sidebar Inset Layout</h2>
              <p style={{ margin: 0, color: 'var(--fui-text-secondary)' }}>
                Sidebar is full height. Logo is in the sidebar header.
              </p>
            </AppShell.Main>
          </AppShell>
        </div>
      ),
    },
    {
      name: 'With Aside Panel',
      description: 'App shell with optional right panel for additional context or actions',
      render: () => (
        <div style={{ height: '400px', position: 'relative', overflow: 'hidden', border: '1px solid var(--fui-border)', borderRadius: '8px' }}>
          <AppShell layout="stacked">
            <AppShell.Header>
              <Header>
                <Header.Brand>App</Header.Brand>
                <Header.Spacer />
                <Header.Actions>
                  <ThemeToggle size="sm" />
                </Header.Actions>
              </Header>
            </AppShell.Header>

            <AppShell.Sidebar width="180px" collapsible="offcanvas">
              <Sidebar.Nav>
                <Sidebar.Section>
                  <Sidebar.Item icon={<HomeIcon />} active>Home</Sidebar.Item>
                  <Sidebar.Item icon={<ChartIcon />}>Stats</Sidebar.Item>
                </Sidebar.Section>
              </Sidebar.Nav>
            </AppShell.Sidebar>

            <AppShell.Main padding="md">
              <h2 style={{ margin: '0 0 8px' }}>Main Content</h2>
              <p style={{ margin: 0 }}>Content with aside panel on the right.</p>
            </AppShell.Main>

            <AppShell.Aside width="180px">
              <div style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '14px' }}>Aside Panel</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--fui-text-secondary)' }}>
                  Additional context, filters, or quick actions.
                </p>
              </div>
            </AppShell.Aside>
          </AppShell>
        </div>
      ),
    },
    {
      name: 'Collapsible Icon Sidebar',
      description: 'Sidebar that collapses to icons only on desktop',
      render: () => (
        <div style={{ height: '400px', position: 'relative', overflow: 'hidden', border: '1px solid var(--fui-border)', borderRadius: '8px' }}>
          <AppShell layout="sidebar-inset">
            <AppShell.Header>
              <Header>
                <Header.Trigger />
                <Header.Spacer />
                <Header.Actions>
                  <ThemeToggle size="sm" />
                </Header.Actions>
              </Header>
            </AppShell.Header>

            <AppShell.Sidebar collapsible="icon" width="200px" collapsedWidth="56px">
              <Sidebar.Header>
                <span style={{ fontWeight: 600 }}>App</span>
              </Sidebar.Header>
              <Sidebar.Nav>
                <Sidebar.Section>
                  <Sidebar.Item icon={<HomeIcon />} active>Home</Sidebar.Item>
                  <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
                  <Sidebar.Item icon={<GearIcon />}>Settings</Sidebar.Item>
                </Sidebar.Section>
              </Sidebar.Nav>
              <Sidebar.Footer>
                <Sidebar.CollapseToggle />
              </Sidebar.Footer>
            </AppShell.Sidebar>

            <AppShell.Main padding="md">
              <p style={{ margin: 0 }}>Click the collapse button in the sidebar footer to toggle between expanded and icon-only modes.</p>
            </AppShell.Main>
          </AppShell>
        </div>
      ),
    },
    {
      name: 'Inset Layout',
      description: 'Modern shadcn-style layout with rounded main content area and visual separation from sidebar.',
      render: () => (
        <div style={{ height: '400px', position: 'relative', overflow: 'hidden', border: '1px solid var(--fui-border)', borderRadius: '8px' }}>
          <AppShell layout="inset">
            <AppShell.Header>
              <Header>
                <Header.Trigger />
                <Header.Search>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--fui-bg-primary)', borderRadius: '6px', color: 'var(--fui-text-tertiary)', fontSize: '14px', border: '1px solid var(--fui-border)' }}>
                    <SearchIcon /> Search...
                  </div>
                </Header.Search>
                <Header.Spacer />
                <Header.Actions>
                  <ThemeToggle size="sm" />
                </Header.Actions>
              </Header>
            </AppShell.Header>

            <AppShell.Sidebar width="200px" collapsible="offcanvas">
              <Sidebar.Header>
                <span style={{ fontWeight: 600 }}>MyApp</span>
              </Sidebar.Header>
              <Sidebar.Nav>
                <Sidebar.Section label="Menu">
                  <Sidebar.Item icon={<HomeIcon />} active>Home</Sidebar.Item>
                  <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
                  <Sidebar.Item icon={<GearIcon />}>Settings</Sidebar.Item>
                </Sidebar.Section>
              </Sidebar.Nav>
              <Sidebar.Footer>v1.0.0</Sidebar.Footer>
            </AppShell.Sidebar>

            <AppShell.Main padding="md">
              <h2 style={{ margin: '0 0 8px' }}>Inset Layout</h2>
              <p style={{ margin: 0, color: 'var(--fui-text-secondary)' }}>
                Main content has rounded corners and visual separation from the sidebar.
              </p>
            </AppShell.Main>
          </AppShell>
        </div>
      ),
    },
  ],
});
