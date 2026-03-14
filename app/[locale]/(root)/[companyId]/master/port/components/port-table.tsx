"use client";

import { memo, useMemo } from "react";
import { Check, X } from "lucide-react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IPort } from "@/interfaces/port";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface PortTableProps {
  data: IPort[];
  totalRecords?: number;
  onView: (item: IPort) => void;
  onEdit: (item: IPort) => void;
  onDelete: (item: IPort) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  addButtonLabel?: string;
  searchPlaceholder?: string;
  /** Current search/filter string for the toolbar search box */
  searchFilter?: string;
  /** Called when user changes the search input (e.g. types) */
  onSearchChange?: (value: string) => void;
  /** Called when user clicks Search or presses Enter (e.g. reset to page 1 and refetch) */
  onSearchSubmit?: () => void;
  /** Called when user clicks the clear (X) button in the search box */
  onSearchClear?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  currentPage?: number;
  pageSize?: number;
  /** Page size dropdown options (e.g. from user settings) */
  serverSidePagination?: boolean;
  moduleId?: number | string;
  transactionId?: number | string;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  canCreate?: boolean;
  /** Optional column overrides; when set, replaces default columns for flexibility */
  columns?: MasterDataGridColumn[];
}

function PortTableInner(props: PortTableProps) {
  const t = useNamespaceTranslations("port");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  const defaultColumns: MasterDataGridColumn[] = useMemo(
    () => [
      {
        field: "portId",
        title: "Port Id",
        width: 80,
        minWidth: 60,
        hidden: true,
      },
      { field: "portCode", title: tc("code"), width: 100, minWidth: 80 },
      { field: "portName", title: tc("name"), flex: true, minWidth: 150 },
      {
        field: "portShortName",
        title: t("shortName"),
        width: 100,
        minWidth: 100,
        media: "(min-width: 768px)",
      },
      {
        field: "portRegionName",
        title: t("region"),
        width: 120,
        minWidth: 100,
      },
      {
        field: "isActive",
        title: tc("active"),
        width: 100,
        minWidth: 100,
        cells: {
          data: (props) => {
            const isActive = (props.dataItem as IPort).isActive;
            const label = isActive ? tc("active") : tc("inactive");
            const bgClass = isActive
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white";
            return (
              <td {...props.tdProps} className="k-table-td">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${bgClass}`}
                  title={label}
                  aria-label={label}
                >
                  {isActive ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </span>
              </td>
            );
          },
        },
      },
      { field: "remarks", title: tc("remarks"), flex: true, minWidth: 100 },
      {
        field: "createBy",
        title: tc("createdBy"),
        width: 100,
        minWidth: 100,
        media: "(min-width: 992px)",
      },
      {
        field: "createDate",
        title: tc("createdDate"),
        width: 180,
        minWidth: 180,
        cells: {
          data: (props) => {
            const val = (props.dataItem as IPort).createDate;
            const text = formatDateTime(val, datetimeFormat);
            return (
              <td
                {...props.tdProps}
                className="k-table-td whitespace-nowrap"
                title={text}
              >
                {text}
              </td>
            );
          },
        },
      },
      {
        field: "editBy",
        title: tc("editedBy"),
        width: 100,
        minWidth: 100,
        media: "(min-width: 1200px)",
      },

      {
        field: "editDate",
        title: tc("editedDate"),
        width: 180,
        minWidth: 180,
        media: "(min-width: 1200px)",
        cells: {
          data: (props) => {
            const val = (props.dataItem as IPort).editDate;
            const text = formatDateTime(val, datetimeFormat);
            return (
              <td
                {...props.tdProps}
                className="k-table-td whitespace-nowrap"
                title={text}
              >
                {text}
              </td>
            );
          },
        },
      },
    ],
    [datetimeFormat, t, tc],
  );

  const {
    data,
    totalRecords = 0,
    onView,
    onEdit,
    onDelete,
    onAdd,
    onRefresh,
    addButtonLabel,
    searchPlaceholder,
    searchFilter,
    onSearchChange,
    onSearchSubmit,
    onSearchClear,
    onPageChange,
    onPageSizeChange,
    currentPage = 1,
    pageSize,
    serverSidePagination,
    moduleId,
    transactionId,
    canEdit = true,
    canDelete = true,
    canView = true,
    columns: columnsOverride,
  } = props;

  const columns = columnsOverride ?? defaultColumns;

  return (
    <MasterDataGrid
      data={data}
      columns={columns}
      dataItemKey="portId"
      actions={{
        onView: (item) => onView(item as unknown as IPort),
        onEdit: (item) => onEdit(item as unknown as IPort),
        onDelete: (item) => onDelete(item as unknown as IPort),
      }}
      pageable
      groupable={false}
      pageSize={pageSize}
      total={serverSidePagination ? totalRecords : undefined}
      currentPage={currentPage}
      serverSidePagination={serverSidePagination}
      searchPlaceholder={searchPlaceholder ?? t("searchPortsPlaceholder")}
      searchValue={searchFilter}
      showView={canView}
      showEdit={canEdit}
      showDelete={canDelete}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onAdd={onAdd}
      onRefresh={onRefresh}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onSearchClear={onSearchClear}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.port}
      addButtonLabel={addButtonLabel ?? tc("add")}
    />
  );
}

export const PortTable = memo(PortTableInner);
