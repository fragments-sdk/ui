import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { ComponentDefaultsProvider } from "../ComponentDefaults";
import { ThemeProvider } from "../Theme";
import { Button } from "./index";

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

  it("applies variant classes", () => {
    const { rerender } = render(<Button variant="primary">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("primary");

    rerender(<Button variant="danger">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("danger");
  });

  it("applies link variant class", () => {
    render(<Button variant="link">View all</Button>);
    expect(screen.getByRole("button")).toHaveClass("link");
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
      <ThemeProvider
        defaultMode="light"
        storageKey=""
        componentDefaults={{ controlSize: "sm" }}
      >
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

  it("applies xs size class for inline row actions", () => {
    render(<Button size="xs">Btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("xs");
  });

  it("combines xs size with icon variant for compact row actions", () => {
    render(
      <Button variant="icon" size="xs" aria-label="Dismiss">
        <span aria-hidden>×</span>
      </Button>
    );
    const button = screen.getByRole("button", { name: "Dismiss" });
    expect(button).toHaveClass("outlined");
    expect(button).toHaveClass("icon");
    expect(button).toHaveClass("xs");
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

  it('resolves variant="outline" to "outlined"', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveClass("outlined");
  });

  it('resolves variant="icon" to an outlined icon-only button', () => {
    render(
      <Button variant="icon" aria-label="Icon action">
        <span aria-hidden>+</span>
      </Button>
    );
    const button = screen.getByRole("button", { name: "Icon action" });
    expect(button).toHaveClass("outlined");
    expect(button).toHaveClass("icon");
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
