"use client";

import { useMemo } from "react";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IAuditLog } from "@/interfaces/admin";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";

export interface AuditLogTableProps {
  data: IAuditLog[];
  isLoading?: boolean;
  onRefresh?: () => void;
  searchFilter?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onSearchClear?: () => void;
  moduleId?: number | string;
  transactionId?: number | string;
}

export function AuditLogTable(props: AuditLogTableProps) {
  const { data, onRefresh, searchFilter, onSearchChange, onSearchSubmit, onSearchClear, moduleId, transactionId } = props;

  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "companyName", title: "Company", width: 120 },
      { field: "moduleName", title: "Module", width: 100 },
      { field: "transactionName", title: "Transaction", width: 120 },
      { field: "documentNo", title: "Document No", width: 100 },
      { field: "tableName", title: "Table", width: 100 },
      { field: "modeName", title: "Mode", width: 80 },
      { field: "remarks", title: "Remarks", flex: true },
      { field: "createBy", title: "Create By", width: 100 },
      {
        field: "createDate",
        title: "Create Date",
        width: 140,
        cells: {
          data: (p) => {
            const val = (p.dataItem as IAuditLog).createDate;
            return <td {...p.tdProps} className="k-table-td">{formatDateTime(val, "dd/MM/yyyy HH:mm:ss")}</td>;
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
      tableName={TableName.auditlog}
      onRefresh={onRefresh}
      searchPlaceholder="Search audit logs..."
      searchValue={searchFilter}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onSearchClear={onSearchClear}
    />
  );
}
