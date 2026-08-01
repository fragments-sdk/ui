import { describe, expect, it, vi } from "vitest";
import { render, screen, userEvent, waitFor } from "../../test/utils";
import { Theme, ThemeProvider, ThemeToggle, useTheme } from "./index";

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

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("light", "dark");
  });

  it("provides theme context to children", () => {
    function Consumer() {
      const { mode } = useTheme();
      return <span>Mode: {mode}</span>;
    }

    render(
      <ThemeProvider defaultMode="dark">
        <Consumer />
      </ThemeProvider>
    );

    expect(screen.getByText("Mode: dark")).toBeInTheDocument();
  });

  it("returns safe hook defaults outside a provider", () => {
    function Consumer() {
      const { mode, resolvedMode } = useTheme();
      return (
        <span>
          Mode: {mode}, Resolved: {resolvedMode}
        </span>
      );
    }

    render(<Consumer />);

    expect(screen.getByText("Mode: system, Resolved: light")).toBeInTheDocument();
  });

  it("supports controlled mode", () => {
    function Consumer() {
      const { mode } = useTheme();
      return <span>Mode: {mode}</span>;
    }

    render(
      <ThemeProvider mode="light">
        <Consumer />
      </ThemeProvider>
    );

    expect(screen.getByText("Mode: light")).toBeInTheDocument();
  });

  it("preserves the public compound and named export identities", () => {
    expect(Theme).toBe(ThemeProvider);
    expect(Theme.Root).toBe(ThemeProvider);
    expect(Theme.Provider).toBe(ThemeProvider);
    expect(Theme.Toggle).toBe(ThemeToggle);
    expect(Theme.useTheme).toBe(useTheme);
  });

  it("hydrates an uncontrolled mode from the configured storage key", async () => {
    localStorageMock.setItem("product-theme", "dark");

    function Consumer() {
      const { mode } = useTheme();
      return <span>Mode: {mode}</span>;
    }

    render(
      <ThemeProvider defaultMode="light" storageKey="product-theme">
        <Consumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Mode: dark")).toBeInTheDocument();
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    });
    expect(localStorageMock.getItem).toHaveBeenCalledWith("product-theme");
  });

  it("persists mode changes and applies the selected DOM attribute", async () => {
    const user = userEvent.setup();

    function Consumer() {
      const { mode, toggleMode } = useTheme();
      return <button onClick={toggleMode}>Mode: {mode}</button>;
    }

    render(
      <ThemeProvider defaultMode="light" storageKey="persisted-theme">
        <Consumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith("persisted-theme", "light");
    });
    localStorageMock.setItem.mockClear();

    await user.click(screen.getByRole("button", { name: "Mode: light" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Mode: dark" })).toBeInTheDocument();
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("persisted-theme", "dark");
    });
  });
});
