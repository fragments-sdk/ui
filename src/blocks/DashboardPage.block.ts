import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Dashboard Page',
  description:
    'Full dashboard page with sidebar navigation, stats cards, revenue chart, transactions table, and activity feed',
  category: 'kitchen-sink',
  components: [
    'AppShell',
    'Header',
    'Sidebar',
    'Grid',
    'Card',
    'Stack',
    'Text',
    'Badge',
    'Icon',
    'Avatar',
    'Input',
    'Button',
    'Separator',
    'Table',
    'ChartContainer',
    'ChartTooltip',
    'Breadcrumbs',
    'ThemeToggle',
    'Progress',
    'Tabs',
  ],
  tags: [
    'dashboard',
    'full-page',
    'kitchen-sink',
    'chart',
    'table',
    'sidebar',
    'stats',
    'metrics',
    'analytics',
  ],
  code: `
import { AreaChart, Area, XAxis } from 'recharts';
import {
  TrendUp, TrendDown, Bell, SquaresFour, ChartBar,
  FileText, GearSix, Users, UserCircle, CreditCard,
  Bank, Lightning, Wallet, CheckCircle, Clock, XCircle,
  ArrowClockwise, DownloadSimple,
} from '@phosphor-icons/react';

// ── Stats data ──────────────────────────────────────────────
const stats = [
  { label: 'Total Revenue', value: '$45,231', change: '+20.1%', up: true },
  { label: 'Active Users', value: '2,350', change: '+12.5%', up: true },
  { label: 'Sessions', value: '12,543', change: '-3.2%', up: false },
  { label: 'Growth Rate', value: '4.5%', change: '+0.8%', up: true },
];

// ── Chart data ──────────────────────────────────────────────
const revenueData = [
  { month: 'Sep', revenue: 3200 },
  { month: 'Oct', revenue: 4100 },
  { month: 'Nov', revenue: 3800 },
  { month: 'Dec', revenue: 5200 },
  { month: 'Jan', revenue: 4800 },
  { month: 'Feb', revenue: 6100 },
];

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--fui-color-accent)' },
};

// ── Table data ──────────────────────────────────────────────
const methodIcons = { card: CreditCard, bank: Bank, crypto: Lightning, wallet: Wallet };
const methodLabels = { card: 'Card', bank: 'Bank', crypto: 'Crypto', wallet: 'Wallet' };
const statusConfig = {
  completed: { variant: 'success', icon: CheckCircle, label: 'Completed' },
  pending: { variant: 'warning', icon: Clock, label: 'Pending' },
  failed: { variant: 'error', icon: XCircle, label: 'Failed' },
  refunded: { variant: 'info', icon: ArrowClockwise, label: 'Refunded' },
};

const transactions = [
  { id: '1', customer: 'Alice Chen', method: 'card', amount: '$1,250.00', status: 'completed', date: 'Feb 3' },
  { id: '2', customer: 'Bob Park', method: 'bank', amount: '$890.00', status: 'pending', date: 'Feb 2' },
  { id: '3', customer: 'Clara Liu', method: 'crypto', amount: '$2,100.00', status: 'completed', date: 'Feb 1' },
  { id: '4', customer: 'David Kim', method: 'wallet', amount: '$450.00', status: 'failed', date: 'Jan 31' },
  { id: '5', customer: 'Eva Santos', method: 'card', amount: '$3,200.00', status: 'completed', date: 'Jan 30' },
];

const columns = createColumns([
  {
    key: 'customer',
    header: 'Customer',
    cell: (row) => (
      <Stack direction="row" gap="sm" align="center">
        <Icon icon={UserCircle} size="sm" />
        <Text size="sm" weight="medium">{row.customer}</Text>
      </Stack>
    ),
  },
  {
    key: 'method',
    header: 'Method',
    cell: (row) => (
      <Stack direction="row" gap="xs" align="center">
        <Icon icon={methodIcons[row.method]} size="xs" />
        <Text size="sm" color="secondary">{methodLabels[row.method]}</Text>
      </Stack>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    cell: (row) => <Text size="sm" weight="medium" font="mono">{row.amount}</Text>,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => {
      const cfg = statusConfig[row.status];
      return (
        <Badge variant={cfg.variant} size="sm" icon={<Icon icon={cfg.icon} size="xs" />}>
          {cfg.label}
        </Badge>
      );
    },
  },
  { key: 'date', header: 'Date' },
]);

// ── Activity data ───────────────────────────────────────────
const activities = [
  { id: 1, user: 'Alice Chen', action: 'completed a purchase', time: '2 min ago', initials: 'AC' },
  { id: 2, user: 'Bob Park', action: 'submitted a support ticket', time: '15 min ago', initials: 'BP' },
  { id: 3, user: 'Clara Liu', action: 'upgraded to Pro plan', time: '1 hour ago', initials: 'CL' },
  { id: 4, user: 'David Kim', action: 'left a review', time: '3 hours ago', initials: 'DK' },
];

// ── Layout ──────────────────────────────────────────────────

<AppShell layout="sidebar-inset">
  <AppShell.Header>
    <Header>
      <Header.Trigger />
      <Header.Nav>
        <Breadcrumbs>
          <Breadcrumbs.Item>Dashboard</Breadcrumbs.Item>
          <Breadcrumbs.Item>Overview</Breadcrumbs.Item>
        </Breadcrumbs>
      </Header.Nav>
      <Header.Spacer />
      <Header.Search>
        <Input placeholder="Search..." size="sm" style={{ width: 200 }} />
      </Header.Search>
      <Header.Actions>
        <Button variant="ghost" size="sm" icon aria-label="Notifications">
          <Icon icon={Bell} />
        </Button>
        <ThemeToggle size="sm" />
        <Avatar size="sm" initials="JD" />
      </Header.Actions>
    </Header>
  </AppShell.Header>

  <AppShell.Sidebar width="220px" collapsible="icon">
    <Sidebar.Header>
      <Text weight="semibold" size="lg">Acme Inc</Text>
    </Sidebar.Header>
    <Sidebar.Nav>
      <Sidebar.Section label="Main">
        <Sidebar.Item icon={<Icon icon={SquaresFour} />} active>Dashboard</Sidebar.Item>
        <Sidebar.Item icon={<Icon icon={ChartBar} />}>Analytics</Sidebar.Item>
        <Sidebar.Item icon={<Icon icon={Users} />}>Customers</Sidebar.Item>
        <Sidebar.Item icon={<Icon icon={FileText} />}>Reports</Sidebar.Item>
      </Sidebar.Section>
      <Sidebar.Section label="System">
        <Sidebar.Item icon={<Icon icon={GearSix} />}>Settings</Sidebar.Item>
      </Sidebar.Section>
    </Sidebar.Nav>
    <Sidebar.Footer>
      <Sidebar.CollapseToggle />
    </Sidebar.Footer>
  </AppShell.Sidebar>

  <AppShell.Main padding="lg">
    <Stack gap="lg">
      {/* Page header */}
      <Stack direction="row" justify="between" align="end">
        <Stack gap="xs">
          <Text size="xl" weight="semibold">Dashboard</Text>
          <Text color="secondary">Welcome back! Here's an overview of your metrics.</Text>
        </Stack>
        <Button variant="primary" size="sm">
          <Icon icon={DownloadSimple} size="sm" /> Export
        </Button>
      </Stack>

      {/* Stats cards */}
      <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <Card.Body>
              <Stack gap="xs">
                <Text size="sm" color="secondary">{stat.label}</Text>
                <Text size="2xl" weight="semibold">{stat.value}</Text>
                <Badge
                  variant={stat.up ? 'success' : 'warning'}
                  size="sm"
                  icon={<Icon icon={stat.up ? TrendUp : TrendDown} size="xs" />}
                >
                  {stat.change}
                </Badge>
              </Stack>
            </Card.Body>
          </Card>
        ))}
      </Grid>

      {/* Chart + Activity feed row */}
      <Grid columns={{ base: 1, lg: 3 }} gap="md">
        <Grid.Item colSpan={2}>
          <Card style={{ height: '100%' }}>
            <Card.Header>
              <Stack direction="row" justify="between" align="center">
                <Card.Title>Revenue</Card.Title>
                <Text size="sm" color="secondary">Last 6 months</Text>
              </Stack>
            </Card.Header>
            <Card.Body>
              <div style={{ height: 220 }}>
                <ChartContainer config={chartConfig}>
                  <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--fui-color-accent)"
                      fill="var(--fui-color-accent)"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <ChartTooltip />
                  </AreaChart>
                </ChartContainer>
              </div>
            </Card.Body>
          </Card>
        </Grid.Item>

        <Card>
          <Card.Header>
            <Card.Title>Recent Activity</Card.Title>
          </Card.Header>
          <Card.Body>
            <Stack gap="md">
              {activities.map((a) => (
                <Stack key={a.id} direction="row" gap="sm" align="center">
                  <Avatar size="sm" initials={a.initials} />
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text size="sm">
                      <Text size="sm" weight="semibold">{a.user}</Text> {a.action}
                    </Text>
                    <Text size="xs" color="tertiary">{a.time}</Text>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Card.Body>
        </Card>
      </Grid>

      {/* Transactions table */}
      <Card>
        <Card.Header>
          <Stack direction="row" justify="between" align="center">
            <Stack direction="row" gap="sm" align="center">
              <Card.Title>Recent Transactions</Card.Title>
              <Badge variant="outline" size="sm">5 total</Badge>
            </Stack>
            <Button variant="ghost" size="sm" icon aria-label="Download">
              <Icon icon={DownloadSimple} size="sm" />
            </Button>
          </Stack>
        </Card.Header>
        <Table
          columns={columns}
          data={transactions}
          size="sm"
          caption="Recent transactions"
          captionHidden
        />
      </Card>
    </Stack>
  </AppShell.Main>
</AppShell>
`.trim(),
});
