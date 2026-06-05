import { CheckCircle, GithubLogo, Warning, Wrench, XCircle } from "@phosphor-icons/react";
import { Alert } from "../Alert";
import { Box } from "../Box";
import { Button } from "../Button";
import { Card } from "../Card";
import { Stack } from "../Stack";
import { Tabs } from "../Tabs";
import { Text } from "../Text";
import {
  ChangedFilesPanel,
  ConversationPanel,
  FindingsPanel,
} from "./PullRequestsPrototypes.detail-panels";
import {
  blockingFindings,
  changedFiles,
  githubChecks,
  impactAreas,
  prFindings,
  prIdPagePullRequest as pr,
  reviewers,
  threadFindings,
  type GithubCheck,
} from "./PullRequestsPrototypes.id-data";
import styles from "./DashboardLayoutPrototypes.module.scss";

const coverageDelta = pr.coverageAfter - pr.coverageBefore;
// PR opened + governance report + designer reply wrap the inline review threads.
const conversationCount = threadFindings.length + 3;

// Gate-aware decision actions live in the shell header so the page title is the
// real PR title — no second header, no generic "Pull Request" h1 above it.
export function PullRequestDecisionActions() {
  return (
    <Stack direction="row" align="center" gap="sm" wrap>
      <Button variant="primary" size="sm">
        <Wrench size={14} weight="fill" />
        Create fix PR
      </Button>
      <Button variant="outlined" size="sm">
        Request changes
      </Button>
      <Button
        as="a"
        href="https://github.com/fragments-sdk/fragments/pull/248"
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        size="sm"
      >
        <GithubLogo size={14} weight="fill" />
        GitHub
      </Button>
    </Stack>
  );
}

export function PullRequestDetail() {
  return (
    <Stack gap="md">
      <GateBanner />
      <Box className={styles.prIdGithubLayout}>
        <Box className={styles.minWidthZero}>
          <Tabs defaultValue="findings" variant="pills">
            <Tabs.List>
              <Tabs.Tab value="findings">Findings {prFindings.length}</Tabs.Tab>
              <Tabs.Tab value="conversation">Conversation {conversationCount}</Tabs.Tab>
              <Tabs.Tab value="files">Changed files {changedFiles.length}</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="findings" flush>
              <FindingsPanel />
            </Tabs.Panel>
            <Tabs.Panel value="conversation" flush>
              <ConversationPanel />
            </Tabs.Panel>
            <Tabs.Panel value="files" flush>
              <ChangedFilesPanel />
            </Tabs.Panel>
          </Tabs>
        </Box>
        <DetailRail />
      </Box>
    </Stack>
  );
}

function GateBanner() {
  return (
    <Alert severity="error">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Title>Merge blocked · fragments/contract-compliance</Alert.Title>
        <Alert.Content>
          {blockingFindings.length} blocking design-contract comments must be resolved before this
          PR can merge. Marketing contract coverage fell {pr.coverageBefore}% to {pr.coverageAfter}%
          ({coverageDelta} points), and {pr.safeFixes} of {prFindings.length} findings have
          deterministic fixes.
        </Alert.Content>
      </Alert.Body>
    </Alert>
  );
}

// ============================================================================
// Sidebar status rail — every status fact has exactly one home here
// ============================================================================

function DetailRail() {
  return (
    <aside className={styles.prDetailRail} aria-label="Pull request status">
      <RailCard title="Merge gate">
        <Stack gap="sm">
          {githubChecks.map((check) => (
            <CheckRow key={check.name} check={check} />
          ))}
        </Stack>
      </RailCard>
      <RailCard title="Coverage">
        <Stack gap="xs">
          <RailRow label="Marketing coverage" value={`${pr.coverageAfter}%`} />
          <RailRow label="Coverage delta" value={`${coverageDelta} points`} variant="error" />
          <RailRow label="Safe fixes" value={String(pr.safeFixes)} />
        </Stack>
      </RailCard>
      <RailCard title="Impacted areas">
        <Stack gap="xs">
          {impactAreas.map((area) => (
            <RailRow key={area.area} label={area.area} value={area.review} variant={area.variant} />
          ))}
        </Stack>
      </RailCard>
      <RailCard title="Reviewers">
        <Stack gap="xs">
          {reviewers.map((reviewer) => (
            <RailRow
              key={reviewer.name}
              label={reviewer.name}
              value={reviewer.status}
              variant={reviewer.variant}
            />
          ))}
        </Stack>
      </RailCard>
    </aside>
  );
}

function RailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card variant="panel" padding="none">
      <Card.Header divided>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Body padding="md">{children}</Card.Body>
    </Card>
  );
}

function RailRow({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant?: GithubCheck["variant"];
}) {
  return (
    <Box className={styles.prIdSidebarRow} data-variant={variant}>
      <Text size="xs" color="tertiary">
        {label}
      </Text>
      <Text size="xs" color="secondary">
        {value}
      </Text>
    </Box>
  );
}

function CheckRow({ check }: { check: GithubCheck }) {
  const Icon =
    check.state === "passed" ? CheckCircle : check.state === "failed" ? XCircle : Warning;

  return (
    <Box className={styles.prIdCheckSummary}>
      <span className={styles.prIdCheckIcon} data-state={check.state} aria-hidden>
        <Icon size={14} weight="fill" />
      </span>
      <Stack gap="none" className={styles.minWidthZero}>
        <Stack direction="row" gap="sm" align="baseline" justify="between" className={styles.full}>
          <Text size="xs" weight="medium" truncate>
            {check.name}
          </Text>
          <Text size="2xs" color="tertiary">
            {check.label}
          </Text>
        </Stack>
        <Text size="xs" color="tertiary" truncate>
          {check.summary}
        </Text>
      </Stack>
    </Box>
  );
}
