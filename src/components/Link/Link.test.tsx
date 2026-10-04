import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Link } from "./index";

const linkStyles = readFileSync(
  resolve(process.cwd(), "src/components/Link/Link.module.scss"),
  "utf8"
);

describe("Link", () => {
  it("renders an anchor element", () => {
    render(<Link href="/page">Go</Link>);
    const link = screen.getByRole("link", { name: "Go" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/page");
  });

  it("defaults to the accent tone and takes neutral", () => {
    const { rerender } = render(<Link href="#">Plain</Link>);
    expect(screen.getByRole("link")).toHaveClass("link", "toneAccent");

    rerender(
      <Link href="#" tone="neutral">
        Quiet
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("toneNeutral");
  });

  it("is always underlined at the shared offset, with neutral at ink 1", () => {
    expect(linkStyles).toContain("text-decoration-line: underline");
    expect(linkStyles).toContain("--fui-link-underline-offset");
    expect(linkStyles).toContain("text-decoration-thickness: var(--fui-stroke-hairline");
    expect(linkStyles).toMatch(/\.toneNeutral\s*\{\s*color: var\(--fui-text-primary/);
    expect(linkStyles).not.toContain("--fui-text-secondary");
    expect(linkStyles).not.toMatch(/--fui-color-accent\b|underline-none|interactive-base/);
  });

  it("adds external link attributes", () => {
    render(
      <Link href="https://example.com" external>
        External
      </Link>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(
      <Link ref={ref} href="#">
        Ref
      </Link>
    );
    expect(ref).toHaveBeenCalled();
  });

  it("moves the look and props onto a rendered element", async () => {
    const user = userEvent.setup();
    const ownClick = vi.fn();
    const linkClick = vi.fn();

    render(
      <Link
        tone="neutral"
        onClick={linkClick}
        render={<a href="/test" className="custom-class" onClick={ownClick} />}
      >
        Test
      </Link>
    );
    const link = screen.getByRole("link", { name: "Test" });
    expect(link).toHaveClass("link", "toneNeutral", "custom-class");
    expect(link).toHaveAttribute("href", "/test");

    await user.click(link);
    expect(ownClick).toHaveBeenCalledTimes(1);
    expect(linkClick).toHaveBeenCalledTimes(1);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Link href="/page">Accessible link</Link>);
    await expectNoA11yViolations(container);
  });
});
