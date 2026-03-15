"use client";

import { memo } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IBargeGLMapping } from "@/interfaces/bargeglmapping";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Check, X } from "lucide-react";

export interface BargeGLMappingTableProps {
  data: IBargeGLMapping[];
  totalRecords?: number;
  onView: (item: IBargeGLMapping) => void;
  onEdit: (item: IBargeGLMapping) => void;
  onDelete: (item: IBargeGLMapping) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  searchFilter?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onSearchClear?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  currentPage?: number;
  pageSize?: number;
  serverSidePagination?: boolean;
  moduleId?: number | string;
  transactionId?: number | string;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  canCreate?: boolean;
}

function BargeGLMappingTableInner(props: BargeGLMappingTableProps) {
  const t = useNamespaceTranslations("bargeGLMapping");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const defaultColumns: MasterDataGridColumn[] = [
    { field: "bargeId", title: "Id", width: 80, minWidth: 60 },
    { field: "bargeName", title: tc("barge"), flex: true, minWidth: 150 },
    { field: "glCode", title: tc("glCode"), width: 120, minWidth: 100 },
    { field: "glName", title: tc("glName"), flex: true, minWidth: 150 },
    {
      field: "isActive",
      title: tc("active"),
      width: 100,
      minWidth: 80,
      cells: {
        data: (p) => {
          const isActive = (p.dataItem as IBargeGLMapping).isActive;
          const label = isActive ? tc("active") : tc("inactive");
          const bgClass = isActive
            ? "bg-emerald-500 text-white"
            : "bg-red-500 text-white";
          return (
            <td {...p.tdProps} className="k-table-td">
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${bgClass}`}
                title={label}
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
    {
      field: "createDate",
      title: tc("createdDate"),
      width: 180,
      minWidth: 140,
      cells: {
        data: (p) => (
          <td {...p.tdProps} className="k-table-td whitespace-nowrap">
            {formatDateTime(
              (p.dataItem as IBargeGLMapping).createDate,
              datetimeFormat,
            )}
          </td>
        ),
      },
      media: "(min-width: 992px)",
    },
  ];
  const {
    data,
    totalRecords = 0,
    onView,
    onEdit,
    onDelete,
    onAdd,
    onRefresh,
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
  } = props;

  const dataWithKey = data.map((item, idx) => ({
    ...item,
    _rowKey: `${item.bargeId}_${item.glId}_${idx}`,
  }));

  return (
    <MasterDataGrid
      data={dataWithKey}
      columns={defaultColumns}
      dataItemKey="_rowKey"
      actions={{
        onView: (i) => onView(i as unknown as IBargeGLMapping),
        onEdit: (i) => onEdit(i as unknown as IBargeGLMapping),
        onDelete: (i) => onDelete(i as unknown as IBargeGLMapping),
      }}
      pageable
      groupable={false}
      pageSize={pageSize}
      total={serverSidePagination ? totalRecords : undefined}
      currentPage={currentPage}
      serverSidePagination={serverSidePagination}
      searchPlaceholder={t("searchPlaceholder")}
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
      tableName={TableName.bargeGLMapping}
      addButtonLabel={tc("add")}
    />
  );
}
export const BargeGLMappingTable = memo(BargeGLMappingTableInner);
