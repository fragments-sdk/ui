import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Accordion } from "./index";

function renderAccordion(props: Partial<React.ComponentProps<typeof Accordion>> = {}) {
  return render(
    <Accordion {...props}>
      <Accordion.Item value="one">
        <Accordion.Trigger>Item One</Accordion.Trigger>
        <Accordion.Content>Content One</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Trigger>Item Two</Accordion.Trigger>
        <Accordion.Content>Content Two</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="three">
        <Accordion.Trigger>Item Three</Accordion.Trigger>
        <Accordion.Content>Content Three</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("renders all triggers", () => {
    renderAccordion();
    expect(screen.getByText("Item One")).toBeInTheDocument();
    expect(screen.getByText("Item Two")).toBeInTheDocument();
    expect(screen.getByText("Item Three")).toBeInTheDocument();
  });

  it("opens an item when its trigger is clicked", async () => {
    const user = userEvent.setup();
    renderAccordion();

    const trigger = screen.getByRole("button", { name: /item one/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Content One")).toBeInTheDocument();
  });

  it("keeps one item open at a time by default", async () => {
    const user = userEvent.setup();
    renderAccordion();

    const triggerOne = screen.getByRole("button", { name: /item one/i });
    const triggerTwo = screen.getByRole("button", { name: /item two/i });

    await user.click(triggerOne);
    expect(triggerOne).toHaveAttribute("aria-expanded", "true");

    await user.click(triggerTwo);
    expect(triggerTwo).toHaveAttribute("aria-expanded", "true");
    expect(triggerOne).toHaveAttribute("aria-expanded", "false");
  });

  it("multiple lets several items stay open", async () => {
    const user = userEvent.setup();
    renderAccordion({ multiple: true });

    const triggerOne = screen.getByRole("button", { name: /item one/i });
    const triggerTwo = screen.getByRole("button", { name: /item two/i });

    await user.click(triggerOne);
    await user.click(triggerTwo);

    expect(triggerOne).toHaveAttribute("aria-expanded", "true");
    expect(triggerTwo).toHaveAttribute("aria-expanded", "true");
  });

  it("links trigger aria-controls to content id", async () => {
    renderAccordion({ defaultValue: ["one"] });

    const trigger = screen.getByRole("button", { name: /item one/i });
    const contentId = trigger.getAttribute("aria-controls");
    expect(contentId).toBeTruthy();
    expect(document.getElementById(contentId!)).toBeInTheDocument();
  });

  it("renders correct heading level", () => {
    renderAccordion({ headingLevel: 4 });
    const headings = document.querySelectorAll("h4");
    expect(headings.length).toBe(3);
  });

  it("defaults heading level to h3", () => {
    renderAccordion();
    const headings = document.querySelectorAll("h3");
    expect(headings.length).toBe(3);
  });

  it("disables an item when disabled prop is set", async () => {
    const user = userEvent.setup();
    render(
      <Accordion>
        <Accordion.Item value="one" disabled>
          <Accordion.Trigger>Disabled Item</Accordion.Trigger>
          <Accordion.Content>Hidden Content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: /disabled item/i });
    expect(trigger).toHaveAttribute("data-disabled");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports controlled value prop", async () => {
    const onValueChange = vi.fn();
    render(
      <Accordion value={["one"]} onValueChange={onValueChange}>
        <Accordion.Item value="one">
          <Accordion.Trigger>Item One</Accordion.Trigger>
          <Accordion.Content>Content One</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="two">
          <Accordion.Trigger>Item Two</Accordion.Trigger>
          <Accordion.Content>Content Two</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const triggerOne = screen.getByRole("button", { name: /item one/i });
    expect(triggerOne).toHaveAttribute("aria-expanded", "true");

    const user = userEvent.setup();
    const triggerTwo = screen.getByRole("button", { name: /item two/i });
    await user.click(triggerTwo);
    expect(onValueChange.mock.calls[0][0]).toEqual(["two"]);
  });

  it("supports defaultValue for uncontrolled usage", () => {
    renderAccordion({ defaultValue: ["two"] });
    const trigger = screen.getByRole("button", { name: /item two/i });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes the open item when it is pressed again", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderAccordion({ defaultValue: ["one"], onValueChange });

    const trigger = screen.getByRole("button", { name: /item one/i });
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(onValueChange.mock.calls[0][0]).toEqual([]);
  });

  it("honors a canceled change", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn((_value: string[], details: { cancel: () => void }) => {
      details.cancel();
    });

    render(
      <Accordion onValueChange={onValueChange}>
        <Accordion.Item value="one">
          <Accordion.Trigger>Item One</Accordion.Trigger>
          <Accordion.Content>Content One</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: /item one/i });
    await user.click(trigger);

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("leads each trigger with the caret", () => {
    renderAccordion();
    const trigger = screen.getByRole("button", { name: /item one/i });
    expect(trigger.firstElementChild?.tagName.toLowerCase()).toBe("svg");
  });

  it("forwards html props to trigger and content", async () => {
    const user = userEvent.setup();
    render(
      <Accordion>
        <Accordion.Item value="one">
          <Accordion.Trigger data-testid="trigger" data-track="accordion-trigger">
            Item One
          </Accordion.Trigger>
          <Accordion.Content data-testid="content" aria-label="Accordion panel">
            Content One
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    await user.click(screen.getByTestId("trigger"));

    expect(screen.getByTestId("trigger")).toHaveAttribute("data-track", "accordion-trigger");
    expect(screen.getByTestId("content")).toHaveAttribute("aria-label", "Accordion panel");
  });

  it("keeps collapsed content mounted when keepMounted is true", () => {
    render(
      <Accordion>
        <Accordion.Item value="one">
          <Accordion.Trigger>Item One</Accordion.Trigger>
          <Accordion.Content keepMounted data-testid="content">
            Content One
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("opens hidden-until-found content when the browser fires beforematch", () => {
    const onValueChange = vi.fn();
    render(
      <Accordion onValueChange={onValueChange}>
        <Accordion.Item value="one">
          <Accordion.Trigger>Item One</Accordion.Trigger>
          <Accordion.Content hiddenUntilFound data-testid="content">
            Content One
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: /item one/i });
    const content = screen.getByTestId("content");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(content).toHaveAttribute("hidden", "until-found");

    fireEvent(content, new Event("beforematch"));

    expect(onValueChange.mock.calls[0][0]).toEqual(["one"]);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(content).not.toHaveAttribute("hidden");
  });

  it('uses type="button" for triggers by default to avoid form submission', () => {
    renderAccordion();
    const trigger = screen.getByRole("button", { name: /item one/i });
    expect(trigger).toHaveAttribute("type", "button");
  });

  it("has no accessibility violations", async () => {
    const { container } = renderAccordion({ defaultValue: ["one"] });
    await expectNoA11yViolations(container);
  });
});
