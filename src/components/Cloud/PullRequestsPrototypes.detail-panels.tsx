import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Box } from "../Box";
import { Button } from "../Button";
import { Card } from "../Card";
import { DataTable, type DataTableColumn } from "../DataTable";
import { Select } from "../Select";
import { Stack } from "../Stack";
import { Text } from "../Text";
import {
  blockingFindings,
  changedFiles,
  introducedFindings,
  prFindings,
  prIdPagePullRequest as pr,
  threadFindings,
  type ChangedFile,
  type PrFinding,
} from "./PullRequestsPrototypes.id-data";
import styles from "./DashboardLayoutPrototypes.module.scss";

const legacyCount = prFindings.length - introducedFindings.length;

function actionLabel(finding: PrFinding) {
  if (finding.fix === "Deterministic") return "Create fix";
  if (finding.severity === "Blocking") return "Request waiver";
  return "Mark intentional";
}

// ============================================================================
// Findings tab — the table-first workbench
// ============================================================================

const findingColumns: DataTableColumn<PrFinding>[] = [
  {
    id: "severity",
    header: "Severity",
    size: 104,
    cell: (context) => {
      const finding = context.row.original as PrFinding;
      return (
        <Badge variant={finding.variant} size="sm">
          {finding.severity}
        </Badge>
      );
    },
  },
  {
    id: "finding",
    header: "Finding",
    minSize: 280,
    cell: (context) => {
      const finding = context.row.original as PrFinding;
      return (
        <Stack gap="none" className={styles.minWidthZero}>
          <Text size="sm" weight="medium" truncate>
            {finding.suggestion}
          </Text>
          <Text size="xs" color="tertiary" font="mono" truncate>
            {finding.code} · {finding.file}:{finding.line}
          </Text>
        </Stack>
      );
    },
  },
  { accessorKey: "rule", header: "Rule", size: 150, truncate: true },
  {
    id: "occurrences",
    header: "Sites",
    size: 72,
    align: "right",
    cell: (context) => (
      <Text size="xs" color="secondary" tabularNums>
        ×{(context.row.original as PrFinding).occurrences}
      </Text>
    ),
  },
  {
    id: "origin",
    header: "Origin",
    size: 104,
    cell: (context) => {
      const finding = context.row.original as PrFinding;
      return (
        <Text size="xs" color={finding.origin === "Introduced" ? "secondary" : "tertiary"}>
          {finding.origin}
        </Text>
      );
    },
  },
  {
    id: "fix",
    header: "Fix",
    size: 116,
    cell: (context) => (
      <Text size="xs" color="tertiary">
        {(context.row.original as PrFinding).fix}
      </Text>
    ),
  },
  {
    id: "actions",
    header: "",
    size: 132,
    align: "right",
    cell: (context) => (
      <Button variant="outlined" size="xs">
        {actionLabel(context.row.original as PrFinding)}
      </Button>
    ),
  },
];

export function FindingsPanel() {
  return (
    <Stack gap="sm">
      <Box className={styles.prFindingsToolbar}>
        <Select aria-label="Group findings" defaultValue="rule" size="sm">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="rule">Group by rule</Select.Item>
            <Select.Item value="area">Group by area</Select.Item>
            <Select.Item value="severity">Group by severity</Select.Item>
            <Select.Item value="file">Group by file</Select.Item>
          </Select.Content>
        </Select>
        <Stack direction="row" gap="xs" align="center" wrap>
          <Button variant="secondary" size="sm">
            Create {pr.safeFixes} fixes
          </Button>
          <Button variant="ghost" size="sm">
            Mark intentional
          </Button>
        </Stack>
      </Box>
      <Stack direction="row" gap="xs" wrap>
        <Badge variant="dim" size="md" active>
          All {prFindings.length}
        </Badge>
        <Badge variant="dim" size="md">
          Blocking {blockingFindings.length}
        </Badge>
        <Badge variant="dim" size="md">
          Safe fixes {pr.safeFixes}
        </Badge>
        <Badge variant="dim" size="md">
          Introduced {introducedFindings.length}
        </Badge>
        <Badge variant="dim" size="md">
          Legacy {legacyCount}
        </Badge>
      </Stack>
      <DataTable
        columns={findingColumns}
        data={prFindings}
        getRowId={(row) => row.id}
        selectable
        showCheckbox
        density="condensed"
        bordered
        caption="Pull request findings"
        captionHidden
        wrapperClassName={styles.prTable}
      />
      <Text size="xs" color="tertiary">
        {prFindings.length} findings · {introducedFindings.length} introduced gate this PR ·{" "}
        {legacyCount} legacy shown for context
      </Text>
    </Stack>
  );
}

// ============================================================================
// Conversation tab — the human-readable timeline on canonical Avatar + Card
// ============================================================================

