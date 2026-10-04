import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Field } from "../Field";
import { Textarea } from "./index";

describe("Textarea", () => {
  it("renders a textbox", () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("takes its label, description and error from Field", () => {
    render(
      <Field invalid>
        <Field.Label>Description</Field.Label>
        <Textarea />
        <Field.Description>Shown on the profile.</Field.Description>
        <Field.Error match>Add a description.</Field.Error>
      </Field>
    );
    const textarea = screen.getByRole("textbox", { name: "Description" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAccessibleDescription(/Shown on the profile\./);
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("sets the resize mode on the element", () => {
    render(<Textarea aria-label="Notes" resize="none" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-resize", "none");
  });

  it("passes numeric row bounds to the CSS field equation", () => {
    render(<Textarea aria-label="Notes" minRows={2} maxRows={5} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea.style.getPropertyValue("--_fui-textarea-min-rows")).toBe("2");
    expect(textarea.style.getPropertyValue("--_fui-textarea-max-rows")).toBe("5");
    expect(textarea).toHaveAttribute("rows", "2");
  });

  it("marks a one-row textarea so it lines up with an Input", () => {
    render(<Textarea aria-label="Notes" minRows={1} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-single-row");
  });

  it("sets aria-invalid when invalid", () => {
    render(<Textarea aria-label="Notes" invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("disables the textarea when disabled prop is true", () => {
    render(<Textarea aria-label="Notes" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("sets the size on the element, the 24 step included", () => {
    render(<Textarea aria-label="Notes" size="xs" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-size", "xs");
  });

  it("calls onValueChange with the string value", async () => {
    const handleValueChange = vi.fn();
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" onValueChange={handleValueChange} />);
    await user.type(screen.getByRole("textbox"), "x");
    expect(handleValueChange).toHaveBeenCalledWith("x");
  });

  it("forwards ref to the textarea element", () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea aria-label="Notes" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("forwards the native focus and blur events", async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <Textarea aria-label="Notes" onFocus={handleFocus} onBlur={handleBlur} />
        <button type="button">Next</button>
      </>
    );

    await user.click(screen.getByRole("textbox"));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("shows a counter whenever maxLength is set", () => {
    render(<Textarea aria-label="Bio" maxLength={100} />);
    expect(screen.getByText("0/100")).toBeInTheDocument();
  });

  it("shows no counter without maxLength", () => {
    const { container } = render(<Textarea aria-label="Bio" />);
    expect(container.querySelector(".counter")).toBeNull();
  });

  it("updates the counter on input", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Bio" maxLength={100} />);
    await user.type(screen.getByRole("textbox"), "Hello");
    expect(screen.getByText("5/100")).toBeInTheDocument();
  });

  it("follows a controlled value, so the counter never goes stale", () => {
    const { rerender } = render(
      <Textarea aria-label="Bio" maxLength={10} value="abc" onValueChange={() => {}} />
    );
    expect(screen.getByText("3/10")).toBeInTheDocument();
    rerender(<Textarea aria-label="Bio" maxLength={10} value="abcdef" onValueChange={() => {}} />);
    expect(screen.getByText("6/10")).toBeInTheDocument();
  });

  it("says how far a set value runs past the limit, in words", () => {
    render(
      <Textarea aria-label="Bio" maxLength={5} value="abcdefgh" onValueChange={() => {}} />
    );
    const counter = screen.getByText("3 over the 5 limit");
    expect(counter).toHaveAttribute("data-over");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Field>
        <Field.Label>Accessible textarea</Field.Label>
        <Textarea maxLength={200} />
      </Field>
    );
    await expectNoA11yViolations(container);
  });
});
