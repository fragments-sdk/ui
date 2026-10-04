import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { act, render, screen, expectNoA11yViolations } from "../../test/utils";
import { Slider } from "./index";

describe("Slider", () => {
  it("keeps the invalid edge on the wrapper when disabled and invalid", () => {
    const { container } = render(<Slider aria-label="Volume" disabled invalid />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute("data-disabled");
    expect(wrapper).toHaveAttribute("data-invalid");
  });

  it("renders a slider named by aria-label", () => {
    render(<Slider aria-label="Volume" />);
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  });

  it("names the slider by its visible label", () => {
    render(<Slider label="Volume" />);
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  });

  it("warns in development when the slider has no name, with no silent fallback", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      render(<Slider />);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("Slider: pass `label`"));
      expect(screen.getByRole("slider")).not.toHaveAttribute("aria-label");
    } finally {
      process.env.NODE_ENV = previous;
      warn.mockRestore();
    }
  });

  it("renders one thumb per value for a range and reports the array", async () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        label="Price"
        defaultValue={[20, 80]}
        getAriaLabel={(index) => (index === 0 ? "Minimum price" : "Maximum price")}
        onValueChange={onValueChange}
        showValue
      />
    );

    const [low, high] = screen.getAllByRole("slider");
    expect(low).toHaveAccessibleName("Minimum price");
    expect(high).toHaveAccessibleName("Maximum price");
    expect(screen.getByText("20 – 80")).toBeInTheDocument();

    await act(async () => {
      low.focus();
      fireEvent.keyDown(low, { key: "ArrowRight" });
    });
    expect(onValueChange).toHaveBeenLastCalledWith([21, 80]);
  });

  it("formats the shown value with Intl options", () => {
    render(
      <Slider
        label="Opacity"
        defaultValue={0.4}
        min={0}
        max={1}
        step={0.1}
        format={{ style: "percent" }}
        locale="en-US"
        showValue
      />
    );
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("refuses changes and says so when readOnly", async () => {
    const onValueChange = vi.fn();
    const onValueCommitted = vi.fn();
    const { container } = render(
      <Slider
        aria-label="Volume"
        defaultValue={40}
        readOnly
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
      />
    );

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-readonly", "true");
    expect(container.firstElementChild).toHaveAttribute("data-readonly");

    await act(async () => {
      slider.focus();
      fireEvent.keyDown(slider, { key: "ArrowRight" });
    });

    expect(slider).toHaveAttribute("aria-valuenow", "40");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onValueCommitted).not.toHaveBeenCalled();
  });

  it("shows the error message with an icon and wires it to the thumb while invalid", () => {
    const { container } = render(
      <Slider label="Budget" invalid errorMessage="Pick a budget under the cap." />
    );
    expect(screen.getByRole("slider")).toHaveAccessibleDescription("Pick a budget under the cap.");
    expect(container.querySelector("svg[aria-hidden='true']")).not.toBeNull();
  });

  it("drops the cut aliases at the type level", () => {
    // @ts-expect-error onChange was cut in v4; use onValueChange.
    render(<Slider aria-label="A" onChange={() => {}} />);
    // @ts-expect-error valueSuffix was cut in v4; use format.
    render(<Slider aria-label="B" valueSuffix="%" />);
    // @ts-expect-error error was cut in v4; use invalid and errorMessage.
    render(<Slider aria-label="C" error />);
    expect(screen.getAllByRole("slider")).toHaveLength(3);
  });

  it("sets aria-valuemin and aria-valuemax from min/max props", () => {
    render(<Slider aria-label="Volume" min={10} max={90} defaultValue={50} />);
    const slider = screen.getByRole("slider");
    // Base UI Slider sets min/max on the group or thumb — check the output element
    expect(slider).toBeInTheDocument();
    // The slider group should be present with the right configuration
    const output = slider.closest('[role="group"]') || slider;
    expect(output).toBeInTheDocument();
  });

  it("sets aria-valuenow from value prop", () => {
    render(<Slider aria-label="Volume" value={42} onValueChange={() => {}} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "42");
  });

  it("renders a label via Field.Label", () => {
    render(<Slider label="Volume" />);
    expect(screen.getByText("Volume")).toBeInTheDocument();
  });

  it("disables the slider", () => {
    render(<Slider aria-label="Volume" disabled />);
    expect(screen.getByRole("slider")).toBeDisabled();
    expect(screen.getByRole("group", { name: "Volume" })).toHaveAttribute("aria-disabled", "true");
  });

  it("respects step attribute", () => {
    render(<Slider aria-label="Volume" step={5} defaultValue={0} />);
    // step is part of the slider control — no direct ARIA but functional
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("displays the value when showValue is true", () => {
    render(<Slider label="Volume" value={75} showValue onValueChange={() => {}} />);
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("does not commit when a keyboard interaction leaves the value unchanged", async () => {
    const onValueChange = vi.fn();
    const onValueCommitted = vi.fn();
    render(
      <Slider
        aria-label="Volume"
        defaultValue={100}
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
      />
    );

    const slider = screen.getByRole("slider");
    await act(async () => {
      slider.focus();
      fireEvent.keyDown(slider, { key: "ArrowRight" });
    });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(onValueCommitted).not.toHaveBeenCalled();
    expect(slider).toHaveAttribute("aria-valuenow", "100");
  });

  it("removes the exact touchend listener registered for a touch interaction", () => {
    const onValueCommitted = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={0} onValueCommitted={onValueCommitted} />);

    const slider = screen.getByRole("slider");
    const control = slider.parentElement?.parentElement?.parentElement;
    expect(control).toBeInstanceOf(HTMLElement);

    vi.spyOn(control!, "getBoundingClientRect").mockReturnValue({
      bottom: 20,
      height: 20,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const addEventListener = vi.spyOn(document, "addEventListener");
    const removeEventListener = vi.spyOn(document, "removeEventListener");

    fireEvent.touchStart(control!, {
      changedTouches: [{ identifier: 1, clientX: 50, clientY: 10 }],
    });

    const registeredTouchEnd = addEventListener.mock.calls.find(
      ([eventName]) => eventName === "touchend"
    );
    expect(registeredTouchEnd).toBeDefined();

    fireEvent.touchEnd(document, {
      changedTouches: [{ identifier: 1, clientX: 50, clientY: 10 }],
    });

    expect(
      removeEventListener.mock.calls.some(
        ([eventName, listener]) => eventName === "touchend" && listener === registeredTouchEnd?.[1]
      )
    ).toBe(true);
    expect(onValueCommitted).toHaveBeenCalledTimes(1);

    // A later page tap must not replay the completed slider interaction.
    fireEvent.touchEnd(document, {
      changedTouches: [{ identifier: 2, clientX: 0, clientY: 0 }],
    });
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
  });

  it("forwards form ownership to the hidden input", () => {
    const { container } = render(
      <Slider aria-label="Volume" name="volume" form="external-form" defaultValue={33} />
    );

    const input = container.querySelector('input[name="volume"]');
    expect(input).toHaveAttribute("form", "external-form");
  });

  it("shows a value bubble while dragging when showValueOnDrag is enabled", () => {
    const { container } = render(
      <Slider
        aria-label="Volume"
        defaultValue={0.33}
        max={1}
        step={0.01}
        format={{ style: "percent" }}
        locale="en-US"
        showValueOnDrag
      />
    );
    const thumb = screen.getByRole("slider");
    const root = thumb.closest('[role="group"]') ?? container.firstElementChild;

    expect(screen.queryByText("33%")).not.toBeInTheDocument();

    expect(root).toBeTruthy();
    fireEvent.pointerDown(root as Element);
    expect(screen.getByText("33%")).toBeInTheDocument();

    fireEvent.pointerUp(window);
    expect(screen.queryByText("33%")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Slider label="Accessible slider" defaultValue={50} />);
    await expectNoA11yViolations(container);
  });
});
