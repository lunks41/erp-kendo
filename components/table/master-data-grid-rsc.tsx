/**
 * Master Data Grid – RSC-style (server data + server action)
 *
 * Use from a Server Component page: pass server-fetched data, dataState (e.g. from
 * cookies), and a server action for onDataStateChange. Per Kendo RSC docs, the
 * handler should use 'use server' in the page; this wrapper is a Client Component
 * so the Grid can receive that action (Next.js serializes it) and we can call
 * router.refresh() after the action completes.
 *
 * Paging (server-side):
 * - Grid receives skip, take, total from dataState and total prop.
 * - On page/sort/size change, onDataStateChange (server action) runs on the server.
 * - Then router.refresh() re-renders the Server Component with new data.
 *
 * @see https://www.telerik.com/kendo-react-ui/components/grid/rsc-mode
 */
"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridToolbar,
  GridToolbarSpacer,
  GridSearchBox,
  GridCsvExportButton,
  GridPdfExportButton,
} from "@progress/kendo-react-grid";
import { LayoutGrid, Plus, RotateCcw, Save, Search, X } from "lucide-react";
import { createActionCell } from "./master-action-cell";
import type {
  GridColumnProps,
  GridColumnsStateChangeEvent,
  GridDataStateChangeEvent,
  GridGroupExpandChangeEvent,
} from "@progress/kendo-react-grid";
import type { State } from "@progress/kendo-data-query";
import { GridTooltipCell } from "./grid-tooltip-cell";
import { useGetGridLayout, useUpdateGridLayout } from "@/hooks/use-settings";
import { getCompanyIdFromSession } from "@/lib/api-client";
import {
  buildDefaultColumnsState,
  normalizeLayout,
  parseGridLayoutToColumnsState,
  serializeColumnsStateToLayout,
  type GridLayoutLike,
} from "@/lib/grid-layout-utils";

/** Fixed grid height; data area scrolls inside. */
const DEFAULT_TABLE_HEIGHT = "min(650px, 70vh)";

/**
 * Alias for server actions: Kendo's GridDataStateChangeEvent (only dataState is serialized).
 * Re-exported for pages that define 'use server' handlers.
 */
export type GridDataStateChangeServerEvent = GridDataStateChangeEvent;

export interface MasterDataGridRSCColumn extends Omit<
  GridColumnProps,
  "children" | "minWidth"
> {
  field: string;
  title?: string;
  width?: string | number;
  minWidth?: string | number;
  flex?: boolean;
  locked?: boolean;
  hidden?: boolean;
}

export interface MasterDataGridRSCActionHandlers<T = unknown> {
  onView?: (dataItem: T) => void;
  onEdit?: (dataItem: T) => void;
  onDelete?: (dataItem: T) => void;
}

export interface MasterDataGridRSCProps<T = unknown> {
  data: T[];
  columns: MasterDataGridRSCColumn[];
  dataItemKey: string;
  /** Server-controlled data state (e.g. from cookies or URL). Required for RSC mode. */
  dataState?: State;
  /** Server action: call with 'use server' and persist state (e.g. cookies().set(...)). Matches Kendo RSC pattern. */
  onDataStateChange?: (event: GridDataStateChangeEvent) => Promise<void>;
  /** Optional server action for group expand (save groupExpand in state). */
  onGroupExpandChange?: (event: GridGroupExpandChangeEvent) => Promise<void>;
  pageable?: boolean;
  pageSize?: number;
  /** Total record count for server-side pagination (required to show pager when using server data). */
  total?: number;
  sortable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  tableHeight?: string;
  csvFileName?: string;
  pdfEnabled?: boolean;
  scrollableMode?: "scrollable" | "virtual";
  /** Search box placeholder (or use grid namespace). */
  searchPlaceholder?: string;
  searchFields?: string[];
  pageSizes?: number[];
  /** Optional column(s) to render before data columns (e.g. extra custom columns). */
  children?: React.ReactNode;
  /** Optional row actions (View/Edit/Delete). When set, an actions column is rendered. */
  actions?: MasterDataGridRSCActionHandlers<T>;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  /** Show actions column first (true) or last (false). Default true. Same as MasterDataGrid. */
  actionsColumnFirst?: boolean;
  /** Toolbar: Add button (e.g. "Add Vessel") */
  onAdd?: () => void;
  addButtonLabel?: string;
  /** Toolbar: Refresh button */
  onRefresh?: () => void;
  /** Toolbar: external search – value and handlers (when set, shows search input + Search button) */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onSearchClear?: () => void;
  /** When true, do not call router.refresh() after onDataStateChange (e.g. when using client-only state). */
  skipRefreshOnStateChange?: boolean;
  /** When set with transactionId and tableName, load/save grid layout (column order/visibility) from server. Same as MasterDataGrid. */
  moduleId?: number | string;
  transactionId?: number | string;
  tableName?: string;
}

