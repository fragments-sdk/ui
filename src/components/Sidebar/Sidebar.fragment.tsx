import React, { useState } from 'react';
import { defineSegment } from '@fragments/core';
import { Sidebar, SidebarProvider, useSidebar } from '.';
import { Button } from '../Button';

// Example icons (inline SVGs for demo)
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8H96a8,8,0,0,0,8-8V160h48v56a8,8,0,0,0,8,8h56a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H168V152a8,8,0,0,0-8-8H96a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z" />
  </svg>
);

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M216,72H130.67L102.93,51.2a16.12,16.12,0,0,0-9.6-3.2H40A16,16,0,0,0,24,64V200a16,16,0,0,0,16,16H216.89A15.13,15.13,0,0,0,232,200.89V88A16,16,0,0,0,216,72Zm0,128H40V64H93.33l27.74,20.8a16.12,16.12,0,0,0,9.6,3.2H216Z" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224,200h-8V40a8,8,0,0,0-16,0V200H168V96a8,8,0,0,0-16,0V200H120V136a8,8,0,0,0-16,0v64H72V168a8,8,0,0,0-16,0v32H40a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16Z" />
  </svg>
);

const GearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z" />
  </svg>
);

const HelpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
  </svg>
);

const SidebarToggleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Z" />
  </svg>
);

// Mock Link component for demonstrating asChild pattern
const MockLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ children, ...props }, ref) => (
    <a ref={ref} {...props} onClick={(e) => { e.preventDefault(); props.onClick?.(e); }}>
      {children}
    </a>
  )
);

const LogoIcon = ({ size = 32 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
    <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
  </svg>
);

// Shared styles for demo content area
const mainContentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0, // Prevents flex item from overflowing
  padding: '24px',
  background: 'var(--fui-bg-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--fui-text-secondary)',
  fontSize: 'var(--fui-font-size-sm)',
};

const demoContainerStyle: React.CSSProperties = {
  height: '400px',
  display: 'flex',
  width: '100%',
};

// Stateful demo for collapsed state
function CollapsedDemo() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div style={demoContainerStyle}>
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <Sidebar.Header collapsedContent={<LogoIcon size={32} />}>
          <LogoIcon size={32} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Acme App</span>
        </Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
            <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
            <Sidebar.Item icon={<UsersIcon />}>Team</Sidebar.Item>
            <Sidebar.Item icon={<FolderIcon />}>Projects</Sidebar.Item>
          </Sidebar.Section>
          <Sidebar.Section label="Settings">
            <Sidebar.Item icon={<GearIcon />}>Preferences</Sidebar.Item>
            <Sidebar.Item icon={<HelpIcon />}>Help</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </Sidebar>
      <main style={mainContentStyle}>
        Hover over icons to see tooltips. Click toggle to expand.
      </main>
    </div>
  );
}

// Demo for submenu expansion using uncontrolled defaultExpanded
function SubmenuDemo() {
  return (
    <div style={demoContainerStyle}>
      <Sidebar>
        <Sidebar.Header collapsedContent={<LogoIcon size={32} />}>
          <LogoIcon size={32} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Acme App</span>
        </Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item icon={<HomeIcon />}>Dashboard</Sidebar.Item>
            <Sidebar.Item icon={<FolderIcon />} hasSubmenu defaultExpanded>
              Projects
            </Sidebar.Item>
            <Sidebar.Submenu>
              <Sidebar.SubItem active>Website Redesign</Sidebar.SubItem>
              <Sidebar.SubItem>Mobile App</Sidebar.SubItem>
              <Sidebar.SubItem>API Integration</Sidebar.SubItem>
            </Sidebar.Submenu>
            <Sidebar.Item icon={<UsersIcon />} hasSubmenu>
              Team
            </Sidebar.Item>
            <Sidebar.Submenu>
              <Sidebar.SubItem>Engineering</Sidebar.SubItem>
              <Sidebar.SubItem>Design</Sidebar.SubItem>
            </Sidebar.Submenu>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </Sidebar>
      <main style={mainContentStyle}>
        Click on "Projects" or "Team" to toggle their submenus
      </main>
    </div>
  );
}

