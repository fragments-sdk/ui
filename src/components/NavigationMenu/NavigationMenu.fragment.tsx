import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { NavigationMenu } from '.';

export default defineFragment({
  component: NavigationMenu,

  meta: {
    name: 'NavigationMenu',
    description: 'Rich navigation menu for site headers with dropdown content panels, animated viewport transitions, and automatic mobile drawer. Supports structured links with titles, descriptions, and icons.',
    category: 'navigation',
    status: 'stable',
    tags: ['navigation', 'menu', 'header', 'dropdown', 'navbar', 'mobile', 'responsive', 'drawer'],
    since: '0.9.0',
  },

  usage: {
    when: [
      'Site-level header navigation with rich dropdown content',
      'Navigation with titles, descriptions, and icons in dropdowns',
      'Responsive navigation that converts to a mobile drawer automatically',
      'Multi-section navigation requiring animated viewport transitions',
    ],
    whenNot: [
      'Simple flat navigation without dropdowns (use Header.Nav)',
      'Application menus with actions like cut/paste (use Menu)',
      'Sidebar navigation (use Sidebar)',
      'Breadcrumb trail navigation (use Breadcrumbs)',
    ],
    guidelines: [
      'Place inside Header component for site-level navigation',
      'Use NavigationMenu.Viewport for animated content panel transitions',
      'Use NavigationMenu.MobileContent to add extra sections to the mobile drawer',
      'Use structured links (title + description) for rich dropdown content',
      'Use simple NavigationMenu.Link for items without dropdown content',
      'NavigationMenu.Link asChild composes click handlers and respects event.preventDefault()',
      'Triggers open on hover (desktop) with configurable delay',
    ],
    accessibility: [
      'Uses disclosure pattern (not menu role) per W3C guidance',
      'Keyboard: Arrow keys navigate between triggers, Enter/Space toggles, Escape closes',
      'Content panels have role="region" with aria-labelledby pointing to trigger',
      'Mobile drawer has focus trap, Escape to close, and aria-modal',
      'Supports prefers-reduced-motion for all animations',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'NavigationMenu.List, NavigationMenu.Viewport, and optionally NavigationMenu.MobileContent',
      required: true,
    },
    value: {
      type: 'string',
      description: 'Controlled open item value',
    },
    defaultValue: {
      type: 'string',
      description: 'Default open item value',
      default: "''",
    },
    onValueChange: {
      type: 'function',
      description: 'Callback when open item changes',
    },
    orientation: {
      type: 'string',
      description: "'horizontal' | 'vertical'",
      default: "'horizontal'",
    },
    delayDuration: {
      type: 'number',
      description: 'Hover delay before opening (ms)',
      default: '200',
    },
    skipDelayDuration: {
      type: 'number',
      description: 'Duration after close during which moving to another trigger opens instantly (ms)',
      default: '300',
    },
  },

  relations: [
    { component: 'Header', relationship: 'sibling', note: 'Place NavigationMenu inside Header for site navigation' },
    { component: 'Sidebar', relationship: 'alternative', note: 'Use Sidebar for persistent side navigation, NavigationMenu for header dropdowns' },
    { component: 'Menu', relationship: 'alternative', note: 'Use Menu for action menus (role=menu), NavigationMenu for site navigation (disclosure pattern)' },
    { component: 'Breadcrumbs', relationship: 'sibling', note: 'Use Breadcrumbs for hierarchical page trail, NavigationMenu for site-level navigation' },
  ],

  contract: {
    propsSummary: [
      'value: string — controlled open item',
      'onValueChange: (value) => void — open state handler',
      'orientation: horizontal | vertical — layout direction',
      'delayDuration: number — hover open delay (default: 200ms)',
      'NavigationMenu.Link: title + description + icon for structured links, or children for simple links',
      'NavigationMenu.Link asChild: composes child and menu click handlers (preventDefault keeps menu open)',
      'NavigationMenu.MobileContent: slot for extra mobile-only sections',
    ],
    scenarioTags: [
      'navigation.site',
      'navigation.dropdown',
      'navigation.mobile',
      'layout.header',
    ],
    a11yRules: ['A11Y_DISCLOSURE_PATTERN', 'A11Y_KEYBOARD_NAV', 'A11Y_FOCUS_TRAP'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['List', 'Item', 'Trigger', 'Content', 'Link', 'Indicator', 'Viewport', 'MobileBrand', 'MobileContent', 'MobileSection'],
    requiredChildren: ['List'],
    commonPatterns: [
      '<NavigationMenu><NavigationMenu.List><NavigationMenu.Item value="docs"><NavigationMenu.Trigger>Docs</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href="/guides" title="Guides" description="Learn the basics" /></NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List><NavigationMenu.Viewport /></NavigationMenu>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Two trigger items with dropdown content and one direct link',
      render: () => (
        <NavigationMenu>
          <NavigationMenu.List>
            <NavigationMenu.Item value="products">
              <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.Link href="/analytics" title="Analytics" description="Track your metrics and KPIs." />
                <NavigationMenu.Link href="/automation" title="Automation" description="Automate your workflows." />
              </NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item value="resources">
              <NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.Link href="/docs" title="Documentation" description="Comprehensive API reference." />
                <NavigationMenu.Link href="/blog" title="Blog" description="Latest news and updates." />
              </NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Viewport />
        </NavigationMenu>
      ),
    },
    {
      name: 'With Rich Content',
      description: 'Grid layout with icons, titles, and descriptions',
      render: () => (
        <NavigationMenu>
          <NavigationMenu.List>
            <NavigationMenu.Item value="platform">
              <NavigationMenu.Trigger>Platform</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', padding: '8px', minWidth: '400px' }}>
                  <NavigationMenu.Link
                    href="/dashboard"
                    title="Dashboard"
                    description="Overview of your project metrics."
                  />
                  <NavigationMenu.Link
                    href="/analytics"
                    title="Analytics"
                    description="Deep dive into your data."
                  />
                  <NavigationMenu.Link
                    href="/reports"
                    title="Reports"
                    description="Generate custom reports."
                  />
                  <NavigationMenu.Link
                    href="/settings"
                    title="Settings"
                    description="Configure your workspace."
                  />
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Viewport />
        </NavigationMenu>
      ),
    },
    {
      name: 'With Simple Links',
      description: 'Mix of triggers with simple link lists and plain links',
      render: () => (
        <NavigationMenu>
          <NavigationMenu.List>
            <NavigationMenu.Item value="company">
              <NavigationMenu.Trigger>Company</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '4px', minWidth: '160px' }}>
                  <NavigationMenu.Link href="/about">About</NavigationMenu.Link>
                  <NavigationMenu.Link href="/careers">Careers</NavigationMenu.Link>
                  <NavigationMenu.Link href="/contact">Contact</NavigationMenu.Link>
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link href="/blog">Blog</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Viewport />
        </NavigationMenu>
      ),
    },
    {
      name: 'With Featured Card',
      description: 'Highlighted featured item alongside regular links',
      render: () => (
        <NavigationMenu>
          <NavigationMenu.List>
            <NavigationMenu.Item value="learn">
              <NavigationMenu.Trigger>Learn</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px', minWidth: '420px' }}>
                  <NavigationMenu.Link
                    href="/quickstart"
                    title="Quick Start"
                    description="Get up and running in 5 minutes with our getting started guide."
                    featured
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <NavigationMenu.Link href="/docs" title="Documentation" description="API reference and guides." />
                    <NavigationMenu.Link href="/examples" title="Examples" description="Browse example projects." />
                  </div>
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Viewport />
        </NavigationMenu>
      ),
    },
    {
      name: 'Vertical',
      description: 'Vertical orientation with content panels to the right',
      render: () => (
        <div style={{ display: 'flex' }}>
          <NavigationMenu orientation="vertical">
            <NavigationMenu.List>
              <NavigationMenu.Item value="overview">
                <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
                <NavigationMenu.Content>
                  <div style={{ padding: '8px', minWidth: '200px' }}>
                    <NavigationMenu.Link href="/intro" title="Introduction" description="Learn the basics." />
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
              <NavigationMenu.Item value="guides">
                <NavigationMenu.Trigger>Guides</NavigationMenu.Trigger>
                <NavigationMenu.Content>
                  <div style={{ padding: '8px', minWidth: '200px' }}>
                    <NavigationMenu.Link href="/install" title="Installation" description="Get started quickly." />
                    <NavigationMenu.Link href="/config" title="Configuration" description="Customize your setup." />
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            </NavigationMenu.List>
            <NavigationMenu.Viewport />
          </NavigationMenu>
        </div>
      ),
    },
  ],
});
