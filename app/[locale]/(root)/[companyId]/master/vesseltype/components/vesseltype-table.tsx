"use client";

import { memo, useMemo } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IVesselType } from "@/interfaces/vesseltype";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Check, X } from "lucide-react";

export interface VesselTypeTableProps {
  data: IVesselType[];
  totalRecords?: number;
  onView: (item: IVesselType) => void;
  onEdit: (item: IVesselType) => void;
  onDelete: (item: IVesselType) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  searchFilter?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onSearchClear?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  currentPage?: number;
  pageSize?: number;
  serverSidePagination?: boolean;
  moduleId?: number | string;
  transactionId?: number | string;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  canCreate?: boolean;
}

function VesselTypeTableInner(props: VesselTypeTableProps) {
  const t = useNamespaceTranslations("vesselType");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const defaultColumns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "vesselTypeId", title: "Id", width: 80, hidden: true },
      { field: "vesselTypeCode", title: tc("code"), width: 100, minWidth: 80 },
      { field: "vesselTypeName", title: tc("name"), flex: true, minWidth: 150 },
      {
        field: "isActive",
        title: tc("active"),
        width: 100,
        cells: {
          data: (props) => {
            const isActive = (props.dataItem as IVesselType).isActive;
            const label = isActive ? tc("active") : tc("inactive");
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
      { field: "remarks", title: tc("remarks"), flex: true, minWidth: 100 },
      {
        field: "createBy",
        title: tc("createdBy"),
        width: 100,
        media: "(min-width: 992px)",
      },
      {
        field: "createDate",
        title: tc("createdDate"),
        width: 180,
        cells: {
          data: (p) => (
            <td {...p.tdProps} className="k-table-td whitespace-nowrap">
              {formatDateTime(
                (p.dataItem as IVesselType).createDate,
                datetimeFormat,
              )}
            </td>
          ),
        },
        media: "(min-width: 992px)",
      },
      {
        field: "editBy",
        title: tc("editedBy"),
        width: 100,
        media: "(min-width: 1200px)",
      },
      {
        field: "editDate",
        title: tc("editedDate"),
        width: 180,
        cells: {
          data: (p) => (
            <td {...p.tdProps} className="k-table-td whitespace-nowrap">
              {formatDateTime(
                (p.dataItem as IVesselType).editDate,
                datetimeFormat,
              )}
            </td>
          ),
        },
        media: "(min-width: 1200px)",
      },
    ],
    [datetimeFormat, t, tc],
  );
  const {
    data,
    totalRecords = 0,
    onView,
    onEdit,
    onDelete,
    onAdd,
    onRefresh,
    searchFilter,
    onSearchChange,
    onSearchSubmit,
    onSearchClear,
    onPageChange,
    onPageSizeChange,
    currentPage = 1,
    pageSize,
    serverSidePagination,
    moduleId,
    transactionId,
    canEdit = true,
    canDelete = true,
    canView = true,
  } = props;
  return (
    <MasterDataGrid
      data={data}
      columns={defaultColumns}
      dataItemKey="vesselTypeId"
      actions={{
        onView: (i) => onView(i as unknown as IVesselType),
        onEdit: (i) => onEdit(i as unknown as IVesselType),
        onDelete: (i) => onDelete(i as unknown as IVesselType),
      }}
      pageable
      groupable={false}
      pageSize={pageSize}
      total={serverSidePagination ? totalRecords : undefined}
      currentPage={currentPage}
      serverSidePagination={serverSidePagination}
      searchPlaceholder={t("searchPlaceholder")}
      searchValue={searchFilter}
      showView={canView}
      showEdit={canEdit}
      showDelete={canDelete}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onAdd={onAdd}
      onRefresh={onRefresh}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onSearchClear={onSearchClear}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.vesselType}
      addButtonLabel={t("addVesselType")}
    />
  );
}
export const VesselTypeTable = memo(VesselTypeTableInner);
