import * as React from "react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from "../../test/utils";
import { DatePicker } from "./index";
import type { DateRange } from "./index";

// react-day-picker resolves through a lazy import(); preloading it makes the
// calendar render synchronously when the popover opens.
beforeAll(async () => {
  await DatePicker.preload();
});

function renderDatePicker(
  props: {
    onValueChange?: (date: Date | null) => void;
    disabled?: boolean;
    value?: Date | null;
    placeholder?: string;
  } = {}
) {
  return render(
    <DatePicker
      placeholder={props.placeholder ?? "Pick a date"}
      onValueChange={props.onValueChange}
      disabled={props.disabled}
      value={props.value}
    >
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  );
}

function renderRangePicker(
  props: {
    onValueChange?: (range: DateRange | null) => void;
    value?: DateRange | null;
    numberOfMonths?: number;
    placeholder?: string;
  } = {}
) {
  return render(
    <DatePicker
      mode="range"
      placeholder={props.placeholder ?? "Select date range"}
      onValueChange={props.onValueChange}
      value={props.value}
      numberOfMonths={props.numberOfMonths ?? 2}
    >
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  );
}

describe("DatePicker", () => {
  describe("rendering", () => {
    it("renders a trigger button", () => {
      renderDatePicker();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("uses button semantics and forwards button props on Trigger", () => {
      render(
        <form>
          <DatePicker>
            <DatePicker.Trigger data-testid="trigger" type="button" name="date-trigger" />
            <DatePicker.Content>
              <DatePicker.Calendar />
            </DatePicker.Content>
          </DatePicker>
        </form>
      );

      const trigger = screen.getByTestId("trigger");
      expect(trigger).toHaveAttribute("type", "button");
      expect(trigger).toHaveAttribute("name", "date-trigger");
    });

    it("shows placeholder text when no value selected", () => {
      renderDatePicker({ placeholder: "Choose date" });
      expect(screen.getByText("Choose date")).toBeInTheDocument();
    });

    it("shows formatted date when selected", () => {
      renderDatePicker({ value: new Date(2025, 0, 15) });
      // Intl long date in the default en-US locale.
      expect(screen.getByRole("button")).toHaveTextContent("January 15, 2025");
    });

    it("shows formatted range when range selected", () => {
      const range: DateRange = {
        from: new Date(2025, 0, 10),
        to: new Date(2025, 0, 20),
      };
      renderRangePicker({ value: range });
      // Ranges join with an en dash.
      expect(screen.getByRole("button")).toHaveTextContent("Jan 10, 2025 \u2013 Jan 20, 2025");
    });
  });

  describe("interaction", () => {
    it("opens on click", async () => {
      const user = userEvent.setup();
      renderDatePicker();

      await user.click(screen.getByRole("button"));
      // DayPicker renders a grid
      expect(await screen.findByRole("grid")).toBeInTheDocument();
    });

    it("selects a date on click", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderDatePicker({ onValueChange });

      await user.click(screen.getByRole("button"));
      await screen.findByRole("grid");

      // Click the 15th day button (find any visible "15" in a grid cell)
      const dayButtons = screen.getAllByRole("gridcell");
      const day15 = dayButtons.find((cell) => {
        const btn = cell.querySelector("button");
        return btn?.textContent === "15";
      });
      expect(day15).toBeDefined();
      const btn = day15!.querySelector("button")!;
      await user.click(btn);

      expect(onValueChange).toHaveBeenCalledWith(expect.any(Date));
    });

    it("closes at once after a single date selection", async () => {
      const user = userEvent.setup();
      renderDatePicker({ onValueChange: vi.fn() });

      await user.click(screen.getByRole("button"));
      await screen.findByRole("grid");

      const dayButtons = screen.getAllByRole("gridcell");
      const visibleDay = dayButtons.find((cell) => {
        const btn = cell.querySelector("button");
        return btn?.textContent === "10";
      });
      const btn = visibleDay!.querySelector("button")!;
      await user.click(btn);

      await waitFor(() => {
        expect(screen.queryByRole("grid")).not.toBeInTheDocument();
      });
    });

    it("range mode: stays open after both clicks (no auto-close)", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderRangePicker({ onValueChange, numberOfMonths: 1 });

      await user.click(screen.getByRole("button"));
      await screen.findByRole("grid");

      const dayButtons = screen.getAllByRole("gridcell");
      const day10 = dayButtons.find((cell) => {
        const btn = cell.querySelector("button");
        return btn?.textContent === "10";
      });
      await user.click(day10!.querySelector("button")!);

      // Should still be open after first click
      expect(screen.getByRole("grid")).toBeInTheDocument();

      const day20 = dayButtons.find((cell) => {
        const btn = cell.querySelector("button");
        return btn?.textContent === "20";
      });
      await user.click(day20!.querySelector("button")!);

      // Range mode never auto-closes; Escape or an outside click closes it.
      expect(screen.getByRole("grid")).toBeInTheDocument();
      expect(onValueChange).toHaveBeenLastCalledWith({
        from: expect.any(Date),
        to: expect.any(Date),
      });
    });

    it("preset click selects a date", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const presetDate = new Date(2025, 5, 1);

      render(
        <DatePicker onValueChange={onValueChange}>
          <DatePicker.Trigger placeholder="Pick a date" />
          <DatePicker.Content>
            <DatePicker.Preset date={presetDate}>June 1st</DatePicker.Preset>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </DatePicker>
      );

      await user.click(screen.getByRole("button", { name: /pick a date/i }));
      await user.click(await screen.findByRole("button", { name: "June 1st" }));

      expect(onValueChange).toHaveBeenCalledWith(presetDate);
    });

    it("preset forwards html props", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onPresetClick = vi.fn();
      const presetDate = new Date(2025, 5, 2);

      render(
        <DatePicker onValueChange={onValueChange}>
          <DatePicker.Trigger placeholder="Pick a date" />
          <DatePicker.Content>
            <DatePicker.Preset
              id="preset-june-2"
              data-testid="preset"
              aria-label="Preset June 2"
              onClick={onPresetClick}
              date={presetDate}
            >
              June 2nd
            </DatePicker.Preset>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </DatePicker>
      );

      await user.click(screen.getByRole("button", { name: /pick a date/i }));
      const preset = screen.getByTestId("preset");
      expect(preset).toHaveAttribute("id", "preset-june-2");
      // A single-mode preset is the whole pick, so the popup closes with it.
      await user.click(preset);

      expect(onPresetClick).toHaveBeenCalled();
      expect(onValueChange).toHaveBeenCalledWith(presetDate);
    });
  });

  describe("keyboard", () => {
    it("Escape closes the calendar", async () => {
      const user = userEvent.setup();
      renderDatePicker();

      await user.click(screen.getByRole("button"));
      await screen.findByRole("grid");

      await user.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByRole("grid")).not.toBeInTheDocument();
      });
    });
  });

  describe("disabled", () => {
    it("trigger is disabled when disabled prop is true", () => {
      renderDatePicker({ disabled: true });
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("controlled", () => {
    it("returns focus to an external control after a programmatic open closes", async () => {
      function ProgrammaticDatePicker() {
        const [open, setOpen] = React.useState(false);

        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>
              Open date picker externally
            </button>
            <DatePicker open={open} onOpenChange={setOpen}>
              <DatePicker.Trigger placeholder="Reference date trigger" />
              <DatePicker.Content>
                <DatePicker.Calendar />
              </DatePicker.Content>
            </DatePicker>
          </>
        );
      }

      const user = userEvent.setup();
      render(<ProgrammaticDatePicker />);

      const opener = screen.getByRole("button", { name: "Open date picker externally" });
      await user.click(opener);
      await screen.findByRole("grid");

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("grid")).not.toBeInTheDocument();
        expect(opener).toHaveFocus();
      });
    });

    it("reflects an external value", () => {
      const date = new Date(2025, 2, 20);
      renderDatePicker({ value: date });
      expect(screen.getByRole("button")).toHaveTextContent("March 20, 2025");
    });

    it("reflects an external range value", () => {
      const range: DateRange = {
        from: new Date(2025, 3, 1),
        to: new Date(2025, 3, 7),
      };
      renderRangePicker({ value: range });
      expect(screen.getByRole("button")).toHaveTextContent("Apr 1, 2025 \u2013 Apr 7, 2025");
    });

    it("requests close after single selection when open is controlled", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onValueChange = vi.fn();

      render(
        <DatePicker open onOpenChange={onOpenChange} onValueChange={onValueChange}>
          <DatePicker.Trigger placeholder="Pick a date" />
          <DatePicker.Content>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </DatePicker>
      );

      await screen.findByRole("grid");

      const dayButtons = screen.getAllByRole("gridcell");
      const day10 = dayButtons.find((cell) => {
        const btn = cell.querySelector("button");
        return btn?.textContent === "10";
      });

      await user.click(day10!.querySelector("button")!);

      // No timer: the close is requested in the same event as the pick.
      expect(onValueChange).toHaveBeenCalledWith(expect.any(Date));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("forms", () => {
    it("serializes selected date to a date-only hidden input value", () => {
      render(
        <DatePicker name="appointment" defaultValue={new Date(2025, 0, 15)}>
          <DatePicker.Trigger />
          <DatePicker.Content>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </DatePicker>
      );

      const input = document.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="appointment"]'
      );
      expect(input).toBeTruthy();
      expect(input?.value).toBe("2025-01-15");
    });
  });

  describe("multi-month", () => {
    it("renders correct number of month panels", async () => {
      const user = userEvent.setup();
      renderRangePicker({ numberOfMonths: 2 });

      await user.click(screen.getByRole("button"));
      const grids = await screen.findAllByRole("grid");
      expect(grids).toHaveLength(2);
    });
  });

  describe("a11y", () => {
    it("has no accessibility violations (closed)", async () => {
      const { container } = render(
        <DatePicker>
          <DatePicker.Trigger aria-label="Pick a date" placeholder="Pick a date" />
          <DatePicker.Content>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </DatePicker>
      );
      await expectNoA11yViolations(container);
    });

    it("has no accessibility violations (open)", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DatePicker>
          <DatePicker.Trigger aria-label="Pick a date" placeholder="Pick a date" />
          <DatePicker.Content aria-label="Choose date">
            <DatePicker.Calendar />
          </DatePicker.Content>
        </DatePicker>
      );

      await user.click(screen.getByRole("button"));
      await screen.findByRole("grid");
      // Disable aria-command-name: Base UI focus guard spans have role="button" without names (upstream)
      await expectNoA11yViolations(container, {
        disabledRules: ["aria-command-name"],
      });
    });
  });

  // The `error` prop shipped once rendering only the message: no invalid edge
  // and no aria-invalid, so the control looked and read as valid. Assert the
  // rendered pair, not the source text — a source check cannot tell whether
  // the attribute is present but the selector never matches.
  it("marks the control invalid both visually and programmatically", () => {
    const { container } = render(
      <DatePicker label="Due" invalid errorMessage="Pick a date">
        <DatePicker.Trigger />
        <DatePicker.Content>
          <DatePicker.Calendar />
        </DatePicker.Content>
      </DatePicker>
    );

    expect(container.querySelector("[data-invalid]")).not.toBeNull();
    expect(screen.getByRole("button")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button")).toHaveAccessibleDescription("Pick a date");
  });

  describe("v4 API", () => {
    it("names the trigger with the label and the current value", () => {
      render(
        <DatePicker label="Start date" defaultValue={new Date(2025, 0, 15)}>
          <DatePicker.Trigger />
          <DatePicker.Content>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </DatePicker>
      );
      expect(screen.getByRole("button")).toHaveAccessibleName("Start date January 15, 2025");
    });

    it("takes one format function and a locale", () => {
      render(
        <DatePicker
          mode="range"
          defaultValue={{ from: new Date(2025, 0, 1), to: new Date(2025, 0, 2) }}
          format={(date) => `d${date.getDate()}`}
        >
          <DatePicker.Trigger />
        </DatePicker>
      );
      expect(screen.getByRole("button")).toHaveTextContent("d1 \u2013 d2");
    });

    it("holds the calendar shut when read-only", async () => {
      const user = userEvent.setup();
      render(
        <DatePicker label="Start date" defaultValue={new Date(2025, 0, 15)} readOnly>
          <DatePicker.Trigger />
          <DatePicker.Content>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </DatePicker>
      );
      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("data-readonly");
      await user.click(trigger);
      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });

    it("updates an uncontrolled value and shows it", async () => {
      const user = userEvent.setup();
      renderDatePicker({ placeholder: "Pick a date" });
      await user.click(screen.getByRole("button"));
      await screen.findByRole("grid");
      const cell = screen
        .getAllByRole("gridcell")
        .find((c) => c.querySelector("button")?.textContent === "12");
      await user.click(cell!.querySelector("button")!);
      expect(screen.getByRole("button")).not.toHaveTextContent("Pick a date");
    });

    it("exposes Root on the compound", () => {
      expect(DatePicker.Root).toBe(DatePicker);
    });

    it("cuts the split callbacks, value props, format hooks and lg size", () => {
      const cut = () => [
        // @ts-expect-error v4: onSelect merged into onValueChange
        <DatePicker key="a" onSelect={() => {}} />,
        // @ts-expect-error v4: selected merged into value
        <DatePicker key="b" selected={new Date()} />,
        // @ts-expect-error v4: onRangeSelect merged into onValueChange
        <DatePicker key="c" mode="range" onRangeSelect={() => {}} />,
        // @ts-expect-error v4: selectedRange merged into value
        <DatePicker key="d" mode="range" selectedRange={null} />,
        // @ts-expect-error v4: fixed weeks are always on
        <DatePicker key="e" fixedWeeks />,
        // @ts-expect-error v4: formatDate merged into format
        <DatePicker key="f" formatDate={() => ""} />,
        // @ts-expect-error v4: formatRange merged into format
        <DatePicker key="g" formatRange={() => ""} />,
        // @ts-expect-error v4: error merged into invalid + errorMessage
        <DatePicker key="h" error="Bad" />,
        // @ts-expect-error v4: the trigger is sm or md
        <DatePicker key="i" size="lg" />,
      ];
      expect(cut).toBeTypeOf("function");
    });
  });
});
