"use client";

import { useMemo } from "react";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IErrorLog } from "@/interfaces/admin";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";

export interface ErrorLogTableProps {
  data: IErrorLog[];
  isLoading?: boolean;
  onRefresh?: () => void;
  searchFilter?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onSearchClear?: () => void;
  moduleId?: number | string;
  transactionId?: number | string;
}

export function ErrorLogTable({
  data,
  onRefresh,
  searchFilter,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  moduleId,
  transactionId,
}: ErrorLogTableProps) {
  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "companyName", title: "Company", width: 120, minWidth: 80 },
      { field: "moduleName", title: "Module", width: 100, minWidth: 70 },
      { field: "transactionName", title: "Transaction", width: 120, minWidth: 90 },
      { field: "documentNo", title: "Document No", width: 100, minWidth: 80 },
      { field: "tableName", title: "Table", width: 100, minWidth: 70 },
      { field: "modeName", title: "Mode", width: 80, minWidth: 60 },
      { field: "remarks", title: "Remarks", flex: true, minWidth: 100 },
      { field: "createBy", title: "Create By", width: 100, minWidth: 80 },
      {
        field: "createDate",
        title: "Create Date",
        width: 140,
        cells: {
          data: (props) => {
            const val = (props.dataItem as IErrorLog).createDate;
            return (
              <td {...props.tdProps} className="k-table-td">
                {formatDateTime(val, "dd/MM/yyyy HH:mm:ss")}
              </td>
            );
          },
        },
      },
    ],
    []
  );

  return (
    <MasterDataGrid
      data={data}
      columns={columns}
      dataItemKey="documentId"
      pageable
      pageSize={50}
      sortable
      filterable
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.errorlog}
      onRefresh={onRefresh}
      searchPlaceholder="Search error logs..."
      searchValue={searchFilter}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onSearchClear={onSearchClear}
    />
  );
}
