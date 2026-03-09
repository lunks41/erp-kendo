"use client";

import { memo, useMemo } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { ILoanType } from "@/interfaces/loantype";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface LoanTypeTableProps {
  data: ILoanType[];
  totalRecords?: number;
  onView: (item: ILoanType) => void;
  onEdit: (item: ILoanType) => void;
  onDelete: (item: ILoanType) => void;
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

function LoanTypeTableInner(props: LoanTypeTableProps) {
  const t = useNamespaceTranslations("loanType");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const defaultColumns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "loanTypeId", title: "Id", width: 80, hidden: true },
      { field: "loanTypeCode", title: tc("code"), width: 100, minWidth: 80 },
      { field: "loanTypeName", title: tc("name"), flex: true, minWidth: 150 },
      {
        field: "interestRatePct",
        title: t("interestRatePct"),
        width: 100,
        minWidth: 80,
      },
      {
        field: "minTermMonths",
        title: t("minTermMonths"),
        width: 100,
        minWidth: 80,
      },
      {
        field: "maxTermMonths",
        title: t("maxTermMonths"),
        width: 100,
        minWidth: 80,
      },
      {
        field: "createBy",
        title: tc("createdBy"),
        width: 100,
        media: "(min-width: 992px)",
      },
      {
        field: "createDate",
        title: tc("createdDate"),
        width: 180,
        cells: {
          data: (p) => (
            <td {...p.tdProps} className="k-table-td whitespace-nowrap">
              {formatDateTime(
                (p.dataItem as ILoanType).createDate,
                datetimeFormat,
              )}
            </td>
          ),
        },
        media: "(min-width: 992px)",
      },
      {
        field: "editBy",
        title: tc("editedBy"),
        width: 100,
        media: "(min-width: 1200px)",
      },
      {
        field: "editDate",
        title: tc("editedDate"),
        width: 180,
        cells: {
          data: (p) => (
            <td {...p.tdProps} className="k-table-td whitespace-nowrap">
              {formatDateTime(
                (p.dataItem as ILoanType).editDate,
                datetimeFormat,
              )}
            </td>
          ),
        },
        media: "(min-width: 1200px)",
      },
    ],
    [datetimeFormat, t],
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
  return (
    <MasterDataGrid
      data={data}
      columns={defaultColumns}
      dataItemKey="loanTypeId"
      actions={{
        onView: (i) => onView(i as unknown as ILoanType),
        onEdit: (i) => onEdit(i as unknown as ILoanType),
        onDelete: (i) => onDelete(i as unknown as ILoanType),
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
      tableName={TableName.loanType}
      addButtonLabel={t("addLoanType")}
    />
  );
}
export const LoanTypeTable = memo(LoanTypeTableInner);
