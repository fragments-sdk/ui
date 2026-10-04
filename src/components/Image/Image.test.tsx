import { describe, it, expect, vi } from "vitest";
import { render, screen, act, expectNoA11yViolations } from "../../test/utils";
import { Image } from "./index";

describe("Image", () => {
  it("renders an img element with src and alt", () => {
    render(<Image src="/photo.jpg" alt="A photo" />);
    const img = screen.getByRole("img", { name: "A photo" });
    expect(img).toHaveAttribute("src", "/photo.jpg");
  });

  it("marks the frame loading (a pulsing band) until the image loads", () => {
    const { container } = render(<Image src="/photo.jpg" alt="Photo" />);
    const frame = container.firstChild as HTMLElement;
    expect(frame).toHaveAttribute("data-state", "loading");
    expect(frame).toHaveAttribute("aria-busy", "true");
    act(() => {
      screen.getByRole("img").dispatchEvent(new Event("load", { bubbles: false }));
    });
    expect(frame).toHaveAttribute("data-state", "loaded");
    expect(frame).not.toHaveAttribute("aria-busy");
  });

  it("shows the built-in fallback with the alt words on error", () => {
    const { container } = render(<Image src="/broken.jpg" alt="Team photo" />);
    act(() => {
      screen.getByRole("img").dispatchEvent(new Event("error", { bubbles: false }));
    });
    expect(container.firstChild).toHaveAttribute("data-state", "error");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Team photo")).toBeInTheDocument();
  });

  it("lets a caller fallback replace the built-in one", () => {
    render(<Image src="/broken.jpg" alt="Broken" fallback={<span>No preview</span>} />);
    act(() => {
      screen.getByRole("img").dispatchEvent(new Event("error", { bubbles: false }));
    });
    expect(screen.getByText("No preview")).toBeInTheDocument();
    expect(screen.queryByText("Broken")).not.toBeInTheDocument();
  });

  it.each(["control", "nested", "surface"] as const)("applies the %s radius role", (radius) => {
    const { container } = render(<Image src="/photo.jpg" alt="Photo" radius={radius} />);
    expect(container.firstChild).toHaveClass(`radius-${radius}`);
  });

  it("has no cut variants", () => {
    // Type-level only: each cut value is a compile error.
    const cut = () => [
      // @ts-expect-error -- rounded merged into radius at v4
      <Image key="r" src="/a.jpg" alt="A" rounded="full" />,
      // @ts-expect-error -- 21:9 cut at v4
      <Image key="a" src="/a.jpg" alt="A" aspectRatio="21:9" />,
      // @ts-expect-error -- fill cut at v4
      <Image key="f" src="/a.jpg" alt="A" objectFit="fill" />,
    ];
    expect(cut).toBeTypeOf("function");
  });

  it("applies aspect ratio class", () => {
    const { container } = render(<Image src="/photo.jpg" alt="Photo" aspectRatio="16:9" />);
    expect(container.firstChild).toHaveClass("aspect-16-9");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Image src="/photo.jpg" alt="Accessible photo" />);
    await expectNoA11yViolations(container);
  });

  it("forwards root props and imgProps and fires image event callbacks", () => {
    const onImageLoad = vi.fn();
    const onImageError = vi.fn();

    render(
      <Image
        src="/photo.jpg"
        alt="Photo"
        data-testid="container"
        imgProps={{ loading: "lazy", decoding: "async", crossOrigin: "anonymous" }}
        onImageLoad={onImageLoad}
        onImageError={onImageError}
      />
    );

    const container = screen.getByTestId("container");
    const img = screen.getByRole("img");
    expect(container).toBeInTheDocument();
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveAttribute("crossorigin", "anonymous");

    act(() => {
      img.dispatchEvent(new Event("load", { bubbles: false }));
    });
    act(() => {
      img.dispatchEvent(new Event("error", { bubbles: false }));
    });

    expect(onImageLoad).toHaveBeenCalledTimes(1);
    expect(onImageError).toHaveBeenCalledTimes(1);
  });
});
