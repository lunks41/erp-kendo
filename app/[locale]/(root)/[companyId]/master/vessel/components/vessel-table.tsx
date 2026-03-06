"use client";

import { memo, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IVessel } from "@/interfaces/vessel";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface VesselTableProps {
  data: IVessel[];
  totalRecords?: number;
  onView: (item: IVessel) => void;
  onEdit: (item: IVessel) => void;
  onDelete: (item: IVessel) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  addButtonLabel?: string;
  searchPlaceholder?: string;
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
  columns?: MasterDataGridColumn[];
}

function VesselTableInner(props: VesselTableProps) {
  const t = useTranslations("vesselTable");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  const defaultColumns: MasterDataGridColumn[] = useMemo(
    () => [
      {
        field: "vesselId",
        title: "Vessel Id",
        width: 80,
        minWidth: 60,
        hidden: true,
      },
      { field: "vesselCode", title: t("code"), width: 100, minWidth: 80 },
      { field: "vesselName", title: t("name"), flex: true, minWidth: 150 },
      {
        field: "vesselTypeName",
        title: t("type"),
        width: 120,
        minWidth: 90,
      },
      {
        field: "callSign",
        title: t("callSign"),
        width: 90,
        minWidth: 70,
      },
      {
        field: "imoCode",
        title: t("imoCode"),
        width: 100,
        minWidth: 80,
      },
      { field: "grt", title: t("grt"), width: 80, minWidth: 60 },
      {
        field: "isActive",
        title: t("active"),
        width: 100,
        cells: {
          data: (props) => {
            const isActive = (props.dataItem as IVessel).isActive;
            const label = isActive ? t("active") : t("inactive");
            const bgClass = isActive
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white";
            return (
              <td {...props.tdProps} className="k-table-td">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${bgClass}`}
                >
                  {label}
                </span>
              </td>
            );
          },
        },
      },
      { field: "remarks", title: t("remarks"), flex: true, minWidth: 100 },
      {
        field: "createBy",
        title: t("createdBy"),
        width: 100,
        media: "(min-width: 992px)",
      },
      {
        field: "createDate",
        title: t("createdDate"),
        width: 180,
        cells: {
          data: (props) => {
            const val = (props.dataItem as IVessel).createDate;
            const text = formatDateTime(val, datetimeFormat);
            return (
              <td
                {...props.tdProps}
                className="k-table-td whitespace-nowrap"
                title={text}
              >
                {text}
              </td>
            );
          },
        },
      },
      {
        field: "editBy",
        title: t("editedBy"),
        width: 100,
        media: "(min-width: 1200px)",
      },
      {
        field: "editDate",
        title: t("editedDate"),
        width: 180,
        media: "(min-width: 1200px)",
        cells: {
          data: (props) => {
            const val = (props.dataItem as IVessel).editDate;
            const text = formatDateTime(val, datetimeFormat);
            return (
              <td
                {...props.tdProps}
                className="k-table-td whitespace-nowrap"
                title={text}
              >
                {text}
              </td>
            );
          },
        },
      },
    ],
    [datetimeFormat, t],
  );

  const {
    data,
    totalRecords = 0,
    onView,
    onEdit,
    onDelete,
    onAdd,
    onRefresh,
    addButtonLabel,
    searchPlaceholder,
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
    columns: columnsOverride,
  } = props;

  const columns = columnsOverride ?? defaultColumns;

  return (
    <MasterDataGrid
      data={data}
      columns={columns}
      dataItemKey="vesselId"
      actions={{
        onView: (item) => onView(item as unknown as IVessel),
        onEdit: (item) => onEdit(item as unknown as IVessel),
        onDelete: (item) => onDelete(item as unknown as IVessel),
      }}
      pageable
      groupable={false}
      pageSize={pageSize}
      total={serverSidePagination ? totalRecords : undefined}
      currentPage={currentPage}
      serverSidePagination={serverSidePagination}
      searchPlaceholder={searchPlaceholder ?? t("searchVesselsPlaceholder")}
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
      tableName={TableName.vessel}
      addButtonLabel={addButtonLabel ?? t("addVessel")}
    />
  );
}

export const VesselTable = memo(VesselTableInner);
