import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { Box } from "../Box";
import { Card } from "../Card";
import { Grid } from "../Grid";
import { Link } from "../Link";
import { Progress } from "../Progress";
import { Stack } from "../Stack";
import { Tabs } from "../Tabs";
import { Text } from "../Text";
import {
  ActionPanel,
  ActivityPanel,
  ActivityTable,
  AreasTable,
  CoverageHero,
  FindingsToolbar,
  MetricPanel,
  PrototypeShell,
  StatePanel,
  areas,
} from "./DashboardLayoutPrototypes.shared";
import styles from "./DashboardLayoutPrototypes.module.scss";

const meta = {
  title: "Cloud/Prototypes/Dashboard",
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
    docs: {
      description: {
        component:
          "Cloud dashboard layout prototypes for comparing governance-first product information architecture.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type AreaName = (typeof areas)[number]["area"];

const driftSeries = {
  Checkout: [4, 3, 5, 3, 2, 3, 2, 2],
  Dashboard: [2, 4, 3, 5, 6, 4, 5, 4],
  Marketing: [5, 7, 8, 11, 9, 13, 12, 11],
  Admin: [3, 2, 2, 1, 2, 1, 1, 1],
} satisfies Record<AreaName, number[]>;

function buildAreaPath(values: number[]) {
  const width = 240;
  const height = 72;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - (value / max) * (height - 10) - 5;
    return [x, y] as const;
  });
  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const fill = `${line} L ${width} ${height} L 0 ${height} Z`;
  return { line, fill };
}

function DashboardSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack as="section" gap="sm">
      <Stack direction="row" justify="between" align="center" gap="md" wrap>
        <Text as="h2" size="sm" weight="semibold">
          {title}
        </Text>
        <Text size="sm" weight="medium">
          <Link href="#" variant="muted" underline="none">
            View more
          </Link>
        </Text>
      </Stack>
      {children}
    </Stack>
  );
}

