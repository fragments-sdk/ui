import React from 'react';
import { defineSegment } from '@fragments/core';
import { Header } from '.';
import { ThemeToggle, ThemeProvider } from '../Theme';
import { Button } from '../Button';
import { Input } from '../Input';
import { MagnifyingGlass } from '@phosphor-icons/react';

export default defineSegment({
  component: Header,

  meta: {
    name: 'Header',
    description: 'Composable header with slots for brand, navigation, search, and actions. Supports dropdown nav groups via Header.NavMenu. Designed for use within AppShell with responsive mobile support.',
    category: 'navigation',
    status: 'stable',
    tags: ['header', 'navigation', 'navbar', 'brand', 'layout', 'dropdown'],
    since: '0.5.0',
  },

  usage: {
    when: [
      'Primary site or app header inside AppShell',
      'Navigation bar with branding (stacked layout)',
      'Search and actions bar (sidebar-inset layout)',
      'Header with responsive mobile menu trigger',
      'Grouping related nav items under a dropdown menu',
    ],
    whenNot: [
      'Simple page titles (use heading elements)',
      'Footer navigation (use Footer component)',
      'Standalone sidebar navigation (use Sidebar directly)',
    ],
    guidelines: [
      'Use Header.SkipLink for accessibility (skip to main content)',
      'In stacked layout: include Header.Brand for logo',
      'In sidebar-inset layout: omit Header.Brand (logo in sidebar)',
      'Header.Trigger integrates with SidebarProvider for mobile menus',
      'Header.Nav is hidden on mobile; use sidebar for mobile navigation',
      'Use Header.Spacer to push items apart',
      'Use Header.NavMenu to group related nav items under a dropdown',
      'Use Header.NavMenuItem inside Header.NavMenu for dropdown items',
    ],
    accessibility: [
      'Include Header.SkipLink for keyboard users',
      'Navigation has aria-label for screen readers',
      'Active nav items use aria-current="page"',
      'Mobile trigger has aria-expanded state',
      'NavMenu dropdown opens with click and is keyboard navigable',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Header content (use Header.Brand, Header.Nav, etc.)',
      required: true,
    },
    height: {
      type: 'string',
      description: 'Header height',
      default: '56px',
    },
    position: {
      type: 'enum',
      description: 'Position behavior (usually controlled by AppShell)',
      values: ['static', 'fixed', 'sticky'],
      default: 'static',
    },
  },

  relations: [
    { component: 'AppShell', relationship: 'parent', note: 'Header is typically used inside AppShell.Header' },
    { component: 'Sidebar', relationship: 'sibling', note: 'Header.Trigger toggles Sidebar on mobile' },
    { component: 'Theme', relationship: 'child', note: 'ThemeToggle is commonly placed in Header.Actions' },
  ],

  ai: {
    compositionPattern: 'compound',
    subComponents: ['SkipLink', 'Trigger', 'Brand', 'Nav', 'NavItem', 'NavMenu', 'NavMenuItem', 'Search', 'Spacer', 'Actions'],
    commonPatterns: [
      '<Header><Header.Brand href="/">{appName}</Header.Brand><Header.Nav><Header.NavItem href="/home" active>Home</Header.NavItem></Header.Nav><Header.Spacer /><Header.Actions>{actions}</Header.Actions></Header>',
      '<Header><Header.Nav><Header.NavItem href="/home">Home</Header.NavItem><Header.NavMenu label="Docs" active><Header.NavMenuItem href="/cli">CLI</Header.NavMenuItem><Header.NavMenuItem href="/mcp">MCP</Header.NavMenuItem></Header.NavMenu></Header.Nav></Header>',
    ],
  },

  variants: [
    {
      name: 'For Stacked Layout',
      description: 'Header with brand, nav, and actions. Use with AppShell layout="stacked".',
      render: () => (
        <ThemeProvider defaultMode="light">
          <Header>
            <Header.SkipLink />
            <Header.Trigger />
            <Header.Brand href="/">MyApp</Header.Brand>
            <Header.Nav>
              <Header.NavItem href="/dashboard" active>Dashboard</Header.NavItem>
              <Header.NavItem href="/projects">Projects</Header.NavItem>
              <Header.NavItem href="/settings">Settings</Header.NavItem>
            </Header.Nav>
            <Header.Spacer />
            <Header.Actions>
              <ThemeToggle size="md" />
              <Button variant="secondary" size="sm">Sign In</Button>
            </Header.Actions>
          </Header>
        </ThemeProvider>
      ),
    },
    {
      name: 'With Dropdown Nav',
      description: 'Header with a dropdown menu grouping related navigation links.',
      render: () => (
        <ThemeProvider defaultMode="light">
          <Header>
            <Header.Brand href="/">MyApp</Header.Brand>
            <Header.Nav>
              <Header.NavItem href="/components" active>Components</Header.NavItem>
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
              <ThemeToggle size="md" />
            </Header.Actions>
          </Header>
        </ThemeProvider>
      ),
    },
    {
      name: 'For Sidebar Inset Layout',
      description: 'Header without brand (logo is in sidebar). Use with AppShell layout="sidebar-inset".',
      render: () => (
        <ThemeProvider defaultMode="light">
          <Header>
            <Header.SkipLink />
            <Header.Trigger />
            <Header.Search>
              <Input placeholder="Search..." style={{ width: '240px' }} />
            </Header.Search>
            <Header.Spacer />
            <Header.Actions>
              <ThemeToggle size="md" />
            </Header.Actions>
          </Header>
        </ThemeProvider>
      ),
    },
    {
      name: 'Minimal',
      description: 'Clean header with just trigger and actions',
      render: () => (
        <ThemeProvider defaultMode="light">
          <Header>
            <Header.Trigger />
            <Header.Spacer />
            <Header.Actions>
              <ThemeToggle size="md" />
            </Header.Actions>
          </Header>
        </ThemeProvider>
      ),
    },
    {
      name: 'With Search',
      description: 'Header featuring a prominent search input',
      render: () => (
        <ThemeProvider defaultMode="light">
          <Header>
            <Header.Brand>Docs</Header.Brand>
            <Header.Search>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'var(--fui-bg-secondary)',
                borderRadius: '6px',
                color: 'var(--fui-text-tertiary)',
                fontSize: '14px',
                width: '280px'
              }}>
                <MagnifyingGlass size={16} /> Search documentation...
              </div>
            </Header.Search>
            <Header.Spacer />
            <Header.Actions>
              <ThemeToggle size="md" />
            </Header.Actions>
          </Header>
        </ThemeProvider>
      ),
    },
    {
      name: 'With Skip Link',
      description: 'Accessible header with skip link for keyboard navigation',
      render: () => (
        <Header>
          <Header.SkipLink href="#main-content">Skip to content</Header.SkipLink>
          <Header.Brand>Accessible App</Header.Brand>
          <Header.Nav>
            <Header.NavItem href="/" active>Home</Header.NavItem>
            <Header.NavItem href="/about">About</Header.NavItem>
          </Header.Nav>
        </Header>
      ),
    },
  ],
});