// Demo for SidebarProvider with external trigger
function ExternalTriggerContent() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <main style={mainContentStyle}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '16px' }}>
          Sidebar state: <strong>{state}</strong>
        </p>
        <Button onClick={toggleSidebar} variant="outline" size="sm">
          <SidebarToggleIcon /> Toggle Sidebar
        </Button>
        <p style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
          Also try pressing Cmd/Ctrl+B
        </p>
      </div>
    </main>
  );
}

function ProviderDemo() {
  return (
    <div style={demoContainerStyle}>
      <SidebarProvider>
        <Sidebar>
          <Sidebar.Header collapsedContent={<LogoIcon size={32} />}>
            <LogoIcon size={32} />
            <span style={{ fontWeight: 600, fontSize: '16px' }}>Acme App</span>
            <Sidebar.CollapseToggle />
          </Sidebar.Header>
          <Sidebar.Nav>
            <Sidebar.Section>
              <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
              <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
              <Sidebar.Item icon={<UsersIcon />}>Team</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Nav>
        </Sidebar>
        <ExternalTriggerContent />
      </SidebarProvider>
    </div>
  );
}

// Demo for asChild pattern with mock Link
function AsChildDemo() {
  return (
    <div style={demoContainerStyle}>
      <Sidebar>
        <Sidebar.Header collapsedContent={<LogoIcon size={32} />}>
          <LogoIcon size={32} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Acme App</span>
        </Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item icon={<HomeIcon />} active asChild>
              <MockLink href="/dashboard">Dashboard</MockLink>
            </Sidebar.Item>
            <Sidebar.Item icon={<ChartIcon />} asChild>
              <MockLink href="/analytics">Analytics</MockLink>
            </Sidebar.Item>
            <Sidebar.Item icon={<UsersIcon />} asChild>
              <MockLink href="/team">Team</MockLink>
            </Sidebar.Item>
            <Sidebar.Item icon={<FolderIcon />} asChild>
              <MockLink href="/projects">Projects</MockLink>
            </Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </Sidebar>
      <main style={mainContentStyle}>
        Items rendered as Link components using asChild pattern
      </main>
    </div>
  );
}

// Demo for section with action button
function SectionActionDemo() {
  return (
    <div style={demoContainerStyle}>
      <Sidebar>
        <Sidebar.Header collapsedContent={<LogoIcon size={32} />}>
          <LogoIcon size={32} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Acme App</span>
        </Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
            <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
          </Sidebar.Section>
          <Sidebar.Section
            label="Projects"
            action={
              <Sidebar.SectionAction aria-label="Add project" onClick={() => alert('Add project clicked')}>
                <PlusIcon />
              </Sidebar.SectionAction>
            }
          >
            <Sidebar.Item icon={<FolderIcon />}>Website Redesign</Sidebar.Item>
            <Sidebar.Item icon={<FolderIcon />}>Mobile App</Sidebar.Item>
            <Sidebar.Item icon={<FolderIcon />}>API Integration</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </Sidebar>
      <main style={mainContentStyle}>
        Section header has an "Add" action button
      </main>
    </div>
  );
}

// Demo for skeleton loading state
function SkeletonDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={demoContainerStyle}>
      <Sidebar>
        <Sidebar.Header collapsedContent={<LogoIcon size={32} />}>
          <LogoIcon size={32} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Acme App</span>
        </Sidebar.Header>
        <Sidebar.Nav>
          {loading ? (
            <Sidebar.MenuSkeleton count={6} />
          ) : (
            <Sidebar.Section>
              <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
              <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
              <Sidebar.Item icon={<UsersIcon />}>Team</Sidebar.Item>
              <Sidebar.Item icon={<FolderIcon />}>Projects</Sidebar.Item>
              <Sidebar.Item icon={<GearIcon />}>Settings</Sidebar.Item>
              <Sidebar.Item icon={<HelpIcon />}>Help</Sidebar.Item>
            </Sidebar.Section>
          )}
        </Sidebar.Nav>
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </Sidebar>
      <main style={mainContentStyle}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '16px' }}>
            {loading ? 'Loading navigation...' : 'Navigation loaded!'}
          </p>
          <Button onClick={() => setLoading(!loading)} variant="outline" size="sm">
            {loading ? 'Show Content' : 'Show Skeleton'}
          </Button>
        </div>
      </main>
    </div>
  );
}