export function ConversationPanel() {
  return (
    <Stack gap="md" className={styles.prIdTimeline}>
      <TimelineItem author={pr.author} meta="opened this pull request" avatarName={pr.author}>
        <Stack gap="sm">
          <Text size="sm">
            Refreshes the public launch cards for the June campaign. The branch changes hero CTA
            behavior, form danger states, and campaign-card spacing.
          </Text>
          <Box className={styles.prIdPrBodyTable}>
            <SummaryRow label="Area" value="Marketing / public launch" />
            <SummaryRow label="Designer" value="Growth design" />
            <SummaryRow label="Fragments gate" value="Blocked by contract" />
          </Box>
        </Stack>
      </TimelineItem>

      <TimelineItem
        author="fragments[bot]"
        meta="summarized the governance report"
        avatarName="Fragments bot"
      >
        <Stack gap="xs">
          <Text size="sm" weight="semibold">
            Fragments governance report
          </Text>
          <Text size="sm" color="secondary">
            {blockingFindings.length} blocking and {pr.safeFixes} safe-fix findings on a public
            marketing flow. Merge stays blocked until the blocking contract comments resolve — see
            Impacted areas for the area rollup.
          </Text>
        </Stack>
      </TimelineItem>

      {threadFindings.map((finding) => (
        <ReviewThread key={finding.id} finding={finding} />
      ))}

      <TimelineItem author="Noah Lee" meta="Growth design" avatarName="Noah Lee">
        <Text size="sm" color="secondary">
          I can approve the visual direction once the Button replacement and semantic danger token
          land. The spacing rhythm can be an intentional campaign exception.
        </Text>
      </TimelineItem>
    </Stack>
  );
}

function TimelineItem({
  author,
  meta,
  avatarName,
  children,
}: {
  author: string;
  meta: string;
  avatarName: string;
  children: React.ReactNode;
}) {
  return (
    <Box className={styles.prIdTimelineItem}>
      <Avatar name={avatarName} size="md" />
      <Card variant="panel" padding="none">
        <Card.Header divided>
          <Stack
            direction="row"
            gap="sm"
            align="baseline"
            justify="between"
            className={styles.full}
          >
            <Text size="sm" weight="semibold">
              {author}
            </Text>
            <Text size="xs" color="tertiary">
              {meta}
            </Text>
          </Stack>
        </Card.Header>
        <Card.Body padding="md">{children}</Card.Body>
      </Card>
    </Box>
  );
}

function ReviewThread({ finding }: { finding: PrFinding }) {
  return (
    <Box className={styles.prIdTimelineItem}>
      <Avatar name="Fragments bot" size="md" />
      <Card variant="panel" padding="none">
        <Card.Header divided>
          <Stack direction="row" gap="sm" align="center" justify="between" className={styles.full}>
            <Text size="xs" color="secondary" font="mono" truncate>
              {finding.file}:{finding.line}
            </Text>
            <Badge variant={finding.variant} size="sm">
              {finding.severity}
            </Badge>
          </Stack>
        </Card.Header>
        <Card.Body padding="md">
          <Stack gap="sm">
            <Text size="sm" color="secondary">
              {finding.body}
            </Text>
            {finding.designerSignal ? (
              <Text size="xs" color="tertiary">
                Designer signal: {finding.designerSignal}
              </Text>
            ) : null}
            <Stack direction="row" gap="sm" wrap>
              {finding.fix === "Deterministic" ? (
                <Button variant="outlined" size="xs">
                  Create fix
                </Button>
              ) : null}
              <Button variant="ghost" size="xs">
                {finding.severity === "Blocking" ? "Request waiver" : "Mark intentional"}
              </Button>
            </Stack>
          </Stack>
        </Card.Body>
      </Card>
    </Box>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Box className={styles.prIdSummaryRow}>
      <Text size="xs" color="tertiary">
        {label}
      </Text>
      <Text size="xs" color="secondary">
        {value}
      </Text>
    </Box>
  );
}

// ============================================================================
// Changed files tab
// ============================================================================

const changedFileColumns: DataTableColumn<ChangedFile>[] = [
  {
    accessorKey: "path",
    header: "File",
    minSize: 320,
    truncate: true,
    cell: (context) => (
      <Text size="xs" font="mono" truncate>
        {(context.row.original as ChangedFile).path}
      </Text>
    ),
  },
  { accessorKey: "area", header: "Area", size: 120, truncate: true },
  {
    id: "delta",
    header: "Changes",
    size: 120,
    align: "right",
    cell: (context) => {
      const file = context.row.original as ChangedFile;
      return (
        <Text size="xs" color="secondary" tabularNums>
          +{file.additions} -{file.deletions}
        </Text>
      );
    },
  },
  {
    id: "findings",
    header: "Findings",
    size: 96,
    align: "right",
    cell: (context) => {
      const file = context.row.original as ChangedFile;
      return file.findings > 0 ? (
        <Badge variant="warning" size="sm">
          {file.findings}
        </Badge>
      ) : (
        <Text size="xs" color="tertiary">
          0
        </Text>
      );
    },
  },
];

export function ChangedFilesPanel() {
  return (
    <DataTable
      columns={changedFileColumns}
      data={changedFiles}
      getRowId={(row) => row.path}
      density="condensed"
      bordered
      caption="Changed files"
      captionHidden
      wrapperClassName={styles.prTable}
    />
  );
}
