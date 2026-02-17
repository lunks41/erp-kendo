"use client";

import { useMemo } from "react";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IPort } from "@/interfaces/port";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface PortTableProps {
  data: IPort[];
  totalRecords?: number;
  onView: (item: IPort) => void;
  onEdit: (item: IPort) => void;
  onDelete: (item: IPort) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  addButtonLabel?: string;
  searchPlaceholder?: string;
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

export function PortTable(props: PortTableProps) {
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  const columns: MasterDataGridColumn[] = useMemo(
    () => [
      { field: "portCode", title: "Code", width: 100, minWidth: 80 },
      { field: "portName", title: "Name", flex: true, minWidth: 150 },
      {
        field: "portShortName",
        title: "Short Name",
        width: 100,
        media: "(min-width: 768px)",
      },
      { field: "portRegionName", title: "Region", width: 120, minWidth: 100 },
      { field: "isActive", title: "Active", width: 80 },
      { field: "remarks", title: "Remarks", flex: true, minWidth: 100 },
      {
        field: "createBy",
        title: "Created By",
        width: 100,
        media: "(min-width: 992px)",
      },
      {
        field: "editBy",
        title: "Edited",
        width: 100,
        media: "(min-width: 1200px)",
      },
      {
        field: "createDate",
        title: "Created Date",
        width: 130,
        cells: {
          data: (props) => {
            const val = (props.dataItem as IPort).createDate;
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
        title: "Edited Date",
        width: 130,
        media: "(min-width: 1200px)",
        cells: {
          data: (props) => {
            const val = (props.dataItem as IPort).editDate;
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

  const {
    data,
    totalRecords = 0,
    onView,
    onEdit,
    onDelete,
    onAdd,
    onRefresh,
    addButtonLabel = "+ Add Port",
    searchPlaceholder = "Search ports...",
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
      dataItemKey="portId"
      actions={{
        onView: (item) => onView(item as unknown as IPort),
        onEdit: (item) => onEdit(item as unknown as IPort),
        onDelete: (item) => onDelete(item as unknown as IPort),
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
      tableName={TableName.port}
      onAdd={onAdd}
      onRefresh={onRefresh}
      addButtonLabel={addButtonLabel}
      searchPlaceholder={searchPlaceholder}
    />
  );
}