function AreaDriftCard({ area }: { area: (typeof areas)[number] }) {
  const values = driftSeries[area.area];
  const latest = values.at(-1) ?? 0;
  const first = values[0] ?? latest;
  const trendDelta = latest - first;
  const trend = trendDelta > 0 ? "up" : trendDelta < 0 ? "down" : "flat";
  const chart = buildAreaPath(values);
  const gradientId = `drift-${area.area.toLowerCase()}`;

  return (
    <Card variant="panel" padding="none" className={styles.areaDriftCard}>
      <Card.Body padding="none">
        <Stack gap="none">
          <Stack
            direction="row"
            justify="between"
            align="start"
            gap="md"
            className={styles.areaDriftSummary}
          >
            <Stack gap="xs" className={styles.minWidthZero}>
              <Text size="xs" color="tertiary">
                {area.owner}
              </Text>
              <Text size="sm" weight="semibold" tabularNums>
                {latest} open drift
              </Text>
            </Stack>
            <Text
              size="xs"
              color="secondary"
              className={styles.areaDelta}
              data-trend={trend}
              tabularNums
            >
              {trendDelta > 0 ? "+" : ""}
              {trendDelta} trend
            </Text>
          </Stack>
          <Box className={styles.chartWrap}>
            <svg
              className={styles.driftChart}
              data-trend={trend}
              viewBox="0 0 240 72"
              preserveAspectRatio="none"
              role="img"
              aria-label={`${area.area} drift over time`}
            >
              <title>{area.area} drift over time</title>
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              <path d={chart.fill} fill={`url(#${gradientId})`} />
              <path d={chart.line} fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
          </Box>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function AreaDriftCards() {
  return (
    <Grid columns="auto" minChildWidth="240px" gap="md">
      {areas.map((area) => (
        <AreaDriftCard key={area.area} area={area} />
      ))}
    </Grid>
  );
}

function BudgetPanel() {
  return (
    <Card variant="panel" padding="none">
      <Card.Header divided>
        <Card.Title>Area drift budgets</Card.Title>
      </Card.Header>
      <Card.Body padding="md">
        <Stack gap="md">
          {areas.map((area) => (
            <Stack key={area.area} gap="xs">
              <Stack direction="row" justify="between" align="center" gap="md">
                <Text size="sm" weight="medium">
                  {area.area}
                </Text>
                <Text size="xs" color="secondary">
                  {area.drift} open
                </Text>
              </Stack>
              <Progress
                value={Math.min(area.drift * 8, 100)}
                variant={area.variant === "error" ? "danger" : area.variant}
                size="sm"
                aria-label={`${area.area} drift budget`}
              />
            </Stack>
          ))}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function InventoryPanel() {
  return (
    <Card variant="panel" padding="none">
      <Card.Header divided>
        <Card.Title>Inventory health</Card.Title>
      </Card.Header>
      <Card.Body padding="md">
        <Grid columns={{ base: 1, md: 2 }} gap="md">
          <MetricPanel label="Tracked components" value="128" progress={88} />
          <MetricPanel label="Tracked tokens" value="312" progress={94} />
        </Grid>
      </Card.Body>
    </Card>
  );
}

function TabbedFindings() {
  return (
    <Stack gap="sm" className={styles.minWidthZero}>
      <Tabs defaultValue="findings" variant="pills">
        <Tabs.List>
          <Tabs.Tab value="findings">Findings</Tabs.Tab>
          <Tabs.Tab value="prs">Pull requests</Tabs.Tab>
          <Tabs.Tab value="agents">Agents</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="findings" flush>
          <AreasTable title="Governance findings by area" />
        </Tabs.Panel>
        <Tabs.Panel value="prs" flush>
          <AreasTable title="Pull requests with drift" />
        </Tabs.Panel>
        <Tabs.Panel value="agents" flush>
          <AreasTable title="AI-generated code compliance" />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

export const Layout1ExecutiveOverview: Story = {
  name: "Layout 1 · Executive overview",
  render: () => (
    <PrototypeShell title="Dashboard">
      <Box className={styles.heroActionGrid}>
        <CoverageHero className={styles.stretchCard} />
        <ActionPanel className={styles.stretchCard} />
      </Box>
      <DashboardSection title="Codebase by area">
        <AreaDriftCards />
      </DashboardSection>
      <DashboardSection title="Recent governance activity">
        <ActivityTable />
      </DashboardSection>
    </PrototypeShell>
  ),
};

export const Layout2OperationsCommandCenter: Story = {
  name: "Layout 2 · Operations command center",
  render: () => (
    <PrototypeShell eyebrow="Layout 2" title="Operations command center">
      <ActionPanel />
      <Grid columns="auto" minChildWidth="220px" gap="md">
        <MetricPanel label="Contract coverage" value="82%" progress={82} variant="success" />
        <MetricPanel label="New drift" value="24" progress={48} variant="warning" />
        <MetricPanel label="Blocked PRs" value="4" progress={16} variant="danger" />
        <MetricPanel label="Exceptions" value="9" progress={36} variant="warning" />
      </Grid>
      <Box className={styles.twoColumn}>
        <Stack gap="md" className={styles.minWidthZero}>
          <FindingsToolbar />
          <TabbedFindings />
        </Stack>
        <Stack gap="md">
          <BudgetPanel />
          <StatePanel />
        </Stack>
      </Box>
    </PrototypeShell>
  ),
};

export const Layout3AreaFirst: Story = {
  name: "Layout 3 · Area first",
  render: () => (
    <PrototypeShell eyebrow="Layout 3" title="Area-first dashboard">
      <Grid columns="auto" minChildWidth="220px" gap="md">
        <MetricPanel label="Overall coverage" value="82%" progress={82} variant="success" />
        <MetricPanel label="Worst area" value="68%" progress={68} variant="warning" />
        <MetricPanel label="New drift" value="24" progress={48} variant="warning" />
        <MetricPanel label="Owners needed" value="2" progress={20} variant="danger" />
      </Grid>
      <AreasTable title="Areas ranked by governance risk" />
      <Box className={styles.twoColumn}>
        <Card variant="panel" padding="none">
          <Card.Header divided>
            <Card.Title>Marketing area detail</Card.Title>
          </Card.Header>
          <Card.Body padding="md">
            <Stack gap="md">
              <Text size="sm" color="secondary">
                Public surfaces have low coverage, rising exception debt, and repeated color
                substitutions from generated code.
              </Text>
              <Progress value={68} variant="warning" aria-label="Marketing coverage" />
            </Stack>
          </Card.Body>
        </Card>
        <ActionPanel />
      </Box>
      <ActivityPanel />
    </PrototypeShell>
  ),
};

export const Layout4SplitGovernanceInventory: Story = {
  name: "Layout 4 · Governance and inventory",
  render: () => (
    <PrototypeShell eyebrow="Layout 4" title="Governance and inventory">
      <CoverageHero />
      <Grid columns="auto" minChildWidth="220px" gap="md">
        <MetricPanel label="Open findings" value="24" progress={48} variant="warning" />
        <MetricPanel label="Blocked releases" value="1" progress={10} variant="danger" />
        <MetricPanel label="Tracked components" value="128" progress={88} />
        <MetricPanel label="Tracked tokens" value="312" progress={94} />
      </Grid>
      <Box className={styles.twoColumn}>
        <Stack gap="md" className={styles.minWidthZero}>
          <AreasTable title="Governance risk" />
          <ActivityPanel />
        </Stack>
        <Stack gap="md">
          <InventoryPanel />
          <BudgetPanel />
        </Stack>
      </Box>
    </PrototypeShell>
  ),
};
