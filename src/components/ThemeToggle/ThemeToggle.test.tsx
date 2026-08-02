import { resolve } from "node:path";

import * as sass from "sass";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, render, screen, userEvent } from "../../test/utils";
import { ComponentDefaultsProvider } from "../ComponentDefaults";
import { ThemeProvider } from "../Theme";
import { ThemeToggle } from "./index";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: localStorageMock,
});

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const compiledStyles = sass.compile(
  resolve(process.cwd(), "src/components/ThemeToggle/ThemeToggle.module.scss"),
  { style: "expanded" }
).css;

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("preserves the group and button DOM contract", () => {
    render(
      <ThemeProvider defaultMode="light">
        <ThemeToggle />
      </ThemeProvider>
    );

    const group = screen.getByRole("group", { name: "Theme toggle" });
    const lightButton = screen.getByRole("button", { name: "Light mode" });
    const darkButton = screen.getByRole("button", { name: "Dark mode" });

    expect(group.tagName).toBe("DIV");
    expect(group).toHaveClass("toggleGroup", "sizeMd");
    expect(lightButton).toHaveAttribute("type", "button");
    expect(lightButton).toHaveAttribute("aria-pressed", "true");
    expect(darkButton).toHaveAttribute("type", "button");
    expect(darkButton).toHaveAttribute("aria-pressed", "false");
    expect(lightButton.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(darkButton.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("updates ThemeProvider context when used uncontrolled", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultMode="light">
        <ThemeToggle />
      </ThemeProvider>
    );

    const darkButton = screen.getByRole("button", { name: "Dark mode" });
    await user.click(darkButton);

    expect(darkButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Light mode" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("uses the controlled value and callback without mutating its own state", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<ThemeToggle value="light" onValueChange={onValueChange} />);

    const darkButton = screen.getByRole("button", { name: "Dark mode" });
    await user.click(darkButton);

    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("dark");
    expect(darkButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Light mode" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("offers system mode only for context-backed usage", () => {
    const { rerender } = render(
      <ThemeProvider defaultMode="system">
        <ThemeToggle showSystem />
      </ThemeProvider>
    );

    expect(screen.getByRole("button", { name: "System preference" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    rerender(<ThemeToggle showSystem value="light" onValueChange={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "System preference" })).not.toBeInTheDocument();
  });

  it("forwards group props, handlers, accessible name, and className", async () => {
    const onKeyDown = vi.fn();
    const user = userEvent.setup();
    render(
      <ThemeToggle
        aria-label="Switch theme"
        className="consumer-class"
        data-testid="theme-toggle"
        id="theme-toggle-group"
        onKeyDown={onKeyDown}
        tabIndex={-1}
      />
    );

    const group = screen.getByRole("group", { name: "Switch theme" });
    expect(group).toHaveAttribute("data-testid", "theme-toggle");
    expect(group).toHaveAttribute("id", "theme-toggle-group");
    expect(group).toHaveAttribute("tabindex", "-1");
    expect(group).toHaveClass("toggleGroup", "sizeMd", "consumer-class");

    group.focus();
    await user.keyboard("{Escape}");
    expect(onKeyDown).toHaveBeenCalledOnce();
  });

  it("keeps native keyboard activation and focus order", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultMode="light">
        <ThemeToggle />
      </ThemeProvider>
    );

    const lightButton = screen.getByRole("button", { name: "Light mode" });
    const darkButton = screen.getByRole("button", { name: "Dark mode" });

    await user.tab();
    expect(lightButton).toHaveFocus();
    await user.tab();
    expect(darkButton).toHaveFocus();
    await user.keyboard(" ");
    expect(darkButton).toHaveAttribute("aria-pressed", "true");
  });

  it("resolves explicit size before the nearest component default", () => {
    const { rerender } = render(
      <ComponentDefaultsProvider value={{ controlSize: "lg" }}>
        <ThemeToggle />
      </ComponentDefaultsProvider>
    );
    expect(screen.getByRole("group", { name: "Theme toggle" })).toHaveClass("sizeLg");

    rerender(
      <ComponentDefaultsProvider value={{ controlSize: "lg" }}>
        <ThemeToggle size="sm" />
      </ComponentDefaultsProvider>
    );
    expect(screen.getByRole("group", { name: "Theme toggle" })).toHaveClass("sizeSm");
  });

  it("uses the fixed 28/32/40 action boxes and governed icon scale", () => {
    const expectedGeometry = [
      ["Sm", "28px", "14px"],
      ["Md", "32px", "16px"],
      ["Lg", "40px", "20px"],
    ] as const;

    for (const [size, box, icon] of expectedGeometry) {
      const prefix = size.toLowerCase();
      expect(compiledStyles).toContain(
        `--_fui-action-track: var(--fui-control-track-${prefix}, ${box});`
      );
      expect(compiledStyles).toContain(`inline-size: var(--fui-icon-${prefix}, ${icon});`);
      expect(compiledStyles).toContain(`block-size: var(--fui-icon-${prefix}, ${icon});`);
      expect(compiledStyles).toContain(`.size${size} .toggleButton`);
      expect(compiledStyles).toContain(`.size${size} .toggleButton svg`);
    }
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeToggle showSystem />
      </ThemeProvider>
    );

    await expectNoA11yViolations(container);
  });
});
