"use client";

import { useMemo } from "react";
import { Check, X, CircleCheck, CircleX } from "lucide-react";
import { Badge } from "@progress/kendo-react-indicators";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import { IBankAddress } from "@/interfaces/bank";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { useAuthStore } from "@/stores/auth-store";

export interface BankAddressTableProps {
  data: IBankAddress[];
  isLoading?: boolean;
  onSelect?: (address: IBankAddress | null) => void;
  onDeleteAction?: (addressId: string) => Promise<void>;
  onEditAction?: (address: IBankAddress | null) => void;
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

export function BankAddressTable({
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
}: BankAddressTableProps) {
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat =
    decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "addressId", title: "Address Id", width: 90, minWidth: 70 },
      { field: "bankId", title: "Bank Id", width: 100, minWidth: 80 },
      {
        field: "isDefaultAdd",
        title: "Def Status",
        width: 110,
        minWidth: 80,
        cells: {
          data: (props) => (
            <td {...props.tdProps} className="k-table-td">
              <StatusBadge
                value={!!(props.dataItem as IBankAddress).isDefaultAdd}
              />
            </td>
          ),
        },
      },
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
              <StatusBadge
                value={!!(props.dataItem as IBankAddress).isDeliveryAdd}
              />
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
              <StatusBadge
                value={!!(props.dataItem as IBankAddress).isFinAdd}
              />
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
              <StatusBadge
                value={!!(props.dataItem as IBankAddress).isSalesAdd}
              />
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
          data: (props) => {
            const isActive = (props.dataItem as IBankAddress).isActive;
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
                (props.dataItem as IBankAddress).createDate,
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
                (props.dataItem as IBankAddress).editDate,
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
      ? (item: unknown) => onSelect(item as IBankAddress)
      : undefined;
  const handleEdit =
    canEdit && onEditAction
      ? (item: unknown) => onEditAction(item as IBankAddress)
      : undefined;
  const handleDelete =
    canDelete && onDeleteAction
      ? (item: unknown) =>
          onDeleteAction(String((item as IBankAddress).addressId))
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
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.bankAddress}
      onAdd={canCreate ? onCreateAction : undefined}
      onRefresh={onRefreshAction}
      addButtonLabel={tc("add")}
    />
  );
}