/**
 * Grid that accepts server-fetched data and a server action for state changes.
 * Page stays a Server Component; this wrapper is client so the Grid can receive handlers.
 */
export function MasterDataGridRSC<T extends object>({
  data,
  columns,
  dataItemKey,
  dataState,
  onDataStateChange,
  onGroupExpandChange,
  pageable = true,
  pageSize = 100,
  total: totalProp,
  sortable = true,
  className,
  style,
  tableHeight = DEFAULT_TABLE_HEIGHT,
  csvFileName = "grid-export",
  pdfEnabled = true,
  scrollableMode = "scrollable",
  searchPlaceholder,
  searchFields,
  pageSizes: pageSizesProp = [50, 100, 500],
  children,
  actions = {},
  showView = true,
  showEdit = true,
  showDelete = true,
  actionsColumnFirst = true,
  onAdd,
  addButtonLabel,
  onRefresh,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  skipRefreshOnStateChange = false,
  moduleId: moduleIdProp,
  transactionId: transactionIdProp,
  tableName: tableNameProp,
}: MasterDataGridRSCProps<T>) {
  const t = useTranslations("grid");
  const tc = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();

  const moduleId = moduleIdProp?.toString() ?? "";
  const transactionId = transactionIdProp?.toString() ?? "";
  const tableName = tableNameProp ?? "";

  const { data: gridLayoutResponse } = useGetGridLayout(
    moduleId,
    transactionId,
    tableName,
  );
  const updateLayoutMutation = useUpdateGridLayout();

  const rawLayout = gridLayoutResponse?.data ?? gridLayoutResponse;
  const layout = useMemo(
    () =>
      normalizeLayout(rawLayout, tableName) ??
      (rawLayout as GridLayoutLike | undefined),
    [rawLayout, tableName],
  );

  const baseColumnFields = columns.map((c) => c.field);
  const hasActions = !!(actions.onView || actions.onEdit || actions.onDelete);
  const { onView, onEdit, onDelete } = actions;

  const defaultColumnsState = useMemo(() => {
    if (!moduleId || !transactionId || !tableName) return undefined;
    const fields = hasActions
      ? ["__actions", ...baseColumnFields]
      : baseColumnFields;
    const hiddenFields = new Set(
      columns.filter((c) => c.hidden).map((c) => c.field),
    );
    const parsed = parseGridLayoutToColumnsState(
      layout as GridLayoutLike | undefined,
      fields,
    );
    if (!parsed) return undefined;
    let result = parsed.map((col) => ({
      ...col,
      hidden: hiddenFields.has(col.field ?? col.id ?? "") || col.hidden,
    }));
    // When we have actions, ensure __actions is always first and visible (saved layout may omit or hide it)
    if (hasActions) {
      const actionsEntry = result.find((c) => (c.field ?? c.id) === "__actions");
      const rest = result.filter((c) => (c.field ?? c.id) !== "__actions");
      const actionsState = actionsEntry
        ? { ...actionsEntry, hidden: false, orderIndex: 0 }
        : { id: "__actions", field: "__actions", hidden: false, orderIndex: 0 };
      result = [
        actionsState,
        ...rest.map((c, i) => ({ ...c, orderIndex: i + 1 })),
      ] as typeof result;
    }
    return result;
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
      columnsStateRef.current = null;
    }
    prevLayoutIdsRef.current = key;
  }, [moduleId, transactionId, tableName]);

  // Seed column state from normalized default so the actions column is never hidden by saved layout
  const hasLayoutIds = !!(moduleId && transactionId && tableName);
  useEffect(() => {
    if (
      hasLayoutIds &&
      defaultColumnsState != null &&
      columnsState == null &&
      columnsStateRef.current == null
    ) {
      setColumnsState(defaultColumnsState);
      columnsStateRef.current = defaultColumnsState;
    }
  }, [hasLayoutIds, defaultColumnsState, columnsState]);

  const handleColumnsStateChange = useCallback(
    (e: GridColumnsStateChangeEvent) => {
      columnsStateRef.current = e.columnsState;
      setColumnsState(e.columnsState);
    },
    [],
  );

  const handleDefaultLayoutInternal = useCallback(() => {
    if (!moduleId || !transactionId || !tableName) return;
    const companyId = getCompanyIdFromSession();
    if (!companyId) return;
    const fields = hasActions
      ? ["__actions", ...baseColumnFields]
      : baseColumnFields;
    const hiddenFields = new Set(
      columns.filter((c) => c.hidden).map((c) => c.field),
    );
    const defaultState = buildDefaultColumnsState(fields, hiddenFields);
    setColumnsState(defaultState);
    columnsStateRef.current = defaultState;
    const { grdColOrder, grdColVisible, grdColSize } =
      serializeColumnsStateToLayout(defaultState);
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
        grdSort: "",
        grdGroup: "",
        grdString: "",
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
    updateLayoutMutation,
    queryClient,
  ]);

  const handleSaveLayoutInternal = useCallback(() => {
    if (!moduleId || !transactionId || !tableName) return;
    const companyId = getCompanyIdFromSession();
    if (!companyId) return;
    const layoutData = layout as { grdString?: string; grdSort?: string };
    let payload: { grdColOrder: string; grdColVisible: string; grdColSize: string };
    if (columnsStateRef.current) {
      payload = serializeColumnsStateToLayout(columnsStateRef.current);
    } else {
      const fields = hasActions
        ? ["__actions", ...baseColumnFields]
        : baseColumnFields;
      const hiddenFields = new Set(
        columns.filter((c) => c.hidden).map((c) => c.field),
      );
      const defaultState = buildDefaultColumnsState(fields, hiddenFields);
      payload = serializeColumnsStateToLayout(defaultState);
    }
    const { grdColOrder, grdColVisible, grdColSize } = payload;
    const currentSort = dataState?.sort;
    const grdSort =
      currentSort && currentSort.length > 0
        ? JSON.stringify(currentSort)
        : (layoutData?.grdSort ?? "");
    updateLayoutMutation.mutate({
      companyId: Number(companyId),
      moduleId: Number(moduleId),
      transactionId: Number(transactionId),
      grdName: tableName,
      grdKey: tableName,
      grdColOrder,
      grdColVisible,
      grdColSize,
      grdSort,
      grdGroup: "",
      grdString: layoutData?.grdString ?? "",
    });
  }, [
    moduleId,
    transactionId,
    tableName,
    layout,
    dataState?.sort,
    updateLayoutMutation,
    hasActions,
    baseColumnFields,
    columns,
  ]);

  const canSaveLayout = !!(moduleId && transactionId && tableName);
  const showToolbar =
    !!onAdd || !!onRefresh || !!onSearchSubmit || canSaveLayout;

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

  const handleDataStateChange = useCallback(
    async (e: GridDataStateChangeEvent) => {
      if (!onDataStateChange) return;
      await onDataStateChange(e);
      if (!skipRefreshOnStateChange) {
        setTimeout(() => router.refresh(), 50);
      }
    },
    [onDataStateChange, router, skipRefreshOnStateChange],
  );

  const handleGroupExpandChange = useCallback(
    async (e: GridGroupExpandChangeEvent) => {
      if (!onGroupExpandChange) return;
      await onGroupExpandChange(e);
      setTimeout(() => router.refresh(), 0);
    },
    [onGroupExpandChange, router],
  );

  const gridSearchFields = searchFields ?? baseColumnFields;
  const gridPageSize = pageable ? pageSize : 1000;
  const scrollableValue =
    scrollableMode === "virtual" ? "virtual" : "scrollable";

  const gridPageSizes = (() => {
    const base = pageSizesProp.length > 0 ? pageSizesProp : [50, 100, 500];
    if (pageable && pageSize && !base.includes(pageSize)) {
      return [...base, pageSize].sort((a, b) => a - b);
    }
    return base;
  })();

  const dataColumns = columns.map((col) => {
    const {
      field,
      title,
      width,
      minWidth,
      flex,
      locked,
      sortable: colSortable,
      cells: colCells,
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
        filterable={false}
        cells={colCells ?? { data: GridTooltipCell }}
        {...rest}
      />
    );
  });

  const actionsColumn =
    hasActions && ActionCellComponent ? (
      <GridColumn
        key="__actions"
        id="__actions"
        field="__actions"
        title={t("actions")}
        width={130}
        locked
        sortable={false}
        filterable={false}
        resizable={false}
        cells={{ data: ActionCellComponent }}
      />
    ) : null;

  const orderedColumns =
    hasActions && ActionCellComponent
      ? actionsColumnFirst
        ? [actionsColumn, children, ...dataColumns].filter(Boolean)
        : [...dataColumns, children, actionsColumn].filter(Boolean)
      : [children, ...dataColumns].filter(Boolean);

  return (
    <div
      className={`flex min-w-0 w-full max-w-full flex-col gap-4 ${className ?? ""}`.trim()}
    >
      {showToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {onAdd && (
              <Button themeColor="primary" onClick={onAdd}>
                <Plus size={18} className="mr-1.5 inline" />
                {addButtonLabel ?? tc("add")}
              </Button>
            )}
            {onRefresh && (
              <Button onClick={onRefresh} title={t("refresh")}>
                <RotateCcw size={18} className="mr-1.5 inline" />
                {t("refresh")}
              </Button>
            )}
            {canSaveLayout && (
              <>
                <Button
                  onClick={handleSaveLayoutInternal}
                  title={t("saveLayout")}
                  disabled={updateLayoutMutation.isPending}
                >
                  <Save size={18} className="mr-1.5 inline" />
                  {t("saveLayout")}
                </Button>
                <Button
                  onClick={handleDefaultLayoutInternal}
                  title={t("defaultLayout")}
                  disabled={updateLayoutMutation.isPending}
                >
                  <LayoutGrid size={18} className="mr-1.5 inline" />
                  {t("defaultLayout")}
                </Button>
              </>
            )}
          </div>
          {onSearchSubmit != null && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchValue ?? ""}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onSearchSubmit?.();
                    }
                  }}
                  placeholder={searchPlaceholder ?? tc("search")}
                  className="min-w-[320px] rounded border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                />
                {(searchValue ?? "").length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange?.("");
                      onSearchClear?.();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-slate-200"
                    title={t("clearSearch")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                type="button"
                themeColor="primary"
                onClick={onSearchSubmit}
                title={t("search")}
              >
                <Search size={18} className="mr-1.5 inline" />
                {t("search")}
              </Button>
            </div>
          )}
        </div>
      )}
      <div
        className="k-grid-container min-w-0 w-full shrink-0 overflow-auto rounded border border-slate-500 bg-white dark:border-slate-700 dark:bg-slate-800/50"
        style={{ height: tableHeight }}
      >
        <Grid
          data={data}
          dataItemKey={dataItemKey}
          skip={dataState?.skip ?? 0}
          take={dataState?.take ?? gridPageSize}
          total={pageable && totalProp != null ? totalProp : undefined}
          sort={dataState?.sort}
          filter={dataState?.filter}
          group={dataState?.group}
          onDataStateChange={
            onDataStateChange ? handleDataStateChange : undefined
          }
          onGroupExpandChange={
            onGroupExpandChange ? handleGroupExpandChange : undefined
          }
          defaultColumnsState={defaultColumnsState}
          columnsState={columnsState}
          onColumnsStateChange={
            canSaveLayout ? handleColumnsStateChange : undefined
          }
          key={
            tableName
              ? `grid-${tableName}-${defaultColumnsState ? "layout-ready" : "default"}`
              : "grid-rsc"
          }
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
          sortable={sortable}
          filterable={false}
          resizable
          reorderable
          className={className}
          style={{ height: "100%", minHeight: 0, ...style }}
          autoProcessData={{
            search: true,
            sort: true,
            filter: false,
            // When total is set we use server-side paging: data is already the current page, so do not slice by skip/take
            page: pageable && totalProp != null ? false : true,
          }}
          searchFields={gridSearchFields}
          csv={{ fileName: csvFileName, allPages: true }}
          pdf={pdfEnabled}
          scrollable={scrollableValue}
        >
          {orderedColumns}
          <GridToolbar>
            <GridCsvExportButton>{t("excel")}</GridCsvExportButton>
            <GridPdfExportButton>{t("pdf")}</GridPdfExportButton>
            <GridToolbarSpacer />
            <GridSearchBox
              placeholder={searchPlaceholder ?? tc("search")}
              className="min-w-[320px]"
            />
          </GridToolbar>
        </Grid>
      </div>
    </div>
  );
}
