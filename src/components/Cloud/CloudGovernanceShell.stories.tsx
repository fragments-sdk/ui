import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  CheckCircle,
  Clock,
  Cube,
  DotsThree,
  Gear,
  GitBranch,
  House,
  MagnifyingGlass,
  Palette,
  ShieldCheck,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import { AppShell } from "../AppShell";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Box } from "../Box";
import { Button } from "../Button";
import { ButtonGroup } from "../ButtonGroup";
import { Card } from "../Card";
import { DataTable, type DataTableColumn } from "../DataTable";
import { Grid } from "../Grid";
import { Input } from "../Input";
import { Progress, type ProgressProps } from "../Progress";
import { Select } from "../Select";
import { Separator } from "../Separator";
import { Sidebar } from "../Sidebar";
import { Stack } from "../Stack";
import { Tabs } from "../Tabs";
import { Text } from "../Text";
import styles from "./CloudGovernanceShell.module.scss";

const meta = {
  title: "Cloud/Governance Shell",
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
    docs: {
      description: {
        component:
          "Cloud-specific product shell for dogfooding Fragments UI across layout, navigation, controls, tables, cards, and semantic states.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type GovernanceRow = {
  token: string;
  surface: string;
  status: "Healthy" | "Watching" | "Blocked" | "Review";
  severity: "success" | "warning" | "error" | "info";
  lastSeen: string;
};

const rows: GovernanceRow[] = [
  {
    token: "color.background.surface",
    surface: "Cloud dashboard shell",
    status: "Healthy",
    severity: "success",
    lastSeen: "2m ago",
  },
  {
    token: "space.4",
    surface: "Components index cards",
    status: "Watching",
    severity: "warning",
    lastSeen: "14m ago",
  },
  {
    token: "color.danger.text",
    surface: "Findings table badges",
    status: "Review",
    severity: "info",
    lastSeen: "31m ago",
  },
  {
    token: "radius.card",
    surface: "Governance setup panel",
    status: "Blocked",
    severity: "error",
    lastSeen: "1h ago",
  },
];

const badgeVariant = {
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
} satisfies Record<GovernanceRow["severity"], "success" | "warning" | "error" | "info">;

const columns: DataTableColumn<GovernanceRow>[] = [
  {
    accessorKey: "token",
    header: "Token",
    size: 248,
    truncate: true,
  },
  {
    accessorKey: "surface",
    header: "Surface",
    truncate: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 126,
    cell: (context) => {
      const row = context.row.original as GovernanceRow;
      return (
        <Badge variant={badgeVariant[row.severity]} size="sm">
          {row.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastSeen",
    header: "Seen",
    align: "right",
    size: 92,
  },
  {
    id: "actions",
    header: "",
    align: "right",
    size: 48,
    enableSorting: false,
    cell: () => (
      <Button variant="icon" size="xs" aria-label="Open row actions">
        <DotsThree size={16} weight="bold" />
      </Button>
    ),
  },
];

function SidebarBrand() {
  return (
    <Stack direction="row" gap="sm" align="center">
      <Box as="span" className={styles.brandMark}>
        <GitBranch size={16} weight="bold" />
      </Box>
      <Stack gap="none" className={styles.brandCopy}>
        <Text variant="section-label" color="tertiary" truncate>
          Active repository
        </Text>
        <Text size="sm" weight="semibold" truncate>
          fragments-sdk/ui
        </Text>
      </Stack>
    </Stack>
  );
}

function MetricCard({
  value,
  label,
  progress,
  variant = "default",
}: {
  value: string;
  label: string;
  progress: number;
  variant?: ProgressProps["variant"];
}) {
  return (
    <Card variant="panel" padding="none">
      <Card.Header divided>
        <Card.Title>{label}</Card.Title>
      </Card.Header>
      <Card.Body padding="md">
        <Stack gap="sm">
          <Text size="sm" weight="semibold" tabularNums>
            {value}
          </Text>
          <Progress value={progress} variant={variant} size="sm" aria-label={`${label} progress`} />
        </Stack>
      </Card.Body>
    </Card>
  );
}

function StateRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box paddingX="md" paddingY="xs">
      <Stack direction="row" align="center" justify="between" gap="sm" className={styles.stateRow}>
        <Text size="sm" color="secondary">
          {label}
        </Text>
        {children}
      </Stack>
    </Box>
  );
}

function CloudSidebar() {
  return (
    <>
      <Sidebar.Header>
        <SidebarBrand />
      </Sidebar.Header>

      <Sidebar.Nav>
        <Sidebar.Section>
          <Sidebar.Item icon={<House size={18} />} active>
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item icon={<Cube size={18} />}>Components</Sidebar.Item>
          <Sidebar.Item icon={<Palette size={18} />}>Tokens</Sidebar.Item>
          <Sidebar.Item icon={<WarningCircle size={18} />} badge={7}>
            Findings
          </Sidebar.Item>
          <Sidebar.Item icon={<ShieldCheck size={18} />}>Governance</Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="Setup">
          <Sidebar.Item icon={<Clock size={18} />}>Developer setup</Sidebar.Item>
          <Sidebar.Item icon={<Gear size={18} />}>Settings</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>

      <Sidebar.Footer>
        <Stack direction="row" align="center" gap="sm">
          <Avatar initials="T" name="Test User" size="md" />
          <Stack gap="none" className={styles.brandCopy}>
            <Text size="sm" weight="semibold" truncate>
              Test User
            </Text>
            <Text size="2xs" color="tertiary" truncate>
              dev_test@app.usefragments.com
            </Text>
          </Stack>
        </Stack>
      </Sidebar.Footer>
    </>
  );
}

function FindingsPanel() {
  return (
    <Card variant="panel" padding="none" className={styles.tableColumn}>
      <Card.Header divided>
        <Stack
          direction="row"
          align="center"
          justify="between"
          gap="sm"
          className={styles.panelHeader}
        >
          <Stack gap="xs">
            <Card.Title>Governance findings</Card.Title>
            <Card.Description>
              Shared state colors across tables, badges, and rows.
            </Card.Description>
          </Stack>
          <Badge variant="info" size="sm">
            Live
          </Badge>
        </Stack>
      </Card.Header>
      <Card.Body>
        <Box padding="sm">
          <Stack gap="sm">
            <Box className={styles.toolbar}>
              <Input
                aria-label="Search findings"
                placeholder="Search findings..."
                size="sm"
                startAdornment={<MagnifyingGlass size={16} />}
                shortcut="⌘K"
                withFieldWrapper={false}
              />
              <Select aria-label="Date range" defaultValue="15d" size="sm">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="7d">Last 7 days</Select.Item>
                  <Select.Item value="15d">Last 15 days</Select.Item>
                  <Select.Item value="30d">Last 30 days</Select.Item>
                </Select.Content>
              </Select>
              <Select aria-label="Status" defaultValue="all" size="sm">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="all">All statuses</Select.Item>
                  <Select.Item value="healthy">Healthy</Select.Item>
                  <Select.Item value="blocked">Blocked</Select.Item>
                </Select.Content>
              </Select>
            </Box>
            <DataTable
              columns={columns}
              data={rows}
              getRowId={(row) => row.token}
              density="condensed"
              bordered
              sortable
              caption="Governance findings"
              captionHidden
            />
          </Stack>
        </Box>
      </Card.Body>
    </Card>
  );
}

function StatePanel() {
  return (
    <Card variant="panel" padding="none">
      <Card.Header divided>
        <Card.Title>System states</Card.Title>
      </Card.Header>
      <Card.Body>
        <Stack gap="none" separator={<Separator soft />}>
          <StateRow label="Ready to ship">
            <Badge variant="success" size="sm" icon={<CheckCircle size={14} />}>
              Success
            </Badge>
          </StateRow>
          <StateRow label="Needs attention">
            <Badge variant="warning" size="sm" icon={<WarningCircle size={14} />}>
              Warning
            </Badge>
          </StateRow>
          <StateRow label="Deploy blocked">
            <Badge variant="error" size="sm" icon={<XCircle size={14} />}>
              Danger
            </Badge>
          </StateRow>
          <StateRow label="Informational">
            <Badge variant="info" size="sm">
              Info
            </Badge>
          </StateRow>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function ActionsPanel() {
  return (
    <Card variant="panel" padding="md">
      <Stack gap="md">
        <Stack gap="xs">
          <Card.Title>Actions</Card.Title>
          <Card.Description>
            Button states use the same border, hover, and semantic recipes.
          </Card.Description>
        </Stack>
        <ButtonGroup gap="sm" wrap className={styles.actions}>
          <Button variant="primary" size="sm">
            Create setup PR
          </Button>
          <Button variant="outlined" size="sm">
            Copy MCP config
          </Button>
          <Button variant="danger" size="sm">
            Disconnect repository
          </Button>
        </ButtonGroup>
      </Stack>
    </Card>
  );
}

export const GovernanceShell: Story = {
  render: () => (
    <Box className={styles.frame}>
      <AppShell layout="sidebar" bg="var(--fui-app-canvas-bg)" className={styles.shell}>
        <AppShell.Sidebar width="260px" collapsible="offcanvas">
          <CloudSidebar />
        </AppShell.Sidebar>

        <AppShell.Main padding="none" className={styles.main}>
          <Stack as="main" gap="lg" className={styles.page}>
            <Stack direction="row" align="start" justify="between" gap="md" wrap>
              <Stack gap="xs">
                <Text as="h1" size="2xl" weight="bold">
                  Dashboard
                </Text>
                <Text as="p" size="sm" color="secondary">
                  Design system health, coverage, and governance status.
                </Text>
              </Stack>
              <Button variant="outlined" size="sm">
                Take a tour
              </Button>
            </Stack>

            <Grid columns="auto" minChildWidth="220px" gap="md">
              <MetricCard value="94%" label="Component coverage" progress={94} variant="success" />
              <MetricCard value="312" label="Tracked tokens" progress={78} />
              <MetricCard value="7" label="Open findings" progress={38} variant="warning" />
              <MetricCard value="1" label="Blocking drift" progress={14} variant="danger" />
            </Grid>

            <Box as="section" className={styles.contentGrid}>
              <Box className={styles.tableColumn}>
                <Tabs defaultValue="findings" variant="pills">
                  <Tabs.List>
                    <Tabs.Tab value="findings">Findings</Tabs.Tab>
                    <Tabs.Tab value="activity">Activity</Tabs.Tab>
                    <Tabs.Tab value="changes">Changes</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="findings" flush>
                    <FindingsPanel />
                  </Tabs.Panel>
                  <Tabs.Panel value="activity" flush>
                    <Card variant="panel" padding="md">
                      <Card.Title>Activity</Card.Title>
                      <Card.Description>
                        The same panel chrome carries secondary content.
                      </Card.Description>
                    </Card>
                  </Tabs.Panel>
                  <Tabs.Panel value="changes" flush>
                    <Card variant="panel" padding="md">
                      <Card.Title>Changes</Card.Title>
                      <Card.Description>
                        Token changes inherit the same surface and border model.
                      </Card.Description>
                    </Card>
                  </Tabs.Panel>
                </Tabs>
              </Box>

              <Stack as="aside" gap="md">
                <StatePanel />
                <ActionsPanel />
              </Stack>
            </Box>
          </Stack>
        </AppShell.Main>
      </AppShell>
    </Box>
  ),
};
