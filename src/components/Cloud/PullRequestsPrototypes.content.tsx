import {
  ArrowSquareOut,
  Check,
  GithubLogo,
  GitPullRequest,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { Badge } from "../Badge";
import { Box } from "../Box";
import { Button } from "../Button";
import { DataTable, type DataTableColumn } from "../DataTable";
import { Input } from "../Input";
import { Pagination } from "../Pagination";
import { Select } from "../Select";
import { Stack } from "../Stack";
import { Tabs } from "../Tabs";
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

type ReviewComment = {
  file: string;
  line: string;
  comment: string;
  area: string;
  status: string;
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

const reviewComments: ReviewComment[] = [
  {
    file: "src/routes/(marketing)/launch/Hero.tsx",
    line: "42",
    comment:
      "Replace the raw danger background with the semantic danger token so badges, buttons, and alerts stay aligned.",
    area: "Marketing",
    status: "Blocking",
    variant: "error",
  },
  {
    file: "src/routes/(marketing)/launch/Form.tsx",
    line: "88",
    comment:
      "This native button bypasses Button loading, disabled, focus, and variant behavior. Use the Button contract.",
    area: "Marketing",
    status: "Safe fix",
    variant: "warning",
  },
  {
    file: "src/components/campaign/CardGrid.tsx",
    line: "31",
    comment:
      "Spacing is off scale. Use a Fragments spacing token so the marketing surface matches the rest of Cloud.",
    area: "Marketing",
    status: "Review",
    variant: "info",
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

const commentColumns: DataTableColumn<ReviewComment>[] = [
  { accessorKey: "comment", header: "Comment", minSize: 360, truncate: true },
  {
    id: "evidence",
    header: "Evidence",
    minSize: 260,
    cell: (context) => {
      const row = context.row.original as ReviewComment;
      return `${row.file}:${row.line}`;
    },
  },
  { accessorKey: "area", header: "Area", size: 120 },
  {
    accessorKey: "status",
    header: "Status",
    size: 112,
    cell: (context) => {
      const row = context.row.original as ReviewComment;
      return (
        <Badge variant={row.variant} size="sm">
          {row.status}
        </Badge>
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

function DetailSummary() {
  const pr = pullRequests[0];

  return (
    <Box className={styles.prDetailSummary}>
      <Stack direction={{ base: "column", md: "row" }} justify="between" gap="md">
        <Stack gap="xs" className={styles.minWidthZero}>
          <Stack direction="row" align="center" gap="sm" wrap>
            <Badge variant={pr.variant} size="sm">
              {pr.gate}
            </Badge>
            <Text size="xs" color="tertiary">
              #{pr.number} · {pr.branch} · {pr.author}
            </Text>
          </Stack>
          <Text size="lg" weight="semibold">
            {pr.title}
          </Text>
          <Text size="sm" color="secondary">
            Marketing coverage drops by {pr.coverageDelta.replace("-", "")}. Fragments found{" "}
            {pr.blocking} blocking comments and {pr.safeFixes} safe fixes.
          </Text>
        </Stack>
        <Stack direction="row" align="center" gap="sm" wrap>
          <Button variant="primary" size="sm">
            Create fix PR
          </Button>
          <Button variant="outlined" size="sm">
            Post comments
          </Button>
          <Button
            as="a"
            href="https://github.com/fragments-sdk/fragments/pull/248"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="sm"
          >
            <ArrowSquareOut size={14} />
            View on GitHub
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export function PullRequestReviewSurface() {
  return (
    <Stack gap="md">
      <DetailSummary />
      <Tabs defaultValue="comments" variant="pills">
        <Tabs.List>
          <Tabs.Tab value="comments">Comments 8</Tabs.Tab>
          <Tabs.Tab value="violations">Violations 11</Tabs.Tab>
          <Tabs.Tab value="diff">Changed files 6</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="comments" flush>
          <DataTable
            columns={commentColumns}
            data={reviewComments}
            getRowId={(row) => `${row.file}:${row.line}`}
            density="condensed"
            bordered
            caption="Fragments pull request comments"
            captionHidden
          />
        </Tabs.Panel>
        <Tabs.Panel value="violations" flush>
          <DataTable
            columns={commentColumns}
            data={reviewComments}
            getRowId={(row) => `${row.file}:${row.line}`}
            density="condensed"
            bordered
            caption="Fragments pull request violations"
            captionHidden
          />
        </Tabs.Panel>
        <Tabs.Panel value="diff" flush>
          <DataTable
            columns={commentColumns}
            data={reviewComments}
            getRowId={(row) => `${row.file}:${row.line}`}
            density="condensed"
            bordered
            caption="Fragments pull request changed files"
            captionHidden
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

export function PullRequestDetailActions() {
  return (
    <Stack direction="row" align="center" gap="sm" wrap>
      <Button variant="primary" size="sm">
        <Check size={14} weight="bold" />
        Approve after fixes
      </Button>
      <Button
        as="a"
        href="https://github.com/fragments-sdk/fragments/pull/248"
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        size="sm"
      >
        <GitPullRequest size={14} />
        View on GitHub
      </Button>
    </Stack>
  );
}
