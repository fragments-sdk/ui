import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import * as React from "react";
import { Alert, type AlertProps } from "./index";

describe("Alert", () => {
  it('uses role="status" for non-urgent alerts', () => {
    render(
      <Alert>
        <Alert.Title>Info</Alert.Title>
        <Alert.Content>Details</Alert.Content>
      </Alert>
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("applies tone class", () => {
    const { rerender } = render(
      <Alert tone="danger">
        <Alert.Title>Error</Alert.Title>
      </Alert>
    );
    expect(screen.getByRole("alert")).toHaveClass("toneDanger");

    rerender(
      <Alert tone="warning">
        <Alert.Title>Warning</Alert.Title>
      </Alert>
    );
    expect(screen.getByRole("alert")).toHaveClass("toneWarning");
  });

  it("links title and content via aria-labelledby and aria-describedby", () => {
    render(
      <Alert>
        <Alert.Title>Title</Alert.Title>
        <Alert.Content>Content</Alert.Content>
      </Alert>
    );
    const alertEl = screen.getByRole("status");
    const titleId = alertEl.getAttribute("aria-labelledby");
    const descId = alertEl.getAttribute("aria-describedby");
    expect(titleId).toBeTruthy();
    expect(descId).toBeTruthy();
    expect(screen.getByText("Title")).toHaveAttribute("id", titleId);
    expect(screen.getByText("Content")).toHaveAttribute("id", descId);
  });

  it("dismisses when close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Alert>
        <Alert.Title>Dismissable</Alert.Title>
        <Alert.Close />
      </Alert>
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /dismiss alert/i }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("moves focus from its close button to the next item when dismissed", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Alert>
          <Alert.Title>Dismissable</Alert.Title>
          <Alert.Close />
        </Alert>
        <button type="button">Next item</button>
      </>
    );
    const close = screen.getByRole("button", { name: /dismiss alert/i });
    close.focus();
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next item" }));
  });

  it("renders the tone icon as a hidden svg, with no glyph disc", () => {
    const { container } = render(
      <Alert tone="danger">
        <Alert.Icon />
        <Alert.Title>Failed</Alert.Title>
      </Alert>
    );
    const icon = container.querySelector(".icon");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon?.querySelector("svg")).toBeTruthy();
    expect(icon?.textContent).toBe("");
  });

  it("only points aria ids at parts that render", () => {
    render(
      <Alert>
        <Alert.Content>Content only</Alert.Content>
      </Alert>
    );
    const alertEl = screen.getByRole("status");
    expect(alertEl).not.toHaveAttribute("aria-labelledby");
    expect(alertEl).toHaveAttribute("aria-describedby", screen.getByText("Content only").id);
  });

  it("supports controlled open and onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = React.useState(true);
      return (
        <>
          <Alert
            open={open}
            onOpenChange={(next) => {
              onOpenChange(next);
              setOpen(next);
            }}
          >
            <Alert.Title>Controlled</Alert.Title>
            <Alert.Close />
          </Alert>
          <button type="button" onClick={() => setOpen(true)}>
            Show again
          </button>
        </>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: /dismiss alert/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show again" }));
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("stays hidden while open is false", () => {
    render(
      <Alert open={false}>
        <Alert.Title>Hidden</Alert.Title>
      </Alert>
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("carries no cut props", () => {
    // @ts-expect-error success is cut: a pass goes to a Badge verdict, a confirmation to Toast
    const success: AlertProps = { tone: "success", children: "x" };
    // @ts-expect-error emphasis is cut: the tint is the only treatment
    const emphasis: AlertProps = { emphasis: "surface", children: "x" };
    expect([success, emphasis]).toHaveLength(2);
  });

  it("renders compound sub-components", () => {
    render(
      <Alert>
        <Alert.Icon />
        <Alert.Body>
          <Alert.Title>Title</Alert.Title>
          <Alert.Content>Description</Alert.Content>
        </Alert.Body>
        <Alert.Actions>
          <Alert.Action onClick={() => {}}>Retry</Alert.Action>
        </Alert.Actions>
      </Alert>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("fires action callback", async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();
    render(
      <Alert>
        <Alert.Title>Alert</Alert.Title>
        <Alert.Actions>
          <Alert.Action onClick={handleAction}>Retry</Alert.Action>
        </Alert.Actions>
      </Alert>
    );
    await user.click(screen.getByText("Retry"));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("uses button semantics and forwards props for actions/close", async () => {
    const user = userEvent.setup();
    const handleCloseClick = vi.fn((event: React.MouseEvent) => event.preventDefault());

    render(
      <form>
        <Alert>
          <Alert.Title>Alert</Alert.Title>
          <Alert.Actions data-testid="actions">
            <Alert.Action data-testid="retry">Retry</Alert.Action>
          </Alert.Actions>
          <Alert.Close data-testid="close" onClick={handleCloseClick} />
        </Alert>
      </form>
    );

    expect(screen.getByTestId("retry")).toHaveAttribute("type", "button");
    expect(screen.getByTestId("close")).toHaveAttribute("type", "button");
    expect(screen.getByTestId("actions")).toBeInTheDocument();

    await user.click(screen.getByTestId("close"));
    expect(handleCloseClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("defaults to the info tone", () => {
    render(
      <Alert>
        <Alert.Title>Default</Alert.Title>
      </Alert>
    );
    expect(screen.getByRole("status")).toHaveClass("toneInfo");
  });

  it('uses role="alert" for urgent tones', () => {
    render(
      <Alert tone="warning">
        <Alert.Title>Warning</Alert.Title>
      </Alert>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Alert tone="warning">
        <Alert.Icon />
        <Alert.Body>
          <Alert.Title>Warning</Alert.Title>
          <Alert.Content>Something happened</Alert.Content>
        </Alert.Body>
        <Alert.Close />
      </Alert>
    );
    await expectNoA11yViolations(container);
  });
});
