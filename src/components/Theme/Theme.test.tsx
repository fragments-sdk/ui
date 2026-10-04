import { describe, expect, it, vi } from "vitest";
import { act, render, screen, userEvent, waitFor } from "../../test/utils";
import { Popover } from "../Popover";
import { Theme, useTheme, useThemePortalProps } from "./index";

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

describe("Theme root", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-chrome");
    document.documentElement.removeAttribute("style");
    document.documentElement.classList.remove("light", "dark");
  });

  it("provides theme context to children", () => {
    function Consumer() {
      const { mode } = useTheme();
      return <span>Mode: {mode}</span>;
    }

    render(
      <Theme defaultMode="dark">
        <Consumer />
      </Theme>
    );

    expect(screen.getByText("Mode: dark")).toBeInTheDocument();
  });

  it("reads and writes data-theme on <html> outside a Theme", async () => {
    const user = userEvent.setup();
    function Consumer() {
      const { mode, resolvedMode, setMode, toggleMode } = useTheme();
      return (
        <>
          <span>
            Mode: {mode}, Resolved: {resolvedMode}
          </span>
          <button onClick={() => setMode("dark")}>Dark</button>
          <button onClick={() => setMode("system")}>System</button>
          <button onClick={toggleMode}>Next</button>
        </>
      );
    }

    render(<Consumer />);
    const root = document.documentElement;
    expect(screen.getByText("Mode: system, Resolved: light")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dark" }));
    await waitFor(() => expect(screen.getByText("Mode: dark, Resolved: dark")).toBeInTheDocument());
    expect(root).toHaveAttribute("data-theme", "dark");
    expect(root.style.colorScheme).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(screen.getByText(/Mode: system/)).toBeInTheDocument());
    expect(root).not.toHaveAttribute("data-theme");

    act(() => root.setAttribute("data-theme", "light"));
    await waitFor(() => expect(screen.getByText(/Mode: light/)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "System" }));
    await waitFor(() => expect(screen.getByText(/Mode: system/)).toBeInTheDocument());
  });

  it("steps toggleMode through system, light and dark", async () => {
    const user = userEvent.setup();
    render(
      <Theme defaultMode="system">
        <ModeButton label="Page" />
      </Theme>
    );
    for (const next of ["light", "dark", "system"]) {
      await user.click(screen.getByRole("button", { name: /^Page:/ }));
      await waitFor(() =>
        expect(screen.getByRole("button", { name: `Page: ${next}` })).toBeInTheDocument()
      );
    }
  });

  it("supports controlled mode", () => {
    function Consumer() {
      const { mode } = useTheme();
      return <span>Mode: {mode}</span>;
    }

    render(
      <Theme mode="light">
        <Consumer />
      </Theme>
    );

    expect(screen.getByText("Mode: light")).toBeInTheDocument();
  });

  it("restores transitions after a theme change", () => {
    {
      const root = document.documentElement;
      root.setAttribute("data-theme", "light");
      const originalStyles = new Set(document.head.querySelectorAll("style"));
      const frames: FrameRequestCallback[] = [];
      const requestFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((frame) => {
        frames.push(frame);
        return frames.length;
      });
      const addedStyles = () =>
        [...document.head.querySelectorAll("style")].filter((style) => !originalStyles.has(style));

      try {
        const { rerender } = render(<Theme mode="light">Content</Theme>);
        expect(addedStyles()).toHaveLength(0);
        expect(frames).toHaveLength(0);

        rerender(<Theme mode="dark">Content</Theme>);
        const [override] = addedStyles();
        expect(addedStyles()).toHaveLength(1);
        const rule = override.sheet?.cssRules[0] as CSSStyleRule;
        expect(rule.style.getPropertyValue("transition")).toBe("none");
        expect(rule.style.getPropertyPriority("transition")).toBe("important");
        expect(root).toHaveAttribute("data-theme", "dark");

        act(() => frames.shift()?.(0));
        expect(override.isConnected).toBe(true);
        act(() => frames.shift()?.(16));
        expect(override.isConnected).toBe(false);
        expect(frames).toHaveLength(0);
      } finally {
        requestFrame.mockRestore();
        addedStyles().forEach((style) => style.remove());
      }
    }
  });

  it("has one root name and no provider aliases", async () => {
    expect(Theme.Root).toBe(Theme);
    expect("Provider" in Theme).toBe(false);
    expect("Toggle" in Theme).toBe(false);
    expect("Button" in Theme).toBe(false);
    expect(Theme.useTheme).toBe(useTheme);
    const exports = await import("./index");
    expect("ThemeProvider" in exports).toBe(false);
  });

  it("drops the cut props at the type level", () => {
    const cut = () => [
      // @ts-expect-error defaultTheme was cut in v4; use defaultMode
      <Theme key="defaultTheme" defaultTheme="dark">
        Content
      </Theme>,
      // @ts-expect-error attribute was cut in v4; the mode is always data-theme
      <Theme key="attribute" attribute="class">
        Content
      </Theme>,
    ];
    expect(cut).toBeTypeOf("function");
  });

  it("hydrates an uncontrolled mode from the configured storage key", async () => {
    localStorageMock.setItem("product-theme", "dark");

    function Consumer() {
      const { mode } = useTheme();
      return <span>Mode: {mode}</span>;
    }

    render(
      <Theme defaultMode="light" storageKey="product-theme">
        <Consumer />
      </Theme>
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
      <Theme defaultMode="light" storageKey="persisted-theme">
        <Consumer />
      </Theme>
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

function ModeButton({ label }: { label: string }) {
  const { mode, toggleMode } = useTheme();
  return (
    <button onClick={toggleMode}>
      {label}: {mode}
    </button>
  );
}

function blockStorage(): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException("The operation is insecure.", "SecurityError");
    },
  });
  return () => {
    if (descriptor) Object.defineProperty(window, "localStorage", descriptor);
  };
}

