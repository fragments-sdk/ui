import type { StateVariant } from "./DashboardLayoutPrototypes.shared";

export type CheckState = "failed" | "passed" | "warning";

export type GithubCheck = {
  name: string;
  state: CheckState;
  label: string;
  variant: StateVariant;
  summary: string;
  duration: string;
};

export type GithubComment = {
  id: string;
  author: string;
  status: string;
  variant: StateVariant;
  file: string;
  line: number;
  body: string;
  designerSignal: string;
};

export type ImpactArea = {
  area: string;
  criticality: string;
  coverage: string;
  findings: string;
  owner: string;
  review: string;
  variant: StateVariant;
};

export type FindingSeverity = "Blocking" | "Safe fix" | "Review";

/** How a finding can be remediated — drives the per-row action verb. */
export type FixKind = "Deterministic" | "Proposed" | "Manual";

export type PrFinding = {
  id: string;
  /** Versioned diagnostic code (FUI####). */
  code: string;
  /** Rule family the finding belongs to. */
  rule: string;
  severity: FindingSeverity;
  variant: StateVariant;
  /** Introduced by this PR (gates merge) vs. pre-existing legacy debt (never gates). */
  origin: "Introduced" | "Legacy";
  file: string;
  line: number;
  area: string;
  /** Call-sites this single finding-family touches in the PR — the bulk-action rationale. */
  occurrences: number;
  fix: FixKind;
  suggestion: string;
  body: string;
  designerSignal?: string;
  /** Surfaced as a human-readable review thread in the Conversation tab. */
  thread?: boolean;
};

export type Reviewer = {
  name: string;
  status: string;
  variant: StateVariant;
};

export type ChangedFile = {
  path: string;
  area: string;
  additions: number;
  deletions: number;
  findings: number;
};

export const prIdPagePullRequest = {
  number: 248,
  title: "Refresh marketing campaign cards",
  branch: "feat/launch-pages",
  author: "Maya Chen",
  coverageBefore: 68,
  coverageAfter: 61,
  comments: 8,
  safeFixes: 5,
};

export const githubChecks: GithubCheck[] = [
  {
    name: "fragments/contract-compliance",
    state: "failed",
    label: "Required",
    variant: "error",
    summary: "3 blocking design-contract comments must be resolved.",
    duration: "1m 42s",
  },
  {
    name: "fragments/governance-report",
    state: "warning",
    label: "Advisory",
    variant: "warning",
    summary: "Coverage fell 7 points in Marketing; 5 fixes are deterministic.",
    duration: "1m 46s",
  },
  {
    name: "build",
    state: "passed",
    label: "CI",
    variant: "success",
    summary: "Production bundle and typecheck completed.",
    duration: "3m 12s",
  },
  {
    name: "storybook visual review",
    state: "passed",
    label: "Design",
    variant: "success",
    summary: "No snapshot deltas on shared primitives.",
    duration: "2m 08s",
  },
];

export const impactAreas: ImpactArea[] = [
  {
    area: "Marketing",
    criticality: "Public launch",
    coverage: "68% -> 61%",
    findings: "11 findings",
    owner: "Growth design",
    review: "CTA, danger states, card spacing",
    variant: "error",
  },
  {
    area: "Dashboard",
    criticality: "Core app",
    coverage: "84% -> 84%",
    findings: "0 findings",
    owner: "Cloud product",
    review: "No review needed",
    variant: "success",
  },
  {
    area: "Checkout",
    criticality: "Revenue",
    coverage: "91% -> 91%",
    findings: "0 findings",
    owner: "Revenue systems",
    review: "No touched surfaces",
    variant: "success",
  },
];

