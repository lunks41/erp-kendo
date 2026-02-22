"use client";

import { useMemo } from "react";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IUser } from "@/interfaces/admin";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface UserTableProps {
  data: IUser[];
  isLoading?: boolean;
  onView?: (item: IUser) => void;
  onEdit?: (item: IUser) => void;
  onDelete?: (item: IUser) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  searchFilter?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onSearchClear?: () => void;
  moduleId?: number | string;
  transactionId?: number | string;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  canCreate?: boolean;
}

export function UserTable({
  data,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onRefresh,
  searchFilter,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  moduleId,
  transactionId,
  canEdit = true,
  canDelete = true,
  canView = true,
  canCreate = true,
}: UserTableProps) {
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "userName", title: "Name", width: 150, minWidth: 100 },
      { field: "userCode", title: "Code", width: 100, minWidth: 80 },
      { field: "userEmail", title: "Email", width: 180, minWidth: 120 },
      { field: "userRoleName", title: "Role", width: 120, minWidth: 80 },
      { field: "userGroupName", title: "Group", width: 120, minWidth: 80 },
      {
        field: "isActive",
        title: "Status",
        width: 90,
        cells: {
          data: (props) => {
            const active = (props.dataItem as IUser).isActive;
            return (
              <td {...props.tdProps} className="k-table-td">
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    active
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {active ? "Active" : "Inactive"}
                </span>
              </td>
            );
          },
        },
      },
      {
        field: "isLocked",
        title: "Locked",
        width: 90,
        cells: {
          data: (props) => {
            const locked = (props.dataItem as IUser).isLocked;
            return (
              <td {...props.tdProps} className="k-table-td">
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    locked
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                  }`}
                >
                  {locked ? "Locked" : "Unlocked"}
                </span>
              </td>
            );
          },
        },
      },
      { field: "remarks", title: "Remarks", flex: true, minWidth: 100 },
      {
        field: "createDate",
        title: "Create Date",
        width: 130,
        cells: {
          data: (props) => {
            const val = (props.dataItem as IUser).createDate;
            return (
              <td {...props.tdProps} className="k-table-td">
                {formatDateTime(val, datetimeFormat)}
              </td>
            );
          },
        },
      },
    ],
    [datetimeFormat]
  );

  return (
    <MasterDataGrid
      data={data}
      columns={columns}
      dataItemKey="userId"
      actions={{
        onView: onView ? (item) => onView(item as IUser) : undefined,
        onEdit: onEdit ? (item) => onEdit(item as IUser) : undefined,
        onDelete: onDelete ? (item) => onDelete(item as IUser) : undefined,
      }}
      showView={canView}
      showEdit={canEdit}
      showDelete={canDelete}
      pageable
      pageSize={50}
      sortable
      filterable
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.user}
      onAdd={canCreate ? onAdd : undefined}
      onRefresh={onRefresh}
      addButtonLabel="Add User"
      searchPlaceholder="Search users..."
      searchValue={searchFilter}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onSearchClear={onSearchClear}
    />
  );
}
