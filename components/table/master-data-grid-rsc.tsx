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

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
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
  GridDataStateChangeEvent,
  GridGroupExpandChangeEvent,
} from "@progress/kendo-react-grid";
import type { State } from "@progress/kendo-data-query";
import { GridTooltipCell } from "./grid-tooltip-cell";

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
  /** Optional row actions (View/Edit/Delete). When set, an actions column is rendered first. */
  actions?: MasterDataGridRSCActionHandlers<T>;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
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
  /** Optional layout buttons (when provided, show Store layout / Default layout; when showLayoutButtons true but handlers missing, show disabled) */
  onSaveLayout?: () => void;
  onDefaultLayout?: () => void;
  saveLayoutLoading?: boolean;
  /** When true, show Store layout / Default layout buttons (disabled if handlers not provided) */
  showLayoutButtons?: boolean;
  /** When true, do not call router.refresh() after onDataStateChange (e.g. when using client-only state). */
  skipRefreshOnStateChange?: boolean;
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
  pageSizes: pageSizesProp,
  children,
  actions = {},
  showView = true,
  showEdit = true,
  showDelete = true,
  onAdd,
  addButtonLabel,
  onRefresh,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  onSaveLayout,
  onDefaultLayout,
  saveLayoutLoading = false,
  showLayoutButtons = false,
  skipRefreshOnStateChange = false,
}: MasterDataGridRSCProps<T>) {
  const t = useTranslations("grid");
  const tc = useTranslations("common");
  const router = useRouter();
  const showLayout =
    !!onSaveLayout || !!onDefaultLayout || showLayoutButtons;
  const showToolbar =
    !!onAdd || !!onRefresh || !!onSearchSubmit || showLayout;
  const { onView, onEdit, onDelete } = actions;
  const hasActions = !!(onView || onEdit || onDelete);
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

  const baseColumnFields = columns.map((c) => c.field);
  const gridSearchFields = searchFields ?? baseColumnFields;
  const gridPageSize = pageable ? pageSize : 1000;
  const scrollableValue =
    scrollableMode === "virtual" ? "virtual" : "scrollable";

  const gridPageSizes = (() => {
    if (pageSizesProp?.length) return pageSizesProp;
    const base = [50, 100, 500];
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
        filterable={false}
        sortable={false}
        cells={{ data: ActionCellComponent }}
      />
    ) : null;

  const orderedColumns = (
    <>
      {actionsColumn}
      {children}
      {dataColumns}
    </>
  );

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
            {(onSaveLayout || showLayoutButtons) && (
              <Button
                onClick={onSaveLayout}
                title={onSaveLayout ? t("saveLayout") : "Save layout (not available for RSC grid)"}
                disabled={saveLayoutLoading || !onSaveLayout}
              >
                <Save size={18} className="mr-1.5 inline" />
                {t("saveLayout")}
              </Button>
            )}
            {(onDefaultLayout || showLayoutButtons) && (
              <Button
                onClick={onDefaultLayout}
                title={onDefaultLayout ? t("defaultLayout") : "Default layout (not available for RSC grid)"}
                disabled={saveLayoutLoading || !onDefaultLayout}
              >
                <LayoutGrid size={18} className="mr-1.5 inline" />
                {t("defaultLayout")}
              </Button>
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
