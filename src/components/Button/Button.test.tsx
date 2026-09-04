import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { ComponentDefaultsProvider } from "../ComponentDefaults";
import { ThemeProvider } from "../Theme";
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

    rerender(<Button variant="outline">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("outline");

    rerender(<Button variant="ghost">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("ghost");

    rerender(<Button variant="link">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("link");
  });

  it("defaults the tone per variant (UIR-D17)", () => {
    const { rerender } = render(<Button variant="link">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("toneAccent");

    for (const variant of ["soft", "outline", "ghost"] as const) {
      rerender(<Button variant={variant}>Btn</Button>);
      expect(screen.getByRole("button")).toHaveClass("toneNeutral");
      expect(screen.getByRole("button")).not.toHaveClass("toneAccent");
    }
  });

  it("applies an explicit tone on any variant", () => {
    const { rerender } = render(
      <Button variant="solid" tone="danger">
        Btn
      </Button>
    );
    expect(screen.getByRole("button")).toHaveClass("solid", "toneDanger");

    rerender(
      <Button variant="ghost" tone="success">
        Btn
      </Button>
    );
    expect(screen.getByRole("button")).toHaveClass("ghost", "toneSuccess");

    rerender(
      <Button variant="outline" tone="warning">
        Btn
      </Button>
    );
    expect(screen.getByRole("button")).toHaveClass("outline", "toneWarning");

    rerender(
      <Button variant="soft" tone="info">
        Btn
      </Button>
    );
    expect(screen.getByRole("button")).toHaveClass("soft", "toneInfo");
  });

  it("keeps every boxed button treatment flat and the default danger seed muted", () => {
    const buttonTokenSection = tokenStyles.slice(
      tokenStyles.indexOf("// Button chrome."),
      tokenStyles.indexOf("--fui-code-bg:")
    );

    expect(buttonTokenSection).not.toContain("linear-gradient");
    expect(buttonTokenSection).toContain("--fui-button-primary-shadow: none");
    expect(buttonTokenSection).toContain("--fui-button-neutral-shadow: none");
    expect(buttonTokenSection).toContain("--fui-button-outlined-shadow: none");
    expect(seedStyles).toContain("$fui-danger: #c44732 !default");
    expect(seedStyles).toContain("$fui-success: #2c8c5f !default");
    expect(seedStyles).toContain("$fui-warning: #c4922a !default");
    expect(seedStyles).toContain("$fui-info: #3d7aa8 !default");
  });

  it("keeps soft fill-led and reserves the visible border for outline", () => {
    const softStyles = buttonStyles.slice(
      buttonStyles.indexOf(".soft {"),
      buttonStyles.indexOf(".outline {")
    );
    const outlineStyles = buttonStyles.slice(
      buttonStyles.indexOf(".outline {"),
      buttonStyles.indexOf(".ghost {")
    );

    expect(softStyles).toContain("--_button-border: transparent");
    expect(softStyles).toContain("--_button-border-hover: transparent");
    expect(outlineStyles).toContain("--_button-border: var(--_tone-line");
    expect(outlineStyles).toContain("--_button-border-hover: var(--_tone-line-hover");
    expect(buttonStyles).toContain("--_tone-line: var(--fui-button-neutral-border");
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

  it("uses ThemeProvider component defaults when size is omitted", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });

    render(
      <ThemeProvider defaultMode="light" storageKey="" componentDefaults={{ controlSize: "sm" }}>
        <Button>Btn</Button>
      </ThemeProvider>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("sm");
    expect(button).not.toHaveClass("md");
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

  it("combines the small size with an icon-only outline for compact row actions", () => {
    render(
      <Button icon variant="outline" size="sm" aria-label="Dismiss">
        <span aria-hidden>×</span>
      </Button>
    );
    const button = screen.getByRole("button", { name: "Dismiss" });
    expect(button).toHaveClass("outline");
    expect(button).toHaveClass("icon");
    expect(button).toHaveClass("sm");
  });

  it('renders as an anchor when as="a"', () => {
    render(
      <Button as="a" href="/test">
        Link
      </Button>
    );
    const link = screen.getByRole("link", { name: "Link" });
    expect(link).toHaveAttribute("href", "/test");
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

  it("renders as child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveClass("button");
    expect(link).toHaveAttribute("data-fc-canonical", "Button");
  });

  it("translates disabled semantics for non-button asChild children", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button asChild disabled>
        <a href="/test" onClick={handleClick}>
          Link Button
        </a>
      </Button>
    );

    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("data-disabled", "");
    expect(link).toHaveAttribute("tabindex", "-1");

    await user.click(link);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Button>Accessible</Button>);
    await expectNoA11yViolations(container);
  });
});
