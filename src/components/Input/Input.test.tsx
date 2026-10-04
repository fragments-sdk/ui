import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { ComponentDefaultsProvider } from "../ComponentDefaults";
import { Field } from "../Field";
import { Input } from "./index";

describe("Input", () => {
  it("renders a textbox", () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("takes its label, description and error from Field", () => {
    render(
      <Field invalid>
        <Field.Label>Email</Field.Label>
        <Input />
        <Field.Description>We never share it.</Field.Description>
        <Field.Error match>Enter an email address.</Field.Error>
      </Field>
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAccessibleDescription(/We never share it\./);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter an email address.");
  });

  it("sets aria-invalid when invalid", () => {
    render(<Input aria-label="Email" invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("sets no aria-invalid when valid", () => {
    render(<Input aria-label="Email" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("disables the input when disabled prop is true", () => {
    render(<Input aria-label="Name" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("renders a controlled value", () => {
    render(<Input aria-label="Name" value="hello" onValueChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("hello");
  });

  it("renders shortcut as a kbd element", () => {
    const { container } = render(<Input aria-label="Search" shortcut="⌘K" />);
    const kbd = container.querySelector("kbd");
    expect(kbd).toHaveTextContent("⌘K");
    expect(kbd).toHaveAttribute("aria-hidden", "true");
  });

  it("draws the bare input as the shell, sized from data-size", () => {
    render(<Input aria-label="Name" size="sm" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("shell");
    expect(input).toHaveAttribute("data-size", "sm");
  });

  it("offers the 24 step", () => {
    render(<Input aria-label="Name" size="xs" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-size", "xs");
  });

  it("uses the provider control size when size is omitted", () => {
    render(
      <ComponentDefaultsProvider controlSize="sm">
        <Input aria-label="Name" />
      </ComponentDefaultsProvider>
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("data-size", "sm");
  });

  it("keeps explicit size over the provider control size", () => {
    render(
      <ComponentDefaultsProvider controlSize="sm">
        <Input aria-label="Name" size="lg" />
      </ComponentDefaultsProvider>
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("data-size", "lg");
  });

  it("moves the shell to the wrapper when adorned", () => {
    const { container } = render(
      <Input aria-label="Price" startAdornment={<span data-testid="prefix">$</span>} />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("inner");
    expect(input).not.toHaveClass("shell");
    expect(container.querySelector("div.shell")).toContainElement(input);
  });

  it("keeps the same input element when an adornment comes and goes", () => {
    const { rerender } = render(<Input aria-label="Weight" />);
    const input = screen.getByRole("textbox");
    rerender(<Input aria-label="Weight" endAdornment="kg" />);
    expect(screen.getByRole("textbox")).toBe(input);
  });

  it("forwards ref to the input element", () => {
    const ref = vi.fn<(el: HTMLInputElement | null) => void>();
    render(<Input aria-label="Name" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it("calls onValueChange with the string value", async () => {
    const handleValueChange = vi.fn();
    const user = userEvent.setup();
    render(<Input aria-label="Name" onValueChange={handleValueChange} />);
    await user.type(screen.getByRole("textbox"), "a");
    expect(handleValueChange).toHaveBeenCalledWith("a");
  });

  it("keeps onChange the native change event", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input aria-label="Name" onChange={handleChange} />);
    await user.type(screen.getByRole("textbox"), "a");
    expect(handleChange.mock.calls[0][0].target).toBeInstanceOf(HTMLInputElement);
  });

  it("forwards the native focus and blur events", async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <Input aria-label="Name" onFocus={handleFocus} onBlur={handleBlur} />
        <button type="button">Next</button>
      </>
    );

    await user.click(screen.getByRole("textbox"));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("renders startAdornment and endAdornment around the input", () => {
    render(
      <Input
        aria-label="Weight"
        startAdornment={<span data-testid="prefix">~</span>}
        endAdornment={<span data-testid="suffix">kg</span>}
      />
    );
    const input = screen.getByRole("textbox");
    expect(
      screen.getByTestId("prefix").compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      screen.getByTestId("suffix").compareDocumentPosition(input) & Node.DOCUMENT_POSITION_PRECEDING
    ).toBeTruthy();
  });

  describe("type search", () => {
    it("adds a leading glyph and no clear button while empty", () => {
      const { container } = render(<Input type="search" aria-label="Filter" />);
      expect(container.querySelector(".adornment svg")).not.toBeNull();
      expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    });

    it("clears from the clear button and keeps focus in the field", async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Input
          type="search"
          aria-label="Filter"
          defaultValue="button"
          onValueChange={handleValueChange}
        />
      );
      await user.click(screen.getByRole("button", { name: "Clear" }));
      const input = screen.getByRole("searchbox");
      expect(input).toHaveValue("");
      expect(handleValueChange).toHaveBeenLastCalledWith("");
      expect(input).toHaveFocus();
      expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    });

    it("clears a controlled value through onValueChange", async () => {
      function Controlled() {
        const [value, setValue] = React.useState("card");
        return <Input type="search" aria-label="Filter" value={value} onValueChange={setValue} />;
      }
      const user = userEvent.setup();
      render(<Controlled />);
      await user.click(screen.getByRole("button", { name: "Clear" }));
      expect(screen.getByRole("searchbox")).toHaveValue("");
    });

    it("Escape clears first, then leaves the field", async () => {
      const user = userEvent.setup();
      render(<Input type="search" aria-label="Filter" defaultValue="tabs" />);
      const input = screen.getByRole("searchbox");
      await user.click(input);
      await user.keyboard("{Escape}");
      expect(input).toHaveValue("");
      expect(input).toHaveFocus();
      await user.keyboard("{Escape}");
      expect(input).not.toHaveFocus();
    });

    it("keeps Escape from reaching the page while it clears", async () => {
      const onPageKeyDown = vi.fn();
      const user = userEvent.setup();
      render(
        <div onKeyDown={onPageKeyDown}>
          <Input type="search" aria-label="Filter" defaultValue="tabs" />
        </div>
      );
      await user.click(screen.getByRole("searchbox"));
      await user.keyboard("{Escape}");
      expect(onPageKeyDown).not.toHaveBeenCalled();
    });

    it("hands Escape on to the page once the field is empty", async () => {
      const onPageKeyDown = vi.fn();
      const user = userEvent.setup();
      render(
        <div onKeyDown={onPageKeyDown}>
          <Input type="search" aria-label="Filter" defaultValue="tabs" />
        </div>
      );
      await user.click(screen.getByRole("searchbox"));
      await user.keyboard("{Escape}");
      expect(onPageKeyDown).not.toHaveBeenCalled();
      await user.keyboard("{Escape}");
      expect(onPageKeyDown).toHaveBeenCalledTimes(1);
      expect(onPageKeyDown.mock.calls[0]?.[0]).toMatchObject({ key: "Escape" });
    });

    it("lets an author's onKeyDown take Escape first", async () => {
      const user = userEvent.setup();
      render(
        <Input
          type="search"
          aria-label="Filter"
          defaultValue="tabs"
          onKeyDown={(event) => event.preventDefault()}
        />
      );
      const input = screen.getByRole("searchbox");
      await user.click(input);
      await user.keyboard("{Escape}");
      expect(input).toHaveValue("tabs");
    });

    it("announces the count politely while there is a query", async () => {
      const user = userEvent.setup();
      render(<Input type="search" aria-label="Filter" count="3 of 40" />);
      const status = screen.getByRole("status");
      expect(status).toBeEmptyDOMElement();
      await user.type(screen.getByRole("searchbox"), "b");
      expect(status).toHaveTextContent("3 of 40");
    });

    it("hides the shortcut hint while there is a query", async () => {
      const user = userEvent.setup();
      const { container } = render(<Input type="search" aria-label="Filter" shortcut="/" />);
      expect(container.querySelector("kbd")).not.toBeNull();
      await user.type(screen.getByRole("searchbox"), "b");
      expect(container.querySelector("kbd")).toBeNull();
    });

    it("offers no clear button when read-only or disabled", () => {
      const { rerender } = render(
        <Input type="search" aria-label="Filter" defaultValue="x" readOnly />
      );
      expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
      rerender(<Input type="search" aria-label="Filter" defaultValue="x" disabled />);
      expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Field>
        <Field.Label>Accessible input</Field.Label>
        <Input />
      </Field>
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations as a search field with a value", async () => {
    const { container } = render(
      <Input type="search" aria-label="Filter components" defaultValue="card" count="2 of 71" />
    );
    await expectNoA11yViolations(container);
  });
});
