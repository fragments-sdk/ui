import { CheckCircle, GithubLogo, Palette, Warning, XCircle } from "@phosphor-icons/react";
import { Badge } from "../Badge";
import { Box } from "../Box";
import { Button } from "../Button";
import { Stack } from "../Stack";
import { Text } from "../Text";
import {
  githubChecks,
  githubComments,
  impactAreas,
  prIdPagePullRequest as pr,
  type GithubCheck,
  type GithubComment,
} from "./PullRequestsPrototypes.id-data";
import styles from "./DashboardLayoutPrototypes.module.scss";

export function PullRequestIdPage() {
  return (
    <Stack gap="md">
      <PullRequestHeader />
      <PullRequestTabs />
      <Box className={styles.prIdGithubLayout}>
        <ConversationTimeline />
        <PullRequestSidebar />
      </Box>
    </Stack>
  );
}

function PullRequestHeader() {
  const delta = pr.coverageAfter - pr.coverageBefore;

  return (
    <Stack gap="sm" className={styles.prIdHeader}>
      <Stack direction="row" justify="between" align="start" gap="md" wrap>
        <Stack gap="xs" className={styles.minWidthZero}>
          <Stack direction="row" gap="sm" align="center" wrap>
            <Badge variant="error" size="sm" icon={<XCircle size={13} weight="fill" />}>
              Blocked
            </Badge>
            <Text size="xs" color="tertiary">
              #{pr.number} opened by {pr.author} · {pr.branch}
            </Text>
          </Stack>
          <Text as="h2" size="xl" weight="semibold">
            {pr.title}
          </Text>
        </Stack>
        <Stack direction="row" gap="sm" align="center" wrap>
          <Button variant="primary" size="sm">
            <Palette size={14} />
            Mark design reviewed
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
      </Stack>
      <Text size="sm" color="secondary">
        Marketing contract coverage {pr.coverageBefore}% {"->"} {pr.coverageAfter}% ({delta}{" "}
        points). The build is green, but Fragments is blocking merge until the design-system
        comments are resolved.
      </Text>
    </Stack>
  );
}

function PullRequestTabs() {
  return (
    <Box className={styles.prIdTabs} role="navigation" aria-label="Pull request views">
      {[
        ["Conversation", String(pr.comments)],
        ["Checks", String(githubChecks.length)],
        ["Files changed", "6"],
        ["Fragments", "11"],
      ].map(([label, count], index) => (
        <span key={label} data-active={index === 0}>
          {label} <strong>{count}</strong>
        </span>
      ))}
    </Box>
  );
}

function ConversationTimeline() {
  return (
    <Stack gap="md" className={styles.prIdTimeline}>
      <TimelineComment author={pr.author} meta="opened this pull request">
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
      </TimelineComment>

      <TimelineComment author="fragments[bot]" meta="commented with a governance report" avatar="F">
        <Stack gap="md">
          <Stack gap="xs">
            <Text size="sm" weight="semibold">
              Fragments UI Governance Report
            </Text>
            <Text size="sm" color="secondary">
              This PR introduces new design-system drift in a public marketing flow.
            </Text>
          </Stack>
          <Box className={styles.prIdReportTable}>
            {impactAreas.map((area) => (
              <Box key={area.area} className={styles.prIdReportRow}>
                <Text size="sm" weight="medium">
                  {area.area}
                </Text>
                <Text size="xs" color="tertiary">
                  {area.criticality}
                </Text>
                <Text size="xs" color="secondary" tabularNums>
                  {area.coverage}
                </Text>
                <Badge variant={area.variant} size="sm">
                  {area.findings}
                </Badge>
              </Box>
            ))}
          </Box>
          <Text size="sm" color="secondary">
            Merge is blocked because Marketing allows no new primitive bypasses on public launch
            pages.
          </Text>
        </Stack>
      </TimelineComment>

      {githubComments.map((comment) => (
        <ReviewThread key={comment.id} comment={comment} />
      ))}

      <TimelineComment author="Noah Lee" meta="from Growth design" avatar="N" tone="designer">
        <Text size="sm" color="secondary">
          I can approve the visual direction after the Button replacement and semantic danger token
          land. The spacing issue can be an exception if this rhythm is intentional for the
          campaign.
        </Text>
      </TimelineComment>
    </Stack>
  );
}

