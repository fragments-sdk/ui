import * as React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { ComponentDefaultsProvider } from "../ComponentDefaults";
import { Button } from "./index";

const tokenStyles = readFileSync(resolve(process.cwd(), "src/tokens/_variables.scss"), "utf8");
const seedStyles = readFileSync(resolve(process.cwd(), "src/tokens/_seeds.scss"), "utf8");
const buttonStyles = readFileSync(
  resolve(process.cwd(), "src/components/Button/Button.module.scss"),
  "utf8"
);

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("emits canonical inspect stamps on the root in development", () => {
    render(<Button>Stamped</Button>);
    const button = screen.getByRole("button", { name: "Stamped" });
    expect(button).toHaveAttribute("data-fc-canonical", "Button");
    expect(button).toHaveAttribute("data-fc-slot", "root");
    expect(button).toHaveAttribute("data-fc-contract", "source:@usefragments/ui#Button");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("defaults to the solid variant with the accent tone", () => {
    render(<Button>Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("solid", "toneAccent");
  });

  it("applies variant classes", () => {
    const { rerender } = render(<Button variant="solid">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("solid");

    rerender(<Button variant="soft">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("soft");

    rerender(<Button variant="ghost">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("ghost");

    rerender(<Button variant="link">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("link");
  });

  it("defaults the tone per variant (UIR-D17)", () => {
    const { rerender } = render(<Button variant="link">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("toneAccent");

    for (const variant of ["soft", "ghost"] as const) {
      rerender(<Button variant={variant}>Btn</Button>);
      expect(screen.getByRole("button")).toHaveClass("toneNeutral");
      expect(screen.getByRole("button")).not.toHaveClass("toneAccent");
    }
  });

  it("applies the tones each variant takes", () => {
    const { rerender } = render(
      <Button variant="solid" tone="danger">
        Btn
      </Button>
    );
    expect(screen.getByRole("button")).toHaveClass("solid", "toneDanger");

    rerender(
      <Button variant="ghost" tone="danger">
        Btn
      </Button>
    );
    expect(screen.getByRole("button")).toHaveClass("ghost", "toneDanger");

    rerender(
      <Button variant="link" tone="neutral">
        Btn
      </Button>
    );
    expect(screen.getByRole("button")).toHaveClass("link", "toneNeutral");
  });

  it("falls back to the variant default for a tone outside the matrix", () => {
    const looseProps = { variant: "soft", tone: "accent" } as unknown as React.ComponentProps<
      typeof Button
    >;
    render(<Button {...looseProps}>Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("soft", "toneNeutral");
  });

  it("keeps every boxed button treatment flat and the status seeds at the Glass defaults", () => {
    const primaryChrome = tokenStyles.slice(
      tokenStyles.indexOf("@mixin _primary-chrome"),
      tokenStyles.indexOf("// High contrast mode support")
    );

    // v4 hard cut: no button shadow slots and no neutral hooks; buttons are flat.
    expect(primaryChrome).not.toContain("linear-gradient");
    expect(tokenStyles).not.toMatch(/--fui-button-[a-z-]*shadow/);
    expect(tokenStyles).not.toMatch(/--fui-button-neutral-/);
    expect(buttonStyles).not.toMatch(/box-shadow|--_button-shadow/);
    expect(seedStyles).toContain("$fui-danger: #d13d1f !default");
    expect(seedStyles).toContain("$fui-success: #2fbf8f !default");
    expect(seedStyles).toContain("$fui-warning: #f2a100 !default");
    expect(seedStyles).toContain("$fui-info: oklch(0.58 0.13 245) !default");
  });

  it("paints soft with the neutral tint and link as an always-underlined rule", () => {
    const softStyles = buttonStyles.slice(
      buttonStyles.indexOf(".soft {"),
      buttonStyles.indexOf(".ghost {")
    );
    const linkStyles = buttonStyles.slice(
      buttonStyles.indexOf(".link {"),
      buttonStyles.indexOf(".fullWidth {")
    );

    expect(softStyles).toContain("--_button-bg: var(--fui-bg-hover");
    expect(softStyles).toContain("--_button-bg-hover: var(--fui-bg-active");
    expect(softStyles).toContain("--_button-border: var(--fui-button-soft-border");
    expect(linkStyles).toContain("--_button-bg-hover: transparent");
    expect(linkStyles).toContain("text-decoration-line: underline");
    expect(linkStyles).toContain("--fui-link-underline-offset");
    expect(linkStyles).toContain("--fui-link-ink");
    expect(buttonStyles).not.toMatch(/\.outline\b|toneInfo|toneSuccess|toneWarning/);
  });

  it("gives soft no edge at rest and the strong edge in the high-contrast tier", () => {
    const softStyles = buttonStyles.slice(
      buttonStyles.indexOf(".soft {"),
      buttonStyles.indexOf(".ghost {")
    );
    const highContrast = tokenStyles.slice(
      tokenStyles.indexOf("@mixin _fui-high-contrast-tokens"),
      tokenStyles.indexOf("@mixin _fui-forced-colors-tokens")
    );

    expect(softStyles).toContain(
      "--_button-border: var(--fui-button-soft-border, #{$fui-button-soft-border});"
    );
    expect(softStyles).toContain(
      "--_button-border-hover: var(--fui-button-soft-border, #{$fui-button-soft-border});"
    );
    expect(tokenStyles).toContain("$fui-button-soft-border: transparent !default;");
    expect(tokenStyles).toContain("--fui-button-soft-border: #{$fui-button-soft-border};");
    expect(highContrast).toContain("--fui-button-soft-border: var(--fui-border-strong);");
    // The tier answers the system preference and the data attribute alike.
    expect(tokenStyles).toMatch(
      /@media \(prefers-contrast: more\) \{\s*:root,\s*\[data-fui-theme\] \{\s*@include _fui-high-contrast-tokens;/
    );
    expect(tokenStyles).toMatch(
      /:root\[data-high-contrast="true"\],\s*:root\[data-high-contrast="true"\] \[data-fui-theme\] \{\s*@include _fui-high-contrast-tokens;/
    );
  });

  it("carries no hand-written contrast or disabled literals", () => {
    expect(buttonStyles).not.toContain("prefers-contrast");
    expect(buttonStyles).toContain("@include high-contrast-outline");
    expect(buttonStyles).not.toMatch(/opacity:\s*0\.\d/);
  });

  it("applies size classes", () => {
    render(<Button size="lg">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("lg");
  });

  it("uses the provider control size when size is omitted", () => {
    render(
      <ComponentDefaultsProvider controlSize="sm">
        <Button>Btn</Button>
      </ComponentDefaultsProvider>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("sm");
    expect(button).not.toHaveClass("md");
  });

  it("draws the xs step from its prop or an xs region", () => {
    render(
      <>
        <Button size="xs">Prop</Button>
        <ComponentDefaultsProvider controlSize="xs">
          <Button>Region</Button>
        </ComponentDefaultsProvider>
      </>
    );
    expect(screen.getByRole("button", { name: "Prop" })).toHaveClass("xs");
    expect(screen.getByRole("button", { name: "Region" })).toHaveClass("xs");
  });

  it("keeps explicit size over the provider control size", () => {
    render(
      <ComponentDefaultsProvider controlSize="sm">
        <Button size="lg">Btn</Button>
      </ComponentDefaultsProvider>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("lg");
    expect(button).not.toHaveClass("sm");
  });

  it("renders an anchor through render and keeps its link role", () => {
    render(<Button render={<a href="/test" />}>Link</Button>);
    const link = screen.getByRole("link", { name: "Link" });
    expect(link).toHaveAttribute("href", "/test");
    expect(link).not.toHaveAttribute("role");
    expect(link).not.toHaveAttribute("type");
    expect(link).toHaveClass("button", "solid", "toneAccent");
    expect(link).toHaveAttribute("data-fc-canonical", "Button");
  });

  it("renders a native button through render", () => {
    render(<Button render={<button type="submit" />}>Send</Button>);
    const button = screen.getByRole("button", { name: "Send" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveClass("button");
  });

  it("swallows presses while pending", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button pending onClick={onClick}>
        Save
      </Button>
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("data-pending", "");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports disabled state", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it("translates disabled semantics onto a rendered anchor", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button disabled render={<a href="/test" onClick={handleClick} />}>
        Link Button
      </Button>
    );

    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("data-disabled", "");
    expect(link).toHaveAttribute("tabindex", "-1");

    await user.click(link);
    expect(handleClick).not.toHaveBeenCalled();
  });

  describe("pending", () => {
    const press = (element: HTMLElement) =>
      element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    it("sets aria-busy and swallows presses on a button", () => {
      const handleClick = vi.fn();
      render(
        <Button pending onClick={handleClick}>
          Save
        </Button>
      );
      const button = screen.getByRole("button", { name: "Save" });
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toHaveAttribute("data-pending", "");
      expect(press(button)).toBe(false);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("sets aria-busy and swallows presses on a rendered anchor", () => {
      const handleClick = vi.fn();
      render(
        <Button render={<a href="/save" />} pending onClick={handleClick}>
          Save
        </Button>
      );
      const link = screen.getByRole("link", { name: "Save" });
      expect(link).toHaveAttribute("aria-busy", "true");
      expect(link).toHaveAttribute("data-pending", "");
      expect(press(link)).toBe(false);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("swallows presses before the rendered element's own handler", () => {
      const handleClick = vi.fn();
      const handleChildClick = vi.fn();
      render(
        <Button
          render={<a href="/save" onClick={handleChildClick} />}
          pending
          onClick={handleClick}
        >
          Save
        </Button>
      );
      const link = screen.getByRole("link", { name: "Save" });
      expect(link).toHaveAttribute("aria-busy", "true");
      expect(link).toHaveAttribute("data-pending", "");
      expect(press(link)).toBe(false);
      expect(handleClick).not.toHaveBeenCalled();
      expect(handleChildClick).not.toHaveBeenCalled();
    });

    it("presses through once the work is done", () => {
      const handleClick = vi.fn();
      render(
        <Button render={<a href="#save" />} pending={false} onClick={handleClick}>
          Save
        </Button>
      );
      const link = screen.getByRole("link", { name: "Save" });
      expect(link).not.toHaveAttribute("aria-busy");
      press(link);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Button>Accessible</Button>);
    await expectNoA11yViolations(container);
  });
});
