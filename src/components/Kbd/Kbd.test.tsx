import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, render, screen } from "../../test/utils";
import { Kbd } from "./index";

const kbdStyles = readFileSync(
  resolve(process.cwd(), "src/components/Kbd/Kbd.module.scss"),
  "utf8"
);

describe("Kbd", () => {
  it("renders a kbd element with the key", () => {
    render(<Kbd>Esc</Kbd>);
    const key = screen.getByText("Esc");
    expect(key.tagName).toBe("KBD");
    expect(key).toHaveClass("kbd");
  });

  it("speaks the label and hides the glyph", () => {
    const { container } = render(<Kbd label="Command">⌘</Kbd>);
    const kbd = container.querySelector("kbd")!;
    expect(kbd.querySelector('[aria-hidden="true"]')).toHaveTextContent("⌘");
    expect(screen.getByText("Command")).toHaveClass("visuallyHidden");
  });

  it("nests the keys of one shortcut inside Kbd.Group", () => {
    const { container } = render(
      <Kbd.Group>
        <Kbd label="Command">⌘</Kbd>
        <Kbd>K</Kbd>
      </Kbd.Group>
    );
    const group = container.querySelector("kbd.group")!;
    expect(group.querySelectorAll("kbd.kbd")).toHaveLength(2);
  });

  it("forwards refs and merges className", () => {
    const ref = vi.fn();
    render(
      <Kbd ref={ref} className="extra">
        K
      </Kbd>
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
    expect(screen.getByText("K")).toHaveClass("kbd", "extra");
  });

  it("paints the press tint at the indicator corner, with no edge or shadow", () => {
    expect(kbdStyles).toContain("var(--fui-bg-active");
    expect(kbdStyles).toContain("var(--fui-radius-indicator");
    expect(kbdStyles).toContain('typography.role("caption")');
    expect(kbdStyles).not.toMatch(/\bborder\s*:/);
    expect(kbdStyles).not.toMatch(/box-shadow/);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <p>
        Press{" "}
        <Kbd.Group>
          <Kbd label="Command">⌘</Kbd>
          <Kbd>K</Kbd>
        </Kbd.Group>{" "}
        to search.
      </p>
    );
    await expectNoA11yViolations(container);
  });
});
