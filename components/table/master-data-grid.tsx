"use client";

import { useMemo, useCallback, useRef, useState, useEffect } from "react";
import {
  Grid,
  GridColumn,
  GridToolbar,
  GridToolbarSpacer,
  GridSearchBox,
  GridCsvExportButton,
  GridPdfExportButton,
  GridColumnMenuSort,
  GridColumnMenuFilter,
  GridColumnMenuColumnsChooser,
  GridColumnMenuGroup,
} from "@progress/kendo-react-grid";
import type {
  GridPageChangeEvent,
  GridColumnsStateChangeEvent,
  GridColumnProps,
  GridColumnMenuProps,
} from "@progress/kendo-react-grid";
import { Button } from "@progress/kendo-react-buttons";
import { Plus, RotateCcw, Save } from "lucide-react";
import { useGetGridLayout, useUpdateGridLayout } from "@/hooks/use-settings";
import {
  parseGridLayoutToColumnsState,
  serializeColumnsStateToLayout,
  normalizeLayout,
  type GridLayoutLike,
} from "@/lib/grid-layout-utils";
import { getCompanyIdFromSession } from "@/lib/api-client";
import { createActionCell } from "./master-action-cell";

export interface MasterDataGridActionHandlers<T = unknown> {
  onView?: (dataItem: T) => void;
  onEdit?: (dataItem: T) => void;
  onDelete?: (dataItem: T) => void;
}

export interface MasterDataGridColumn extends Omit<
  GridColumnProps,
  "children" | "minWidth"
> {
  field: string;
  title?: string;
  width?: string | number;
  minWidth?: string | number;
  flex?: boolean;
  locked?: boolean;
  /** Hide column initially (user can still show via column menu) */
  hidden?: boolean;
}

export interface MasterDataGridProps<T = unknown> {
  data: T[];
  columns: MasterDataGridColumn[];
  dataItemKey: string;
  actions?: MasterDataGridActionHandlers<T>;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showAdd?: boolean;
  pageable?: boolean;
  pageSize?: number;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** For server-side pagination: records to skip */
  skip?: number;
  /** For server-side pagination: total record count */
  total?: number;
  /** Called when page changes; receives 1-based page number */
  onPageChange?: (page: number) => void;
  /** Called when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Current 1-based page (used with skip for server-side) */
  currentPage?: number;
  serverSidePagination?: boolean;
  moduleId?: number | string;
  transactionId?: number | string;
  /** Table name for grid layout lookup (e.g. TableName.port) */
  tableName?: string;
  /** Add button click handler */
  onAdd?: () => void;
  /** Add button label */
  addButtonLabel?: string;
  /** Refresh button click handler */
  onRefresh?: () => void;
  /** Search box placeholder */
  searchPlaceholder?: string;
  /** Search fields for GridSearchBox (defaults to column fields) */
  searchFields?: string[];
  /** CSV export file name */
  csvFileName?: string;
  /** Enable PDF export */
  pdfEnabled?: boolean;
  /** Scroll mode: "scrollable" | "virtual" - fixed height + scrollable data */
  scrollableMode?: "scrollable" | "virtual";
  /** Show actions column first (true) or last (false) */
  actionsColumnFirst?: boolean;
  /** Enable column menu (filter, sort, columns chooser). Default true. */
  columnMenu?: boolean;
  /** Page size dropdown options. Defaults to [50,100,500] with current pageSize included. */
  pageSizes?: number[];
}
/** Fixed grid height; data area scrolls inside. Pagination stays visible. */
const TABLE_HEIGHT = "min(650px, 70vh)";

function DefaultColumnMenu(props: GridColumnMenuProps) {
  return (
    <>
      <GridColumnMenuSort {...props} />
      <GridColumnMenuFilter {...props} />
      <GridColumnMenuGroup {...props} />
      <GridColumnMenuColumnsChooser {...props} />
    </>
  );
}

