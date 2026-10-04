import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from ".";
import { Button } from "../Button";
import { Input } from "../Input";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Modal sheet for a focused task: the raised plane over a scrim, a fixed
 * header and footer, and a body that scrolls on its own. Compose
 * Dialog.Trigger, Dialog.Content, Dialog.Header, Dialog.Body, Dialog.Footer and
 * Dialog.Close. For a decision the user must answer, use AlertDialog.
 */
const meta = {
  title: "Feedback/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Modal sheet for a focused task.",
      },
    },
  },
  argTypes: {
    defaultOpen: { control: "boolean", description: "Default open state" },
  },
  args: {
    defaultOpen: false,
  },
} satisfies Meta<typeof Dialog>;

export default meta;

// Typed from the component, not the meta: every story renders its own
// children, and JSX stays out of component-level args (Storybook docs).
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger render={<Button variant="soft" />}>Rename branch</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Rename the branch</Dialog.Title>
          <Dialog.Description>Open pull requests move to the new name.</Dialog.Description>
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <Input aria-label="Branch name" defaultValue="feat/card-tokens" />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
          <Button variant="solid">Rename</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
};

export const Widths: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      {(["sm", "md", "lg"] as const).map((width) => (
        <Dialog key={width}>
          <Dialog.Trigger render={<Button variant="soft" />}>{width}</Dialog.Trigger>
          <Dialog.Content width={width}>
            <Dialog.Header>
              <Dialog.Title>Width {width}</Dialog.Title>
              <Dialog.Close />
            </Dialog.Header>
            <Dialog.Body>
              <p>The sheet never grows past the viewport less the safe-area frame.</p>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog>
      ))}
    </div>
  ),
};

export const LongBody: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger render={<Button variant="soft" />}>Review changes</Dialog.Trigger>
      <Dialog.Content width="lg">
        <Dialog.Header>
          <Dialog.Title>Review changes</Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          {Array.from({ length: 30 }, (_, index) => (
            <p key={index}>Change {index + 1}: the body scrolls; the header and footer stay.</p>
          ))}
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close render={<Button variant="ghost" />}>Close</Dialog.Close>
          <Button variant="solid">Approve</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
};

export const InitialFocus: Story = {
  render: function InitialFocusStory() {
    const ref = React.useRef<HTMLInputElement>(null);
    return (
      <Dialog>
        <Dialog.Trigger render={<Button variant="soft" />}>Add token file</Dialog.Trigger>
        <Dialog.Content width="sm" initialFocus={ref}>
          <Dialog.Header>
            <Dialog.Title>Add a token file</Dialog.Title>
            <Dialog.Close />
          </Dialog.Header>
          <Dialog.Body>
            <Input aria-label="Path" placeholder="src/tokens.css" ref={ref} />
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
            <Button variant="solid">Add</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    );
  },
};