// Demo for offcanvas collapsed state
function OffcanvasDemo() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div style={demoContainerStyle}>
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} collapsible="offcanvas">
        <Sidebar.Header collapsedContent={<LogoIcon size={32} />}>
          <LogoIcon size={32} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Acme App</span>
        </Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
            <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
            <Sidebar.Item icon={<UsersIcon />}>Team</Sidebar.Item>
            <Sidebar.Item icon={<FolderIcon />}>Projects</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </Sidebar>
      <main style={mainContentStyle}>
        Offcanvas mode hides sidebar completely. Toggle stays visible to re-open.
      </main>
    </div>
  );
}

// Demo for rail toggle
function RailDemo() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ ...demoContainerStyle, position: 'relative' }}>
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <Sidebar.Header collapsedContent={<LogoIcon size={32} />}>
          <LogoIcon size={32} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Acme App</span>
        </Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
            <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
            <Sidebar.Item icon={<UsersIcon />}>Team</Sidebar.Item>
            <Sidebar.Item icon={<FolderIcon />}>Projects</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
        <Sidebar.Rail />
      </Sidebar>
      <main style={mainContentStyle}>
        <div style={{ textAlign: 'center' }}>
          <p>Hover over the right edge of the sidebar to see the rail indicator.</p>
          <p style={{ marginTop: '8px', opacity: 0.7 }}>Click the rail to toggle collapse/expand.</p>
        </div>
      </main>
    </div>
  );
}

