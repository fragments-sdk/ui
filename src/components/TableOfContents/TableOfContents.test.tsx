import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as sass from "sass";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { TableOfContents } from "./index";

const tableOfContentsStyles = readFileSync(
  resolve(process.cwd(), "src/components/TableOfContents/TableOfContents.module.scss"),
  "utf8"
);

function classDeclarations(source: string, className: string) {
  const match = new RegExp(`\\.${className}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(source);
  expect(match, `Expected .${className} in stylesheet`).not.toBeNull();
  return match![1].replace(/\s+/g, " ").trim();
}

describe("TableOfContents", () => {
  it("renders a nav landmark with default aria-label", () => {
    render(
      <TableOfContents>
        <TableOfContents.Item targetId="intro">Intro</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByRole("navigation", { name: "Table of contents" })).toBeInTheDocument();
  });

  it('renders the default "On this page" title', () => {
    render(
      <TableOfContents>
        <TableOfContents.Item targetId="intro">Intro</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByText("On this page")).toBeInTheDocument();
  });

  it("renders a custom title", () => {
    render(
      <TableOfContents title="Contents">
        <TableOfContents.Item targetId="intro">Intro</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByText("Contents")).toBeInTheDocument();
    expect(screen.queryByText("On this page")).not.toBeInTheDocument();
  });

  it("shows no title when title is null", () => {
    render(
      <TableOfContents title={null}>
        <TableOfContents.Item targetId="intro">Intro</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.queryByText("On this page")).not.toBeInTheDocument();
  });

  it("renders a custom aria-label", () => {
    render(
      <TableOfContents label="Page sections">
        <TableOfContents.Item targetId="intro">Intro</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByRole("navigation", { name: "Page sections" })).toBeInTheDocument();
  });

  it("renders items as links with correct href", () => {
    render(
      <TableOfContents>
        <TableOfContents.Item targetId="setup">Setup</TableOfContents.Item>
        <TableOfContents.Item targetId="props">Props</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByRole("link", { name: "Setup" })).toHaveAttribute("href", "#setup");
    expect(screen.getByRole("link", { name: "Props" })).toHaveAttribute("href", "#props");
  });

  it("points an item without targetId or href nowhere and leaves the click alone", () => {
    const onClick = vi.fn();
    render(
      <TableOfContents>
        <TableOfContents.Item onClick={onClick}>Loose</TableOfContents.Item>
      </TableOfContents>
    );
    fireEvent.click(screen.getByText("Loose"));
    expect(onClick.mock.calls[0][0].defaultPrevented).toBe(false);
  });

  it("routes items with an explicit href instead of an in-page anchor", () => {
    const onClick = vi.fn();
    render(
      <TableOfContents>
        <TableOfContents.Item targetId="link" href="/components/link" onClick={onClick}>
          Link
        </TableOfContents.Item>
      </TableOfContents>
    );
    const link = screen.getByRole("link", { name: "Link" });
    expect(link).toHaveAttribute("href", "/components/link");
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0].defaultPrevented).toBe(false);
  });

  it("marks active item with aria-current", () => {
    render(
      <TableOfContents>
        <TableOfContents.Item targetId="setup" active>
          Setup
        </TableOfContents.Item>
        <TableOfContents.Item targetId="props">Props</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByRole("link", { name: "Setup" })).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Props" })).not.toHaveAttribute("aria-current");
  });

  it("scrolls to heading on click", async () => {
    const scrollIntoViewMock = vi.fn();
    const heading = document.createElement("h2");
    heading.id = "setup";
    heading.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(heading);

    const user = userEvent.setup();
    render(
      <TableOfContents>
        <TableOfContents.Item targetId="setup">Setup</TableOfContents.Item>
      </TableOfContents>
    );

    await user.click(screen.getByRole("link", { name: "Setup" }));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });

    document.body.removeChild(heading);
  });

  it("disables smooth scrolling when reduced motion is requested", async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    const scrollIntoViewMock = vi.fn();
    const heading = document.createElement("h2");
    heading.id = "reduced-motion";
    heading.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(heading);

    try {
      const user = userEvent.setup();
      render(
        <TableOfContents>
          <TableOfContents.Item targetId="reduced-motion">Reduced motion</TableOfContents.Item>
        </TableOfContents>
      );

      await user.click(screen.getByRole("link", { name: "Reduced motion" }));
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "auto" });
    } finally {
      document.body.removeChild(heading);
      window.matchMedia = originalMatchMedia;
    }
  });

  it("allows item onClick to prevent smooth-scroll behavior", async () => {
    const scrollIntoViewMock = vi.fn();
    const heading = document.createElement("h2");
    heading.id = "setup";
    heading.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(heading);

    const user = userEvent.setup();
    render(
      <TableOfContents>
        <TableOfContents.Item targetId="setup" onClick={(e) => e.preventDefault()}>
          Setup
        </TableOfContents.Item>
      </TableOfContents>
    );

    await user.click(screen.getByRole("link", { name: "Setup" }));
    expect(scrollIntoViewMock).not.toHaveBeenCalled();

    document.body.removeChild(heading);
  });

  it("forwards root DOM props and preserves merged className", () => {
    const { container } = render(
      <TableOfContents id="toc" data-testid="toc" className="custom-class">
        <TableOfContents.Item targetId="a">A</TableOfContents.Item>
      </TableOfContents>
    );
    const nav = screen.getByRole("navigation", { name: "Table of contents" });
    expect(nav).toHaveAttribute("id", "toc");
    expect(nav).toHaveAttribute("data-testid", "toc");
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("renders items in a list", () => {
    render(
      <TableOfContents>
        <TableOfContents.Item targetId="a">A</TableOfContents.Item>
        <TableOfContents.Item targetId="b">B</TableOfContents.Item>
        <TableOfContents.Item targetId="c">C</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getAllByRole("list")).toHaveLength(1);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders nothing without items", () => {
    const { container } = render(<TableOfContents>{null}</TableOfContents>);
    expect(container.querySelector("nav")).not.toBeInTheDocument();
  });

  it("keeps the index flush and contains no unreachable rail implementation", () => {
    const list = classDeclarations(tableOfContentsStyles, "list");
    const title = classDeclarations(tableOfContentsStyles, "title");

    expect(list).toContain("padding: var(--fui-raw-space-0, #{measurements.raw-space(0)});");
    expect(list).not.toContain("padding-left:");
    expect(list).toContain("gap: var(--fui-raw-space-2, #{measurements.raw-space(2)});");
    expect(title).toContain(
      "padding-inline: var(--fui-navigation-inline-inset, #{navigation.gutter()});"
    );
    expect(tableOfContentsStyles).not.toContain("$rail-");
    expect(tableOfContentsStyles).not.toContain("--toc-rail");
    expect(tableOfContentsStyles).toContain("@include navigation.row;");
    expect(tableOfContentsStyles).toContain("@include navigation.section-row;");
    // The `--fui-toc-*` host hooks were deleted in Wave 0: rows read the shared
    // navigation hooks directly and nothing outside the kit set them.
    expect(tableOfContentsStyles).not.toContain("--fui-toc-");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <TableOfContents>
        <TableOfContents.Item targetId="intro">Introduction</TableOfContents.Item>
        <TableOfContents.Item targetId="setup" active>
          Setup
        </TableOfContents.Item>
        <TableOfContents.Group label="Reference">
          <TableOfContents.Item targetId="api">API reference</TableOfContents.Item>
        </TableOfContents.Group>
        <TableOfContents.Item targetId="examples">Examples</TableOfContents.Item>
      </TableOfContents>
    );
    await expectNoA11yViolations(container);
  });

  describe("Group", () => {
    it("renders the group label and nested items", () => {
      render(
        <TableOfContents title={null}>
          <TableOfContents.Item targetId="overview">Overview</TableOfContents.Item>
          <TableOfContents.Group label="Primitives">
            <TableOfContents.Item targetId="button">Button</TableOfContents.Item>
            <TableOfContents.Item targetId="card">Card</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      expect(screen.getByRole("button", { name: /primitives/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Button" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Card" })).toBeInTheDocument();
    });

    it("starts open by default and toggles closed on click", async () => {
      const user = userEvent.setup();
      render(
        <TableOfContents title={null}>
          <TableOfContents.Group label="Custom">
            <TableOfContents.Item targetId="features">Features</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      const trigger = screen.getByRole("button", { name: /custom/i });
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("link", { name: "Features" })).toBeInTheDocument();

      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("link", { name: "Features" })).not.toBeInTheDocument();
    });

    it("respects defaultOpen=false", () => {
      render(
        <TableOfContents title={null}>
          <TableOfContents.Group label="Custom" defaultOpen={false}>
            <TableOfContents.Item targetId="features">Features</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      expect(screen.getByRole("button", { name: /custom/i })).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(screen.queryByRole("link", { name: "Features" })).not.toBeInTheDocument();
    });

    it("supports controlled open + onOpenChange", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <TableOfContents title={null}>
          <TableOfContents.Group label="Custom" open={true} onOpenChange={onOpenChange}>
            <TableOfContents.Item targetId="features">Features</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      await user.click(screen.getByRole("button", { name: /custom/i }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
      // Stays open because controlled
      expect(screen.getByRole("button", { name: /custom/i })).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(screen.getByRole("link", { name: "Features" })).toBeInTheDocument();
    });

    it("renders a non-interactive header when collapsible=false", () => {
      render(
        <TableOfContents title={null}>
          <TableOfContents.Group label="Always Open" collapsible={false}>
            <TableOfContents.Item targetId="x">X</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      expect(screen.queryByRole("button", { name: /always open/i })).not.toBeInTheDocument();
      expect(screen.getByText("Always Open")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "X" })).toBeInTheDocument();
    });

    it("nests the group's items in their own list under the header", () => {
      render(
        <TableOfContents title={null}>
          <TableOfContents.Item targetId="overview">Overview</TableOfContents.Item>
          <TableOfContents.Group label="Primitives">
            <TableOfContents.Item targetId="button">Button</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      expect(screen.getAllByRole("list")).toHaveLength(2);
      const groupRow = screen.getByRole("button", { name: /primitives/i }).closest("li");
      expect(groupRow).toHaveAttribute("data-depth", "0");
      expect(groupRow).toContainElement(screen.getByRole("link", { name: "Button" }));
    });

    it("indents nested groups one more step and stops at the deepest step", () => {
      render(
        <TableOfContents title={null}>
          <TableOfContents.Group label="One">
            <TableOfContents.Group label="Two">
              <TableOfContents.Group label="Three">
                <TableOfContents.Group label="Four">
                  <TableOfContents.Item targetId="deep">Deep</TableOfContents.Item>
                </TableOfContents.Group>
              </TableOfContents.Group>
            </TableOfContents.Group>
          </TableOfContents.Group>
        </TableOfContents>
      );
      expect(screen.getByRole("button", { name: "Two" }).closest("li")).toHaveAttribute(
        "data-depth",
        "1"
      );
      expect(screen.getByRole("link", { name: "Deep" }).closest("li")).toHaveAttribute(
        "data-depth",
        "3"
      );
    });

    it("inherits depth=1 for nested items inside a Group", () => {
      render(
        <TableOfContents title={null}>
          <TableOfContents.Group label="Primitives">
            <TableOfContents.Item targetId="button">Button</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      const nestedItem = screen.getByRole("link", { name: "Button" }).closest("li");
      expect(nestedItem).toHaveAttribute("data-depth", "1");
    });

    it("renders trailing content (e.g., a count) on the group header", () => {
      render(
        <TableOfContents title={null}>
          <TableOfContents.Group label="Custom" trailing={<span data-testid="count">140</span>}>
            <TableOfContents.Item targetId="x">X</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      expect(screen.getByTestId("count")).toHaveTextContent("140");
    });

    it("has no accessibility violations with nested groups", async () => {
      const { container } = render(
        <TableOfContents>
          <TableOfContents.Item targetId="all" active>
            All
          </TableOfContents.Item>
          <TableOfContents.Group label="Primitives">
            <TableOfContents.Item targetId="button">Button</TableOfContents.Item>
            <TableOfContents.Item targetId="card">Card</TableOfContents.Item>
          </TableOfContents.Group>
          <TableOfContents.Group label="Custom" defaultOpen={false}>
            <TableOfContents.Item targetId="features">Features</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      await expectNoA11yViolations(container);
    });
  });
});

describe("TableOfContents group label styles", () => {
  const css = sass
    .compile(resolve(process.cwd(), "src/components/TableOfContents/TableOfContents.module.scss"), {
      style: "expanded",
    })
    .css.replace(/\s+/g, " ");

  it("sets a group name at the section label role: caption size, semibold", () => {
    expect(css).toMatch(
      /\.groupHeader \{[^}]*font-size: var\(--fui-type-caption-size[^}]*font-weight: var\(--fui-font-weight-semibold/
    );
  });
});
