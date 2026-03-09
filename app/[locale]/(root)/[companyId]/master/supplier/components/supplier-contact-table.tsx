"use client";

import { useMemo } from "react";
import { Check, X, CircleCheck, CircleX } from "lucide-react";
import { Badge } from "@progress/kendo-react-indicators";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import { ISupplierContact } from "@/interfaces/supplier";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface SupplierContactTableProps {
  data: ISupplierContact[];
  isLoading?: boolean;
  onSelect?: (contact: ISupplierContact | null) => void;
  onDeleteAction?: (contactId: string) => Promise<void>;
  onEditAction?: (contact: ISupplierContact | null) => void;
  onCreateAction?: () => void;
  onRefreshAction?: () => void;
  moduleId: number;
  transactionId: number;
  pageSize?: number;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  canCreate?: boolean;
}

function StatusBadge({ value }: { value: boolean }) {
  return (
    <Badge
      themeColor={value ? "success" : "secondary"}
      fillMode="solid"
      size="small"
    >
      {value ? (
        <CircleCheck className="mr-1 h-4 w-4 text-green-500 dark:text-green-400" />
      ) : (
        <CircleX className="mr-1 h-4 w-4 text-red-500 dark:text-red-400" />
      )}
      {value ? "Active" : "Inactive"}
    </Badge>
  );
}

function StatusIcon({ value }: { value: boolean }) {
  return value ? (
    <CircleCheck className="h-4 w-4 text-green-500" />
  ) : (
    <CircleX className="h-4 w-4 text-red-500" />
  );
}

export function SupplierContactTable({
  data,
  isLoading = false,
  onSelect,
  onDeleteAction,
  onEditAction,
  onCreateAction,
  onRefreshAction,
  moduleId,
  transactionId,
  pageSize = 10,
  canEdit = true,
  canDelete = true,
  canView = true,
  canCreate = true,
}: SupplierContactTableProps) {
  const { decimals } = useAuthStore();
  const datetimeFormat =
    decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "contactId", title: "Contact Id", width: 90, minWidth: 70 },
      { field: "supplierCode", title: "Supplier Code", width: 120, minWidth: 90 },
      { field: "supplierName", title: "Supplier Name", width: 150, minWidth: 100 },
      {
        field: "isDefault",
        title: "Def Status",
        width: 110,
        minWidth: 80,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <StatusBadge
                value={!!(props.dataItem as ISupplierContact).isDefault}
              />
            </td>
          ),
        },
      },
      { field: "contactName", title: "Contact Name", width: 160, minWidth: 120 },
      { field: "otherName", title: "Other Name", width: 130, minWidth: 100 },
      { field: "mobileNo", title: "Mobile", width: 130, minWidth: 100 },
      { field: "offNo", title: "Office", width: 130, minWidth: 100 },
      { field: "faxNo", title: "Fax", width: 130, minWidth: 100 },
      { field: "emailAdd", title: "Email", width: 180, minWidth: 140 },
      {
        field: "isActive",
        title: "Status",
        width: 90,
        minWidth: 70,
        cells: {
          data: (props) => {
            const isActive = (props.dataItem as ISupplierContact).isActive;
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
      {
        field: "isFinance",
        title: "Fin Status",
        width: 110,
        minWidth: 80,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <StatusBadge
                value={!!(props.dataItem as ISupplierContact).isFinance}
              />
            </td>
          ),
        },
      },
      {
        field: "isSales",
        title: "Sale Status",
        width: 110,
        minWidth: 80,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <StatusBadge
                value={!!(props.dataItem as ISupplierContact).isSales}
              />
            </td>
          ),
        },
      },
      { field: "createBy", title: "Create By", width: 90, minWidth: 70 },
      {
        field: "createDate",
        title: "Create Date",
        width: 120,
        minWidth: 90,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              {formatDateTime(
                (props.dataItem as ISupplierContact).createDate,
                datetimeFormat,
              )}
            </td>
          ),
        },
      },
      { field: "editBy", title: "Edit By", width: 90, minWidth: 70 },
      {
        field: "editDate",
        title: "Edit Date",
        width: 120,
        minWidth: 90,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              {formatDateTime(
                (props.dataItem as ISupplierContact).editDate,
                datetimeFormat,
              )}
            </td>
          ),
        },
      },
    ],
    [datetimeFormat],
  );

  const handleView =
    canView && onSelect
      ? (item: unknown) => onSelect(item as ISupplierContact)
      : undefined;
  const handleEdit =
    canEdit && onEditAction
      ? (item: unknown) => onEditAction(item as ISupplierContact)
      : undefined;
  const handleDelete =
    canDelete && onDeleteAction
      ? (item: unknown) =>
          onDeleteAction(String((item as ISupplierContact).contactId))
      : undefined;

  return (
    <MasterDataGrid
      data={data}
      columns={columns}
      dataItemKey="contactId"
      className="w-full max-w-full"
      actions={{
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
      }}
      showView={!!handleView}
      showEdit={!!handleEdit}
      showDelete={!!handleDelete}
      pageable={false}
      pageSize={1000}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.supplierContact}
      onAdd={canCreate ? onCreateAction : undefined}
      onRefresh={onRefreshAction}
      addButtonLabel="Add Contact"
    />
  );
}
