import React from 'react';
import { ChartBar, Gear, House, MagnifyingGlass } from '@phosphor-icons/react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { AppShell } from '.';
import { Box } from '../Box';
import { Header } from '../Header';
import { Icon } from '../Icon';
import { Sidebar } from '../Sidebar';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { ThemeToggle } from '../Theme';

export default defineFragment({
  component: AppShell,

  meta: {
    name: 'AppShell',
    description: 'Full layout wrapper integrating sidebar, header, main content, and optional aside panel. Supports three layout modes: default (header on top), sidebar (sidebar full height), and sidebar-floating (sidebar + rounded main content).',
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
      'Use layout="default" when header should span full width (logo in header)',
      'Use layout="sidebar" when sidebar should be full height (logo in sidebar)',
      'Use layout="sidebar-floating" for a modern look with rounded, elevated main content',
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
      values: ['default', 'sidebar', 'sidebar-floating'],
      default: 'default',
    },
  },

  relations: [
    { component: 'Theme', relationship: 'parent', note: 'AppShell should be wrapped in ThemeProvider' },
    { component: 'Header', relationship: 'child', note: 'Header is placed inside AppShell.Header' },
    { component: 'Sidebar', relationship: 'child', note: 'Sidebar content goes inside AppShell.Sidebar' },
  ],

  variants: [
    {
      name: 'Default Layout',
      description: 'Header spans full width above sidebar (default). Best when brand/logo should be prominent in header.',
      code: `import { ChartBar, Gear, House } from '@phosphor-icons/react';
import { AppShell } from '@/components/AppShell';
import { Box } from '@/components/Box';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { Sidebar } from '@/components/Sidebar';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { ThemeToggle } from '@/components/Theme';

<Box minHeight="100vh" overflow="hidden" border rounded="md">
  <AppShell layout="default">
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
          <Sidebar.Item icon={<Icon icon={House} size="md" />} active>Home</Sidebar.Item>
          <Sidebar.Item icon={<Icon icon={ChartBar} size="md" />}>Analytics</Sidebar.Item>
          <Sidebar.Item icon={<Icon icon={Gear} size="md" />}>Settings</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
    </AppShell.Sidebar>

    <AppShell.Main padding="md">
      <Stack gap="xs">
        <Text as="h2" size="xl" weight="semibold">Default Layout</Text>
        <Text as="p" color="secondary">
          Header spans full width. Logo is in the header.
        </Text>
      </Stack>
    </AppShell.Main>
  </AppShell>
</Box>`,
      render: () => (
        <Box minHeight="100vh" overflow="hidden" border rounded="md">
          <AppShell layout="default">
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
                  <Sidebar.Item icon={<Icon icon={House} size="md" />} active>Home</Sidebar.Item>
                  <Sidebar.Item icon={<Icon icon={ChartBar} size="md" />}>Analytics</Sidebar.Item>
                  <Sidebar.Item icon={<Icon icon={Gear} size="md" />}>Settings</Sidebar.Item>
                </Sidebar.Section>
              </Sidebar.Nav>
            </AppShell.Sidebar>

            <AppShell.Main padding="md">
              <Stack gap="xs">
                <Text as="h2" size="xl" weight="semibold">Default Layout</Text>
                <Text as="p" color="secondary">
                  Header spans full width. Logo is in the header.
                </Text>
              </Stack>
            </AppShell.Main>
          </AppShell>
        </Box>
      ),
    },
    {
      name: 'Sidebar Layout',
      description: 'Sidebar is full height, header sits next to it. Best for documentation sites or when sidebar branding is preferred.',
      code: `import { ChartBar, Gear, House, MagnifyingGlass } from '@phosphor-icons/react';
import { AppShell } from '@/components/AppShell';
import { Box } from '@/components/Box';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { Sidebar } from '@/components/Sidebar';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { ThemeToggle } from '@/components/Theme';

<Box minHeight="100vh" overflow="hidden" border rounded="md">
  <AppShell layout="sidebar">
    <AppShell.Header>
      <Header>
        <Header.Trigger />
        <Header.Search>
          <Box background="secondary" rounded="sm" paddingX="sm" paddingY="xs">
            <Stack direction="row" align="center" gap="sm">
              <Icon icon={MagnifyingGlass} size="sm" variant="tertiary" />
              <Text size="sm" color="tertiary">Search...</Text>
            </Stack>
          </Box>
        </Header.Search>
        <Header.Spacer />
        <Header.Actions>
          <ThemeToggle size="sm" />
        </Header.Actions>
      </Header>
    </AppShell.Header>

    <AppShell.Sidebar width="200px" collapsible="offcanvas">
      <Sidebar.Header>
        <Text weight="semibold">MyApp</Text>
      </Sidebar.Header>
      <Sidebar.Nav>
        <Sidebar.Section label="Menu">
          <Sidebar.Item icon={<Icon icon={House} size="md" />} active>Home</Sidebar.Item>
          <Sidebar.Item icon={<Icon icon={ChartBar} size="md" />}>Analytics</Sidebar.Item>
          <Sidebar.Item icon={<Icon icon={Gear} size="md" />}>Settings</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
      <Sidebar.Footer>v1.0.0</Sidebar.Footer>
    </AppShell.Sidebar>

    <AppShell.Main padding="md">
      <Stack gap="xs">
        <Text as="h2" size="xl" weight="semibold">Sidebar Layout</Text>
        <Text as="p" color="secondary">
          Sidebar is full height. Logo is in the sidebar header.
        </Text>
      </Stack>
    </AppShell.Main>
  </AppShell>
</Box>`,
      render: () => (
        <Box minHeight="100vh" overflow="hidden" border rounded="md">
          <AppShell layout="sidebar">
            <AppShell.Header>
              <Header>
                <Header.Trigger />
                <Header.Search>
                  <Box background="secondary" rounded="sm" paddingX="sm" paddingY="xs">
                    <Stack direction="row" align="center" gap="sm">
                      <Icon icon={MagnifyingGlass} size="sm" variant="tertiary" />
                      <Text size="sm" color="tertiary">Search...</Text>
                    </Stack>
                  </Box>
                </Header.Search>
                <Header.Spacer />
                <Header.Actions>
                  <ThemeToggle size="sm" />
                </Header.Actions>
              </Header>
            </AppShell.Header>

            <AppShell.Sidebar width="200px" collapsible="offcanvas">
              <Sidebar.Header>
                <Text weight="semibold">MyApp</Text>
              </Sidebar.Header>
              <Sidebar.Nav>
                <Sidebar.Section label="Menu">
                  <Sidebar.Item icon={<Icon icon={House} size="md" />} active>Home</Sidebar.Item>
                  <Sidebar.Item icon={<Icon icon={ChartBar} size="md" />}>Analytics</Sidebar.Item>
                  <Sidebar.Item icon={<Icon icon={Gear} size="md" />}>Settings</Sidebar.Item>
                </Sidebar.Section>
              </Sidebar.Nav>
              <Sidebar.Footer>v1.0.0</Sidebar.Footer>
            </AppShell.Sidebar>

            <AppShell.Main padding="md">
              <Stack gap="xs">
                <Text as="h2" size="xl" weight="semibold">Sidebar Layout</Text>
                <Text as="p" color="secondary">
                  Sidebar is full height. Logo is in the sidebar header.
                </Text>
              </Stack>
            </AppShell.Main>
          </AppShell>
        </Box>
      ),
    },
    {
      name: 'With Aside Panel',
      description: 'App shell with optional right panel for additional context or actions',
      code: `import { ChartBar, House } from '@phosphor-icons/react';
import { AppShell } from '@/components/AppShell';
import { Box } from '@/components/Box';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { Sidebar } from '@/components/Sidebar';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { ThemeToggle } from '@/components/Theme';

<Box minHeight="100vh" overflow="hidden" border rounded="md">
  <AppShell layout="default">
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
          <Sidebar.Item icon={<Icon icon={House} size="md" />} active>Home</Sidebar.Item>
          <Sidebar.Item icon={<Icon icon={ChartBar} size="md" />}>Stats</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
    </AppShell.Sidebar>

    <AppShell.Main padding="md">
      <Stack gap="xs">
        <Text as="h2" size="xl" weight="semibold">Main Content</Text>
        <Text as="p">Content with aside panel on the right.</Text>
      </Stack>
    </AppShell.Main>

    <AppShell.Aside width="180px">
      <Box padding="md">
        <Stack gap="xs">
          <Text as="h3" size="sm" weight="semibold">Aside Panel</Text>
          <Text as="p" size="sm" color="secondary">
            Additional context, filters, or quick actions.
          </Text>
        </Stack>
      </Box>
    </AppShell.Aside>
  </AppShell>
</Box>`,
      render: () => (
        <Box minHeight="100vh" overflow="hidden" border rounded="md">
          <AppShell layout="default">
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
                  <Sidebar.Item icon={<Icon icon={House} size="md" />} active>Home</Sidebar.Item>
                  <Sidebar.Item icon={<Icon icon={ChartBar} size="md" />}>Stats</Sidebar.Item>
                </Sidebar.Section>
              </Sidebar.Nav>
            </AppShell.Sidebar>

            <AppShell.Main padding="md">
              <Stack gap="xs">
                <Text as="h2" size="xl" weight="semibold">Main Content</Text>
                <Text as="p">Content with aside panel on the right.</Text>
              </Stack>
            </AppShell.Main>

            <AppShell.Aside width="180px">
              <Box padding="md">
                <Stack gap="xs">
                  <Text as="h3" size="sm" weight="semibold">Aside Panel</Text>
                  <Text as="p" size="sm" color="secondary">
                    Additional context, filters, or quick actions.
                  </Text>
                </Stack>
              </Box>
            </AppShell.Aside>
          </AppShell>
        </Box>
      ),
    },
    {
      name: 'Collapsible Icon Sidebar',
      description: 'Sidebar that collapses to icons only on desktop',
      code: `import { ChartBar, Gear, House } from '@phosphor-icons/react';
import { AppShell } from '@/components/AppShell';
import { Box } from '@/components/Box';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { Sidebar } from '@/components/Sidebar';
import { Text } from '@/components/Text';
import { ThemeToggle } from '@/components/Theme';

<Box minHeight="100vh" overflow="hidden" border rounded="md">
  <AppShell layout="sidebar">
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
        <Text weight="semibold">App</Text>
      </Sidebar.Header>
      <Sidebar.Nav>
        <Sidebar.Section>
          <Sidebar.Item icon={<Icon icon={House} size="md" />} active>Home</Sidebar.Item>
          <Sidebar.Item icon={<Icon icon={ChartBar} size="md" />}>Analytics</Sidebar.Item>
          <Sidebar.Item icon={<Icon icon={Gear} size="md" />}>Settings</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
      <Sidebar.Footer>
        <Sidebar.CollapseToggle />
      </Sidebar.Footer>
    </AppShell.Sidebar>

    <AppShell.Main padding="md">
      <Text as="p">
        Click the collapse button in the sidebar footer to toggle between expanded and icon-only modes.
      </Text>
    </AppShell.Main>
  </AppShell>
</Box>`,
      render: () => (
        <Box minHeight="100vh" overflow="hidden" border rounded="md">
          <AppShell layout="sidebar">
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
                <Text weight="semibold">App</Text>
              </Sidebar.Header>
              <Sidebar.Nav>
                <Sidebar.Section>
                  <Sidebar.Item icon={<Icon icon={House} size="md" />} active>Home</Sidebar.Item>
                  <Sidebar.Item icon={<Icon icon={ChartBar} size="md" />}>Analytics</Sidebar.Item>
                  <Sidebar.Item icon={<Icon icon={Gear} size="md" />}>Settings</Sidebar.Item>
                </Sidebar.Section>
              </Sidebar.Nav>
              <Sidebar.Footer>
                <Sidebar.CollapseToggle />
              </Sidebar.Footer>
            </AppShell.Sidebar>

            <AppShell.Main padding="md">
              <Text as="p">
                Click the collapse button in the sidebar footer to toggle between expanded and icon-only modes.
              </Text>
            </AppShell.Main>
          </AppShell>
        </Box>
      ),
    },
    {
      name: 'Sidebar Floating Layout',
      description: 'Modern layout with rounded main content area and visual separation from sidebar. Main content floats with a distinct background.',
      code: `import { ChartBar, Gear, House, MagnifyingGlass } from '@phosphor-icons/react';
import { AppShell } from '@/components/AppShell';
import { Box } from '@/components/Box';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { Sidebar } from '@/components/Sidebar';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { ThemeToggle } from '@/components/Theme';

<Box minHeight="100vh" overflow="hidden" border rounded="md">
  <AppShell layout="sidebar-floating">
    <AppShell.Header>
      <Header>
        <Header.Trigger />
        <Header.Search>
          <Box background="primary" border rounded="sm" paddingX="sm" paddingY="xs">
            <Stack direction="row" align="center" gap="sm">
              <Icon icon={MagnifyingGlass} size="sm" variant="tertiary" />
              <Text size="sm" color="tertiary">Search...</Text>
            </Stack>
          </Box>
        </Header.Search>
        <Header.Spacer />
        <Header.Actions>
          <ThemeToggle size="sm" />
        </Header.Actions>
      </Header>
    </AppShell.Header>

    <AppShell.Sidebar width="200px" collapsible="offcanvas">
      <Sidebar.Header>
        <Text weight="semibold">MyApp</Text>
      </Sidebar.Header>
      <Sidebar.Nav>
        <Sidebar.Section label="Menu">
          <Sidebar.Item icon={<Icon icon={House} size="md" />} active>Home</Sidebar.Item>
          <Sidebar.Item icon={<Icon icon={ChartBar} size="md" />}>Analytics</Sidebar.Item>
          <Sidebar.Item icon={<Icon icon={Gear} size="md" />}>Settings</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
      <Sidebar.Footer>v1.0.0</Sidebar.Footer>
    </AppShell.Sidebar>

    <AppShell.Main padding="md">
      <Stack gap="xs">
        <Text as="h2" size="xl" weight="semibold">Sidebar Floating Layout</Text>
        <Text as="p" color="secondary">
          Main content has rounded corners and visual separation from the sidebar.
        </Text>
      </Stack>
    </AppShell.Main>
  </AppShell>
</Box>`,
      render: () => (
        <Box minHeight="100vh" overflow="hidden" border rounded="md">
          <AppShell layout="sidebar-floating">
            <AppShell.Header>
              <Header>
                <Header.Trigger />
                <Header.Search>
                  <Box background="primary" border rounded="sm" paddingX="sm" paddingY="xs">
                    <Stack direction="row" align="center" gap="sm">
                      <Icon icon={MagnifyingGlass} size="sm" variant="tertiary" />
                      <Text size="sm" color="tertiary">Search...</Text>
                    </Stack>
                  </Box>
                </Header.Search>
                <Header.Spacer />
                <Header.Actions>
                  <ThemeToggle size="sm" />
                </Header.Actions>
              </Header>
            </AppShell.Header>

            <AppShell.Sidebar width="200px" collapsible="offcanvas">
              <Sidebar.Header>
                <Text weight="semibold">MyApp</Text>
              </Sidebar.Header>
              <Sidebar.Nav>
                <Sidebar.Section label="Menu">
                  <Sidebar.Item icon={<Icon icon={House} size="md" />} active>Home</Sidebar.Item>
                  <Sidebar.Item icon={<Icon icon={ChartBar} size="md" />}>Analytics</Sidebar.Item>
                  <Sidebar.Item icon={<Icon icon={Gear} size="md" />}>Settings</Sidebar.Item>
                </Sidebar.Section>
              </Sidebar.Nav>
              <Sidebar.Footer>v1.0.0</Sidebar.Footer>
            </AppShell.Sidebar>

            <AppShell.Main padding="md">
              <Stack gap="xs">
                <Text as="h2" size="xl" weight="semibold">Sidebar Floating Layout</Text>
                <Text as="p" color="secondary">
                  Main content has rounded corners and visual separation from the sidebar.
                </Text>
              </Stack>
            </AppShell.Main>
          </AppShell>
        </Box>
      ),
    },
  ],
});
