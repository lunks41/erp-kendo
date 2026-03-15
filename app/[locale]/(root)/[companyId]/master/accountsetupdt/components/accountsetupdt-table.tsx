"use client";

import { memo, useMemo } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IAccountSetupDt } from "@/interfaces/accountsetup";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Check, X } from "lucide-react";

export interface AccountSetupDtTableProps {
  data: IAccountSetupDt[];
  totalRecords?: number;
  onView: (item: IAccountSetupDt) => void;
  onEdit: (item: IAccountSetupDt) => void;
  onDelete: (item: IAccountSetupDt) => void;
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

function AccountSetupDtTableInner(props: AccountSetupDtTableProps) {
  const t = useNamespaceTranslations("accountSetupDt");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const defaultColumns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "accSetupId", title: "Id", width: 80, minWidth: 60 },
      {
        field: "accSetupName",
        title: t("accSetup"),
        flex: true,
        minWidth: 140,
      },
      {
        field: "currencyName",
        title: tc("currency"),
        width: 120,
        minWidth: 100,
      },
      {
        field: "glCode",
        title: tc("glCode"),
        width: 120,
        minWidth: 100,
      },
      {
        field: "glName",
        title: tc("glName"),
        flex: true,
        minWidth: 150,
      },
      {
        field: "applyAllCurr",
        title: t("applyAllCurr"),
        width: 100,
        minWidth: 90,
        cells: {
          data: (p) => {
            const val = (p.dataItem as IAccountSetupDt).applyAllCurr;
            const bgClass = val
              ? "bg-emerald-500 text-white"
              : "bg-slate-400 text-white";
            return (
              <td {...p.tdProps} className="k-table-td">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${bgClass}`}
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
                (p.dataItem as IAccountSetupDt).createDate,
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
        _rowKey: `${item.accSetupId}_${item.currencyId}_${item.glId}_${idx}`,
      })),
    [data],
  );

  return (
    <MasterDataGrid
      data={dataWithKey}
      columns={defaultColumns}
      dataItemKey="_rowKey"
      actions={{
        onView: (i) => onView(i as unknown as IAccountSetupDt),
        onEdit: (i) => onEdit(i as unknown as IAccountSetupDt),
        onDelete: (i) => onDelete(i as unknown as IAccountSetupDt),
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
      tableName={TableName.accountSetupDt}
      addButtonLabel={tc("add")}
    />
  );
}
export const AccountSetupDtTable = memo(AccountSetupDtTableInner);
