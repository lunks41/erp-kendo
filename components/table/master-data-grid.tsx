"use client";

import { useMemo, useCallback, useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
  GridDataStateChangeEvent,
} from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import type { State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Plus, RotateCcw, Save, LayoutGrid, Search, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetGridLayout, useUpdateGridLayout } from "@/hooks/use-settings";
import {
  buildDefaultColumnsState,
  parseGridLayoutToColumnsState,
  serializeColumnsStateToLayout,
  normalizeLayout,
  type GridLayoutLike,
} from "@/lib/grid-layout-utils";
import { getCompanyIdFromSession } from "@/lib/api-client";
import { createActionCell } from "./master-action-cell";
import { GridTooltipCell } from "./grid-tooltip-cell";

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
  /** External search: current value (controlled). When set with onSearchChange/onSearchSubmit, shows search box + Search button on toolbar right. */
  searchValue?: string;
  /** Called when search input value changes (e.g. user types). */
  onSearchChange?: (value: string) => void;
  /** Called when user clicks Search or presses Enter. Use to apply search and e.g. reset to page 1. */
  onSearchSubmit?: () => void;
  /** Called when user clicks the clear (X) button. Use to clear filter and refetch (e.g. set filter to "", reset page). */
  onSearchClear?: () => void;
  /** Override grid container height (e.g. "min(450px, 55vh)" for dialog use) */
  tableHeight?: string;
  /** Enable grouping (group panel + column menu "Group by this column"). Default true. */
  groupable?: boolean;
}
/** Fixed grid height; data area scrolls inside. Pagination stays visible. */
const DEFAULT_TABLE_HEIGHT = "min(650px, 70vh)";

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
  showAdd = true,
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
  currentPage = 1,
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
  searchValue: searchValueProp,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  tableHeight,
  groupable = true,
}: MasterDataGridProps<T>) {
  const effectiveTableHeight = tableHeight ?? DEFAULT_TABLE_HEIGHT;
  const t = useTranslations("grid");
  const tc = useTranslations("common");
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

  const queryClient = useQueryClient();
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

  // Parse saved sort/group from layout (e.g. grdSort: '[{"field":"ProductName","dir":"asc"}]', grdGroup: '[{"field":"Category.CategoryName"}]')
  const initialSortGroup = useMemo(() => {
    const layoutRecord =
      rawLayout && Array.isArray(rawLayout)
        ? ((rawLayout as Record<string, unknown>[]).find(
            (item) => item?.grdName === tableName || item?.grdKey === tableName,
          ) ?? (rawLayout as Record<string, unknown>[])[0])
        : (rawLayout as Record<string, unknown> | null);
    const grdSortStr =
      typeof layoutRecord?.grdSort === "string" ? layoutRecord.grdSort : "";
    const grdGroupStr =
      typeof layoutRecord?.grdGroup === "string" ? layoutRecord.grdGroup : "";
    const parseSort = (): State["sort"] => {
      if (!grdSortStr?.trim()) return undefined;
      try {
        const parsed = JSON.parse(grdSortStr) as unknown;
        return Array.isArray(parsed) ? (parsed as State["sort"]) : undefined;
      } catch {
        return undefined;
      }
    };
    const parseGroup = (): State["group"] => {
      if (!grdGroupStr?.trim()) return undefined;
      try {
        const parsed = JSON.parse(grdGroupStr) as unknown;
        return Array.isArray(parsed) ? (parsed as State["group"]) : undefined;
      } catch {
        return undefined;
      }
    };
    return { sort: parseSort(), group: parseGroup() };
  }, [rawLayout, tableName]);

  const [sortState, setSortState] = useState<State["sort"]>(
    initialSortGroup.sort,
  );
  const [groupState, setGroupState] = useState<State["group"]>(
    initialSortGroup.group,
  );
  const sortGroupRef = useRef<{ sort?: State["sort"]; group?: State["group"] }>(
    {
      sort: initialSortGroup.sort,
      group: initialSortGroup.group,
    },
  );

  const [clientSkipTake, setClientSkipTake] = useState({ skip: 0, take: pageSize });

  const prevLayoutIdsRef = useRef<string>("");
  useEffect(() => {
    const key = [moduleId, transactionId, tableName].join("|");
    if (prevLayoutIdsRef.current && prevLayoutIdsRef.current !== key) {
      queueMicrotask(() => {
        setColumnsState(undefined);
        setSortState(undefined);
        setGroupState(undefined);
        setClientSkipTake({ skip: 0, take: pageSize });
        sortGroupRef.current = { sort: undefined, group: undefined };
      });
    }
    prevLayoutIdsRef.current = key;
  }, [moduleId, transactionId, tableName, pageSize]);

  useEffect(() => {
    const sort = initialSortGroup.sort;
    const group = initialSortGroup.group;
    queueMicrotask(() => {
      setSortState(sort);
      setGroupState(group);
    });
  }, [initialSortGroup.sort, initialSortGroup.group]);

  const handleDataStateChange = useCallback((e: GridDataStateChangeEvent) => {
    const ds = e.dataState;
    const isPagingChange =
      ds.skip !== undefined || ds.take !== undefined;

    if (ds.sort !== undefined) {
      if (
        !serverSidePagination ||
        ds.sort.length > 0 ||
        !isPagingChange
      ) {
        setSortState(ds.sort);
        sortGroupRef.current = { ...sortGroupRef.current, sort: ds.sort };
      }
    }
    if (ds.group !== undefined) {
      if (
        !serverSidePagination ||
        ds.group.length > 0 ||
        !isPagingChange
      ) {
        setGroupState(ds.group);
        sortGroupRef.current = { ...sortGroupRef.current, group: ds.group };
      }
    }
    if (!serverSidePagination && (ds.skip !== undefined || ds.take !== undefined)) {
      setClientSkipTake((prev) => ({
        skip: ds.skip !== undefined ? ds.skip : prev.skip,
        take: ds.take !== undefined ? ds.take : prev.take,
      }));
    }
  }, [serverSidePagination]);

  const handleColumnsStateChange = useCallback(
    (e: GridColumnsStateChangeEvent) => {
      columnsStateRef.current = e.columnsState;
      setColumnsState(e.columnsState);
      // Layout is only saved when user clicks "Save layout" button
    },
    [],
  );

  const ActionCellComponent = useMemo(
    () =>
      hasActions
        ? createActionCell<T>(
            onView,
            onEdit,
            onDelete,
            showView && !!onView,
            showEdit && !!onEdit,
            showDelete && !!onDelete,
          )
        : null,
    [hasActions, onView, onEdit, onDelete, showView, showEdit, showDelete],
  );

  const handlePageChange = (e: GridPageChangeEvent) => {
    const { skip: newSkip, take: newTake } = e.page;
    const newPage = Math.floor(newSkip / newTake) + 1;
    onPageChange?.(newPage);
    if (newTake !== pageSize) {
      onPageSizeChange?.(newTake);
    }
  };

  const gridSkip = serverSidePagination
    ? typeof skip === "number"
      ? skip
      : (currentPage - 1) * pageSize
    : undefined;

  const processedResult = useMemo(() => {
    if (serverSidePagination) {
      if (groupState?.length || sortState?.length) {
        return process(data, {
          sort: sortState,
          group: groupState,
        });
      }
      return null;
    }
    return process(data, {
      sort: sortState,
      group: groupState,
      skip: clientSkipTake.skip,
      take: clientSkipTake.take,
    });
  }, [data, serverSidePagination, sortState, groupState, clientSkipTake]);

  const gridData =
    serverSidePagination && !processedResult
      ? data
      : (processedResult?.data ?? data);
  const gridTotalResolved = serverSidePagination
    ? typeof total === "number"
      ? total
      : undefined
    : (processedResult?.total ?? data.length);
  const gridSkipResolved = serverSidePagination
    ? gridSkip
    : (pageable ? clientSkipTake.skip : undefined);
  const gridTakeResolved = serverSidePagination
    ? undefined
    : (pageable ? clientSkipTake.take : undefined);

  const handleDefaultLayout = useCallback(() => {
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
    setSortState(undefined);
    setGroupState(undefined);
    sortGroupRef.current = { sort: undefined, group: undefined };
    const { grdColOrder, grdColVisible, grdColSize } =
      serializeColumnsStateToLayout(defaultState);
    const layoutData = layout as { grdString?: string };
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
      grdGroup?: string;
      grdString?: string;
    };
    const { grdColOrder, grdColVisible, grdColSize } = columnsStateRef.current
      ? serializeColumnsStateToLayout(columnsStateRef.current)
      : {
          grdColOrder: layoutData?.grdColOrder ?? "",
          grdColVisible: layoutData?.grdColVisible ?? "",
          grdColSize: layoutData?.grdColSize ?? "",
        };
    // Serialize current sort and group like: sort: [{ field: 'ProductName', dir: 'asc' }], group: [{ field: 'Category.CategoryName' }]
    const currentSort = sortGroupRef.current?.sort;
    const currentGroup = sortGroupRef.current?.group;
    const grdSort =
      currentSort && currentSort.length > 0
        ? JSON.stringify(currentSort)
        : (layoutData?.grdSort ?? "");
    const grdGroup =
      currentGroup && currentGroup.length > 0
        ? JSON.stringify(currentGroup)
        : (layoutData?.grdGroup ?? "");
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
      grdGroup,
      grdString: layoutData?.grdString ?? "",
    });
  }, [moduleId, transactionId, tableName, layout, updateLayoutMutation]);

  const canSaveLayout = !!(moduleId && transactionId && tableName);
  const showSearchBar = onSearchSubmit != null;
  const showToolbar = onAdd || onRefresh || canSaveLayout || showSearchBar;

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
      title={t("actions")}
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
      hidden,
      sortable: colSortable,
      filterable: colFilterable,
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
        hidden={hidden}
        sortable={colSortable ?? sortable}
        filterable={false}
        cells={colCells ?? { data: GridTooltipCell }}
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
    <div
      className={`flex min-w-0 w-full max-w-full flex-col gap-4 ${className ?? ""}`.trim()}
    >
      {showToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {showAdd && onAdd && (
              <Button themeColor="primary" onClick={onAdd}>
                <Plus size={18} className="mr-1.5 inline" />
                {addButtonLabel}
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
                  onClick={handleSaveLayout}
                  title={t("saveLayout")}
                  disabled={updateLayoutMutation.isPending}
                >
                  <Save size={18} className="mr-1.5 inline" />
                  {t("saveLayout")}
                </Button>
                <Button
                  onClick={handleDefaultLayout}
                  title={t("defaultLayout")}
                  disabled={updateLayoutMutation.isPending}
                >
                  <LayoutGrid size={18} className="mr-1.5 inline" />
                  {t("defaultLayout")}
                </Button>
              </>
            )}
          </div>
          {showSearchBar && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchValueProp ?? ""}
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
                {(searchValueProp ?? "").length > 0 && (
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
        style={{ height: effectiveTableHeight }}
      >
        <Grid
          data={gridData}
          dataItemKey={dataItemKey}
          sort={sortState}
          group={groupState}
          onDataStateChange={handleDataStateChange}
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
          pageSize={gridTakeResolved ?? gridPageSize}
          skip={gridSkipResolved}
          total={gridTotalResolved}
          sortable={sortable}
          filterable={false}
          groupable={groupable}
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
            sort: serverSidePagination,
            filter: false,
            page: false,
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
