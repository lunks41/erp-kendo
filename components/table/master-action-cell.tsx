"use client";

import { Button } from "@progress/kendo-react-buttons";
import type { GridCustomCellProps } from "@progress/kendo-react-grid";
import { Copy, Eye, Pencil, Trash2 } from "lucide-react";

export function createActionCell<T>(
  onView?: (dataItem: T) => void,
  onEdit?: (dataItem: T) => void,
  onDelete?: (dataItem: T) => void,
  showView = true,
  showEdit = true,
  showDelete = true,
  onClone?: (dataItem: T) => void,
  showClone = true,
) {
  const hasAnyButton =
    (showView && onView) ||
    (showEdit && onEdit) ||
    (showDelete && onDelete) ||
    (showClone && onClone);

  const ActionCell = (props: GridCustomCellProps) => {
    const { dataItem, tdProps } = props;
    const item = dataItem as T;
    const tdClassName =
      [tdProps?.className, "k-table-td"].filter(Boolean).join(" ").trim() ||
      "k-table-td";

    return (
      <td {...tdProps} className={tdClassName}>
        <div className="flex items-center gap-1">
          {!hasAnyButton && (
            <span className="text-slate-400 dark:text-slate-300">—</span>
          )}
          {showView && onView && (
            <Button
              type="button"
              fillMode="flat"
              size="small"
              startIcon={
                <Eye className="h-4 w-4 text-slate-700 dark:text-slate-200" />
              }
              title="View"
              onClick={(e) => {
                e.stopPropagation();
                onView(item);
              }}
            />
          )}
          {showEdit && onEdit && (
            <Button
              type="button"
              fillMode="flat"
              size="small"
              startIcon={
                <Pencil className="h-4 w-4 text-slate-700 dark:text-slate-200" />
              }
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            />
          )}
          {showDelete && onDelete && (
            <Button
              type="button"
              fillMode="flat"
              size="small"
              themeColor="error"
              startIcon={
                <Trash2 className="h-4 w-4 text-slate-700 dark:text-slate-200" />
              }
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
            />
          )}
          {showClone && onClone && (
            <Button
              type="button"
              fillMode="flat"
              size="small"
              startIcon={
                <Copy className="h-4 w-4 text-slate-700 dark:text-slate-200" />
              }
              title="Clone row"
              onClick={(e) => {
                e.stopPropagation();
                onClone(item);
              }}
            />
          )}
        </div>
      </td>
    );
  };
  return ActionCell;
}
