"use client";

import { memo, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { MasterDataGridColumn } from "@/components/table";
import { MasterDataGrid } from "@/components/table";
import type { IChartOfAccount } from "@/interfaces/chartofaccount";
import { formatDateTime } from "@/lib/date-utils";
import { TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export interface ChartOfAccountTableProps {
  data: IChartOfAccount[];
  totalRecords?: number;
  onView: (item: IChartOfAccount) => void;
  onEdit: (item: IChartOfAccount) => void;
  onDelete: (item: IChartOfAccount) => void;
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

function ChartOfAccountTableInner(props: ChartOfAccountTableProps) {
  const t = useTranslations("chartOfAccountTable");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  const defaultColumns: MasterDataGridColumn[] = useMemo(
    () => [
      {
        field: "glId",
        title: "GL Id",
        width: 80,
        minWidth: 60,
        hidden: true,
      },
      { field: "glCode", title: t("glCode"), width: 110, minWidth: 80 },
      { field: "glName", title: t("glName"), flex: true, minWidth: 150 },
      {
        field: "accTypeName",
        title: t("accountType"),
        width: 120,
        minWidth: 90,
      },
      {
        field: "accGroupName",
        title: t("accountGroup"),
        width: 120,
        minWidth: 90,
      },
      {
        field: "coaCategoryName1",
        title: t("category1"),
        width: 110,
        minWidth: 80,
      },
      {
        field: "coaCategoryName2",
        title: t("category2"),
        width: 110,
        minWidth: 80,
      },
      {
        field: "coaCategoryName3",
        title: t("category3"),
        width: 110,
        minWidth: 80,
      },
      {
        field: "isSysControl",
        title: t("systemControl"),
        width: 120,
        media: "(min-width: 1100px)",
        cells: {
          data: (props) => {
            const value = (props.dataItem as IChartOfAccount).isSysControl;
            const label = value ? t("active") : t("inactive");
            const bgClass = value
              ? "bg-emerald-600 text-white"
              : "bg-slate-500 text-white";
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
      {
        field: "isJobSpecific",
        title: t("jobControl"),
        width: 120,
        media: "(min-width: 1200px)",
        cells: {
          data: (props) => {
            const value = (props.dataItem as IChartOfAccount).isJobSpecific;
            const label = value ? t("active") : t("inactive");
            const bgClass = value
              ? "bg-emerald-600 text-white"
              : "bg-slate-500 text-white";
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
      {
        field: "isBankAccount",
        title: t("bankControl"),
        width: 120,
        media: "(min-width: 1300px)",
        cells: {
          data: (props) => {
            const value = (props.dataItem as IChartOfAccount).isBankAccount;
            const label = value ? t("active") : t("inactive");
            const bgClass = value
              ? "bg-emerald-600 text-white"
              : "bg-slate-500 text-white";
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
      {
        field: "isDeptMandatory",
        title: t("deptMandatory"),
        width: 130,
        media: "(min-width: 1400px)",
        cells: {
          data: (props) => {
            const value = (props.dataItem as IChartOfAccount).isDeptMandatory;
            const label = value ? t("active") : t("inactive");
            const bgClass = value
              ? "bg-emerald-600 text-white"
              : "bg-slate-500 text-white";
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
      {
        field: "isBargeMandatory",
        title: t("bargeMandatory"),
        width: 140,
        media: "(min-width: 1500px)",
        cells: {
          data: (props) => {
            const value = (props.dataItem as IChartOfAccount).isBargeMandatory;
            const label = value ? t("active") : t("inactive");
            const bgClass = value
              ? "bg-emerald-600 text-white"
              : "bg-slate-500 text-white";
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
      {
        field: "isOperational",
        title: t("operational"),
        width: 120,
        media: "(min-width: 1600px)",
        cells: {
          data: (props) => {
            const value = (props.dataItem as IChartOfAccount).isOperational;
            const label = value ? t("active") : t("inactive");
            const bgClass = value
              ? "bg-emerald-600 text-white"
              : "bg-slate-500 text-white";
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
      {
        field: "isPayableAccount",
        title: t("payableAccount"),
        width: 150,
        media: "(min-width: 1700px)",
        cells: {
          data: (props) => {
            const value = (props.dataItem as IChartOfAccount).isPayableAccount;
            const label = value ? t("active") : t("inactive");
            const bgClass = value
              ? "bg-emerald-600 text-white"
              : "bg-slate-500 text-white";
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
      {
        field: "isReceivableAccount",
        title: t("receivableAccount"),
        width: 160,
        media: "(min-width: 1800px)",
        cells: {
          data: (props) => {
            const value = (props.dataItem as IChartOfAccount)
              .isReceivableAccount;
            const label = value ? t("active") : t("inactive");
            const bgClass = value
              ? "bg-emerald-600 text-white"
              : "bg-slate-500 text-white";
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
      {
        field: "isUniversal",
        title: t("universal"),
        width: 120,
        media: "(min-width: 1900px)",
        cells: {
          data: (props) => {
            const value = (props.dataItem as IChartOfAccount).isUniversal;
            const label = value ? t("active") : t("inactive");
            const bgClass = value
              ? "bg-emerald-600 text-white"
              : "bg-slate-500 text-white";
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
      {
        field: "isActive",
        title: t("active"),
        width: 100,
        cells: {
          data: (props) => {
            const isActive = (props.dataItem as IChartOfAccount).isActive;
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
            const val = (props.dataItem as IChartOfAccount).createDate;
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
            const val = (props.dataItem as IChartOfAccount).editDate;
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
      dataItemKey="glId"
      actions={{
        onView: (item) => onView(item as unknown as IChartOfAccount),
        onEdit: (item) => onEdit(item as unknown as IChartOfAccount),
        onDelete: (item) => onDelete(item as unknown as IChartOfAccount),
      }}
      pageable
      groupable={false}
      pageSize={pageSize}
      total={serverSidePagination ? totalRecords : undefined}
      currentPage={currentPage}
      serverSidePagination={serverSidePagination}
      searchPlaceholder={
        searchPlaceholder ?? t("searchChartOfAccountsPlaceholder")
      }
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
      tableName={TableName.chartOfAccount}
      addButtonLabel={addButtonLabel ?? t("addChartOfAccount")}
    />
  );
}

export const ChartOfAccountTable = memo(ChartOfAccountTableInner);
