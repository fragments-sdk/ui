import type { Meta, StoryObj } from "@storybook/react";
import { PrototypeShell } from "./DashboardLayoutPrototypes.shared";
import {
  PrototypeActions,
  PullRequestDetailActions,
  PullRequestInbox,
  PullRequestReviewSurface,
} from "./PullRequestsPrototypes.content";

const meta = {
  title: "Cloud/Prototypes/Pull Requests",
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
    docs: {
      description: {
        component: "Cloud pull-request review prototypes for table-first topology governance.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Layout1TableInbox: Story = {
  name: "Layout 1 · Table inbox",
  render: () => (
    <PrototypeShell
      activeNav="Pull Requests"
      title="Pull Requests"
      description="Filter every open PR by area, gate state, comments, and drift before reviewing the details."
      actions={<PrototypeActions />}
    >
      <PullRequestInbox />
    </PrototypeShell>
  ),
};

export const Layout2RoomierTable: Story = {
  name: "Layout 2 · Roomier table",
  render: () => (
    <PrototypeShell
      activeNav="Pull Requests"
      eyebrow="Alternative"
      title="Pull Requests"
      description="A roomier review queue for teams that want the same filters with less table density."
      actions={<PrototypeActions />}
    >
      <PullRequestInbox density="regular" />
    </PrototypeShell>
  ),
};

export const Layout3PullRequestDetail: Story = {
  name: "Layout 3 · Pull request detail",
  render: () => (
    <PrototypeShell
      activeNav="Pull Requests"
      eyebrow="PR #248"
      title="Pull Request"
      description="Review Fragments comments, violations, and drift evidence before opening or updating the raw GitHub PR."
      actions={<PrototypeActions />}
    >
      <PullRequestReviewSurface />
      <PullRequestDetailActions />
    </PrototypeShell>
  ),
};
