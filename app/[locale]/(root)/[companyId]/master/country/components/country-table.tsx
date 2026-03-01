"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { MasterDataGridRSCColumn } from "@/components/table";
import { MasterDataGridRSC } from "@/components/table";
import type { ICountry } from "@/interfaces/country";
import type { State } from "@progress/kendo-data-query";
import type { GridDataStateChangeEvent } from "@progress/kendo-react-grid";
import { MasterTransactionId, ModuleId } from "@/lib/utils";

export interface CountryTableProps {
  data: ICountry[];
  totalRecords?: number;
  dataState?: State;
  onDataStateChange?: (event: GridDataStateChangeEvent) => Promise<void>;
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
  currentPage?: number;
  pageSize?: number;
  pageSizes?: number[];
  moduleId?: number | string;
  transactionId?: number | string;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canCreate?: boolean;
  /** When false, grid calls router.refresh() after onDataStateChange (for RSC/server-side table). Default true for client-only state. */
  skipRefreshOnStateChange?: boolean;
  /** Table name for grid layout (e.g. TableName.country). When set with moduleId/transactionId, grid shows Save/Default layout buttons. */
  tableName?: string;
}

export function CountryTable(props: CountryTableProps) {
  const t = useTranslations("countryTable");

  const columns: MasterDataGridRSCColumn[] = useMemo(
    () => [
      { field: "countryId", title: "Country Id", width: 80, minWidth: 60, hidden: true },
      { field: "companyId", title: "Company Id", width: 80, minWidth: 60, hidden: true },
      { field: "countryCode", title: t("code"), width: 100, minWidth: 80 },
      { field: "countryName", title: t("name"), flex: true, minWidth: 150 },
      { field: "phoneCode", title: t("phoneCode"), width: 100, minWidth: 80 },
      { field: "isActive", title: t("active"), width: 80 },
      { field: "remarks", title: t("remarks"), flex: true, minWidth: 100 },
      { field: "createById", title: "Create By Id", width: 80, minWidth: 60, hidden: true },
      { field: "editById", title: "Edit By Id", width: 80, minWidth: 60, hidden: true },
      { field: "createBy", title: t("createdBy"), width: 100 },
      { field: "editBy", title: t("editedBy"), width: 100 },
      { field: "createDate", title: t("createdDate"), width: 130 },
      { field: "editDate", title: t("editedDate"), width: 130 },
    ],
    [t],
  );

  const {
    data,
    totalRecords = 0,
    dataState,
    onDataStateChange,
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
    pageSize = 50,
    pageSizes,
    canView = true,
    canEdit = true,
    canDelete = true,
    canCreate = true,
    skipRefreshOnStateChange = true,
    tableName,
  } = props;

  return (
    <MasterDataGridRSC<ICountry>
      data={data}
      columns={columns}
      dataItemKey="countryId"
      dataState={dataState}
      onDataStateChange={onDataStateChange}
      pageable
      pageSize={pageSize}
      total={totalRecords}
      pageSizes={pageSizes}
      sortable
      csvFileName="countries"
      skipRefreshOnStateChange={skipRefreshOnStateChange}
      actions={{
        onView: (item) => onView(item as ICountry),
        onEdit: (item) => onEdit(item as ICountry),
        onDelete: (item) => onDelete(item as ICountry),
      }}
      showView={canView}
      showEdit={canEdit}
      showDelete={canDelete}
      onAdd={onAdd}
      addButtonLabel={addButtonLabel ?? t("addCountry")}
      onRefresh={onRefresh}
      searchPlaceholder={searchPlaceholder ?? t("searchCountriesPlaceholder")}
      searchValue={searchFilter}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onSearchClear={onSearchClear}
      moduleId={ModuleId.master}
      transactionId={MasterTransactionId.country}
      tableName={tableName}
    />
  );
}
