import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, render, screen, userEvent } from "../../test/utils";
import { ThemeProvider } from "../Theme";
import { ThemeButton } from "./ThemeButton";

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

describe("ThemeButton", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("renders a single icon button that toggles the resolved theme", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultMode="light">
        <ThemeButton />
      </ThemeProvider>
    );

    const button = screen.getByRole("button", { name: "Switch to dark mode" });
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Light mode" })).not.toBeInTheDocument();

    await user.click(button);
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });

  it("uses the resolved mode in controlled usage and reports the next mode", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ThemeProvider defaultMode="light">
        <ThemeButton value="dark" onValueChange={onValueChange} />
      </ThemeProvider>
    );

    await user.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(onValueChange).toHaveBeenCalledWith("light");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ThemeProvider defaultMode="light">
        <ThemeButton />
      </ThemeProvider>
    );
    await expectNoA11yViolations(container);
  });
});
