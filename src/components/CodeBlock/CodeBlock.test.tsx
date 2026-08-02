import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from "../../test/utils";
import { CodeBlock } from "./index";
import styles from "./CodeBlock.module.scss";

vi.mock("shiki", () => ({
  codeToHtml: vi.fn(async (code: string) => `<pre class="shiki"><code>${code}</code></pre>`),
}));

async function waitForHighlight(container: HTMLElement) {
  await waitFor(() => expect(container.querySelector("pre.shiki")).toBeInTheDocument());
}

describe("CodeBlock", () => {
  it("renders pre and code elements", async () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    // Initially shows loading state with pre/code
    expect(container.querySelector("pre")).toBeInTheDocument();
    expect(container.querySelector("code")).toBeInTheDocument();
  });

  it("exposes stable styling slots without adding public props", async () => {
    const { container } = render(
      <CodeBlock code="const x = 1;" title="Example" data-testid="code-example" />
    );

    const root = screen.getByTestId("code-example");
    expect(root).toHaveAttribute("data-slot", "code-block");
    expect(root).toContainElement(container.querySelector('[data-slot="code-block-frame"]'));
    expect(root).toContainElement(container.querySelector('[data-slot="code-block-title"]'));
    await waitForHighlight(container);
  });

  it("renders a copy button by default", async () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    expect(screen.getByRole("button", { name: /copy code/i })).toBeInTheDocument();
    await waitForHighlight(container);
  });

  it("uses overlay copy placement by default when filename is not provided", async () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    expect(container.querySelector(`.${styles.header}`)).not.toBeInTheDocument();
    expect(container.querySelector(`.${styles.copyOverlay}`)).toBeInTheDocument();
    await waitForHighlight(container);
  });

  it("hides copy button when showCopy is false", async () => {
    const { container } = render(<CodeBlock code="const x = 1;" showCopy={false} />);
    expect(screen.queryByRole("button", { name: /copy/i })).not.toBeInTheDocument();
    await waitForHighlight(container);
  });

  it("shows language-highlighted content after shiki resolves", async () => {
    const { container } = render(<CodeBlock code="const x = 1;" language="typescript" />);
    await waitFor(() => {
      // shiki wraps output in a pre.shiki element with syntax-highlighted spans
      const shikiPre = container.querySelector("pre.shiki");
      expect(shikiPre).toBeInTheDocument();
      expect(shikiPre?.querySelector("code")).toBeInTheDocument();
    });
  });

  it("renders title and caption when provided", async () => {
    const { container } = render(
      <CodeBlock code="x = 1" title="Example" caption="A simple example" />
    );
    expect(screen.getByText("Example")).toBeInTheDocument();
    expect(screen.getByText("A simple example")).toBeInTheDocument();
    await waitForHighlight(container);
  });

  it("renders filename in header", async () => {
    const { container } = render(<CodeBlock code="x = 1" filename="app.ts" />);
    expect(screen.getByText("app.ts")).toBeInTheDocument();
    expect(container.querySelector(`.${styles.header}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.copyOverlay}`)).not.toBeInTheDocument();
    await waitForHighlight(container);
  });

  it("supports explicit copy placement variants", async () => {
    const { container: headerContainer } = render(
      <CodeBlock code="const x = 1;" copyPlacement="header" />
    );
    expect(headerContainer.querySelector(`.${styles.header}`)).toBeInTheDocument();
    expect(headerContainer.querySelector(`.${styles.copyOverlay}`)).not.toBeInTheDocument();

    const { container: overlayContainer } = render(
      <CodeBlock code="const x = 1;" copyPlacement="overlay" filename="app.tsx" />
    );
    expect(overlayContainer.querySelector(`.${styles.header}`)).toBeInTheDocument();
    expect(overlayContainer.querySelector(`.${styles.copyOverlay}`)).toBeInTheDocument();
    await waitForHighlight(headerContainer);
    await waitForHighlight(overlayContainer);
  });

  it("copies code to clipboard on copy button click", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<CodeBlock code="const x = 1;" />);
    await user.click(screen.getByRole("button", { name: /copy code/i }));
    expect(writeText).toHaveBeenCalledWith("const x = 1;");
  });

  it("normalizes indentation and wraps long JSX tags before copying", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(
      <CodeBlock
        code={`
<Chart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} dataKey="users" type="monotone" stroke="var(--fui-color-info)" />
        `}
      />
    );
    await user.click(screen.getByRole("button", { name: /copy code/i }));

    expect(writeText).toHaveBeenCalledWith(`<Chart
  data={data}
  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
  dataKey="users"
  type="monotone"
  stroke="var(--fui-color-info)"
/>`);
  });

  it("keeps the first indentation level in YAML, whose meaning depends on it", async () => {
    // The JSX heuristic excludes line 0 from the common-indent calculation.
    // normalizeCode trims first, so line 0 is always at column 0 by then, which
    // used to strip one real level off any single-root YAML block and publish an
    // invalid file. `image` must stay nested under the job, not become a sibling.
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(
      <CodeBlock
        language="yaml"
        code={`fragments_governance:
  image: node:22
  artifacts:
    reports:
      codequality: gl-code-quality-report.json`}
      />
    );
    await user.click(screen.getByRole("button", { name: /copy code/i }));

    expect(writeText).toHaveBeenCalledWith(`fragments_governance:
  image: node:22
  artifacts:
    reports:
      codequality: gl-code-quality-report.json`);
  });

  it("still dedents inline JSX whose body carries the source file indentation", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(
      <CodeBlock
        code={`<Card>
      <Card.Header>Title</Card.Header>
    </Card>`}
      />
    );
    await user.click(screen.getByRole("button", { name: /copy code/i }));

    expect(writeText).toHaveBeenCalledWith(`<Card>
  <Card.Header>Title</Card.Header>
</Card>`);
  });

  it("supports collapsible mode", async () => {
    const user = userEvent.setup();
    const longCode = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join("\n");
    render(<CodeBlock code={longCode} collapsible defaultCollapsed collapsedLines={5} />);
    // Should show expand button
    const expandBtn = screen.getByRole("button", { name: /expand code/i });
    expect(expandBtn).toBeInTheDocument();
    expect(expandBtn).toHaveAttribute("aria-expanded", "false");

    await user.click(expandBtn);
    const collapseBtn = screen.getByRole("button", { name: /collapse code/i });
    expect(collapseBtn).toHaveAttribute("aria-expanded", "true");
  });

  it("supports controlled tabbed mode with explicit tab values", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <CodeBlock.Tabbed
        value="js"
        onValueChange={onValueChange}
        tabs={[
          { label: "Example", value: "ts", language: "typescript", code: "const tsValue = 1;" },
          { label: "Example", value: "js", language: "javascript", code: "const jsValue = 1;" },
        ]}
      />
    );

    expect(screen.getByText("const jsValue = 1;")).toBeInTheDocument();
    const tabs = screen.getAllByRole("tab", { name: "Example" });
    await user.click(tabs[0]);
    expect(onValueChange).toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    await waitForHighlight(container);
    await expectNoA11yViolations(container);
  });
});
