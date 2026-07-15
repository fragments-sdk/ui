import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, render, screen, userEvent } from "../../test/utils";
import { IconButton } from "./index";

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

  it("has no accessibility violations when named", async () => {
    const { container } = render(
      <IconButton aria-label="Delete item">
        <span aria-hidden="true">icon</span>
      </IconButton>
    );

    await expectNoA11yViolations(container);
  });
});
