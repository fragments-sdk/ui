import { Activity } from "react";
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

  it("highlights with the css-variables theme and never pins data-theme", async () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    const root = container.querySelector('[data-slot="code-block"]');
    expect(root).not.toHaveAttribute("data-theme");
    const { codeToHtml } = await import("shiki");
    await waitForHighlight(container);
    expect(codeToHtml).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ theme: expect.objectContaining({ name: "css-variables" }) })
    );
  });

  it("names its language, size and slots on the root", async () => {
    const { container } = render(
      <CodeBlock code="echo hi" language="bash" size="sm" title="install.sh" data-testid="cb" />
    );
    const root = screen.getByTestId("cb");
    expect(root).toHaveAttribute("data-slot", "code-block");
    expect(root).toHaveAttribute("data-language", "bash");
    expect(root).toHaveAttribute("data-size", "sm");
    expect(root).toContainElement(container.querySelector('[data-slot="code-block-header"]'));
    expect(root).toContainElement(container.querySelector('[data-slot="code-block-code"]'));
    await waitForHighlight(container);
  });

  it("shows plain code with no highlight until shiki resolves", async () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    const root = container.querySelector('[data-slot="code-block"]');
    expect(root).not.toHaveAttribute("data-highlighted");
    expect(container.querySelector("pre code")).toHaveTextContent("const x = 1;");
    await waitForHighlight(container);
    expect(root).toHaveAttribute("data-highlighted");
  });

  it("renders a visible copy action by default, over the code without a title", async () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    expect(screen.getByRole("button", { name: "Copy code" })).toBeVisible();
    expect(container.querySelector('[data-slot="code-block"]')).toHaveAttribute(
      "data-copy",
      "overlay"
    );
    expect(container.querySelector(`.${styles.header}`)).not.toBeInTheDocument();
    await waitForHighlight(container);
  });

  it("puts the title and the copy action in the header", async () => {
    const { container } = render(<CodeBlock code="x = 1" title="app.ts" />);
    const header = container.querySelector(`.${styles.header}`);
    expect(header).toHaveTextContent("app.ts");
    expect(header).toContainElement(screen.getByRole("button", { name: "Copy code" }));
    expect(screen.getByRole("region", { name: "app.ts" })).toHaveAttribute("tabindex", "0");
    await waitForHighlight(container);
  });

  it("hides the copy action when showCopy is false", async () => {
    const { container } = render(<CodeBlock code="const x = 1;" showCopy={false} />);
    expect(screen.queryByRole("button", { name: /copy/i })).not.toBeInTheDocument();
    await waitForHighlight(container);
  });

  it("shows language-highlighted content after shiki resolves", async () => {
    const { container } = render(<CodeBlock code="const x = 1;" language="typescript" />);
    await waitFor(() => {
      const shikiPre = container.querySelector("pre.shiki");
      expect(shikiPre).toBeInTheDocument();
      expect(shikiPre?.querySelector("code")).toBeInTheDocument();
    });
  });

  it("announces Copied, then clears", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onCopy = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<CodeBlock code="const x = 1;" onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
    expect(screen.getByRole("status")).toHaveAttribute("data-state", "copied");
    expect(onCopy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(""), {
      timeout: 3000,
    });
  });

  it("still clears Copied after its effects disconnect and reconnect", async () => {
    // Hiding the block (or a development remount) runs the effects' cleanup but keeps the
    // state, so the timer that clears the words has to come back with the effects.
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });

    const block = (mode: "visible" | "hidden") => (
      <Activity mode={mode}>
        <CodeBlock code="const x = 1;" />
      </Activity>
    );
    const { rerender } = render(block("visible"));
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
    rerender(block("hidden"));
    rerender(block("visible"));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(""), {
      timeout: 3000,
    });
  });

  it("says Couldn't copy when the clipboard refuses", async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onCopy = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      writable: true,
      configurable: true,
    });

    render(<CodeBlock code="const x = 1;" onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(screen.getByRole("status")).toHaveTextContent("Couldn\u2019t copy");
    expect(screen.getByRole("status")).toHaveAttribute("data-state", "failed");
    expect(onCopy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
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
    await user.click(screen.getByRole("button", { name: "Copy code" }));
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
    await user.click(screen.getByRole("button", { name: "Copy code" }));

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
    await user.click(screen.getByRole("button", { name: "Copy code" }));

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
    await user.click(screen.getByRole("button", { name: "Copy code" }));

    expect(writeText).toHaveBeenCalledWith(`<Card>
  <Card.Header>Title</Card.Header>
</Card>`);
  });

  it("folds long code behind one Show more bar", async () => {
    const user = userEvent.setup();
    const longCode = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join("\n");
    const { container } = render(
      <CodeBlock code={longCode} collapsible defaultCollapsed collapsedLines={5} />
    );
    const expand = screen.getByRole("button", { name: "Show 15 more lines" });
    expect(expand).toHaveAttribute("aria-expanded", "false");
    expect(expand).toHaveAttribute(
      "aria-controls",
      container.querySelector('[data-slot="code-block-code"]')?.id
    );
    expect(container.querySelector("pre")).not.toHaveTextContent("line 6");

    await user.click(expand);
    const collapse = screen.getByRole("button", { name: "Show less" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    expect(container.querySelector("pre")).toHaveTextContent("line 20");
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

  it("forwards collapse props to every tabbed panel", () => {
    const longCode = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join("\n");
    render(
      <CodeBlock.Tabbed
        collapsible
        defaultCollapsed
        collapsedLines={5}
        tabs={[
          { label: "A", language: "text", code: longCode },
          { label: "B", language: "text", code: longCode },
        ]}
      />
    );
    const expandBtn = screen.getByRole("button", { name: "Show 15 more lines" });
    expect(expandBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    await waitForHighlight(container);
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with a title, line numbers and a fold", async () => {
    const longCode = Array.from({ length: 8 }, (_, i) => `line ${i + 1}`).join("\n");
    const { container } = render(
      <CodeBlock code={longCode} title="lines.txt" showLineNumbers collapsible collapsedLines={3} />
    );
    await waitForHighlight(container);
    await expectNoA11yViolations(container);
  });
});