function TimelineComment({
  author,
  meta,
  avatar,
  tone,
  children,
}: {
  author: string;
  meta: string;
  avatar?: string;
  tone?: "designer";
  children: React.ReactNode;
}) {
  return (
    <Box className={styles.prIdTimelineItem}>
      <span className={styles.prIdAvatar} data-tone={tone} aria-hidden>
        {avatar ?? initials(author)}
      </span>
      <Box className={styles.prIdCommentBox}>
        <Box className={styles.prIdCommentChrome}>
          <Text size="sm" weight="semibold">
            {author}
          </Text>
          <Text size="xs" color="tertiary">
            {meta}
          </Text>
        </Box>
        <Box className={styles.prIdCommentBody}>{children}</Box>
      </Box>
    </Box>
  );
}

function ReviewThread({ comment }: { comment: GithubComment }) {
  return (
    <Box className={styles.prIdTimelineItem}>
      <span className={styles.prIdAvatar} aria-hidden>
        F
      </span>
      <Box className={styles.prIdReviewThread}>
        <Box className={styles.prIdFileHeader}>
          <Text size="xs" color="secondary" font="mono" truncate>
            {comment.file}:{comment.line}
          </Text>
          <Badge variant={comment.variant} size="sm">
            {comment.status}
          </Badge>
        </Box>
        <Box className={styles.prIdCommentBox}>
          <Box className={styles.prIdCommentChrome}>
            <Text size="sm" weight="semibold">
              {comment.author}
            </Text>
            <Text size="xs" color="tertiary">
              left a review comment
            </Text>
          </Box>
          <Stack gap="sm" className={styles.prIdCommentBody}>
            <Text size="sm" color="secondary">
              {comment.body}
            </Text>
            <Text size="xs" color="tertiary">
              Designer signal: {comment.designerSignal}
            </Text>
            <Stack direction="row" gap="sm" wrap>
              <Button variant="outlined" size="xs">
                Create fix
              </Button>
              <Button variant="ghost" size="xs">
                Mark intentional
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function PullRequestSidebar() {
  return (
    <aside className={styles.prIdSidebar} aria-label="Pull request metadata">
      <SidebarSection title="Reviewers">
        <SidebarRow label="Growth design" value="Review needed" variant="warning" />
        <SidebarRow label="Frontend platform" value="Blocked" variant="error" />
      </SidebarSection>
      <SidebarSection title="Checks">
        <Stack gap="xs">
          {githubChecks.map((check) => (
            <CheckSummary key={check.name} check={check} />
          ))}
        </Stack>
      </SidebarSection>
      <SidebarSection title="Fragments">
        <SidebarRow label="Coverage" value={`${pr.coverageAfter}%`} />
        <SidebarRow label="Coverage delta" value="-7 points" variant="error" />
        <SidebarRow label="Safe fixes" value={String(pr.safeFixes)} />
      </SidebarSection>
      <SidebarSection title="Impacted areas">
        <Stack gap="xs">
          {impactAreas.map((area) => (
            <SidebarRow
              key={area.area}
              label={area.area}
              value={area.review}
              variant={area.variant}
            />
          ))}
        </Stack>
      </SidebarSection>
    </aside>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.prIdSidebarSection}>
      <Text as="h3" size="xs" weight="semibold" color="secondary">
        {title}
      </Text>
      {children}
    </section>
  );
}

function SidebarRow({
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

function CheckSummary({ check }: { check: GithubCheck }) {
  const Icon =
    check.state === "passed" ? CheckCircle : check.state === "failed" ? XCircle : Warning;

  return (
    <Box className={styles.prIdCheckSummary}>
      <span className={styles.prIdCheckIcon} data-state={check.state} aria-hidden>
        <Icon size={14} weight="fill" />
      </span>
      <Stack gap="none" className={styles.minWidthZero}>
        <Text size="xs" weight="medium" truncate>
          {check.name}
        </Text>
        <Text size="xs" color="tertiary" truncate>
          {check.summary}
        </Text>
      </Stack>
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

function initials(value: string) {
  return value
    .split(/[\s@/_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
