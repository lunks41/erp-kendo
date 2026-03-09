\"use client\";

import { useMemo, useState } from \"react\";
import { Check, X, CircleCheck, CircleX } from \"lucide-react\";
import { ISupplier, ISupplierFilter } from \"@/interfaces/supplier\";
import { useAuthStore } from \"@/stores/auth-store\";
import { Loader } from "@progress/kendo-react-indicators";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import { TableName } from "@/lib/utils";
import { format, isValid } from "date-fns";

interface SupplierTableProps {
  data: ISupplier[];
  isLoading?: boolean;
  totalRecords?: number;
  onSelect?: (supplier: ISupplier | null) => void;
  onFilterChange?: (filters: ISupplierFilter) => void;
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

export function SupplierTable({
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
}: SupplierTableProps) {
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss";
  const [searchValue, setSearchValue] = useState(initialSearchValue ?? "");

  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "supplierId", title: "Id", width: 80, minWidth: 50 },
      { field: "supplierCode", title: "Code", width: 120, minWidth: 50 },
      { field: "supplierName", title: "Name", width: 200, minWidth: 50 },
      {
        field: "supplierRegNo",
        title: "Registration No",
        width: 120,
        minWidth: 50,
      },
      {
        field: "parentSupplierCode",
        title: "Parent Code",
        width: 120,
        minWidth: 50,
      },
      {
        field: "parentSupplierName",
        title: "Parent Name",
        width: 150,
        minWidth: 50,
      },
      {
        field: "creditTermName",
        title: "Credit Term",
        width: 120,
        minWidth: 50,
      },
      { field: "bankName", title: "Bank", width: 120, minWidth: 50 },
      { field: "currencyName", title: "Currency", width: 120, minWidth: 50 },
      {
        field: "accSetupName",
        title: "Account Setup",
        width: 120,
        minWidth: 50,
      },
      { field: "customerName", title: "Customer", width: 120, minWidth: 50 },
      {
        field: "supplierOtherName",
        title: "Other Name",
        width: 200,
        minWidth: 50,
      },
      {
        field: "supplierShortName",
        title: "Short Name",
        width: 120,
        minWidth: 50,
      },
      {
        field: "isSupplier",
        title: "Supplier",
        width: 90,
        minWidth: 50,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <div className="flex justify-center">
                {(props.dataItem as ISupplier).isSupplier ? (
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
        field: "isVendor",
        title: "Vendor",
        width: 80,
        minWidth: 50,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <div className="flex justify-center">
                {(props.dataItem as ISupplier).isVendor ? (
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
        field: "isCustomer",
        title: "Customer",
        width: 90,
        minWidth: 50,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <div className="flex justify-center">
                {(props.dataItem as ISupplier).isCustomer ? (
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
        field: "isTrader",
        title: "Trader",
        width: 80,
        minWidth: 50,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <div className="flex justify-center">
                {(props.dataItem as ISupplier).isTrader ? (
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
        field: "isDiffGstGl",
        title: "Diff GST GL",
        width: 100,
        minWidth: 50,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <div className="flex justify-center">
                {(props.dataItem as ISupplier).isDiffGstGl ? (
                  <CircleCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <CircleX className="h-4 w-4 text-red-500" />
                )}
              </div>
            </td>
          ),
        },
      },
      { field: "remarks", title: "Remarks", width: 250, minWidth: 50 },
      {
        field: "isActive",
        title: "Status",
        width: 120,
        minWidth: 50,
        cells: {
          data: (props) => {
            const isActive = (props.dataItem as ISupplier).isActive;
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
      { field: "createBy", title: "Create By", width: 120, minWidth: 50 },
      {
        field: "createDate",
        title: "Create Date",
        width: 180,
        minWidth: 150,
        cells: {
          data: (props) => {
            const raw = (props.dataItem as ISupplier).createDate;
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
            const raw = (props.dataItem as ISupplier).editDate;
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
    ? (item: unknown) => onSelect(item as ISupplier)
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
        dataItemKey="supplierId"
        tableHeight="min(600px, 70vh)"
        actions={{ onView: handleView }}
        showView={!!handleView}
        showEdit={false}
        showDelete={false}
        pageable
        pageSize={pageSize}
        moduleId={moduleId}
        transactionId={transactionId}
        tableName={TableName.supplier}
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
