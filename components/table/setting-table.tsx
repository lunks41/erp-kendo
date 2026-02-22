"use client";

import { Grid, GridColumn } from "@progress/kendo-react-grid";
import type { GridCellProps } from "@progress/kendo-react-grid";

export interface SettingTableColumn<T> {
  /** Field name for data binding (or use id for custom columns) */
  accessorKey?: keyof T & string;
  id?: string;
  header: string;
  size?: number;
  /** Custom cell renderer - receives the row data item and index */
  cell?: (row: T, index: number) => React.ReactNode;
}

interface SettingTableProps<T> {
  data: T[];
  columns: SettingTableColumn<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  maxHeight?: string;
}

export function SettingTable<T extends object>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data found.",
  maxHeight = "460px",
}: SettingTableProps<T>) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-slate-200 py-12 dark:border-slate-700"
        style={{ minHeight: 200 }}
      >
        <span className="text-sm text-slate-500">Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-slate-200 py-12 dark:border-slate-700"
        style={{ minHeight: 200 }}
      >
        <span className="text-sm text-slate-500">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
      style={{ maxHeight }}
    >
      <Grid
        data={data}
        style={{ height: maxHeight }}
        skip={0}
        take={data.length}
        total={data.length}
        scrollable="scrollable"
      >
        {columns.map((col, idx) => {
          const field = (col.accessorKey ?? col.id) as string;
          const hasCell = typeof col.cell === "function";
          const cellRenderer = hasCell
            ? (props: GridCellProps) => {
                const item = props.dataItem as T;
                if (!item) return null;
                const rowIndex = data.indexOf(item);
                return <>{col.cell!(item, rowIndex)}</>;
              }
            : undefined;

          return (
            <GridColumn
              key={col.id ?? col.accessorKey ?? idx}
              field={field}
              title={col.header}
              width={col.size}
              cells={cellRenderer ? { data: cellRenderer } : undefined}
            />
          );
        })}
      </Grid>
    </div>
  );
}