export function MasterDataGrid<T extends object>({
  data,
  columns,
  dataItemKey,
  actions = {},
  showView = true,
  showEdit = true,
  showDelete = true,
  showAdd: _showAdd = true,
  pageable = true,
  pageSize = 100,
  sortable = true,
  filterable = false,
  className,
  style,
  skip,
  total,
  onPageChange,
  onPageSizeChange,
  currentPage: _currentPage = 1,
  serverSidePagination,
  moduleId,
  transactionId,
  tableName = "",
  onAdd,
  addButtonLabel = "Add",
  onRefresh,
  searchPlaceholder = "Search...",
  searchFields,
  csvFileName = "grid-export",
  pdfEnabled = true,
  scrollableMode = "scrollable",
  actionsColumnFirst = true,
  columnMenu = true,
  pageSizes: pageSizesProp,
}: MasterDataGridProps<T>) {
  const { onView, onEdit, onDelete } = actions;
  const hasActions = !!(onView || onEdit || onDelete);

  const baseColumnFields = useMemo(
    () => columns.map((c) => c.field),
    [columns],
  );

  const { data: gridLayoutResponse } = useGetGridLayout(
    moduleId?.toString() || "",
    transactionId?.toString() || "",
    tableName || "",
  );

  const updateLayoutMutation = useUpdateGridLayout();

  const rawLayout = gridLayoutResponse?.data ?? gridLayoutResponse;

  const layout = useMemo(
    () =>
      normalizeLayout(rawLayout, tableName) ??
      (rawLayout as GridLayoutLike | undefined),
    [rawLayout, tableName],
  );
  const defaultColumnsState = useMemo(() => {
    const fields = hasActions
      ? ["__actions", ...baseColumnFields]
      : baseColumnFields;
    const hiddenFields = new Set(
      columns.filter((c) => c.hidden).map((c) => c.field),
    );

    if (!moduleId || !transactionId || !tableName) {
      if (hiddenFields.size === 0) return undefined;
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
    if (!parsed) return undefined;
    if (hiddenFields.size === 0) return parsed;
    return parsed.map((col) => ({
      ...col,
      hidden: hiddenFields.has(col.field ?? col.id ?? "") || col.hidden,
    }));
  }, [
    layout,
    baseColumnFields,
    columns,
    hasActions,
    moduleId,
    transactionId,
    tableName,
  ]);

  const columnsStateRef = useRef<
    GridColumnsStateChangeEvent["columnsState"] | null
  >(null);
  const [columnsState, setColumnsState] = useState<
    GridColumnsStateChangeEvent["columnsState"] | undefined
  >(undefined);

  const prevLayoutIdsRef = useRef<string>("");
  useEffect(() => {
    const key = [moduleId, transactionId, tableName].join("|");
    if (prevLayoutIdsRef.current && prevLayoutIdsRef.current !== key) {
      setColumnsState(undefined);
    }
    prevLayoutIdsRef.current = key;
  }, [moduleId, transactionId, tableName]);

  const handleColumnsStateChange = useCallback(
    (e: GridColumnsStateChangeEvent) => {
      columnsStateRef.current = e.columnsState;
      setColumnsState(e.columnsState);
      if (!moduleId || !transactionId || !tableName) return;
      const companyId = getCompanyIdFromSession();
      if (!companyId) return;
      const { grdColOrder, grdColVisible, grdColSize } =
        serializeColumnsStateToLayout(e.columnsState);
      updateLayoutMutation.mutate({
        companyId: Number(companyId),
        moduleId: Number(moduleId),
        transactionId: Number(transactionId),
        grdName: tableName,
        grdKey: tableName,
        grdColOrder,
        grdColVisible,
        grdColSize,
        grdSort: (layout as { grdSort?: string })?.grdSort ?? "",
        grdString: (layout as { grdString?: string })?.grdString ?? "",
      });
    },
    [moduleId, transactionId, tableName, layout, updateLayoutMutation],
  );

  const ActionCellComponent = hasActions
    ? createActionCell<T>(
        onView,
        onEdit,
        onDelete,
        showView && !!onView,
        showEdit && !!onEdit,
        showDelete && !!onDelete,
      )
    : null;

  const handlePageChange = (e: GridPageChangeEvent) => {
    const { skip: newSkip, take: newTake } = e.page;
    const newPage = Math.floor(newSkip / newTake) + 1;
    onPageChange?.(newPage);
    if (newTake !== pageSize) {
      onPageSizeChange?.(newTake);
    }
  };

  const gridSkip =
    serverSidePagination && typeof skip === "number" ? skip : undefined;
  const gridTotal =
    serverSidePagination && typeof total === "number" ? total : undefined;

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
  const showToolbar = onAdd || onRefresh || canSaveLayout;

  const gridSearchFields = searchFields ?? baseColumnFields;
  const gridPageSize = pageable ? pageSize : 1000;
  const scrollableValue =
    scrollableMode === "virtual" ? "virtual" : "scrollable";

  const gridPageSizes = useMemo(() => {
    if (pageSizesProp?.length) return pageSizesProp;
    const base = [50, 100, 500];
    if (pageable && pageSize && !base.includes(pageSize)) {
      return [...base, pageSize].sort((a, b) => a - b);
    }
    return base;
  }, [pageSizesProp, pageable, pageSize]);

  const actionsColumn = hasActions && ActionCellComponent && (
    <GridColumn
      key="__actions"
      id="__actions"
      field="__actions"
      title="Actions"
      width={130}
      locked
      sortable={false}
      filterable={false}
      resizable={false}
      cells={{ data: ActionCellComponent }}
    />
  );

  const dataColumns = columns.map((col) => {
    const {
      field,
      title,
      width,
      minWidth,
      flex,
      locked,
      hidden: _hidden,
      sortable: colSortable,
      filterable: colFilterable,
      ...rest
    } = col;
    return (
      <GridColumn
        key={field}
        id={field}
        field={field}
        title={title ?? field}
        width={flex ? undefined : width}
        minWidth={(minWidth ?? (flex ? 120 : undefined)) as number | undefined}
        locked={locked}
        sortable={colSortable ?? sortable}
        filterable={colFilterable ?? filterable}
        {...rest}
      />
    );
  });

  const orderedColumns =
    hasActions && ActionCellComponent
      ? actionsColumnFirst
        ? [actionsColumn, ...dataColumns]
        : [...dataColumns, actionsColumn]
      : dataColumns;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {showToolbar && (
        <div className="flex justify-between gap-2">
          <div className="flex gap-2">
            {onAdd && (
              <Button themeColor="primary" onClick={onAdd}>
                <Plus size={18} className="mr-1.5 inline" />
                {addButtonLabel}
              </Button>
            )}
            {onRefresh && (
              <Button onClick={onRefresh} title="Refresh">
                <RotateCcw size={18} className="mr-1.5 inline" />
                Refresh
              </Button>
            )}
            {canSaveLayout && (
              <Button
                onClick={handleSaveLayout}
                title="Save layout"
                disabled={updateLayoutMutation.isPending}
              >
                <Save size={18} className="mr-1.5 inline" />
                Save layout
              </Button>
            )}
          </div>
        </div>
      )}
      <div
        className="k-grid-container min-w-0 shrink-0 overflow-hidden rounded border border-slate-500 bg-white dark:border-slate-700 dark:bg-slate-800/50"
        style={{ height: TABLE_HEIGHT }}
      >
        <Grid
          data={data}
          dataItemKey={dataItemKey}
          pageable={
            pageable
              ? {
                  pageSizes: gridPageSizes,
                  previousNext: true,
                  info: true,
                  responsive: true,
                }
              : false
          }
          pageSize={gridPageSize}
          skip={gridSkip}
          total={gridTotal}
          sortable={sortable}
          filterable={filterable}
          resizable
          reorderable
          columnMenu={columnMenu ? DefaultColumnMenu : undefined}
          defaultColumnsState={defaultColumnsState}
          columnsState={columnsState}
          onColumnsStateChange={handleColumnsStateChange}
          key={`grid-${tableName}-${defaultColumnsState ? "layout-ready" : "default"}`}
          className={className}
          style={{ height: "100%", minHeight: 0, ...style }}
          onPageChange={
            onPageChange || onPageSizeChange ? handlePageChange : undefined
          }
          autoProcessData={{
            search: true,
            sort: true,
            filter: filterable,
            page: pageable && !serverSidePagination,
          }}
          searchFields={gridSearchFields}
          csv={{ fileName: csvFileName, allPages: true }}
          pdf={pdfEnabled}
          scrollable={scrollableValue}
        >
          {orderedColumns}
          <GridToolbar>
            <GridCsvExportButton>Excel</GridCsvExportButton>
            <GridPdfExportButton>PDF</GridPdfExportButton>
            <GridToolbarSpacer />
            <GridSearchBox placeholder={searchPlaceholder} />
          </GridToolbar>
        </Grid>
      </div>
    </div>
  );
}
