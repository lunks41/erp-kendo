"use client";

import type { GridCustomCellProps } from "@progress/kendo-react-grid";

/** Single-line row height for grid cells (same across tables). */
export const GRID_ROW_HEIGHT_CLASS = "min-h-9 h-9 max-h-9 align-middle";

/**
 * Renders a grid cell with the field value, truncated to one line, with a native
 * tooltip (title) showing the full value on hover. Keeps consistent row height.
 */
export function GridTooltipCell(props: GridCustomCellProps) {
  const { dataItem, field, tdProps } = props;
  const value =
    field != null && dataItem != null && typeof dataItem === "object"
      ? (dataItem as Record<string, unknown>)[field]
      : undefined;
  const display =
    value === null || value === undefined
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  const tdClassName = [
    tdProps?.className ?? "",
    "k-table-td",
    GRID_ROW_HEIGHT_CLASS,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <td {...tdProps} className={tdClassName || undefined}>
      <span
        title={display || undefined}
        className="block min-w-0 max-w-full truncate"
      >
        {display}
      </span>
    </td>
  );
}

/**
 * Returns a cell component that renders with tooltip and same row height.
 * Use for columns that don't have a custom cell – pass as cells={{ data: createTooltipCell() }}.
 */
export function createTooltipCell() {
  return GridTooltipCell;
}
