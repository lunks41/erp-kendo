"use client";

import { memo, useMemo } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { ICurrencyDt } from "@/interfaces/currency";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface CurrencyDtTableProps {
  data: ICurrencyDt[];
  totalRecords?: number;
  onView: (item: ICurrencyDt) => void;
  onEdit: (item: ICurrencyDt) => void;
  onDelete: (item: ICurrencyDt) => void;
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

function CurrencyDtTableInner(props: CurrencyDtTableProps) {
  const t = useNamespaceTranslations("currencyDt");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const defaultColumns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "currencyId", title: "Id", width: 80, minWidth: 60 },
      { field: "currencyCode", title: t("currencyCode"), width: 110, minWidth: 90 },
      { field: "currencyName", title: t("currencyName"), flex: true, minWidth: 150 },
      { field: "exhRate", title: tc("exchangeRate"), width: 120, minWidth: 100 },
      {
        field: "validFrom",
        title: t("validFrom"),
        width: 140,
        minWidth: 120,
        cells: {
          data: (p) => (
            <td {...p.tdProps} className="k-table-td whitespace-nowrap">
              {formatDateTime((p.dataItem as ICurrencyDt).validFrom, datetimeFormat)}
            </td>
          ),
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
              {formatDateTime((p.dataItem as ICurrencyDt).createDate, datetimeFormat)}
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
        _rowKey: `${item.currencyId}_${String(item.validFrom)}_${idx}`,
      })),
    [data],
  );

  return (
    <MasterDataGrid
      data={dataWithKey}
      columns={defaultColumns}
      dataItemKey="_rowKey"
      actions={{
        onView: (i) => onView(i as unknown as ICurrencyDt),
        onEdit: (i) => onEdit(i as unknown as ICurrencyDt),
        onDelete: (i) => onDelete(i as unknown as ICurrencyDt),
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
      tableName={TableName.currencyDt}
      addButtonLabel={tc("add")}
    />
  );
}
export const CurrencyDtTable = memo(CurrencyDtTableInner);