export default defineSegment({
  component: Sidebar,

  meta: {
    name: 'Sidebar',
    description: 'Responsive navigation sidebar with collapsible desktop mode and mobile drawer behavior.',
    category: 'navigation',
    status: 'stable',
    tags: ['sidebar', 'navigation', 'drawer', 'menu', 'layout'],
    since: '0.3.0',
  },

  usage: {
    when: [
      'Primary app navigation with multiple sections',
      'Dashboard layouts requiring persistent navigation',
      'Admin interfaces with hierarchical menu structure',
      'Apps that need both mobile drawer and desktop sidebar',
    ],
    whenNot: [
      'Simple websites with few pages (use header nav)',
      'Content-focused sites where navigation is secondary',
      'Single-page applications with no navigation needs',
      'Mobile-only apps where bottom navigation is preferred',
    ],
    guidelines: [
      'Group related items into sections with clear labels',
      'Use icons for all items to support collapsed mode',
      'Limit nesting to 2 levels maximum',
      'Place most frequently used items at the top',
      'Use badges sparingly for notifications or counts',
      'The `active` prop on items should be controlled by your app based on current route',
      'Use `collapsedContent` on Header to show just a logo icon when collapsed',
      'Submenus are hidden when collapsed - use tooltips for navigation hints instead',
      'Use SidebarProvider to enable external triggers and keyboard shortcuts',
      'Use asChild with routing libraries (Next.js Link, React Router NavLink)',
      'Use Sidebar.MenuSkeleton while loading navigation data',
    ],
    accessibility: [
      'Uses semantic <nav> element with aria-label',
      'aria-current="page" on active items',
      'aria-expanded on items with submenus',
      'Escape key closes mobile drawer',
      'Cmd/Ctrl+B keyboard shortcut toggles sidebar (when using SidebarProvider)',
      'Focus trap in mobile drawer mode',
      'Minimum 44px touch targets',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Sidebar content (use Sidebar.Header, Sidebar.Nav, Sidebar.Section, etc.)',
      required: true,
    },
    collapsed: {
      type: 'boolean',
      description: 'Icon-only mode for desktop (controlled)',
    },
    defaultCollapsed: {
      type: 'boolean',
      description: 'Initial collapsed state (uncontrolled)',
      default: false,
    },
    onCollapsedChange: {
      type: 'function',
      description: 'Called when collapsed state changes',
    },
    open: {
      type: 'boolean',
      description: 'Mobile drawer open state (controlled)',
    },
    defaultOpen: {
      type: 'boolean',
      description: 'Initial open state (uncontrolled)',
      default: false,
    },
    onOpenChange: {
      type: 'function',
      description: 'Called when open state changes',
    },
    width: {
      type: 'string',
      description: 'Width of expanded sidebar',
      default: '240px',
    },
    collapsedWidth: {
      type: 'string',
      description: 'Width when collapsed',
      default: '64px',
    },
    position: {
      type: 'enum',
      description: 'Sidebar position',
      values: ['left', 'right'],
      default: 'left',
    },
    collapsible: {
      type: 'enum',
      description: 'Collapse behavior mode',
      values: ['icon', 'offcanvas', 'none'],
      default: 'icon',
    },
  },

  relations: [
    { component: 'Tabs', relationship: 'alternative', note: 'Use Tabs for in-page section navigation' },
    { component: 'Menu', relationship: 'composition', note: 'Use Menu for contextual actions within sidebar' },
  ],

  contract: {
    propsSummary: [
      'collapsed: boolean - icon-only desktop mode',
      'open: boolean - mobile drawer state',
      'width: string - expanded width (default: 240px)',
      'position: left|right - sidebar position',
      'active: boolean - set on Sidebar.Item to mark current page (app-controlled)',
    ],
    scenarioTags: [
      'navigation.sidebar',
      'layout.sidebar',
      'navigation.drawer',
    ],
    a11yRules: ['A11Y_NAV_LANDMARK', 'A11Y_FOCUS_TRAP', 'A11Y_ESCAPE_CLOSE'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Header', 'Nav', 'Section', 'Item', 'SubItem', 'Submenu', 'Footer', 'CollapseToggle', 'Rail', 'MenuSkeleton', 'SectionAction'],
    requiredChildren: ['Nav'],
    commonPatterns: [
      '<Sidebar><Sidebar.Header>{logo}</Sidebar.Header><Sidebar.Nav><Sidebar.Section><Sidebar.Item icon={icon} active>{label}</Sidebar.Item></Sidebar.Section></Sidebar.Nav><Sidebar.Footer><Sidebar.CollapseToggle /></Sidebar.Footer></Sidebar>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Standard sidebar with navigation sections. The `active` prop highlights the current page.',
      code: `<Sidebar>
  <Sidebar.Header>
    <Logo />
    <span>Acme App</span>
  </Sidebar.Header>
  <Sidebar.Nav>
    <Sidebar.Section>
      <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
      <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
      <Sidebar.Item icon={<UsersIcon />}>Team</Sidebar.Item>
      <Sidebar.Item icon={<FolderIcon />}>Projects</Sidebar.Item>
    </Sidebar.Section>
    <Sidebar.Section label="Settings">
      <Sidebar.Item icon={<GearIcon />}>Preferences</Sidebar.Item>
      <Sidebar.Item icon={<HelpIcon />}>Help</Sidebar.Item>
    </Sidebar.Section>
  </Sidebar.Nav>
  <Sidebar.Footer>
    <Sidebar.CollapseToggle />
  </Sidebar.Footer>
</Sidebar>`,
      render: () => (
        <div style={demoContainerStyle}>
          <Sidebar>
            <Sidebar.Header collapsedContent={<LogoIcon size={32} />}>
              <LogoIcon size={32} />
              <span style={{ fontWeight: 600, fontSize: '16px' }}>Acme App</span>
            </Sidebar.Header>
            <Sidebar.Nav>
              <Sidebar.Section>
                <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
                <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
                <Sidebar.Item icon={<UsersIcon />}>Team</Sidebar.Item>
                <Sidebar.Item icon={<FolderIcon />}>Projects</Sidebar.Item>
              </Sidebar.Section>
              <Sidebar.Section label="Settings">
                <Sidebar.Item icon={<GearIcon />}>Preferences</Sidebar.Item>
                <Sidebar.Item icon={<HelpIcon />}>Help</Sidebar.Item>
              </Sidebar.Section>
            </Sidebar.Nav>
            <Sidebar.Footer>
              <Sidebar.CollapseToggle />
            </Sidebar.Footer>
          </Sidebar>
          <main style={mainContentStyle}>
            Dashboard content goes here
          </main>
        </div>
      ),
    },
    {
      name: 'Collapsed',
      description: 'Icon-only collapsed state. Header shows only logo, tooltips appear on hover.',
      code: `function App() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
      <Sidebar.Header collapsedContent={<Logo />}>
        <Logo />
        <span>Acme App</span>
      </Sidebar.Header>
      <Sidebar.Nav>
        <Sidebar.Section>
          <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
          <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
      <Sidebar.Footer>
        <Sidebar.CollapseToggle />
      </Sidebar.Footer>
    </Sidebar>
  );
}`,
      render: () => <CollapsedDemo />,
    },
    {
      name: 'With Badges',
      description: 'Navigation items with notification badges for counts or alerts.',
      code: `<Sidebar>
  <Sidebar.Nav>
    <Sidebar.Section>
      <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
      <Sidebar.Item icon={<ChartIcon />} badge="3">Analytics</Sidebar.Item>
      <Sidebar.Item icon={<UsersIcon />} badge="12">Team</Sidebar.Item>
      <Sidebar.Item icon={<FolderIcon />}>Projects</Sidebar.Item>
    </Sidebar.Section>
  </Sidebar.Nav>
</Sidebar>`,
      render: () => (
        <div style={demoContainerStyle}>
          <Sidebar>
            <Sidebar.Header collapsedContent={<LogoIcon size={32} />}>
              <LogoIcon size={32} />
              <span style={{ fontWeight: 600, fontSize: '16px' }}>Acme App</span>
            </Sidebar.Header>
            <Sidebar.Nav>
              <Sidebar.Section>
                <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
                <Sidebar.Item icon={<ChartIcon />} badge="3">Analytics</Sidebar.Item>
                <Sidebar.Item icon={<UsersIcon />} badge="12">Team</Sidebar.Item>
                <Sidebar.Item icon={<FolderIcon />}>Projects</Sidebar.Item>
              </Sidebar.Section>
            </Sidebar.Nav>
            <Sidebar.Footer>
              <Sidebar.CollapseToggle />
            </Sidebar.Footer>
          </Sidebar>
          <main style={mainContentStyle}>
            Badges indicate unread items or notifications
          </main>
        </div>
      ),
    },
    {
      name: 'With Submenu',
      description: 'Nested navigation with expandable sections. Use defaultExpanded for initial state without manual state tracking.',
      code: `<Sidebar>
  <Sidebar.Nav>
    <Sidebar.Section>
      <Sidebar.Item icon={<HomeIcon />}>Dashboard</Sidebar.Item>
      {/* Use defaultExpanded for uncontrolled mode - no state needed! */}
      <Sidebar.Item icon={<FolderIcon />} hasSubmenu defaultExpanded>
        Projects
      </Sidebar.Item>
      <Sidebar.Submenu>
        <Sidebar.SubItem active>Website Redesign</Sidebar.SubItem>
        <Sidebar.SubItem>Mobile App</Sidebar.SubItem>
        <Sidebar.SubItem>API Integration</Sidebar.SubItem>
      </Sidebar.Submenu>
      {/* Multiple submenus work without tracking separate state */}
      <Sidebar.Item icon={<UsersIcon />} hasSubmenu>
        Team
      </Sidebar.Item>
      <Sidebar.Submenu>
        <Sidebar.SubItem>Engineering</Sidebar.SubItem>
        <Sidebar.SubItem>Design</Sidebar.SubItem>
      </Sidebar.Submenu>
    </Sidebar.Section>
  </Sidebar.Nav>
</Sidebar>`,
      render: () => <SubmenuDemo />,
    },
    {
      name: 'With Disabled Items',
      description: 'Some navigation items are disabled for permissions or feature flags.',
      code: `<Sidebar>
  <Sidebar.Nav>
    <Sidebar.Section>
      <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
      <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
      <Sidebar.Item icon={<UsersIcon />} disabled>
        Team (Coming Soon)
      </Sidebar.Item>
      <Sidebar.Item icon={<FolderIcon />} disabled>
        Projects (Upgrade)
      </Sidebar.Item>
    </Sidebar.Section>
  </Sidebar.Nav>
</Sidebar>`,
      render: () => (
        <div style={demoContainerStyle}>
          <Sidebar>
            <Sidebar.Header collapsedContent={<LogoIcon size={32} />}>
              <LogoIcon size={32} />
              <span style={{ fontWeight: 600, fontSize: '16px' }}>Acme App</span>
            </Sidebar.Header>
            <Sidebar.Nav>
              <Sidebar.Section>
                <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
                <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
                <Sidebar.Item icon={<UsersIcon />} disabled>Team (Coming Soon)</Sidebar.Item>
                <Sidebar.Item icon={<FolderIcon />} disabled>Projects (Upgrade)</Sidebar.Item>
              </Sidebar.Section>
            </Sidebar.Nav>
            <Sidebar.Footer>
              <Sidebar.CollapseToggle />
            </Sidebar.Footer>
          </Sidebar>
          <main style={mainContentStyle}>
            Disabled items cannot be clicked
          </main>
        </div>
      ),
    },
    {
      name: 'With Provider & External Trigger',
      description: 'SidebarProvider enables external triggers and keyboard shortcuts (Cmd/Ctrl+B).',
      code: `function App() {
  return (
    <SidebarProvider>
      <Sidebar>
        <Sidebar.Header>
          <Logo />
          <span>Acme App</span>
          <Sidebar.CollapseToggle />
        </Sidebar.Header>
        {/* sidebar nav */}
      </Sidebar>
      <MainContent />
    </SidebarProvider>
  );
}

function MainContent() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <main>
      <p>State: {state}</p>
      <button onClick={toggleSidebar}>Toggle</button>
    </main>
  );
}`,
      render: () => <ProviderDemo />,
    },
    {
      name: 'With asChild (Polymorphic)',
      description: 'Use asChild to render items as custom elements like Next.js Link or React Router NavLink.',
      code: `import { Link } from 'next/link';

<Sidebar>
  <Sidebar.Nav>
    <Sidebar.Section>
      <Sidebar.Item icon={<HomeIcon />} active asChild>
        <Link href="/dashboard">Dashboard</Link>
      </Sidebar.Item>
      <Sidebar.Item icon={<ChartIcon />} asChild>
        <Link href="/analytics">Analytics</Link>
      </Sidebar.Item>
    </Sidebar.Section>
  </Sidebar.Nav>
</Sidebar>`,
      render: () => <AsChildDemo />,
    },
    {
      name: 'With Section Action',
      description: 'Section headers can include action buttons for quick actions like "Add Project".',
      code: `<Sidebar>
  <Sidebar.Nav>
    <Sidebar.Section
      label="Projects"
      action={
        <Sidebar.SectionAction aria-label="Add project" onClick={handleAdd}>
          <PlusIcon />
        </Sidebar.SectionAction>
      }
    >
      <Sidebar.Item icon={<FolderIcon />}>Website Redesign</Sidebar.Item>
      <Sidebar.Item icon={<FolderIcon />}>Mobile App</Sidebar.Item>
    </Sidebar.Section>
  </Sidebar.Nav>
</Sidebar>`,
      render: () => <SectionActionDemo />,
    },
    {
      name: 'With Loading Skeleton',
      description: 'Show skeleton placeholders while navigation data is loading.',
      code: `<Sidebar>
  <Sidebar.Nav>
    {loading ? (
      <Sidebar.MenuSkeleton count={6} />
    ) : (
      <Sidebar.Section>
        <Sidebar.Item icon={<HomeIcon />}>Dashboard</Sidebar.Item>
        {/* ... */}
      </Sidebar.Section>
    )}
  </Sidebar.Nav>
</Sidebar>`,
      render: () => <SkeletonDemo />,
    },
    {
      name: 'With Rail Toggle',
      description: 'Add a Rail component for a subtle drag-handle style toggle at the sidebar edge. Hover to reveal, click to toggle.',
      code: `<Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
  <Sidebar.Header>{/* ... */}</Sidebar.Header>
  <Sidebar.Nav>{/* ... */}</Sidebar.Nav>
  <Sidebar.Footer>
    <Sidebar.CollapseToggle />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar>`,
      render: () => <RailDemo />,
    },
    {
      name: 'Offcanvas Collapsed',
      description: 'Offcanvas mode hides the sidebar completely when collapsed, but the toggle button remains visible as a floating button so the user can always re-expand.',
      code: `function App() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} collapsible="offcanvas">
      <Sidebar.Header collapsedContent={<Logo />}>
        <Logo />
        <span>Acme App</span>
      </Sidebar.Header>
      <Sidebar.Nav>
        <Sidebar.Section>
          <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
          <Sidebar.Item icon={<ChartIcon />}>Analytics</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
      <Sidebar.Footer>
        <Sidebar.CollapseToggle />
      </Sidebar.Footer>
    </Sidebar>
  );
}`,
      render: () => <OffcanvasDemo />,
    },
  ],
});
