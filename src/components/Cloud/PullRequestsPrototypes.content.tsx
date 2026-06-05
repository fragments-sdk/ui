import { GithubLogo, MagnifyingGlass } from "@phosphor-icons/react";
import { Badge } from "../Badge";
import { Box } from "../Box";
import { Button } from "../Button";
import { DataTable, type DataTableColumn } from "../DataTable";
import { Input } from "../Input";
import { Pagination } from "../Pagination";
import { Select } from "../Select";
import { Stack } from "../Stack";
import { Text } from "../Text";
import type { StateVariant } from "./DashboardLayoutPrototypes.shared";
import styles from "./DashboardLayoutPrototypes.module.scss";

type GateState = "Blocked" | "Review" | "Ready";

type PullRequest = {
  number: number;
  title: string;
  author: string;
  branch: string;
  area: string;
  coverageDelta: string;
  findings: number;
  blocking: number;
  safeFixes: number;
  comments: number;
  updated: string;
  gate: GateState;
  variant: StateVariant;
};

const pullRequests: PullRequest[] = [
  {
    number: 248,
    title: "Refresh marketing campaign cards",
    author: "Maya Chen",
    branch: "feat/launch-pages",
    area: "Marketing",
    coverageDelta: "-7%",
    findings: 11,
    blocking: 3,
    safeFixes: 5,
    comments: 8,
    updated: "12m ago",
    gate: "Blocked",
    variant: "error",
  },
  {
    number: 246,
    title: "Checkout discount banner",
    author: "Jon Bell",
    branch: "feat/discount-banner",
    area: "Checkout",
    coverageDelta: "-1%",
    findings: 2,
    blocking: 0,
    safeFixes: 2,
    comments: 2,
    updated: "24m ago",
    gate: "Review",
    variant: "warning",
  },
  {
    number: 241,
    title: "Settings billing cleanup",
    author: "Priya Shah",
    branch: "fix/billing-states",
    area: "Admin",
    coverageDelta: "+2%",
    findings: 1,
    blocking: 0,
    safeFixes: 1,
    comments: 1,
    updated: "1h ago",
    gate: "Ready",
    variant: "success",
  },
  {
    number: 239,
    title: "Dashboard topology rollup",
    author: "Alex Kim",
    branch: "feat/topology-rollup",
    area: "Dashboard",
    coverageDelta: "+4%",
    findings: 4,
    blocking: 0,
    safeFixes: 3,
    comments: 3,
    updated: "2h ago",
    gate: "Review",
    variant: "info",
  },
  {
    number: 237,
    title: "Refactor onboarding form states",
    author: "Sam Reed",
    branch: "chore/onboarding-fields",
    area: "Dashboard",
    coverageDelta: "0%",
    findings: 0,
    blocking: 0,
    safeFixes: 0,
    comments: 0,
    updated: "3h ago",
    gate: "Ready",
    variant: "success",
  },
];

const prColumns: DataTableColumn<PullRequest>[] = [
  {
    id: "pull-request",
    header: "Pull request",
    minSize: 320,
    cell: (context) => {
      const row = context.row.original as PullRequest;
      return (
        <Stack gap="none" className={styles.minWidthZero}>
          <Text size="sm" weight="semibold" truncate>
            {row.title}
          </Text>
          <Text size="xs" color="tertiary" truncate>
            #{row.number} · {row.branch} · {row.author}
          </Text>
        </Stack>
      );
    },
  },
  { accessorKey: "area", header: "Area", size: 128, truncate: true },
  { accessorKey: "coverageDelta", header: "Delta", size: 88, align: "right" },
  { accessorKey: "findings", header: "Findings", size: 88, align: "right" },
  { accessorKey: "comments", header: "Comments", size: 96, align: "right" },
  {
    accessorKey: "gate",
    header: "Gate",
    size: 104,
    cell: (context) => {
      const row = context.row.original as PullRequest;
      return (
        <Badge variant={row.variant} size="sm">
          {row.gate}
        </Badge>
      );
    },
  },
  { accessorKey: "updated", header: "Updated", size: 96, align: "right" },
  {
    id: "actions",
    header: "Actions",
    size: 96,
    align: "right",
    cell: (context) => {
      const row = context.row.original as PullRequest;
      return (
        <Box className={styles.prRowActions}>
          <Button
            as="a"
            href={`https://github.com/fragments-sdk/fragments/pull/${row.number}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="xs"
            icon
            aria-label={`View pull request ${row.number} on GitHub`}
          >
            <GithubLogo size={14} weight="fill" />
          </Button>
          <Button
            as="a"
            href={`/pull-requests/${row.number}`}
            variant="secondary"
            size="xs"
            aria-label={`Open pull request ${row.number} in Fragments`}
          >
            Open
          </Button>
        </Box>
      );
    },
  },
];

export function PrototypeActions() {
  return (
    <Stack direction="row" align="center" gap="sm" wrap>
      <Button variant="secondary" size="sm">
        Learn more
      </Button>
    </Stack>
  );
}

function PullRequestFilters() {
  return (
    <Stack gap="sm">
      <Box className={styles.prToolbar}>
        <Input
          aria-label="Search pull requests"
          placeholder="Search pull requests..."
          size="sm"
          startAdornment={<MagnifyingGlass size={16} />}
          shortcut="⌘K"
          withFieldWrapper={false}
        />
        <Select aria-label="Gate" defaultValue="open" size="sm">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="open">Open PRs</Select.Item>
            <Select.Item value="blocked">Blocked</Select.Item>
            <Select.Item value="ready">Ready</Select.Item>
          </Select.Content>
        </Select>
        <Select aria-label="Area" defaultValue="all" size="sm">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="all">All areas</Select.Item>
            <Select.Item value="marketing">Marketing</Select.Item>
            <Select.Item value="checkout">Checkout</Select.Item>
            <Select.Item value="dashboard">Dashboard</Select.Item>
          </Select.Content>
        </Select>
        <Select aria-label="Review status" defaultValue="all" size="sm">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="all">All reviews</Select.Item>
            <Select.Item value="comments">Has comments</Select.Item>
            <Select.Item value="safe-fixes">Safe fixes</Select.Item>
          </Select.Content>
        </Select>
      </Box>
      <Stack direction="row" gap="xs" wrap>
        <Badge variant="dim" size="md" active>
          Open
        </Badge>
        <Badge variant="dim" size="md">
          Blocking
        </Badge>
        <Badge variant="dim" size="md">
          Needs designer
        </Badge>
        <Badge variant="dim" size="md">
          Safe fixes
        </Badge>
      </Stack>
    </Stack>
  );
}

function PullRequestTable({ density = "condensed" }: { density?: "condensed" | "regular" }) {
  return (
    <Stack gap="sm">
      <DataTable
        columns={prColumns}
        data={pullRequests}
        getRowId={(row) => String(row.number)}
        density={density}
        bordered
        caption="Pull requests"
        captionHidden
        wrapperClassName={styles.prTable}
      />
      <Stack direction="row" justify="between" align="center" gap="md" wrap>
        <Text size="xs" color="tertiary">
          Showing 5 of 28 pull requests
        </Text>
        <Pagination totalPages={6} defaultPage={1} aria-label="Pull request pages">
          <Pagination.Previous />
          <Pagination.Items />
          <Pagination.Next />
        </Pagination>
      </Stack>
    </Stack>
  );
}

export function PullRequestInbox({ density = "condensed" }: { density?: "condensed" | "regular" }) {
  return (
    <Stack gap="md">
      <PullRequestFilters />
      <PullRequestTable density={density} />
    </Stack>
  );
}
