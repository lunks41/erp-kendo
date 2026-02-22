"use client";

import { useMemo } from "react";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IUserGroup } from "@/interfaces/admin";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";

export interface UserGroupTableProps {
  data: IUserGroup[];
  onView?: (item: IUserGroup) => void;
  onEdit?: (item: IUserGroup) => void;
  onDelete?: (item: IUserGroup) => void;
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

export function UserGroupTable({
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
}: UserGroupTableProps) {
  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "userGroupName", title: "Name", width: 180, minWidth: 100 },
      { field: "userGroupCode", title: "Code", width: 120, minWidth: 80 },
      {
        field: "isActive",
        title: "Status",
        width: 90,
        cells: {
          data: (props) => {
            const active = (props.dataItem as IUserGroup).isActive;
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
      { field: "remarks", title: "Remarks", flex: true, minWidth: 100 },
      {
        field: "createDate",
        title: "Create Date",
        width: 130,
        cells: {
          data: (props) => {
            const val = (props.dataItem as IUserGroup).createDate;
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
      dataItemKey="userGroupId"
      actions={{
        onView: onView ? (item) => onView(item as IUserGroup) : undefined,
        onEdit: onEdit ? (item) => onEdit(item as IUserGroup) : undefined,
        onDelete: onDelete ? (item) => onDelete(item as IUserGroup) : undefined,
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
      tableName={TableName.userGroup}
      onAdd={canCreate ? onAdd : undefined}
      onRefresh={onRefresh}
      addButtonLabel="Add User Group"
      searchPlaceholder="Search user groups..."
      searchValue={searchFilter}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onSearchClear={onSearchClear}
    />
  );
}
