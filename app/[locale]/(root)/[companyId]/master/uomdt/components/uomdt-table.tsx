"use client";

import { memo, useMemo } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IUomDt } from "@/interfaces/uom";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface UomDtTableProps {
  data: IUomDt[];
  totalRecords?: number;
  onView: (item: IUomDt) => void;
  onEdit: (item: IUomDt) => void;
  onDelete: (item: IUomDt) => void;
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

function UomDtTableInner(props: UomDtTableProps) {
  const t = useNamespaceTranslations("uomDt");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const defaultColumns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "uomId", title: t("uomId"), width: 80, minWidth: 60 },
      { field: "uomCode", title: t("uomCode"), width: 100, minWidth: 80 },
      { field: "uomName", title: t("uomName"), flex: true, minWidth: 120 },
      { field: "packUomId", title: t("packUomId"), width: 90, minWidth: 70 },
      { field: "packUomCode", title: t("packUomCode"), width: 110, minWidth: 90 },
      { field: "packUomName", title: t("packUomName"), flex: true, minWidth: 120 },
      {
        field: "uomFactor",
        title: t("uomFactor"),
        width: 100,
        minWidth: 80,
      },
      {
        field: "createDate",
        title: tc("createdDate"),
        width: 180,
        minWidth: 140,
        cells: {
          data: (p) => (
            <td {...p.tdProps} className="k-table-td whitespace-nowrap">
              {formatDateTime((p.dataItem as IUomDt).createDate, datetimeFormat)}
            </td>
          ),
        },
        media: "(min-width: 992px)",
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

  const dataWithKey = useMemo(
    () =>
      data.map((item, idx) => ({
        ...item,
        _rowKey: `${item.uomId}_${item.packUomId}_${idx}`,
      })),
    [data],
  );

  return (
    <MasterDataGrid
      data={dataWithKey}
      columns={defaultColumns}
      dataItemKey="_rowKey"
      actions={{
        onView: (i) => onView(i as unknown as IUomDt),
        onEdit: (i) => onEdit(i as unknown as IUomDt),
        onDelete: (i) => onDelete(i as unknown as IUomDt),
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
      tableName={TableName.uomDt}
      addButtonLabel={tc("add")}
    />
  );
}
export const UomDtTable = memo(UomDtTableInner);
