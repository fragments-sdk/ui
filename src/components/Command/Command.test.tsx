import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  userEvent,
  waitFor,
  fireEvent,
  act,
  expectNoA11yViolations,
} from "../../test/utils";
import { Command } from "./index";
import { Dialog } from "../Dialog";

function renderCommand(props: Partial<React.ComponentProps<typeof Command>> = {}) {
  return render(
    <Command {...props}>
      <Command.Input placeholder="Type a command…" />
      <Command.List>
        <Command.Item onSelect={() => {}}>Open File</Command.Item>
        <Command.Item onSelect={() => {}}>Save Document</Command.Item>
        <Command.Item onSelect={() => {}}>Print</Command.Item>
        <Command.Empty>No results found.</Command.Empty>
      </Command.List>
    </Command>
  );
}

describe("Command", () => {
  it("renders input and items", () => {
    renderCommand();

    expect(screen.getByPlaceholderText("Type a command…")).toBeInTheDocument();
    expect(screen.getByText("Open File")).toBeInTheDocument();
    expect(screen.getByText("Save Document")).toBeInTheDocument();
    expect(screen.getByText("Print")).toBeInTheDocument();
  });

  it("draws no frame and claims no search landmark", () => {
    const { container } = renderCommand();
    expect(container.querySelector('[role="search"]')).toBeNull();
    expect(container.firstElementChild?.className).toMatch(/command/);
  });

  it("typing filters items", async () => {
    const user = userEvent.setup();
    renderCommand();

    const input = screen.getByPlaceholderText("Type a command…");
    await user.type(input, "open");

    await waitFor(() => {
      expect(screen.getByText("Open File")).toBeVisible();
      expect(screen.getByText("Save Document")).not.toBeVisible();
      expect(screen.getByText("Print")).not.toBeVisible();
    });
  });

  it("filtered-out items are hidden", async () => {
    const user = userEvent.setup();
    renderCommand();

    const input = screen.getByPlaceholderText("Type a command…");
    await user.type(input, "save");

    await waitFor(() => {
      expect(screen.getByText("Save Document")).toBeVisible();
      expect(screen.getByText("Open File")).not.toBeVisible();
    });
  });

  it("empty state shows when no matches", async () => {
    const user = userEvent.setup();
    renderCommand();

    const input = screen.getByPlaceholderText("Type a command…");
    await user.type(input, "zzzzz");

    await waitFor(() => {
      expect(screen.getByText("No results found.")).toBeInTheDocument();
    });
  });

  it("groups auto-hide when all children filtered", async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Group heading="Files">
            <Command.Item onSelect={() => {}}>Open File</Command.Item>
          </Command.Group>
          <Command.Group heading="Edit">
            <Command.Item onSelect={() => {}}>Copy</Command.Item>
            <Command.Item onSelect={() => {}}>Paste</Command.Item>
          </Command.Group>
          <Command.Empty>No results.</Command.Empty>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText("Search…");
    await user.type(input, "copy");

    await waitFor(() => {
      // "Files" group should be hidden since "Open File" doesn't match "copy"
      const filesGroup = screen.getByText("Files").closest('[role="group"]');
      expect(filesGroup).toHaveStyle({ display: "none" });

      // "Edit" group should be visible since "Copy" matches
      const editGroup = screen.getByText("Edit").closest('[role="group"]');
      expect(editGroup).not.toHaveStyle({ display: "none" });
    });
  });

  it("custom filter function works", async () => {
    const user = userEvent.setup();
    const customFilter = vi.fn((value: string, search: string) => {
      // Only match exact start
      return value.toLowerCase().startsWith(search.toLowerCase()) ? 1 : 0;
    });

    render(
      <Command filter={customFilter}>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item onSelect={() => {}}>Apple</Command.Item>
          <Command.Item onSelect={() => {}}>Banana</Command.Item>
          <Command.Item onSelect={() => {}}>Apricot</Command.Item>
          <Command.Empty>No results.</Command.Empty>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText("Search…");
    await user.type(input, "ap");

    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeVisible();
      expect(screen.getByText("Apricot")).toBeVisible();
      expect(screen.getByText("Banana")).not.toBeVisible();
    });
  });

  it("ArrowDown/ArrowUp navigates items", async () => {
    const user = userEvent.setup();
    renderCommand();

    const input = screen.getByPlaceholderText("Type a command…");
    input.focus();

    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem).toBeTruthy();
      expect(activeItem?.textContent).toBe("Open File");
    });

    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe("Save Document");
    });

    await user.keyboard("{ArrowUp}");

    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe("Open File");
    });
  });

  it("Enter selects active item (calls onSelect)", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item onSelect={onSelect}>First</Command.Item>
          <Command.Item onSelect={() => {}}>Second</Command.Item>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText("Search…");
    input.focus();

    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("lets Enter commit an IME candidate in search, then selects on the next Enter", async () => {
    const onSelect = vi.fn();

    render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item value="日本" onSelect={onSelect}>
            日本
          </Command.Item>
          <Command.Item onSelect={() => {}}>Second</Command.Item>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText("Search…");
    input.focus();
    // The first match is already active.
    await waitFor(() =>
      expect(document.querySelector('[data-active="true"]')?.textContent?.trim()).toBe("日本")
    );

    fireEvent.compositionStart(input);
    // Not default-prevented: the IME must be free to commit the candidate.
    expect(fireEvent.keyDown(input, { key: "Enter", isComposing: true })).toBe(true);
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input);
    // Safari fires compositionend first and reports only keyCode 229 on the committing Enter.
    expect(fireEvent.keyDown(input, { key: "Enter", keyCode: 229 })).toBe(true);
    expect(onSelect).not.toHaveBeenCalled();

    expect(fireEvent.keyDown(input, { key: "Enter", keyCode: 13 })).toBe(false);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith("日本", expect.anything());
  });

  it("click selects item", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item onSelect={onSelect}>Click Me</Command.Item>
        </Command.List>
      </Command>
    );

    await user.click(screen.getByText("Click Me"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("passes selected value and event to onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item onSelect={onSelect}>Click Me</Command.Item>
        </Command.List>
      </Command>
    );

    await user.click(screen.getByText("Click Me"));
    expect(onSelect).toHaveBeenCalledWith("Click Me", expect.any(Object));
  });

  it("disabled items are skipped in keyboard nav", async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item onSelect={() => {}}>First</Command.Item>
          <Command.Item disabled onSelect={() => {}}>
            Disabled
          </Command.Item>
          <Command.Item onSelect={() => {}}>Third</Command.Item>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText("Search…");
    input.focus();

    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe("First");
    });

    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      // Skips "Disabled", goes to "Third"
      expect(activeItem?.textContent).toBe("Third");
    });
  });

  it("Home/End jump to first/last", async () => {
    const user = userEvent.setup();
    renderCommand();

    const input = screen.getByPlaceholderText("Type a command…");
    input.focus();

    await user.keyboard("{End}");
    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe("Print");
    });

    await user.keyboard("{Home}");
    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe("Open File");
    });
  });

  it("loop={false} stops at boundaries", async () => {
    const user = userEvent.setup();
    render(
      <Command loop={false}>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item onSelect={() => {}}>First</Command.Item>
          <Command.Item onSelect={() => {}}>Last</Command.Item>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText("Search…");
    input.focus();

    // Navigate to last (First is active from the start)
    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe("Last");
    });

    // Try to go past last — should stay on Last
    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe("Last");
    });
  });

  it("search value controlled mode", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(
      <Command search="open" onSearchChange={onSearchChange}>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item onSelect={() => {}}>Open File</Command.Item>
          <Command.Item onSelect={() => {}}>Save</Command.Item>
          <Command.Empty>No results.</Command.Empty>
        </Command.List>
      </Command>
    );

    await waitFor(() => {
      expect(screen.getByText("Open File")).toBeVisible();
      expect(screen.getByText("Save")).not.toBeVisible();
    });

    // Type in input triggers onSearchChange
    const input = screen.getByPlaceholderText("Search…");
    await user.type(input, "x");
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("items with keywords match on keywords", async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item keywords={["shortcut", "hotkey"]} onSelect={() => {}}>
            Keyboard Settings
          </Command.Item>
          <Command.Item onSelect={() => {}}>Display Settings</Command.Item>
          <Command.Empty>No results.</Command.Empty>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText("Search…");
    await user.type(input, "hotkey");

    await waitFor(() => {
      expect(screen.getByText("Keyboard Settings")).toBeVisible();
      expect(screen.getByText("Display Settings")).not.toBeVisible();
    });
  });

  it("compose inside Dialog (command palette usage)", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <Dialog.Trigger>Open Palette</Dialog.Trigger>
        <Dialog.Content width="sm">
          <Command>
            <Command.Input placeholder="Search commands…" />
            <Command.List>
              <Command.Item onSelect={() => {}}>New File</Command.Item>
              <Command.Item onSelect={() => {}}>Open Recent</Command.Item>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog>
    );

    await user.click(screen.getByRole("button", { name: /open palette/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search commands…")).toBeInTheDocument();
      expect(screen.getByText("New File")).toBeInTheDocument();
      expect(screen.getByText("Open Recent")).toBeInTheDocument();
    });
  });

  it("uses unique list ids for multiple command instances", () => {
    render(
      <>
        <Command>
          <Command.Input placeholder="First search" />
          <Command.List>
            <Command.Item onSelect={() => {}}>One</Command.Item>
          </Command.List>
        </Command>
        <Command>
          <Command.Input placeholder="Second search" />
          <Command.List>
            <Command.Item onSelect={() => {}}>Two</Command.Item>
          </Command.List>
        </Command>
      </>
    );

    const inputs = [
      screen.getByPlaceholderText("First search"),
      screen.getByPlaceholderText("Second search"),
    ];
    const listIds = inputs.map((input) => input.getAttribute("aria-controls"));

    expect(listIds[0]).toBeTruthy();
    expect(listIds[1]).toBeTruthy();
    expect(listIds[0]).not.toBe(listIds[1]);
    expect(document.getElementById(listIds[0]!)).toBeInTheDocument();
    expect(document.getElementById(listIds[1]!)).toBeInTheDocument();
  });

  it("filters rich-label items using extracted text content", async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item onSelect={() => {}}>
            <span>Open</span> File
          </Command.Item>
          <Command.Item onSelect={() => {}}>Save</Command.Item>
        </Command.List>
      </Command>
    );

    await user.type(screen.getByPlaceholderText("Search…"), "open");

    await waitFor(() => {
      expect(screen.getByText("Save")).not.toBeVisible();
      expect(screen.getByText("Open")).toBeVisible();
    });
  });

  it("composes item and group html props without dropping handlers/styles", async () => {
    const user = userEvent.setup();
    const itemClick = vi.fn();
    const itemKeyDown = vi.fn();
    const itemMouseEnter = vi.fn();

    render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Group heading="Files" data-testid="group" style={{ opacity: 0.5 }}>
            <Command.Item
              onSelect={() => {}}
              data-testid="item"
              onClick={itemClick}
              onKeyDown={itemKeyDown}
              onMouseEnter={itemMouseEnter}
              tabIndex={0}
              style={{ color: "rgb(255, 0, 0)" }}
            >
              Open File
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    );

    const item = screen.getByTestId("item");
    await user.hover(item);
    await user.click(item);
    item.focus();
    await user.keyboard("{Enter}");

    expect(itemMouseEnter).toHaveBeenCalled();
    expect(itemClick).toHaveBeenCalled();
    expect(itemKeyDown).toHaveBeenCalled();
    expect(item).toHaveStyle({ color: "rgb(255, 0, 0)" });
    expect(screen.getByTestId("group")).toHaveStyle({ opacity: "0.5" });
  });

  it("sorts matches by score: a prefix beats a substring", async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item>Reopen tab</Command.Item>
          <Command.Item>Open file</Command.Item>
        </Command.List>
      </Command>
    );
    await user.type(screen.getByPlaceholderText("Search…"), "open");
    await waitFor(() => {
      expect(screen.getByText("Open file")).toHaveStyle({ order: "0" });
      expect(screen.getByText("Reopen tab")).toHaveStyle({ order: "1" });
      expect(document.querySelector('[data-active="true"]')?.textContent).toBe("Open file");
    });
  });

  it("makes the first match active on every search change, so Enter runs it", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item>Open file</Command.Item>
          <Command.Item onSelect={onSelect}>Print</Command.Item>
        </Command.List>
      </Command>
    );
    await user.type(screen.getByPlaceholderText("Search…"), "pri");
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("Print", expect.anything());
  });

  it("reports aria-expanded from the results and keeps Empty out of the options", async () => {
    const user = userEvent.setup();
    renderCommand();
    const input = screen.getByPlaceholderText("Type a command…");
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "true"));
    await user.type(input, "zzz");
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "false"));
    const empty = screen.getByText("No results found.");
    expect(empty).not.toHaveAttribute("role", "option");
  });

  it("marks the list busy while loading and shows the spinner row after a second", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const { container } = render(
        <Command>
          <Command.Input placeholder="Search…" />
          <Command.List loading>
            <Command.Empty>No results.</Command.Empty>
          </Command.List>
        </Command>
      );
      expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");
      expect(container.querySelector("[data-command-loading]")).toBeNull();
      await act(async () => {
        vi.advanceTimersByTime(1100);
      });
      const row = container.querySelector("[data-command-loading]");
      expect(row).toHaveTextContent("Searching…");
      expect(row?.querySelector("svg")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows an error row with Retry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Error onRetry={onRetry}>Couldn’t load commands.</Command.Error>
        </Command.List>
      </Command>
    );
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    const row = screen.getByRole("status");
    expect(row).toHaveTextContent("Couldn’t load commands.");
    expect(row.querySelector("svg")).toBeInTheDocument();
  });

  it("drops the listbox role while an error row shows", () => {
    const { rerender } = render(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Error onRetry={() => {}}>Couldn’t load commands.</Command.Error>
        </Command.List>
      </Command>
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    rerender(
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item>Open</Command.Item>
        </Command.List>
      </Command>
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("drops the listbox role while no result shows", async () => {
    render(
      <Command defaultSearch="zzz">
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Item>Open</Command.Item>
          <Command.Empty>No commands match.</Command.Empty>
        </Command.List>
      </Command>
    );
    expect(await screen.findByText("No commands match.")).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens Command.Dialog as a palette and closes it after a run", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    function Palette() {
      const [open, setOpen] = React.useState(true);
      return (
        <Command.Dialog open={open} onOpenChange={setOpen}>
          <Command.Input placeholder="Search commands…" />
          <Command.List>
            <Command.Item onSelect={onSelect}>New file</Command.Item>
          </Command.List>
        </Command.Dialog>
      );
    }
    render(<Palette />);
    const dialog = await screen.findByRole("dialog", { name: "Command palette" });
    expect(dialog).toHaveTextContent("Run");
    await user.click(screen.getByText("New file"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("has no accessibility violations", async () => {
    const { container } = renderCommand();

    await expectNoA11yViolations(container);
  });
});
