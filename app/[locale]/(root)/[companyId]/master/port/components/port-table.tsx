"use client";

import { format, isValid } from "date-fns";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IPort } from "@/interfaces/port";
import { TableName } from "@/lib/utils";

const DATE_TIME_FORMAT = "dd-MMM-yy HH:mm";

function formatDateTime(value: Date | string | null | undefined): string {
  if (value == null) return "";
  try {
    const d = value instanceof Date ? value : new Date(value);
    return isValid(d) ? format(d, DATE_TIME_FORMAT) : "";
  } catch {
    return "";
  }
}

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

const columns: MasterDataGridColumn[] = [
  { field: "portCode", title: "Code", width: 120 },
  { field: "portName", title: "Name", width: 220 },
  { field: "portShortName", title: "Short Name", width: 100 },
  { field: "portRegionName", title: "Region", width: 160 },
  { field: "isActive", title: "Active", width: 90 },
  { field: "remarks", title: "Remarks", width: 150 },
  { field: "createBy", title: "Created By", width: 120 },
  { field: "editBy", title: "Edited", width: 100 },
  {
    field: "createDate",
    title: "Created Date",
    width: 130,
    cells: {
      data: (props) => {
        const val = (props.dataItem as IPort).createDate;
        return (
          <td {...props.tdProps} className="k-table-td">
            {formatDateTime(val)}
          </td>
        );
      },
    },
  },
  {
    field: "editDate",
    title: "Edited Date",
    width: 130,
    cells: {
      data: (props) => {
        const val = (props.dataItem as IPort).editDate;
        return (
          <td {...props.tdProps} className="k-table-td">
            {formatDateTime(val)}
          </td>
        );
      },
    },
  },
];

export function PortTable(props: PortTableProps) {
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
