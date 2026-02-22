"use client";

import { useMemo } from "react";
import {
  Grid,
  GridColumn,
  GridToolbar,
  GridSearchBox,
  GridCsvExportButton,
  GridPdfExportButton,
  GridToolbarSpacer,
} from "@progress/kendo-react-grid";
import type {
  GridColumnProps,
  GridColumnsStateChangeEvent,
} from "@progress/kendo-react-grid";
import { Button } from "@progress/kendo-react-buttons";
import { LayoutGrid, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useGetGridLayout, useUpdateGridLayout } from "@/hooks/use-settings";
import { getCompanyIdFromSession } from "@/lib/api-client";
import {
  parseGridLayoutToColumnsState,
  normalizeLayout,
  serializeColumnsStateToLayout,
  buildDefaultColumnsState,
  type GridLayoutLike,
} from "@/lib/grid-layout-utils";
import { createActionCell } from "./master-action-cell";
import { useCallback, useRef, useState } from "react";

const TABLE_HEIGHT = "min(400px, 50vh)";

/** Kendo Grid column definition - matches Kendo's GridColumnProps style */
export interface AccountBaseTableColumn<T = unknown> {
  field: string;
  title?: string;
  width?: number;
  hidden?: boolean;
  /** Custom cell renderer - receives dataItem directly (Kendo style) */
  cell?: (props: {
    dataItem: T;
    field?: string;
    tdProps?: React.TdHTMLAttributes<HTMLTableCellElement> | null;
  }) => React.ReactNode;
}

export interface AccountBaseTableProps<T extends object> {
  data: T[];
  columns: AccountBaseTableColumn<T>[];
  moduleId?: number | string;
  transactionId?: number | string;
  tableName?: string;
  emptyMessage?: string;
  accessorId: keyof T & string;
  onRefreshAction?: () => void;
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void;
  onBulkDeleteAction?: (selectedIds: string[]) => void;
  onBulkSelectionChange?: (selectedIds: string[]) => void;
  onDataReorder?: (newData: T[]) => void;
  onEditAction?: (dataItem: T) => void;
  onDeleteAction?: (id: string) => void;
  showHeader?: boolean;
  showActions?: boolean;
  hideEdit?: boolean;
  hideDelete?: boolean;
  hideCheckbox?: boolean;
  disableOnAccountExists?: boolean;
}

/**
 * Kendo Grid table for account/detail data.
 * No pagination - all rows shown (pageable=false).
 * Uses Kendo Grid column format natively.
 */
