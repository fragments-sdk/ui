import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from "../../test/utils";
import { AlertDialog, ALERT_DIALOG_SETTLE_MS } from "./index";
import styles from "./AlertDialog.module.scss";

function renderAlert(
  props: Partial<React.ComponentProps<typeof AlertDialog>> = {},
  onAction = vi.fn()
) {
  render(
    <AlertDialog {...props}>
      <AlertDialog.Trigger>Delete branch</AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete the branch?</AlertDialog.Title>
          <AlertDialog.Description>Its 3 open findings close with it.</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action onClick={onAction}>Delete branch</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
  return { onAction };
}

describe("AlertDialog", () => {
  it("opens with role alertdialog and focuses Cancel", async () => {
    const user = userEvent.setup();
    renderAlert();

    await user.click(screen.getByRole("button", { name: "Delete branch" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveClass(styles.popup);
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus());
  });

  it("draws no corner close", async () => {
    renderAlert({ defaultOpen: true });
    await screen.findByRole("alertdialog");
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });

  it("Cancel closes without acting", async () => {
    const user = userEvent.setup();
    const { onAction } = renderAlert({ defaultOpen: true });
    await screen.findByRole("alertdialog");

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(onAction).not.toHaveBeenCalled();
  });

  it("ignores an Action press inside the settle window, then acts and closes", async () => {
    let clock = 1000;
    const spy = vi.spyOn(performance, "now").mockImplementation(() => clock);
    try {
      const user = userEvent.setup();
      const { onAction } = renderAlert({ defaultOpen: true });
      await screen.findByRole("alertdialog");
      const action = screen.getByRole("button", { name: "Delete branch" });

      await user.click(action);
      expect(onAction).not.toHaveBeenCalled();
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();

      clock += ALERT_DIALOG_SETTLE_MS + 50;
      await user.click(action);
      expect(onAction).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    } finally {
      spy.mockRestore();
    }
  });

  it("does not close on an outside press", async () => {
    const user = userEvent.setup();
    renderAlert({ defaultOpen: true });
    await screen.findByRole("alertdialog");

    const backdrop = document.querySelector(`.${styles.backdrop}`) as HTMLElement;
    await user.click(backdrop);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("Escape closes and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderAlert();
    const trigger = screen.getByRole("button", { name: "Delete branch" });

    await user.click(trigger);
    await screen.findByRole("alertdialog");
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("renders a library control through render on Cancel and Action", async () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialog.Content width="md">
          <AlertDialog.Title>Discard changes?</AlertDialog.Title>
          <AlertDialog.Footer>
            <AlertDialog.Cancel render={<button type="button" data-testid="keep" />}>
              Keep editing
            </AlertDialog.Cancel>
            <AlertDialog.Action render={<button type="button" data-testid="discard" />}>
              Discard
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    );

    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveAttribute("data-width", "md");
    expect(screen.getByTestId("keep")).toHaveAttribute("data-alert-dialog-cancel");
    expect(screen.getByTestId("discard")).toHaveAttribute("data-alert-dialog-action");
  });

  it("has no accessibility violations when open", async () => {
    renderAlert({ defaultOpen: true });
    await screen.findByRole("alertdialog");

    await expectNoA11yViolations(document.body, {
      disabledRules: ["aria-command-name"],
    });
  });
});
