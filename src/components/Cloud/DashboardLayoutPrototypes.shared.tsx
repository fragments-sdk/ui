import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import { Badge } from "../Badge";
import { Box } from "../Box";
import { Button } from "../Button";
import { Card } from "../Card";
import { DataTable, type DataTableColumn } from "../DataTable";
import { Input } from "../Input";
import { Progress, type ProgressProps } from "../Progress";
import { Select } from "../Select";
import { Separator } from "../Separator";
import { Stack } from "../Stack";
import { Text } from "../Text";
export { PrototypeShell } from "./DashboardLayoutPrototypes.shell";
import styles from "./DashboardLayoutPrototypes.module.scss";

export type StateVariant = "success" | "warning" | "error" | "info";

export type AreaRow = {
  area: string;
  owner: string;
  coverage: number;
  drift: number;
  criticality: string;
  state: "Healthy" | "Watching" | "Blocked" | "Review";
  variant: StateVariant;
};

type Activity = {
  title: string;
  detail: string;
  status: string;
  time: string;
  variant: StateVariant;
};

export const areas: AreaRow[] = [
  {
    area: "Checkout",
    owner: "Revenue systems",
    coverage: 91,
    drift: 2,
    criticality: "Revenue",
    state: "Watching",
    variant: "warning",
  },
  {
    area: "Dashboard",
    owner: "Cloud product",
    coverage: 84,
    drift: 4,
    criticality: "Core app",
    state: "Review",
    variant: "info",
  },
  {
    area: "Marketing",
    owner: "Growth",
    coverage: 68,
    drift: 11,
    criticality: "Public",
    state: "Blocked",
    variant: "error",
  },
  {
    area: "Admin",
    owner: "Platform",
    coverage: 96,
    drift: 1,
    criticality: "Internal",
    state: "Healthy",
    variant: "success",
  },
];

const activity: Activity[] = [
  {
    title: "Governance scan completed",
    detail: "21 findings resolved, 4 new color drift reports opened.",
    status: "Completed",
    time: "2m ago",
    variant: "success",
  },
  {
    title: "Checkout exceeded drift budget",
    detail: "Spacing and danger color tokens need review before release.",
    status: "Attention",
    time: "14m ago",
    variant: "warning",
  },
  {
    title: "Setup PR merged",
    detail: "fragments/cloud now reports CI findings into Cloud.",
    status: "Merged",
    time: "1h ago",
    variant: "info",
  },
];

const areaColumns: DataTableColumn<AreaRow>[] = [
  { accessorKey: "area", header: "Area", size: 148, truncate: true },
  { accessorKey: "owner", header: "Owner", truncate: true },
  {
    accessorKey: "coverage",
    header: "Coverage",
    size: 112,
    cell: (context) => `${(context.row.original as AreaRow).coverage}%`,
  },
  {
    accessorKey: "drift",
    header: "Drift",
    size: 84,
    align: "right",
  },
  {
    accessorKey: "state",
    header: "State",
    size: 112,
    cell: (context) => {
      const row = context.row.original as AreaRow;
      return (
        <Badge variant={row.variant} size="sm">
          {row.state}
        </Badge>
      );
    },
  },
];