export function AccountBaseTable<T extends object>({
  data,
  columns,
  moduleId,
  transactionId,
  tableName = "",
  emptyMessage = "No records found.",
  accessorId,
  onRefreshAction,
  onFilterChange: _onFilterChange,
  onBulkDeleteAction: _onBulkDeleteAction,
  onBulkSelectionChange: _onBulkSelectionChange,
  onDataReorder: _onDataReorder,
  onEditAction,
  onDeleteAction,
  showHeader = true,
  showActions = true,
  hideEdit = false,
  hideDelete = false,
  hideCheckbox = true,
}: AccountBaseTableProps<T>) {
  const t = useTranslations("grid");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const updateLayoutMutation = useUpdateGridLayout();
  const baseColumnFields = useMemo(
    () => columns.map((c) => c.field),
    [columns],
  );

  const { data: gridLayoutResponse } = useGetGridLayout(
    moduleId?.toString() ?? "",
    transactionId?.toString() ?? "",
    tableName,
  );

  const rawLayout = gridLayoutResponse?.data ?? gridLayoutResponse;
  const layout = useMemo(
    () =>
      normalizeLayout(rawLayout, tableName) ??
      (rawLayout as GridLayoutLike | undefined),
    [rawLayout, tableName],
  );

  const hasActions = showActions && !!(onEditAction || onDeleteAction);
  const defaultColumnsState = useMemo(() => {
    const fields = hasActions ? ["__actions", ...baseColumnFields] : baseColumnFields;
    const hiddenFields = new Set(
      columns.filter((c) => c.hidden).map((c) => c.field),
    );
    if (!moduleId || !transactionId || !tableName) {
      return fields.map((field, idx) => ({
        id: field,
        field,
        hidden: hiddenFields.has(field),
        orderIndex: idx,
      }));
    }
    const parsed = parseGridLayoutToColumnsState(
      layout as GridLayoutLike | undefined,
      fields,
    );
    return parsed ?? fields.map((field, idx) => ({ id: field, field, hidden: hiddenFields.has(field), orderIndex: idx }));
  }, [layout, baseColumnFields, columns, hasActions, moduleId, transactionId, tableName]);

  const columnsStateRef = useRef<GridColumnsStateChangeEvent["columnsState"] | null>(null);
  const [columnsState, setColumnsState] = useState<
    GridColumnsStateChangeEvent["columnsState"] | undefined
  >(undefined);

  const handleDeleteWrapped = useCallback(
    (dataItem: T) => {
      const id = String((dataItem as Record<string, unknown>)[accessorId] ?? "");
      onDeleteAction?.(id);
    },
    [accessorId, onDeleteAction],
  );

  const ActionCellComponent = hasActions
    ? createActionCell<T>(
        undefined,
        hideEdit ? undefined : onEditAction,
        hideDelete ? undefined : handleDeleteWrapped,
        false,
        !hideEdit && !!onEditAction,
        !hideDelete && !!onDeleteAction,
      )
    : null;

  const handleColumnsStateChange = useCallback(
    (e: GridColumnsStateChangeEvent) => {
      columnsStateRef.current = e.columnsState;
      setColumnsState(e.columnsState);
    },
    [],
  );

  const handleDefaultLayout = useCallback(() => {
    if (!moduleId || !transactionId || !tableName) return;
    const companyId = getCompanyIdFromSession();
    if (!companyId) return;
    const fields = hasActions ? ["__actions", ...baseColumnFields] : baseColumnFields;
    const hiddenFields = new Set(
      columns.filter((c) => c.hidden).map((c) => c.field),
    );
    const defaultState = buildDefaultColumnsState(fields, hiddenFields);
    setColumnsState(defaultState);
    columnsStateRef.current = defaultState;
    const { grdColOrder, grdColVisible, grdColSize } =
      serializeColumnsStateToLayout(defaultState);
    const layoutData = layout as { grdSort?: string; grdString?: string };
    updateLayoutMutation.mutate(
      {
        companyId: Number(companyId),
        moduleId: Number(moduleId),
        transactionId: Number(transactionId),
        grdName: tableName,
        grdKey: tableName,
        grdColOrder,
        grdColVisible,
        grdColSize,
        grdSort: layoutData?.grdSort ?? "",
        grdString: layoutData?.grdString ?? "",
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["gridlayout", moduleId, transactionId, tableName],
          });
        },
      },
    );
  }, [
    moduleId,
    transactionId,
    tableName,
    hasActions,
    baseColumnFields,
    columns,
    layout,
    updateLayoutMutation,
    queryClient,
  ]);

  const handleSaveLayout = useCallback(() => {
    if (!moduleId || !transactionId || !tableName) return;
    const companyId = getCompanyIdFromSession();
    if (!companyId) return;
    const layoutData = layout as {
      grdColOrder?: string;
      grdColVisible?: string;
      grdColSize?: string;
      grdSort?: string;
      grdString?: string;
    };
    const { grdColOrder, grdColVisible, grdColSize } = columnsStateRef.current
      ? serializeColumnsStateToLayout(columnsStateRef.current)
      : {
          grdColOrder: layoutData?.grdColOrder ?? "",
          grdColVisible: layoutData?.grdColVisible ?? "",
          grdColSize: layoutData?.grdColSize ?? "",
        };
    updateLayoutMutation.mutate({
      companyId: Number(companyId),
      moduleId: Number(moduleId),
      transactionId: Number(transactionId),
      grdName: tableName,
      grdKey: tableName,
      grdColOrder,
      grdColVisible,
      grdColSize,
      grdSort: layoutData?.grdSort ?? "",
      grdString: layoutData?.grdString ?? "",
    });
  }, [moduleId, transactionId, tableName, layout, updateLayoutMutation]);

  const canSaveLayout = !!(moduleId && transactionId && tableName);

  const kendoColumns = useMemo(() => {
      const actionCol =
      hasActions && ActionCellComponent ? (
        <GridColumn
          key="__actions"
          id="__actions"
          field="__actions"
          title={t("actions")}
          width={150}
          locked
          sortable={false}
          filterable={false}
          resizable={false}
          cells={{ data: ActionCellComponent }}
        />
      ) : null;

    const dataCols = columns.map((col) => {
      const columnProps: GridColumnProps = {
        id: col.field,
        field: col.field,
        title: col.title ?? col.field,
        width: col.width ?? 120,
        minWidth: 80,
        sortable: true,
      };
      if (col.cell && typeof col.cell === "function") {
        columnProps.cells = {
          data: (props: {
            dataItem: T;
            field?: string;
            tdProps?: React.TdHTMLAttributes<HTMLTableCellElement> | null;
          }) => {
            const content = col.cell!({
              dataItem: props.dataItem,
              field: props.field,
              tdProps: props.tdProps ?? null,
            });
            return (
              <td {...(props.tdProps ?? {})} className="k-table-td">
                {content}
              </td>
            );
          },
        };
      }
      return <GridColumn key={col.field} {...columnProps} />;
    });

    return actionCol ? [actionCol, ...dataCols] : dataCols;
  }, [columns, hasActions, ActionCellComponent, t]);

  const gridPageSize = 9999; // Show all rows - no effective pagination

  return (
    <div
      className="k-grid-container min-w-0 shrink-0 overflow-auto rounded border border-slate-500 bg-white dark:border-slate-700 dark:bg-slate-800/50"
      style={{ height: TABLE_HEIGHT }}
    >
      <Grid
        data={data}
        dataItemKey={accessorId}
        pageable={false}
        pageSize={gridPageSize}
        sortable
        filterable={false}
        resizable
        reorderable
        defaultColumnsState={defaultColumnsState}
        columnsState={columnsState}
        onColumnsStateChange={handleColumnsStateChange}
        scrollable="scrollable"
        className="w-full"
        style={{ height: "100%", minHeight: 0 }}
      >
        {kendoColumns}
        <GridToolbar>
          <GridCsvExportButton>{t("excel")}</GridCsvExportButton>
          <GridPdfExportButton>{t("pdf")}</GridPdfExportButton>
          {canSaveLayout && (
            <>
              <Button
                type="button"
                fillMode="flat"
                onClick={handleSaveLayout}
                disabled={updateLayoutMutation.isPending}
                title={t("saveLayout")}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                {t("saveLayout")}
              </Button>
              <Button
                type="button"
                fillMode="flat"
                onClick={handleDefaultLayout}
                disabled={updateLayoutMutation.isPending}
                title={t("defaultLayout")}
                className="flex items-center gap-1"
              >
                <LayoutGrid className="h-4 w-4" />
                {t("defaultLayout")}
              </Button>
            </>
          )}
          <GridToolbarSpacer />
          <GridSearchBox placeholder={tc("search") ?? "Search..."} />
        </GridToolbar>
      </Grid>
    </div>
  );
}
