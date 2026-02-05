import React from 'react';
import { defineSegment } from '@fragments/core';
import { Header } from '.';
import { ThemeToggle, ThemeProvider } from '../Theme';
import { Button } from '../Button';
import { Input } from '../Input';

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
    </svg>
  );
}

export default defineSegment({
  component: Header,

  meta: {
    name: 'Header',
    description: 'Composable header with slots for brand, navigation, search, and actions. Designed for use within AppShell with responsive mobile support.',
    category: 'navigation',
    status: 'stable',
    tags: ['header', 'navigation', 'navbar', 'brand', 'layout'],
    since: '0.5.0',
  },

  usage: {
    when: [
      'Primary site or app header inside AppShell',
      'Navigation bar with branding (stacked layout)',
      'Search and actions bar (sidebar-inset layout)',
      'Header with responsive mobile menu trigger',
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
    ],
    accessibility: [
      'Include Header.SkipLink for keyboard users',
      'Navigation has aria-label for screen readers',
      'Active nav items use aria-current="page"',
      'Mobile trigger has aria-expanded state',
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
    { component: 'ThemeToggle', relationship: 'child', note: 'ThemeToggle is commonly placed in Header.Actions' },
  ],

  ai: {
    compositionPattern: 'compound',
    subComponents: ['SkipLink', 'Trigger', 'Brand', 'Nav', 'NavItem', 'Search', 'Spacer', 'Actions'],
    commonPatterns: [
      '<Header><Header.Brand href="/">{appName}</Header.Brand><Header.Nav><Header.NavItem href="/home" active>Home</Header.NavItem></Header.Nav><Header.Spacer /><Header.Actions>{actions}</Header.Actions></Header>',
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
                <SearchIcon /> Search documentation...
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
