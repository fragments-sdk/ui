import * as React from "react";

// Skeleton placeholder rows shown while `loading`. Keeps the table's
// column rhythm so the populated state doesn't jump on arrival.
export function DataTableSkeletonRows({
  rowCount,
  columnCount,
  rowClassName,
  cellClassName,
  barClassName,
}: {
  rowCount: number;
  columnCount: number;
  rowClassName: string;
  cellClassName: string;
  barClassName: string;
}) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, r) => (
        <tr key={r} className={rowClassName} aria-hidden="true">
          {Array.from({ length: columnCount }).map((_, c) => (
            <td key={c} className={cellClassName}>
              <span className={barClassName} style={{ width: `${45 + ((r + c) % 4) * 14}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

const NAV_KEYS = new Set(["ArrowDown", "ArrowUp", "Home", "End"]);

// Roving arrow-key navigation across focusable (clickable) rows. Enter /
// Space activation is handled per-row by the table itself. This only moves
// focus; it never hijacks keys when focus is outside the table body.
export function useArrowKeyRowNav(
  tableRef: React.RefObject<HTMLTableElement | null>,
  enabled: boolean
) {
  React.useEffect(() => {
    const table = tableRef.current;
    if (!enabled || !table) return;

    function onKeyDown(event: KeyboardEvent) {
      if (!NAV_KEYS.has(event.key)) return;
      const host = tableRef.current;
      if (!host) return;
      const rows = Array.from(host.querySelectorAll<HTMLElement>("tbody tr[tabindex]"));
      if (rows.length === 0) return;

      const active = document.activeElement;
      const current = rows.findIndex((row) => row === active || row.contains(active));
      // Only take over the arrow keys when focus is already on a row.
      if (current === -1) return;

      event.preventDefault();
      let next = current;
      if (event.key === "ArrowDown") {
        next = Math.min(rows.length - 1, current + 1);
      } else if (event.key === "ArrowUp") {
        next = Math.max(0, current - 1);
      } else if (event.key === "Home") {
        next = 0;
      } else if (event.key === "End") {
        next = rows.length - 1;
      }
      rows[next]?.focus();
    }

    table.addEventListener("keydown", onKeyDown);
    return () => table.removeEventListener("keydown", onKeyDown);
  }, [tableRef, enabled]);
}
