import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Inset Dashboard Layout',
  description: 'Modern shadcn-style layout with rounded main content and visual separation',
  category: 'dashboard',
  components: ['AppShell', 'Header', 'Sidebar', 'Stack', 'Grid', 'Card', 'Text', 'Badge', 'Input', 'ThemeToggle', 'Avatar'],
  tags: ['dashboard', 'layout', 'inset', 'sidebar', 'app-shell'],
  code: `
const navItems = [
  { label: 'Dashboard', active: true },
  { label: 'Analytics', active: false },
  { label: 'Projects', active: false },
  { label: 'Settings', active: false },
];

const metrics = [
  { label: 'Total Users', value: '12,847', change: '+12%' },
  { label: 'Revenue', value: '$48,352', change: '+8%' },
  { label: 'Active Projects', value: '23', change: '+3' },
];

<AppShell layout="inset">
  <AppShell.Header>
    <Header>
      <Header.Trigger />
      <Header.Search>
        <Input placeholder="Search..." style={{ width: '240px' }} />
      </Header.Search>
      <Header.Spacer />
      <Header.Actions>
        <ThemeToggle size="sm" />
        <Avatar size="sm" initials="JD" />
      </Header.Actions>
    </Header>
  </AppShell.Header>
  <AppShell.Sidebar width="220px" collapsible="offcanvas">
    <Sidebar.Header>
      <Text weight="semibold" size="lg">Acme Inc</Text>
    </Sidebar.Header>
    <Sidebar.Nav>
      <Sidebar.Section label="Main">
        {navItems.map((item) => (
          <Sidebar.Item key={item.label} active={item.active}>
            {item.label}
          </Sidebar.Item>
        ))}
      </Sidebar.Section>
    </Sidebar.Nav>
    <Sidebar.Footer>
      <Text size="sm" color="tertiary">v2.0.0</Text>
    </Sidebar.Footer>
  </AppShell.Sidebar>
  <AppShell.Main padding="lg">
    <Stack gap="lg">
      <Stack gap="xs">
        <Text size="xl" weight="semibold">Dashboard</Text>
        <Text color="tertiary">Welcome back! Here's an overview of your metrics.</Text>
      </Stack>
      <Grid columns={{ base: 1, md: 3 }} gap="md">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <Card.Body>
              <Stack gap="sm">
                <Text size="sm" color="tertiary">{metric.label}</Text>
                <Stack direction="row" justify="between" align="baseline">
                  <Text size="2xl" weight="semibold">{metric.value}</Text>
                  <Badge variant="success">{metric.change}</Badge>
                </Stack>
              </Stack>
            </Card.Body>
          </Card>
        ))}
      </Grid>
    </Stack>
  </AppShell.Main>
</AppShell>
`.trim(),
});
