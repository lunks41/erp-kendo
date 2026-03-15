"use client";

import { memo } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IEmployee } from "@/interfaces/employee";
import { TableName } from "@/lib/utils";
import { Check, X } from "lucide-react";

export interface EmployeeTableProps {
  data: IEmployee[];
  totalRecords?: number;
  onView: (item: IEmployee) => void;
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
  canView?: boolean;
}

function EmployeeTableInner(props: EmployeeTableProps) {
  const t = useNamespaceTranslations("employee");
  const tc = useNamespaceTranslations("common");
  const defaultColumns: MasterDataGridColumn[] = [
    { field: "employeeId", title: "Id", width: 80, minWidth: 60 },
    { field: "employeeCode", title: t("employeeCode"), width: 120, minWidth: 100 },
    { field: "employeeName", title: t("employeeName"), flex: true, minWidth: 150 },
    { field: "departmentName", title: tc("department"), width: 140, minWidth: 100 },
    { field: "designationName", title: tc("designation"), width: 140, minWidth: 100 },
    { field: "workLocationName", title: tc("workLocation"), width: 120, minWidth: 100 },
    {
      field: "isActive",
      title: tc("active"),
      width: 100,
      minWidth: 80,
      cells: {
        data: (p) => {
          const isActive = (p.dataItem as IEmployee).isActive ?? true;
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
  ];
  const {
    data,
    totalRecords = 0,
    onView,
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
    canView = true,
  } = props;

  return (
    <MasterDataGrid
      data={data}
      columns={defaultColumns}
      dataItemKey="employeeId"
      actions={{
        onView: (i) => onView(i as unknown as IEmployee),
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
      showEdit={false}
      showDelete={false}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRefresh={onRefresh}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onSearchClear={onSearchClear}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.employee}
    />
  );
}
export const EmployeeTable = memo(EmployeeTableInner);
