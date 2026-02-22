"use client";

import { useMemo } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { Badge } from "@progress/kendo-react-indicators";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import { ICustomerContact } from "@/interfaces/customer";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface ContactsTableProps {
  data: ICustomerContact[];
  isLoading?: boolean;
  onSelect?: (contact: ICustomerContact | null) => void;
  onDeleteAction?: (contactId: string) => Promise<void>;
  onEditAction?: (contact: ICustomerContact | null) => void;
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
    <Badge themeColor={value ? "success" : "secondary"} fillMode="solid" size="small">
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

export function ContactsTable({
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
}: ContactsTableProps) {
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "contactId", title: "Contact Id", width: 90, minWidth: 70 },
      { field: "customerCode", title: "Customer Code", width: 120, minWidth: 90 },
      { field: "customerName", title: "Customer Name", width: 150, minWidth: 100 },
      {
        field: "isDefault",
        title: "Def Status",
        width: 110,
        minWidth: 80,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <StatusBadge value={!!(props.dataItem as ICustomerContact).isDefault} />
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
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <StatusIcon value={!!(props.dataItem as ICustomerContact).isActive} />
            </td>
          ),
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
              <StatusBadge value={!!(props.dataItem as ICustomerContact).isFinance} />
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
              <StatusBadge value={!!(props.dataItem as ICustomerContact).isSales} />
            </td>
          ),
        },
      },
      { field: "remarks", title: "Remarks", width: 150, minWidth: 100 },
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
                (props.dataItem as ICustomerContact).createDate,
                datetimeFormat
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
                (props.dataItem as ICustomerContact).editDate,
                datetimeFormat
              )}
            </td>
          ),
        },
      },
    ],
    [datetimeFormat]
  );

  const handleView = canView && onSelect ? (item: unknown) => onSelect(item as ICustomerContact) : undefined;
  const handleEdit = canEdit && onEditAction ? (item: unknown) => onEditAction(item as ICustomerContact) : undefined;
  const handleDelete =
    canDelete && onDeleteAction
      ? (item: unknown) => onDeleteAction(String((item as ICustomerContact).contactId))
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
      sortable
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.customerContact}
      onAdd={canCreate ? onCreateAction : undefined}
      onRefresh={onRefreshAction}
      addButtonLabel="Add Contact"
    />
  );
}
