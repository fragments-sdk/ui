import type { Meta, StoryObj } from "@storybook/react";
import { Toast, useToast } from ".";
import { Button } from "../Button";
import { Stack } from "../Stack";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Toast is the canonical transient-notification primitive. Use it for brief,
 * non-blocking feedback after an action (saved, deleted, failed). In an app,
 * wrap the tree in `Toast.Provider` and dispatch via `useToast()`; agents
 * should reuse this rather than hand-rolling a notification component.
 */
const meta = {
  title: "Feedback/Toast",
  component: Toast,
  tags: ["autodocs", "canonical"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component:
          "Brief, non-blocking notification messages on the raised plane. The tone shows only as the icon. Prefer this (via Toast.Provider + useToast) over a hand-rolled notification system.",
      },
    },
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "success", "warning", "danger"],
      description: "The outcome; semantic tones draw an icon in the tone's ink",
    },
    title: { control: "text", description: "One line on what happened" },
    description: { control: "text", description: "One sentence more" },
  },
  args: {
    title: "Draft saved",
    description: "Kept until you publish.",
    tone: "neutral",
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <Stack direction="column" gap="sm">
      <Toast title="Draft saved" description="Kept until you publish." />
      <Toast title="Branch merged" description="Checks passed on main." tone="success" />
      <Toast title="Usage near the limit" description="9 of 10 seats in use." tone="warning" />
      <Toast title="Push failed" description="The remote refused the branch." tone="danger" />
    </Stack>
  ),
};

export const WithUndo: Story = {
  args: {
    title: "Deleted 3 findings",
    description: undefined,
    action: { label: "Undo", onClick: () => {}, undo: true },
    onDismiss: () => {},
  },
};

export const Busy: Story = {
  args: {
    title: "Uploading files",
    description: undefined,
    busy: { done: 3, total: 12, onStop: () => {} },
  },
};

function LiveDemo() {
  const { toast, success, danger, promise } = useToast();
  return (
    <Stack direction="row" gap="sm">
      <Button variant="soft" onClick={() => toast({ title: "Draft saved" })}>
        Neutral
      </Button>
      <Button variant="soft" onClick={() => success("Branch merged", "Checks passed on main.")}>
        Success
      </Button>
      <Button
        variant="soft"
        onClick={() => danger("Push failed", "The remote refused the branch.")}
      >
        Danger
      </Button>
      <Button
        variant="soft"
        onClick={() =>
          toast({
            title: "Deleted 3 findings",
            action: { label: "Undo", onClick: () => success("Restored 3 findings"), undo: true },
          })
        }
      >
        Undo
      </Button>
      <Button
        variant="soft"
        onClick={() =>
          void promise(new Promise((done) => setTimeout(done, 2000)), {
            loading: "Deploying",
            success: "Deployed",
            error: "Deploy failed",
          }).catch(() => {})
        }
      >
        Promise
      </Button>
    </Stack>
  );
}

export const Live: Story = {
  render: () => (
    <Toast.Provider>
      <LiveDemo />
    </Toast.Provider>
  ),
};