describe("Theme storage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("style");
  });

  it("falls back to the system mode, silently, when storage access throws", async () => {
    const user = userEvent.setup();
    const restore = blockStorage();
    try {
      render(
        <Theme>
          <ModeButton label="Page" />
        </Theme>
      );
      await waitFor(() => {
        expect(document.documentElement).toHaveAttribute("data-theme", "light");
      });
      expect(screen.getByRole("button", { name: "Page: system" })).toBeInTheDocument();

      // Writing is blocked too; the mode still changes for this page.
      await user.click(screen.getByRole("button", { name: "Page: system" }));
      await user.click(screen.getByRole("button", { name: "Page: light" }));
      await waitFor(() => {
        expect(document.documentElement).toHaveAttribute("data-theme", "dark");
      });
    } finally {
      restore();
    }
  });

  it("ignores a stored value that is not a mode", async () => {
    localStorageMock.setItem("fui-theme", "sepia");
    render(
      <Theme defaultMode="dark">
        <ModeButton label="Page" />
      </Theme>
    );
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    });
    expect(screen.getByRole("button", { name: "Page: dark" })).toBeInTheDocument();
  });

  it("writes color-scheme inline on <html>, as ThemeScript does", async () => {
    document.documentElement.style.colorScheme = "dark";
    render(<Theme mode="light">Content</Theme>);
    await waitFor(() => {
      expect(document.documentElement.style.colorScheme).toBe("light");
    });
  });
});

describe("Theme inputs", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-chrome");
    document.documentElement.removeAttribute("style");
  });

  it("the root renders no element and writes its inputs on <html>", () => {
    const root = document.documentElement;
    const { container, unmount } = render(
      <Theme
        brand="#16a34a"
        neutral="paper"
        radius={8}
        scale={1.125}
        font="Inter, system-ui, sans-serif"
        pressScale={0.97}
        primaryChrome="ink"
        danger="#b91c1c"
      >
        <span data-testid="child" />
      </Theme>
    );

    expect(container.firstElementChild).toBe(screen.getByTestId("child"));
    expect(root.style.getPropertyValue("--fui-seed-brand")).toBe("#16a34a");
    expect(root.style.getPropertyValue("--fui-seed-neutral")).toBe("oklch(0.5 0.012 80)");
    expect(root.style.getPropertyValue("--fui-radius")).toBe("8px");
    expect(root.style.getPropertyValue("--fui-scale")).toBe("1.125");
    expect(root.style.getPropertyValue("--fui-font-sans")).toBe("Inter, system-ui, sans-serif");
    expect(root.style.getPropertyValue("--fui-press-scale")).toBe("0.97");
    expect(root.style.getPropertyValue("--fui-seed-danger")).toBe("#b91c1c");
    expect(root).toHaveAttribute("data-chrome", "ink");

    unmount();
    expect(root.style.getPropertyValue("--fui-seed-brand")).toBe("");
    expect(root.style.getPropertyValue("--fui-seed-neutral")).toBe("");
    expect(root).not.toHaveAttribute("data-chrome");
  });

  it("writes any CSS colour as the neutral, with no special names but paper", () => {
    const root = document.documentElement;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const { rerender } = render(<Theme neutral="oklch(0.5 0.02 250)">Content</Theme>);
      expect(root.style.getPropertyValue("--fui-seed-neutral")).toBe("oklch(0.5 0.02 250)");

      rerender(<Theme neutral="slategray">Content</Theme>);
      expect(root.style.getPropertyValue("--fui-seed-neutral")).toBe("slategray");
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});

