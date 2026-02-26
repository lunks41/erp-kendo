"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IPortRegion } from "@/interfaces/portregion";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface PortRegionTableProps {
  data: IPortRegion[];
  totalRecords?: number;
  onView: (item: IPortRegion) => void;
  onEdit: (item: IPortRegion) => void;
  onDelete: (item: IPortRegion) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  addButtonLabel?: string;
  searchPlaceholder?: string;
  /** Current search/filter string for the toolbar search box */
  searchFilter?: string;
  /** Called when user changes the search input (e.g. types) */
  onSearchChange?: (value: string) => void;
  /** Called when user clicks Search or presses Enter (e.g. reset to page 1 and refetch) */
  onSearchSubmit?: () => void;
  /** Called when user clicks the clear (X) button in the search box */
  onSearchClear?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  currentPage?: number;
  pageSize?: number;
  /** Page size dropdown options (e.g. from user settings) */
  pageSizes?: number[];
  serverSidePagination?: boolean;
  moduleId?: number | string;
  transactionId?: number | string;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  canCreate?: boolean;
}

export function PortRegionTable(props: PortRegionTableProps) {
  const t = useTranslations("portRegionTable");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      {
        field: "portRegionId",
        title: "Port Region Id",
        width: 100,
        minWidth: 80,
      },
      { field: "portRegionCode", title: t("code"), width: 120, minWidth: 90 },
      { field: "portRegionName", title: t("name"), flex: true, minWidth: 150 },
      {
        field: "countryCode",
        title: t("countryCode"),
        width: 100,
        minWidth: 80,
      },
      { field: "countryName", title: t("country"), width: 120, minWidth: 100 },
      { field: "isActive", title: t("active"), width: 80 },
      { field: "remarks", title: t("remarks"), flex: true, minWidth: 100 },
      {
        field: "createBy",
        title: t("createdBy"),
        width: 100,
        media: "(min-width: 992px)",
      },
      {
        field: "editBy",
        title: t("editedBy"),
        width: 100,
        media: "(min-width: 1200px)",
      },
      {
        field: "createDate",
        title: t("createdDate"),
        width: 130,
        cells: {
          data: (props) => {
            const val = (props.dataItem as IPortRegion).createDate;
            return (
              <td {...props.tdProps} className="k-table-td">
                {formatDateTime(val, datetimeFormat)}
              </td>
            );
          },
        },
      },
      {
        field: "editDate",
        title: t("editedDate"),
        width: 130,
        media: "(min-width: 1200px)",
        cells: {
          data: (props) => {
            const val = (props.dataItem as IPortRegion).editDate;
            return (
              <td {...props.tdProps} className="k-table-td">
                {formatDateTime(val, datetimeFormat)}
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
    pageSize = 50,
    pageSizes,
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
      columns={columns}
      dataItemKey="portRegionId"
      actions={{
        onView: (item) => onView(item as unknown as IPortRegion),
        onEdit: (item) => onEdit(item as unknown as IPortRegion),
        onDelete: (item) => onDelete(item as unknown as IPortRegion),
      }}
      showView={canView}
      showEdit={canEdit}
      showDelete={canDelete}
      pageable
      pageSize={pageSize}
      pageSizes={pageSizes}
      sortable
      filterable
      skip={serverSidePagination ? (currentPage - 1) * pageSize : undefined}
      total={serverSidePagination ? totalRecords : undefined}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      currentPage={currentPage}
      serverSidePagination={serverSidePagination}
      moduleId={moduleId}
      transactionId={transactionId}
      tableName={TableName.portRegion}
      onAdd={onAdd}
      onRefresh={onRefresh}
      addButtonLabel={addButtonLabel ?? t("addPortRegion")}
      searchPlaceholder={searchPlaceholder ?? t("searchPortRegionsPlaceholder")}
      searchValue={searchFilter}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onSearchClear={onSearchClear}
    />
  );
}
