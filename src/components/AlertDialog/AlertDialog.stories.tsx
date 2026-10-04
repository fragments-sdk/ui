import type { Meta, StoryObj } from "@storybook/react";
import { AlertDialog } from ".";
import { Button } from "../Button";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * A decision the user must answer before going on. It opens with focus on the
 * least destructive answer, has no corner close and does not dismiss on an
 * outside press. Escape and Cancel close it; Action runs and closes.
 */
const meta = {
  title: "Feedback/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Modal decision with a cancel and an explicit verb.",
      },
    },
  },
  args: {
    children: null,
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialog.Trigger render={<Button variant="soft" />}>Delete branch</AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete the branch?</AlertDialog.Title>
          <AlertDialog.Description>
            Its 3 open findings close with it. You can restore it for 30 days.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel render={<Button variant="ghost" />}>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action render={<Button variant="solid" tone="danger" />}>
            Delete branch
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  ),
};

export const WithBody: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialog.Trigger render={<Button variant="soft" />}>
        Activate contract
      </AlertDialog.Trigger>
      <AlertDialog.Content width="md">
        <AlertDialog.Header>
          <AlertDialog.Title>Activate the contract?</AlertDialog.Title>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <p>Every pull request is checked against 12 canonical components from now on.</p>
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <AlertDialog.Cancel render={<Button variant="ghost" />}>Not now</AlertDialog.Cancel>
          <AlertDialog.Action render={<Button variant="solid" />}>Activate</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  ),
};
