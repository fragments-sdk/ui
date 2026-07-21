import * as React from "react";
import { describe, it, expect, vi } from "vitest";

import { render } from "../../test/utils";
import { DataTable } from "./index";

// vitest's module mocker does not intercept CommonJS `require()` (DataTable
// lazy-requires its optional peer), so simulate absence at Node's resolver:
// force `require("@tanstack/react-table")` to fail the way a missing install
// does. This drives DataTable's lazy loader into its failure branch. The file
// is isolated from DataTable.test.tsx so the module-level load cache is fresh.
function withMissingReactTable<T>(run: () => T): T {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const NodeModule = require("node:module") as {
    _resolveFilename: (request: string, ...rest: unknown[]) => string;
  };
  const original = NodeModule._resolveFilename;
  NodeModule._resolveFilename = function (request: string, ...rest: unknown[]) {
    if (request === "@tanstack/react-table") {
      throw new Error("Cannot find module '@tanstack/react-table'");
    }
    return original.call(this, request, ...rest);
  };
  try {
    return run();
  } finally {
    NodeModule._resolveFilename = original;
  }
}

class ErrorBoundary extends React.Component<
  { onError: (error: Error) => void; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

describe("DataTable without @tanstack/react-table", () => {
  it("throws a friendly install message when the peer is absent", () => {
    // React logs the caught render error; suppress that noise for this assertion.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    let captured: Error | undefined;
    withMissingReactTable(() => {
      render(
        <ErrorBoundary onError={(error) => (captured = error)}>
          <DataTable columns={[]} data={[]} aria-label="People" />
        </ErrorBoundary>
      );
    });
    spy.mockRestore();

    expect(captured).toBeDefined();
    expect(captured?.message).toMatch(/@tanstack\/react-table is not installed/);
  });
});