const activityColumns: DataTableColumn<Activity>[] = [
  {
    accessorKey: "title",
    header: "Event",
    size: 240,
    truncate: true,
  },
  {
    accessorKey: "detail",
    header: "Detail",
    truncate: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 116,
    cell: (context) => {
      const row = context.row.original as Activity;
      return (
        <Badge variant={row.variant} size="sm">
          {row.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "time",
    header: "Time",
    size: 96,
    align: "right",
  },
];

export function MetricPanel({
  label,
  value,
  progress,
  variant = "default",
}: {
  label: string;
  value: string;
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
          <Progress value={progress} variant={variant} size="sm" aria-label={label} />
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function CoverageHero({ className }: { className?: string } = {}) {
  return (
    <Card variant="panel" padding="none" className={className}>
      <Card.Body padding="none" className={styles.stretchBody}>
        <Stack gap="none" className={styles.coverageBody}>
          <Stack
            direction="row"
            justify="between"
            align="start"
            gap="md"
            className={styles.coverageSummary}
          >
            <Stack gap="xs" className={styles.minWidthZero}>
              <Text size="xs" color="tertiary">
                Design contract coverage
              </Text>
              <Text size="lg" weight="semibold" tabularNums>
                82% covered evidence
              </Text>
            </Stack>
            <Text size="xs" color="secondary" className={styles.coverageDelta}>
              +8 trend
            </Text>
          </Stack>
          <Box className={styles.coverageChartWrap}>
            <svg
              className={styles.coverageTrendChart}
              viewBox="0 0 240 72"
              preserveAspectRatio="none"
              role="img"
              aria-label="Design contract coverage over time"
            >
              <defs>
                <linearGradient id="coverage-trend" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              <path
                d="M 0 56 L 34 50 L 69 45 L 103 47 L 137 35 L 171 31 L 206 23 L 240 20 L 240 72 L 0 72 Z"
                fill="url(#coverage-trend)"
              />
              <path
                d="M 0 56 L 34 50 L 69 45 L 103 47 L 137 35 L 171 31 L 206 23 L 240 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </Box>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function AreasTable({ title = "Areas at risk" }: { title?: string }) {
  return (
    <Card variant="panel" padding="none" className={styles.minWidthZero}>
      <Card.Header divided>
        <Stack direction="row" justify="between" align="center" gap="md" className={styles.full}>
          <Card.Title>{title}</Card.Title>
          <Badge variant="warning" size="sm">
            3 need attention
          </Badge>
        </Stack>
      </Card.Header>
      <Card.Body padding="sm">
        <DataTable
          columns={areaColumns}
          data={areas}
          getRowId={(row) => row.area}
          density="condensed"
          bordered
          caption={title}
          captionHidden
        />
      </Card.Body>
    </Card>
  );
}

export function ActionPanel({ className }: { className?: string } = {}) {
  return (
    <Card variant="panel" padding="none" className={className}>
      <Card.Header divided>
        <Card.Title>Recommended action</Card.Title>
      </Card.Header>
      <Card.Body padding="md" className={styles.actionPanelBody}>
        <Stack gap="md" justify="between" className={styles.actionPanelContent}>
          <Stack gap="xs">
            <Text size="sm" weight="semibold">
              Review Marketing color drift before release.
            </Text>
            <Text size="sm" color="secondary">
              11 new findings came from public pages with low contract coverage.
            </Text>
          </Stack>
          <Button variant="primary" size="sm" className={styles.actionButton}>
            Open findings <ArrowRight size={14} weight="bold" />
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function ActivityPanel() {
  return (
    <Card variant="panel" padding="none">
      <Card.Header divided>
        <Card.Title>Recent governance activity</Card.Title>
      </Card.Header>
      <Card.Body padding="sm">
        <ActivityTable />
      </Card.Body>
    </Card>
  );
}

export function ActivityTable() {
  return (
    <DataTable
      columns={activityColumns}
      data={activity}
      getRowId={(row) => row.title}
      density="condensed"
      bordered
      caption="Recent governance activity"
      captionHidden
    />
  );
}

export function StatePanel() {
  return (
    <Card variant="panel" padding="none">
      <Card.Header divided>
        <Card.Title>System status</Card.Title>
      </Card.Header>
      <Card.Body>
        <Stack gap="none" separator={<Separator soft />}>
          {[
            ["CI ingestion", "Live", "success"],
            ["GitHub App", "Connected", "success"],
            ["Exception debt", "Watching", "warning"],
            ["Release gate", "Blocked", "error"],
          ].map(([label, value, variant]) => (
            <Box key={label} paddingX="md" paddingY="sm">
              <Stack direction="row" justify="between" align="center" gap="md">
                <Text size="sm" color="secondary">
                  {label}
                </Text>
                <Badge variant={variant as StateVariant} size="sm">
                  {value}
                </Badge>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function FindingsToolbar() {
  return (
    <Box className={styles.toolbar}>
      <Input
        aria-label="Search dashboard evidence"
        placeholder="Search evidence..."
        size="sm"
        startAdornment={<MagnifyingGlass size={16} />}
        shortcut="⌘K"
        withFieldWrapper={false}
      />
      <Select aria-label="Time range" defaultValue="7d" size="sm">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="7d">Last 7 days</Select.Item>
          <Select.Item value="30d">Last 30 days</Select.Item>
        </Select.Content>
      </Select>
    </Box>
  );
}
