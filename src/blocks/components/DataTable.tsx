'use client';

import * as React from 'react';

// ============================================
// Types
// ============================================

export interface DataTableColumn {
  /** Unique key matching a property in the data objects */
  key: string;
  /** Display text for the column header */
  header: string;
  /** Optional fixed width (e.g., "200px", "30%") */
  width?: string;
}

export interface DataTableProps {
  /** Column definitions */
  columns: DataTableColumn[];
  /** Array of row data objects; keys should match column keys */
  data: Array<Record<string, React.ReactNode>>;
  /** Additional CSS class name */
  className?: string;
}

// ============================================
// Component
// ============================================

export const DataTable = React.forwardRef<HTMLTableElement, DataTableProps>(
  function DataTable({ columns, data, className }, ref) {
    return (
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          borderRadius: 'var(--fui-radius-md)',
          border: '1px solid var(--fui-border)',
        }}
      >
        <table
          ref={ref}
          className={className}
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--fui-font-sans)',
            fontSize: 'var(--fui-font-size-sm)',
          }}
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={{
                    padding: 'var(--fui-space-2) var(--fui-space-3)',
                    textAlign: 'left',
                    fontWeight: 'var(--fui-font-weight-medium)' as React.CSSProperties['fontWeight'],
                    color: 'var(--fui-text-secondary)',
                    backgroundColor: 'var(--fui-bg-secondary)',
                    borderBottom: '1px solid var(--fui-border)',
                    whiteSpace: 'nowrap',
                    width: col.width,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  borderBottom:
                    rowIndex < data.length - 1
                      ? '1px solid var(--fui-border)'
                      : undefined,
                  transition: 'background-color var(--fui-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--fui-bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: 'var(--fui-space-2) var(--fui-space-3)',
                      color: 'var(--fui-text-primary)',
                    }}
                  >
                    {row[col.key] ?? '\u2014'}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: 'var(--fui-space-6)',
                    textAlign: 'center',
                    color: 'var(--fui-text-tertiary)',
                  }}
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
);
