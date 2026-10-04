import * as React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, render, screen, userEvent } from "../../test/utils";
import { ComponentDefaultsProvider } from "../ComponentDefaults";
import { IconButton } from "./index";

const iconButtonStyles = readFileSync(
  resolve(process.cwd(), "src/components/IconButton/IconButton.module.scss"),
  "utf8"
);

describe("IconButton", () => {
  it("renders a named non-submitting button and handles activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButton aria-label="Open settings" onClick={onClick}>
        <span aria-hidden="true">icon</span>
      </IconButton>
    );

    const button = screen.getByRole("button", { name: "Open settings" });
    expect(button).toHaveAttribute("type", "button");

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards its ref and exposes pressed and disabled semantics", () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <IconButton ref={ref} aria-label="Pin item" pressed disabled>
        <span aria-hidden="true">icon</span>
      </IconButton>
    );

    const button = screen.getByRole("button", { name: "Pin item" });
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toBeDisabled();
  });

  it("is a real toggle: aria-pressed follows presses and onPressedChange reports them", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();

    render(
      <IconButton aria-label="Pin item" defaultPressed={false} onPressedChange={onPressedChange}>
        <span aria-hidden="true">icon</span>
      </IconButton>
    );

    const button = screen.getByRole("button", { name: "Pin item" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).not.toHaveClass("pressed");

    await user.click(button);
    expect(onPressedChange).toHaveBeenLastCalledWith(true);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass("pressed");
  });

  it("stays a plain button without toggle props", () => {
    render(
      <IconButton aria-label="Copy">
        <span aria-hidden="true">icon</span>
      </IconButton>
    );
    expect(screen.getByRole("button", { name: "Copy" })).not.toHaveAttribute("aria-pressed");
  });

  it("swallows presses while pending, toggle state included", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onPressedChange = vi.fn();

    render(
      <>
        <IconButton aria-label="Sync" pending onClick={onClick}>
          <span aria-hidden="true">icon</span>
        </IconButton>
        <IconButton aria-label="Watch" pending defaultPressed onPressedChange={onPressedChange}>
          <span aria-hidden="true">icon</span>
        </IconButton>
      </>
    );

    const sync = screen.getByRole("button", { name: "Sync" });
    expect(sync).toHaveAttribute("aria-busy", "true");
    expect(sync).toHaveAttribute("data-pending", "");
    await user.click(sync);
    expect(onClick).not.toHaveBeenCalled();

    const watch = screen.getByRole("button", { name: "Watch" });
    await user.click(watch);
    expect(onPressedChange).not.toHaveBeenCalled();
    expect(watch).toHaveAttribute("aria-pressed", "true");
  });

  it("draws the xs step, from its prop or an xs region", () => {
    render(
      <>
        <IconButton aria-label="Small" size="xs">
          <span aria-hidden="true">icon</span>
        </IconButton>
        <ComponentDefaultsProvider controlSize="xs">
          <IconButton aria-label="Inherited">
            <span aria-hidden="true">icon</span>
          </IconButton>
        </ComponentDefaultsProvider>
      </>
    );
    expect(screen.getByRole("button", { name: "Small" })).toHaveClass("xs");
    expect(screen.getByRole("button", { name: "Inherited" })).toHaveClass("xs");
  });

  it("renders a link through render, keeping link semantics", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Settings" render={<a href="#settings" />} onClick={onClick}>
        <span aria-hidden="true">icon</span>
      </IconButton>
    );
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveAttribute("href", "#settings");
    expect(link).not.toHaveAttribute("type");
    expect(link.className).toContain("iconButton");
    expect(screen.queryByRole("button")).toBeNull();
    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("stops presses on a disabled rendered link", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Settings" render={<a href="#settings" />} disabled onClick={onClick}>
        <span aria-hidden="true">icon</span>
      </IconButton>
    );
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("gives soft the soft edge: none at rest, the strong edge under high contrast", () => {
    const softStyles = iconButtonStyles.slice(
      iconButtonStyles.indexOf(".soft {"),
      iconButtonStyles.indexOf(".pressed {")
    );

    expect(softStyles).toContain(
      "border-color: var(--fui-button-soft-border, $fui-button-soft-border);"
    );
    expect(iconButtonStyles).toContain("@include high-contrast-outline");
  });

  it("has no accessibility violations when named", async () => {
    const { container } = render(
      <IconButton aria-label="Delete item">
        <span aria-hidden="true">icon</span>
      </IconButton>
    );

    await expectNoA11yViolations(container);
  });
});
