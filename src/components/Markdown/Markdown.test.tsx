import { describe, it, expect } from "vitest";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { compiledModuleRules } from "../../test/compiled-css";
import { Markdown, closeOpenFence } from "./index";

const cssText = compiledModuleRules("src/components/Markdown/Markdown.module.scss")
  .map((rule) => rule.cssText)
  .join("\n");

// Markdown resolves react-markdown with a dynamic import, so the first render
// on a page is always the plain-text fallback and the parsed output arrives a
// tick later. The synchronous assertions below therefore describe the fallback;
// the one that awaits describes the real thing.

describe("Markdown", () => {
  it("renders markdown content as paragraphs (fallback)", () => {
    render(<Markdown content="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("splits content into paragraphs on double newlines (fallback)", () => {
    const { container } = render(<Markdown content={"First paragraph\n\nSecond paragraph"} />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveTextContent("First paragraph");
    expect(paragraphs[1]).toHaveTextContent("Second paragraph");
  });

  it("applies custom className", () => {
    const { container } = render(<Markdown content="test" className="custom" />);
    expect(container.firstElementChild).toHaveClass("custom");
  });

  it("renders the wrapping div with markdown class", () => {
    const { container } = render(<Markdown content="test" />);
    expect(container.firstElementChild).toHaveClass("markdown");
  });

  it("forwards root DOM props to the wrapper", () => {
    render(<Markdown content="test" id="md-root" data-testid="markdown" />);
    const root = screen.getByTestId("markdown");
    expect(root).toHaveAttribute("id", "md-root");
  });

  it("renders parsed markdown once the parser resolves", async () => {
    render(<Markdown content={"# Heading\n\nSome **bold** text."} />);
    // A heading element is something only the real parser can produce — the
    // fallback emits every block as a <p>. This is the regression guard for
    // the require()-in-a-browser-bundle bug, which failed silently by looking
    // exactly like markdown that had not been written as markdown.
    expect(await screen.findByRole("heading", { name: "Heading" })).toBeInTheDocument();
    expect(await screen.findByText("bold")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Markdown content={"# Hello\n\nSome paragraph text.\n\nAnother paragraph."} />
    );
    await expectNoA11yViolations(container);
  });

  it("renders fences through CodeBlock", async () => {
    const { container } = render(<Markdown content={"Run it:\n\n```bash\npnpm install\n```"} />);
    await screen.findByText("Run it:");
    expect(container.querySelector('[data-language="bash"], [class*="codeBlock"]')).not.toBeNull();
  });

  it("wraps tables in a focusable region", async () => {
    render(<Markdown content={"| a | b |\n| - | - |\n| 1 | 2 |"} />);
    const region = await screen.findByRole("region", { name: "Table" });
    expect(region).toHaveAttribute("tabindex", "0");
  });

  it("closes an open fence while streaming and marks the region busy", () => {
    expect(closeOpenFence("Here:\n\n```ts\nconst a = 1;")).toBe(
      "Here:\n\n```ts\nconst a = 1;\n```"
    );
    expect(closeOpenFence("Done.\n\n```ts\nx\n```")).toBe("Done.\n\n```ts\nx\n```");
    const { container } = render(<Markdown content="Partial" streaming />);
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
  });

  it("reads the body at 12/18 in ink 1 and has no hover rule on links", () => {
    expect(cssText).toContain("--fui-type-body-compact-size");
    expect(cssText).toContain("--fui-text-primary");
    expect(cssText).not.toMatch(/a:hover/);
  });
});
