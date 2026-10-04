import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen, act, expectNoA11yViolations } from "../../test/utils";
import { Avatar, type AvatarProps } from "./index";

const avatarStyles = readFileSync(
  resolve(process.cwd(), "src/components/Avatar/Avatar.module.scss"),
  "utf8"
);

describe("Avatar", () => {
  it("renders an image when src is provided", () => {
    render(<Avatar src="https://example.com/photo.jpg" alt="Jane Doe" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
    expect(img).toHaveAttribute("alt", "Jane Doe");
  });

  it("renders initials from the name prop when no src", () => {
    render(<Avatar name="John Smith" />);
    expect(screen.getByText("JS")).toBeInTheDocument();
  });

  it("renders explicit initials prop over name-derived initials", () => {
    render(<Avatar name="John Smith" initials="AB" />);
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("renders an explicit fallback after initials and before the generic icon", () => {
    const { rerender } = render(<Avatar fallback={<span data-testid="fallback">?</span>} />);
    expect(screen.getByTestId("fallback")).toBeInTheDocument();

    rerender(<Avatar initials="AB" fallback={<span data-testid="fallback">?</span>} />);
    expect(screen.getByText("AB")).toBeInTheDocument();
    expect(screen.queryByTestId("fallback")).not.toBeInTheDocument();
  });

  it("keeps the root accessible label when rendering a custom fallback", () => {
    render(<Avatar alt="Anonymous user" fallback="?" />);
    expect(screen.getByRole("img", { name: "Anonymous user" })).toHaveTextContent("?");
  });

  it("renders Avatar.Group and limits visible avatars with max", () => {
    render(
      <Avatar.Group max={2}>
        <Avatar name="Alice" />
        <Avatar name="Bob" />
        <Avatar name="Charlie" />
        <Avatar name="Diana" />
      </Avatar.Group>
    );
    // 2 visible + 1 overflow indicator
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "2 more people" })).toBeInTheDocument();
  });

  it("defaults to the 24px track and takes the control-track sizes", () => {
    const { rerender } = render(<Avatar name="Jane Doe" data-testid="avatar" />);
    expect(screen.getByTestId("avatar")).toHaveClass("avatar", "xs");
    rerender(<Avatar name="Jane Doe" size="lg" data-testid="avatar" />);
    expect(screen.getByTestId("avatar")).toHaveClass("lg");
  });

  it("paints initials on the accent's soft fill, and only initials", () => {
    const { rerender } = render(<Avatar name="Jane Doe" data-testid="avatar" />);
    expect(screen.getByTestId("avatar")).toHaveClass("named");
    rerender(<Avatar alt="Anonymous" data-testid="avatar" />);
    expect(screen.getByTestId("avatar")).not.toHaveClass("named");
    rerender(<Avatar src="https://example.com/photo.jpg" alt="Jane" data-testid="avatar" />);
    expect(screen.getByTestId("avatar")).not.toHaveClass("named");
  });

  it("draws the placeholder glyph as an icon when nothing else is known", () => {
    const { container } = render(<Avatar alt="Unknown user" />);
    const glyph = container.querySelector("svg.fallbackIcon");
    expect(glyph).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("path[d^='M12 12c2.21']")).toBeNull();
  });

  it("is a rounded square on the indicator corner, never a circle or a raw colour", () => {
    expect(avatarStyles).toContain("border-radius: var(--fui-radius-indicator");
    expect(avatarStyles).toContain("var(--fui-color-accent-tint");
    expect(avatarStyles).toContain("var(--fui-color-accent-text");
    expect(avatarStyles).not.toMatch(/radius-full|bg-tertiary|text-inverse/);
  });

  it("drops the cut props from the API", () => {
    // @ts-expect-error shape was cut at v4: every avatar is a rounded square
    const shaped: AvatarProps = { name: "A", shape: "circle" };
    // @ts-expect-error color was cut at v4: initials take the accent's soft fill
    const coloured: AvatarProps = { name: "A", color: "#f00" };
    // @ts-expect-error customSize was cut at v4: sizes sit on the control tracks
    const custom: AvatarProps = { name: "A", customSize: 36 };
    // @ts-expect-error xl was cut at v4: the tracks end at 40
    const huge: AvatarProps = { name: "A", size: "xl" };
    expect([shaped, coloured, custom, huge]).toHaveLength(4);
  });

  it("rings and overlaps every avatar after the first in a group", () => {
    const { container } = render(
      <Avatar.Group size="sm">
        <Avatar name="Alice" />
        <Avatar name="Bob" />
      </Avatar.Group>
    );
    const group = container.firstElementChild!;
    expect(group).toHaveClass("group", "group-sm");
    expect(group.querySelectorAll(".groupItem.sm")).toHaveLength(2);
    expect(avatarStyles).toMatch(/\.groupItem \{[\s\S]*box-shadow: 0 0 0/);
  });

  it("forwards imageProps to the underlying img and respects prevented onError", () => {
    const onError = vi.fn((event: React.SyntheticEvent<HTMLImageElement>) =>
      event.preventDefault()
    );
    render(
      <Avatar
        src="https://example.com/photo.jpg"
        alt="Jane Doe"
        imageProps={{ loading: "lazy", referrerPolicy: "no-referrer", onError }}
      />
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("referrerpolicy", "no-referrer");

    act(() => {
      img.dispatchEvent(new Event("error", { bubbles: false, cancelable: true }));
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("JD")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Avatar name="Jane Doe" />);
    await expectNoA11yViolations(container);
  });
});
