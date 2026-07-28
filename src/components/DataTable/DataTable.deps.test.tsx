import { describe, it, expect, vi } from "vitest";

import { render, screen } from "../../test/utils";
import { DataTable, createColumns } from "./index";

// Simulate a consumer who never installed the optional peer: the lazy
// `import("@tanstack/react-table")` must reject, driving the loader into its
// failure branch. The file is isolated from DataTable.test.tsx so the
// module-level load cache is fresh.
vi.mock("@tanstack/react-table", () => {
  throw new Error("Cannot find module '@tanstack/react-table'");
});

type Person = { id: string; name: string; age: number };

const columns = createColumns<Person>([
  { key: "name", header: "Name" },
  { key: "age", header: "Age" },
]);

const data: Person[] = [
  { id: "1", name: "Alice", age: 30 },
  { id: "2", name: "Bob", age: 25 },
];

describe("DataTable without @tanstack/react-table", () => {
  it("renders a static fallback table instead of throwing", async () => {
    render(<DataTable columns={columns} data={data} aria-label="People" />);

    // Once the failed load settles, the static fallback shows headers + data.
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "People" })).toBeInTheDocument();
    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent)).toEqual(["Name", "Age"]);
    expect(screen.getByText("Bob")).toBeInTheDocument();

    // Degraded mode: no sort buttons, no checkboxes, nothing interactive.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("shows the empty state when there is no data", async () => {
    render(<DataTable columns={columns} data={[]} aria-label="Empty" />);
    expect(await screen.findByText("No data available")).toBeInTheDocument();
  });
});
