"use client";

import { useMemo } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { Badge } from "@progress/kendo-react-indicators";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import { ICustomerAddress } from "@/interfaces/customer";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface AddresssTableProps {
  data: ICustomerAddress[];
  isLoading?: boolean;
  onSelect?: (address: ICustomerAddress | null) => void;
  onDeleteAction?: (addressId: string) => Promise<void>;
  onEditAction?: (address: ICustomerAddress | null) => void;
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

export function AddresssTable({
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
}: AddresssTableProps) {
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "addressId", title: "Address Id", width: 90, minWidth: 70 },
      { field: "customerId", title: "Customer Id", width: 100, minWidth: 80 },
      {
        field: "isDefaultAdd",
        title: "Def Status",
        width: 110,
        minWidth: 80,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <StatusBadge value={!!(props.dataItem as ICustomerAddress).isDefaultAdd} />
            </td>
          ),
        },
      },
      { field: "billName", title: "Bill Name", width: 120, minWidth: 90 },
      { field: "address1", title: "Address 1", width: 180, minWidth: 120 },
      { field: "address2", title: "Address 2", width: 140, minWidth: 100 },
      { field: "address3", title: "Address 3", width: 120, minWidth: 80 },
      { field: "address4", title: "Address 4", width: 120, minWidth: 80 },
      { field: "countryId", title: "Country Id", width: 90, minWidth: 70 },
      { field: "pinCode", title: "Pin Code", width: 100, minWidth: 80 },
      { field: "phoneNo", title: "Phone", width: 130, minWidth: 100 },
      { field: "faxNo", title: "Fax", width: 130, minWidth: 100 },
      { field: "emailAdd", title: "Email", width: 160, minWidth: 120 },
      { field: "webUrl", title: "Url", width: 140, minWidth: 100 },
      {
        field: "isDeliveryAdd",
        title: "Dev Status",
        width: 110,
        minWidth: 80,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <StatusBadge value={!!(props.dataItem as ICustomerAddress).isDeliveryAdd} />
            </td>
          ),
        },
      },
      {
        field: "isFinAdd",
        title: "Fin Status",
        width: 110,
        minWidth: 80,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <StatusBadge value={!!(props.dataItem as ICustomerAddress).isFinAdd} />
            </td>
          ),
        },
      },
      {
        field: "isSalesAdd",
        title: "Sale Status",
        width: 110,
        minWidth: 80,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <StatusBadge value={!!(props.dataItem as ICustomerAddress).isSalesAdd} />
            </td>
          ),
        },
      },
      {
        field: "isActive",
        title: "Status",
        width: 90,
        minWidth: 70,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <StatusIcon value={!!(props.dataItem as ICustomerAddress).isActive} />
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
                (props.dataItem as ICustomerAddress).createDate,
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
                (props.dataItem as ICustomerAddress).editDate,
                datetimeFormat
              )}
            </td>
          ),
        },
      },
    ],
    [datetimeFormat]
  );

  const handleView = canView && onSelect ? (item: unknown) => onSelect(item as ICustomerAddress) : undefined;
  const handleEdit = canEdit && onEditAction ? (item: unknown) => onEditAction(item as ICustomerAddress) : undefined;
  const handleDelete =
    canDelete && onDeleteAction
      ? (item: unknown) => onDeleteAction(String((item as ICustomerAddress).addressId))
      : undefined;

  return (
    <MasterDataGrid
      data={data}
      columns={columns}
      dataItemKey="addressId"
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
      tableName={TableName.customerAddress}
      onAdd={canCreate ? onCreateAction : undefined}
      onRefresh={onRefreshAction}
      addButtonLabel="Add Address"
    />
  );
}
