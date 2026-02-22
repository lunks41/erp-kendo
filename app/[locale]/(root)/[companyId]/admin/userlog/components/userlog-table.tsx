"use client";

import { useMemo } from "react";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IUserLog } from "@/interfaces/admin";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";

export interface UserLogTableProps {
  data: IUserLog[];
  isLoading?: boolean;
  onRefresh?: () => void;
  searchFilter?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onSearchClear?: () => void;
  moduleId?: number | string;
  transactionId?: number | string;
}

export function UserLogTable(props: UserLogTableProps) {
  const {
    data,
    onRefresh,
    searchFilter,
    onSearchChange,
    onSearchSubmit,
    onSearchClear,
    moduleId,
    transactionId,
  } = props;

  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "userName", title: "User", width: 150, minWidth: 100 },
      {
        field: "isLogin",
        title: "Login",
        width: 90,
        cells: {
          data: (p) => {
            const login = (p.dataItem as IUserLog).isLogin;
            return (
              <td {...p.tdProps} className="k-table-td">
                <span className={`rounded px-2 py-0.5 text-xs ${login ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {login ? "Yes" : "No"}
                </span>
              </td>
            );
          },
        },
      },
      {
        field: "loginDate",
        title: "Login Date",
        width: 150,
        cells: {
          data: (p) => {
            const val = (p.dataItem as IUserLog).loginDate;
            return <td {...p.tdProps} className="k-table-td">{formatDateTime(val, "dd/MM/yyyy HH:mm:ss")}</td>;
          },
        },
      },
      { field: "remarks", title: "Remarks", flex: true, minWidth: 120 },
    ],
    []
  );

  return (
    <MasterDataGrid
      data={data}
      columns={columns}
      dataItemKey="userName"
      pageable
      pageSize={50}
      sortable
      filterable
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.userlog}
      onRefresh={onRefresh}
      searchPlaceholder="Search user logs..."
      searchValue={searchFilter}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onSearchClear={onSearchClear}
    />
  );
}
