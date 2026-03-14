"use client";

import { memo, useMemo } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { ICountry } from "@/interfaces/country";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Check, X } from "lucide-react";

export interface CountryTableProps {
  data: ICountry[];
  totalRecords?: number;
  onView: (item: ICountry) => void;
  onEdit: (item: ICountry) => void;
  onDelete: (item: ICountry) => void;
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

function CountryTableInner(props: CountryTableProps) {
  const t = useNamespaceTranslations("country");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  const defaultColumns: MasterDataGridColumn[] = useMemo(
    () => [
      {
        field: "countryId",
        title: "Country Id",
        width: 80,
        minWidth: 60,
        hidden: true,
      },
      { field: "countryCode", title: tc("code"), width: 100, minWidth: 80 },
      { field: "countryName", title: tc("name"), flex: true, minWidth: 150 },
      {
        field: "phoneCode",
        title: t("phoneCode"),
        width: 100,
        minWidth: 80,
      },
      {
        field: "isActive",
        title: tc("active"),
        width: 100,
        minWidth: 100,
        cells: {
          data: (props) => {
            const isActive = (props.dataItem as ICountry).isActive;
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
        minWidth: 100,
        media: "(min-width: 992px)",
      },
      {
        field: "createDate",
        title: tc("createdDate"),
        width: 180,
        minWidth: 180,
        cells: {
          data: (props) => {
            const val = (props.dataItem as ICountry).createDate;
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
        title: tc("editedBy"),
        width: 100,
        minWidth: 100,
        media: "(min-width: 1200px)",
      },
      {
        field: "editDate",
        title: tc("editedDate"),
        width: 180,
        minWidth: 180,
        media: "(min-width: 1200px)",
        cells: {
          data: (props) => {
            const val = (props.dataItem as ICountry).editDate;
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
      dataItemKey="countryId"
      actions={{
        onView: (item) => onView(item as unknown as ICountry),
        onEdit: (item) => onEdit(item as unknown as ICountry),
        onDelete: (item) => onDelete(item as unknown as ICountry),
      }}
      pageable
      groupable={false}
      pageSize={pageSize}
      total={serverSidePagination ? totalRecords : undefined}
      currentPage={currentPage}
      serverSidePagination={serverSidePagination}
      searchPlaceholder={searchPlaceholder ?? t("searchCountriesPlaceholder")}
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
      tableName={TableName.country}
      addButtonLabel={addButtonLabel ?? tc("add")}
    />
  );
}

export const CountryTable = memo(CountryTableInner);
