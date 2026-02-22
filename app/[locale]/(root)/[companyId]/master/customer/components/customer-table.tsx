"use client"

import { useMemo, useState, useEffect } from "react"
import { ICustomer, ICustomerFilter } from "@/interfaces/customer"
import { useAuthStore } from "@/stores/auth-store"
import { CircleCheck, CircleX } from "lucide-react"
import { Loader } from "@progress/kendo-react-indicators"
import type { MasterDataGridColumn } from "@/components/table"
import { MasterDataGrid } from "@/components/table"
import { TableName } from "@/lib/utils"
import { format, isValid } from "date-fns"

interface CustomerTableProps {
  data: ICustomer[]
  isLoading?: boolean
  totalRecords?: number
  onSelect?: (customer: ICustomer | null) => void
  onFilterChange?: (filters: ICustomerFilter) => void
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  currentPage?: number
  pageSize?: number
  serverSidePagination?: boolean
  initialSearchValue?: string
  onRefreshAction?: () => void
  moduleId: number
  transactionId: number
}

export function CustomerTable({
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
}: CustomerTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const [searchValue, setSearchValue] = useState(initialSearchValue ?? "")
  useEffect(() => {
    setSearchValue(initialSearchValue ?? "")
  }, [initialSearchValue])

  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "customerId", title: "Id", width: 80, minWidth: 50 },
      { field: "customerCode", title: "Code", width: 120, minWidth: 50 },
      { field: "customerName", title: "Name", width: 200, minWidth: 50 },
      { field: "customerRegNo", title: "Registration No", width: 120, minWidth: 50 },
      { field: "parentCustomerCode", title: "Parent Code", width: 120, minWidth: 50 },
      { field: "parentCustomerName", title: "Parent Name", width: 150, minWidth: 50 },
      { field: "creditTermName", title: "Credit Term", width: 120, minWidth: 50 },
      { field: "bankName", title: "Bank", width: 120, minWidth: 50 },
      { field: "currencyName", title: "Currency", width: 120, minWidth: 50 },
      { field: "accSetupName", title: "Account Setup", width: 120, minWidth: 50 },
      { field: "supplierName", title: "Supplier", width: 120, minWidth: 50 },
      { field: "customerOtherName", title: "Other Name", width: 200, minWidth: 50 },
      { field: "customerShortName", title: "Short Name", width: 120, minWidth: 50 },
      {
        field: "isCustomer",
        title: "Customer",
        width: 90,
        minWidth: 50,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <div className="flex justify-center">
                {(props.dataItem as ICustomer).isCustomer ? (
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
                {(props.dataItem as ICustomer).isVendor ? (
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
        field: "isSupplier",
        title: "Supplier",
        width: 90,
        minWidth: 50,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <div className="flex justify-center">
                {(props.dataItem as ICustomer).isSupplier ? (
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
                {(props.dataItem as ICustomer).isTrader ? (
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
        field: "isCredit",
        title: "Credit",
        width: 80,
        minWidth: 50,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <div className="flex justify-center">
                {(props.dataItem as ICustomer).isCredit ? (
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
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <div className="flex justify-center">
                {(props.dataItem as ICustomer).isActive ? (
                  <CircleCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <CircleX className="h-4 w-4 text-red-500" />
                )}
              </div>
            </td>
          ),
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
            const raw = (props.dataItem as ICustomer).createDate
            const date =
              typeof raw === "string" ? new Date(raw) : raw instanceof Date ? raw : null
            return (
              <td {...props.tdProps} className="k-table-td">
                {date && isValid(date) ? format(date, datetimeFormat) : "-"}
              </td>
            )
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
            const raw = (props.dataItem as ICustomer).editDate
            const date =
              typeof raw === "string" ? new Date(raw) : raw instanceof Date ? raw : null
            return (
              <td {...props.tdProps} className="k-table-td">
                {date && isValid(date) ? format(date, datetimeFormat) : "-"}
              </td>
            )
          },
        },
      },
    ],
    [datetimeFormat]
  )

  const handleView = onSelect ? (item: unknown) => onSelect(item as ICustomer) : undefined

  const handleFilterSubmit = () => {
    if (onFilterChange) {
      onFilterChange({
        search: searchValue,
        sortOrder: "asc",
      })
    }
  }

  const handleFilterClear = () => {
    setSearchValue("")
    if (onFilterChange) {
      onFilterChange({ search: "", sortOrder: "asc" })
    }
  }

  const skip =
    serverSidePagination && currentPage && pageSize
      ? (currentPage - 1) * pageSize
      : undefined

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
        dataItemKey="customerId"
        tableHeight="min(600px, 70vh)"
        actions={{ onView: handleView }}
        showView={!!handleView}
        showEdit={false}
        showDelete={false}
        pageable
        pageSize={pageSize}
        pageSizes={[25, 50, 100, 200]}
        sortable
        moduleId={moduleId}
        transactionId={transactionId}
        tableName={TableName.customer}
        onRefresh={onRefreshAction}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleFilterSubmit}
        onSearchClear={handleFilterClear}
        skip={skip}
        total={serverSidePagination ? totalRecords : undefined}
        currentPage={currentPage}
        serverSidePagination={serverSidePagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