// Single source of truth for PR #248 findings. Both the table-first detail
// (Layout 3) and the conversation prototype (Layout 4) read from this list so
// the two surfaces can never drift apart.
export const prFindings: PrFinding[] = [
  {
    id: "button-contract",
    code: "FUI3101",
    rule: "Canonical usage",
    severity: "Blocking",
    variant: "error",
    origin: "Introduced",
    file: "src/routes/(marketing)/launch/Hero.tsx",
    line: 42,
    area: "Marketing",
    occurrences: 4,
    fix: "Deterministic",
    suggestion: "Replace with <Button>",
    body: "Native button introduced in a public launch hero. Use Button so loading, disabled, focus, and variants stay governed.",
    designerSignal: "Primary CTA behavior is outside the design-system contract.",
    thread: true,
  },
  {
    id: "danger-token",
    code: "FUI2110",
    rule: "Tokens · color",
    severity: "Blocking",
    variant: "error",
    origin: "Introduced",
    file: "src/routes/(marketing)/launch/Form.tsx",
    line: 88,
    area: "Marketing",
    occurrences: 3,
    fix: "Deterministic",
    suggestion: "Use var(--fui-color-danger-bg)",
    body: "Raw danger background bypasses the semantic danger token. Replace the hardcoded value before merge.",
    designerSignal: "Error and warning color semantics can drift from brand.",
    thread: true,
  },
  {
    id: "brand-accent",
    code: "FUI2101",
    rule: "Tokens · brand",
    severity: "Blocking",
    variant: "error",
    origin: "Introduced",
    file: "src/routes/(marketing)/launch/Hero.tsx",
    line: 51,
    area: "Marketing",
    occurrences: 2,
    fix: "Deterministic",
    suggestion: "Use var(--fui-color-accent)",
    body: "Hardcoded #6d5efc on the CTA bypasses the brand accent token.",
  },
  {
    id: "spacing-gap",
    code: "FUI2120",
    rule: "Tokens · spacing",
    severity: "Safe fix",
    variant: "warning",
    origin: "Introduced",
    file: "src/components/campaign/CardGrid.tsx",
    line: 31,
    area: "Marketing",
    occurrences: 6,
    fix: "Deterministic",
    suggestion: "Use var(--fui-space-4)",
    body: "Off-scale 18px gap. Snap to the nearest spacing token.",
  },
  {
    id: "radius-scale",
    code: "FUI2122",
    rule: "Tokens · radius",
    severity: "Safe fix",
    variant: "warning",
    origin: "Introduced",
    file: "src/components/campaign/Card.tsx",
    line: 12,
    area: "Marketing",
    occurrences: 4,
    fix: "Deterministic",
    suggestion: "Use var(--fui-radius-md)",
    body: "Hardcoded 10px corner radius is off the radius scale.",
  },
  {
    id: "font-size",
    code: "FUI2130",
    rule: "Tokens · type",
    severity: "Safe fix",
    variant: "warning",
    origin: "Introduced",
    file: "src/routes/(marketing)/launch/Hero.tsx",
    line: 60,
    area: "Marketing",
    occurrences: 2,
    fix: "Deterministic",
    suggestion: "Use var(--fui-font-size-lg)",
    body: "Hardcoded 19px heading size bypasses the type scale.",
  },
  {
    id: "shadow-token",
    code: "FUI2140",
    rule: "Tokens · elevation",
    severity: "Safe fix",
    variant: "warning",
    origin: "Introduced",
    file: "src/components/campaign/Card.tsx",
    line: 20,
    area: "Marketing",
    occurrences: 5,
    fix: "Deterministic",
    suggestion: "Use var(--fui-shadow-sm)",
    body: "Raw box-shadow does not match the elevation scale.",
  },
  {
    id: "muted-text",
    code: "FUI2112",
    rule: "Tokens · color",
    severity: "Safe fix",
    variant: "warning",
    origin: "Legacy",
    file: "src/routes/(marketing)/launch/Footer.tsx",
    line: 14,
    area: "Marketing",
    occurrences: 3,
    fix: "Deterministic",
    suggestion: "Use var(--fui-text-tertiary)",
    body: "Pre-existing hardcoded muted gray. Visible as legacy debt; does not gate this PR.",
  },
  {
    id: "spacing-rhythm",
    code: "FUI4010",
    rule: "Spacing rhythm",
    severity: "Review",
    variant: "info",
    origin: "Introduced",
    file: "src/components/campaign/CardGrid.tsx",
    line: 31,
    area: "Marketing",
    occurrences: 6,
    fix: "Proposed",
    suggestion: "Snap to scale or mark intentional",
    body: "Spacing is off scale. Use the nearest Fragments spacing token or mark this as an intentional campaign exception.",
    designerSignal: "Card rhythm changes across the marketing grid.",
    thread: true,
  },
  {
    id: "icon-button-label",
    code: "FUI1204",
    rule: "A11y · name",
    severity: "Review",
    variant: "info",
    origin: "Introduced",
    file: "src/routes/(marketing)/launch/Hero.tsx",
    line: 70,
    area: "Marketing",
    occurrences: 1,
    fix: "Manual",
    suggestion: "Add an accessible label",
    body: "Icon-only share button has no accessible name.",
  },
  {
    id: "heading-order",
    code: "FUI1330",
    rule: "A11y · structure",
    severity: "Review",
    variant: "info",
    origin: "Legacy",
    file: "src/routes/(marketing)/launch/Form.tsx",
    line: 22,
    area: "Marketing",
    occurrences: 1,
    fix: "Manual",
    suggestion: "Restore heading order",
    body: "Heading level skips from h2 to h4. Pre-existing; does not gate this PR.",
  },
];

export const blockingFindings = prFindings.filter((finding) => finding.severity === "Blocking");
export const introducedFindings = prFindings.filter((finding) => finding.origin === "Introduced");
export const threadFindings = prFindings.filter((finding) => finding.thread);

// Layout 4 renders a curated subset of findings as GitHub-style review threads.
// Deriving it here keeps the conversation prototype in lock-step with the table.
export const githubComments: GithubComment[] = threadFindings.map((finding) => ({
  id: finding.id,
  author: "fragments[bot]",
  status: finding.severity,
  variant: finding.variant,
  file: finding.file,
  line: finding.line,
  body: finding.body,
  designerSignal: finding.designerSignal ?? "",
}));

export const reviewers: Reviewer[] = [
  { name: "Growth design", status: "Review needed", variant: "warning" },
  { name: "Cloud platform", status: "Blocked", variant: "error" },
];

export const changedFiles: ChangedFile[] = [
  {
    path: "src/routes/(marketing)/launch/Hero.tsx",
    area: "Marketing",
    additions: 64,
    deletions: 12,
    findings: 4,
  },
  {
    path: "src/routes/(marketing)/launch/Form.tsx",
    area: "Marketing",
    additions: 38,
    deletions: 9,
    findings: 2,
  },
  {
    path: "src/components/campaign/CardGrid.tsx",
    area: "Marketing",
    additions: 27,
    deletions: 5,
    findings: 3,
  },
  {
    path: "src/components/campaign/Card.tsx",
    area: "Marketing",
    additions: 19,
    deletions: 3,
    findings: 2,
  },
  {
    path: "src/routes/(marketing)/launch/Footer.tsx",
    area: "Marketing",
    additions: 8,
    deletions: 2,
    findings: 0,
  },
  {
    path: "src/styles/campaign.css",
    area: "Marketing",
    additions: 14,
    deletions: 6,
    findings: 0,
  },
];
