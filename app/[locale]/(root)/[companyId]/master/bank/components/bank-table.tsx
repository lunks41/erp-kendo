'use client';

import { useMemo, useState } from "react";
import { Check, X, CircleCheck, CircleX } from "lucide-react";
import { IBank, IBankFilter } from "@/interfaces/bank";
import { useAuthStore } from "@/stores/auth-store";
import { Loader } from "@progress/kendo-react-indicators";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import { TableName } from "@/lib/utils";
import { format, isValid } from "date-fns";

interface BankTableProps {
  data: IBank[];
  isLoading?: boolean;
  totalRecords?: number;
  onSelect?: (bank: IBank | null) => void;
  onFilterChange?: (filters: IBankFilter) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  currentPage?: number;
  pageSize?: number;
  serverSidePagination?: boolean;
  initialSearchValue?: string;
  onRefreshAction?: () => void;
  moduleId: number;
  transactionId: number;
}

export function BankTable({
  data,
  isLoading = false,
  totalRecords = 0,
  onSelect,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  currentPage = 1,
  pageSize = 50,
  serverSidePagination = false,
  initialSearchValue,
  onRefreshAction,
  moduleId,
  transactionId,
}: BankTableProps) {
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss";
  const [searchValue, setSearchValue] = useState(initialSearchValue ?? "");

  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "bankId", title: "Id", width: 80, minWidth: 50 },
      { field: "bankCode", title: "Code", width: 120, minWidth: 50 },
      { field: "bankName", title: "Name", width: 200, minWidth: 50 },
      { field: "currencyName", title: "Currency", width: 120, minWidth: 50 },
      { field: "accountNo", title: "Account No", width: 140, minWidth: 80 },
      { field: "swiftCode", title: "SWIFT Code", width: 120, minWidth: 80 },
      { field: "iban", title: "IBAN", width: 160, minWidth: 100 },
      {
        field: "isOwnBank",
        title: "Own Bank",
        width: 90,
        minWidth: 50,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <div className="flex justify-center">
                {(props.dataItem as IBank).isOwnBank ? (
                  <CircleCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <CircleX className="h-4 w-4 text-red-500" />
                )}
              </div>
            </td>
          ),
        },
      },
      {
        field: "isPettyCashBank",
        title: "Petty Cash",
        width: 100,
        minWidth: 50,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <div className="flex justify-center">
                {(props.dataItem as IBank).isPettyCashBank ? (
                  <CircleCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <CircleX className="h-4 w-4 text-red-500" />
                )}
              </div>
            </td>
          ),
        },
      },
      {
        field: "isActive",
        title: "Status",
        width: 120,
        minWidth: 50,
        cells: {
          data: (props) => {
            const isActive = (props.dataItem as IBank).isActive;
            const label = isActive ? "Active" : "Inactive";
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
      { field: "remarks1", title: "Remarks", width: 200, minWidth: 100 },
      { field: "createBy", title: "Create By", width: 120, minWidth: 50 },
      {
        field: "createDate",
        title: "Create Date",
        width: 180,
        minWidth: 150,
        cells: {
          data: (props) => {
            const raw = (props.dataItem as IBank).createDate;
            const date =
              typeof raw === "string"
                ? new Date(raw)
                : raw instanceof Date
                  ? raw
                  : null;
            return (
              <td {...props.tdProps} className="k-table-td">
                {date && isValid(date) ? format(date, datetimeFormat) : "-"}
              </td>
            );
          },
        },
      },
      { field: "editBy", title: "Edit By", width: 120, minWidth: 50 },
      {
        field: "editDate",
        title: "Edit Date",
        width: 180,
        minWidth: 150,
        cells: {
          data: (props) => {
            const raw = (props.dataItem as IBank).editDate;
            const date =
              typeof raw === "string"
                ? new Date(raw)
                : raw instanceof Date
                  ? raw
                  : null;
            return (
              <td {...props.tdProps} className="k-table-td">
                {date && isValid(date) ? format(date, datetimeFormat) : "-"}
              </td>
            );
          },
        },
      },
    ],
    [datetimeFormat],
  );

  const handleView = onSelect
    ? (item: unknown) => onSelect(item as IBank)
    : undefined;

  const handleFilterSubmit = () => {
    if (onFilterChange) {
      onFilterChange({
        search: searchValue,
        sortOrder: "asc",
      });
    }
  };

  const handleFilterClear = () => {
    setSearchValue("");
    if (onFilterChange) {
      onFilterChange({ search: "", sortOrder: "asc" });
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-900/70">
          <Loader type="converging-spinner" size="large" />
        </div>
      )}
      <MasterDataGrid
        data={data}
        columns={columns}
        dataItemKey="bankId"
        tableHeight="min(600px, 70vh)"
        actions={{ onView: handleView }}
        showView={!!handleView}
        showEdit={false}
        showDelete={false}
        pageable
        pageSize={pageSize}
        moduleId={moduleId}
        transactionId={transactionId}
        tableName={TableName.bank}
        onRefresh={onRefreshAction}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleFilterSubmit}
        onSearchClear={handleFilterClear}
        total={serverSidePagination ? totalRecords : undefined}
        currentPage={currentPage}
        serverSidePagination={serverSidePagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
