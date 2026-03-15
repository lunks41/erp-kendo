"use client";

import { memo, useMemo } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { ITaxDt } from "@/interfaces/tax";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface TaxDtTableProps {
  data: ITaxDt[];
  totalRecords?: number;
  onView: (item: ITaxDt) => void;
  onEdit: (item: ITaxDt) => void;
  onDelete: (item: ITaxDt) => void;
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

function TaxDtTableInner(props: TaxDtTableProps) {
  const t = useNamespaceTranslations("taxDt");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const defaultColumns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "taxId", title: "Id", width: 80, minWidth: 60 },
      { field: "taxCode", title: t("taxCode"), width: 100, minWidth: 80 },
      { field: "taxName", title: t("taxName"), flex: true, minWidth: 150 },
      {
        field: "taxPercentage",
        title: t("taxPercentage"),
        width: 120,
        minWidth: 100,
      },
      {
        field: "validFrom",
        title: t("validFrom"),
        width: 140,
        minWidth: 120,
        cells: {
          data: (p) => (
            <td {...p.tdProps} className="k-table-td whitespace-nowrap">
              {formatDateTime((p.dataItem as ITaxDt).validFrom, datetimeFormat)}
            </td>
          ),
        },
      },
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
          data: (p) => (
            <td {...p.tdProps} className="k-table-td whitespace-nowrap">
              {formatDateTime((p.dataItem as ITaxDt).createDate, datetimeFormat)}
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
        _rowKey: `${item.taxId}_${String(item.validFrom)}_${idx}`,
      })),
    [data],
  );

  return (
    <MasterDataGrid
      data={dataWithKey}
      columns={defaultColumns}
      dataItemKey="_rowKey"
      actions={{
        onView: (i) => onView(i as unknown as ITaxDt),
        onEdit: (i) => onEdit(i as unknown as ITaxDt),
        onDelete: (i) => onDelete(i as unknown as ITaxDt),
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
      tableName={TableName.taxDt}
      addButtonLabel={tc("add")}
    />
  );
}
export const TaxDtTable = memo(TaxDtTableInner);
