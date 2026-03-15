"use client";

import { memo, useMemo } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { ICreditTermDt } from "@/interfaces/creditterm";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Check, X } from "lucide-react";

export interface CreditTermDtTableProps {
  data: ICreditTermDt[];
  totalRecords?: number;
  onView: (item: ICreditTermDt) => void;
  onEdit: (item: ICreditTermDt) => void;
  onDelete: (item: ICreditTermDt) => void;
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

function CreditTermDtTableInner(props: CreditTermDtTableProps) {
  const t = useNamespaceTranslations("creditTermDt");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const defaultColumns: MasterDataGridColumn[] = useMemo(
    () => [
      {
        field: "creditTermId",
        title: "Id",
        width: 80,
        minWidth: 60,
      },
      {
        field: "creditTermCode",
        title: t("creditTermCode"),
        width: 110,
        minWidth: 90,
      },
      {
        field: "creditTermName",
        title: t("creditTermName"),
        flex: true,
        minWidth: 150,
      },
      { field: "fromDay", title: t("fromDay"), width: 90, minWidth: 70 },
      { field: "toDay", title: t("toDay"), width: 90, minWidth: 70 },
      { field: "dueDay", title: t("dueDay"), width: 90, minWidth: 70 },
      { field: "noMonth", title: t("noMonth"), width: 90, minWidth: 70 },
      {
        field: "isEndOfMonth",
        title: t("isEndOfMonth"),
        width: 100,
        minWidth: 90,
        cells: {
          data: (p) => {
            const val = (p.dataItem as ICreditTermDt).isEndOfMonth;
            const label = val ? tc("yesLabel") : tc("noLabel");
            const bgClass = val
              ? "bg-emerald-500 text-white"
              : "bg-slate-400 text-white";
            return (
              <td {...p.tdProps} className="k-table-td">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${bgClass}`}
                  title={label}
                >
                  {val ? (
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
                (p.dataItem as ICreditTermDt).createDate,
                datetimeFormat,
              )}
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
        _rowKey: `${item.creditTermId}_${item.fromDay}_${item.toDay}_${idx}`,
      })),
    [data],
  );

  return (
    <MasterDataGrid
      data={dataWithKey}
      columns={defaultColumns}
      dataItemKey="_rowKey"
      actions={{
        onView: (i) => onView(i as unknown as ICreditTermDt),
        onEdit: (i) => onEdit(i as unknown as ICreditTermDt),
        onDelete: (i) => onDelete(i as unknown as ICreditTermDt),
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
      tableName={TableName.creditTermDt}
      addButtonLabel={tc("add")}
    />
  );
}
export const CreditTermDtTable = memo(CreditTermDtTableInner);