describe("nested Theme", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-chrome");
    document.documentElement.removeAttribute("style");
  });

  it("renders a scope element with its own mode and inputs; the page keeps its own", async () => {
    const { container } = render(
      <Theme mode="light">
        <Theme mode="dark" brand="#16a34a" primaryChrome="ink" className="panel">
          <ModeButton label="Panel" />
        </Theme>
      </Theme>
    );

    const scope = container.querySelector<HTMLElement>("[data-fui-theme]");
    expect(scope).not.toBeNull();
    expect(scope).toHaveAttribute("data-theme", "dark");
    expect(scope).toHaveAttribute("data-chrome", "ink");
    expect(scope).toHaveClass("panel");
    expect(scope?.style.getPropertyValue("--fui-seed-brand")).toBe("#16a34a");
    expect(screen.getByRole("button", { name: "Panel: dark" })).toBeInTheDocument();
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "light");
    });
    expect(document.documentElement.style.getPropertyValue("--fui-seed-brand")).toBe("");
    expect(document.documentElement).not.toHaveAttribute("data-chrome");
  });

  it("owns a local mode only when it sets one, and never touches storage without a key", async () => {
    const user = userEvent.setup();
    render(
      <Theme defaultMode="light">
        <Theme defaultMode="dark">
          <ModeButton label="Panel" />
        </Theme>
      </Theme>
    );

    // dark steps to system: the panel's own mode, never the page's.
    await user.click(screen.getByRole("button", { name: "Panel: dark" }));
    expect(screen.getByRole("button", { name: "Panel: system" })).toBeInTheDocument();
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "light");
    });
    const keys = localStorageMock.setItem.mock.calls.map(([key]) => key);
    expect(new Set(keys)).toEqual(new Set(["fui-theme"]));
    expect(localStorageMock.setItem).not.toHaveBeenCalledWith("fui-theme", "dark");
  });

  it("passes the page's mode through when it sets no mode, and renders no element when it sets nothing", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Theme defaultMode="light">
        <Theme>
          <ModeButton label="Inner" />
        </Theme>
      </Theme>
    );

    expect(container.querySelector("[data-fui-theme]")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Inner: light" }));
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    });
  });

  it("hands portals the merged scope, so a popup re-derives like the panel it opened from", async () => {
    let outside: ReturnType<typeof useThemePortalProps> | null = null;
    let inside: ReturnType<typeof useThemePortalProps> | null = null;
    function Outside() {
      outside = useThemePortalProps();
      return null;
    }
    function Inside() {
      inside = useThemePortalProps();
      return null;
    }

    render(
      <Theme>
        <Outside />
        <Theme brand="#16a34a" primaryChrome="ink">
          <Theme mode="dark" scale={1.125}>
            <Inside />
            <Popover defaultOpen>
              <Popover.Trigger>Open</Popover.Trigger>
              <Popover.Content>
                <Popover.Body>Inside the panel</Popover.Body>
              </Popover.Content>
            </Popover>
          </Theme>
        </Theme>
      </Theme>
    );

    expect(outside).toEqual({});
    expect(inside).toEqual({
      "data-fui-theme": "",
      "data-theme": "dark",
      "data-chrome": "ink",
      style: { "--fui-seed-brand": "#16a34a", "--fui-scale": "1.125" },
    });

    const body = await screen.findByText("Inside the panel");
    const portal = body.closest<HTMLElement>("[data-fui-theme]");
    expect(portal).not.toBeNull();
    expect(portal?.closest("[data-fui-theme] [data-fui-theme]")).toBeNull();
    expect(portal).toHaveAttribute("data-theme", "dark");
    expect(portal).toHaveAttribute("data-chrome", "ink");
    expect(portal?.style.getPropertyValue("--fui-seed-brand")).toBe("#16a34a");
    expect(portal?.style.getPropertyValue("--fui-scale")).toBe("1.125");
  });

  it("hands portals the scope's font family when this scope or one above sets a font", () => {
    const seen: Record<
      "own" | "inherited" | "none",
      ReturnType<typeof useThemePortalProps> | null
    > = { own: null, inherited: null, none: null };
    function Own() {
      seen.own = useThemePortalProps();
      return null;
    }
    function Inherited() {
      seen.inherited = useThemePortalProps();
      return null;
    }
    function None() {
      seen.none = useThemePortalProps();
      return null;
    }

    render(
      <Theme>
        <Theme brand="#16a34a">
          <None />
        </Theme>
        <Theme font="Georgia, serif">
          <Own />
          <Theme mode="dark">
            <Inherited />
          </Theme>
        </Theme>
      </Theme>
    );

    expect(seen.own?.style).toEqual({
      "--fui-font-sans": "Georgia, serif",
      fontFamily: "var(--fui-font-sans)",
    });
    expect(seen.inherited?.style).toEqual({
      "--fui-font-sans": "Georgia, serif",
      fontFamily: "var(--fui-font-sans)",
    });
    expect(seen.none?.style).toEqual({ "--fui-seed-brand": "#16a34a" });
  });
});
