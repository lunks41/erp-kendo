"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { X } from "lucide-react";
import type { IArInvoiceFilter, IArInvoiceHd } from "@/interfaces/ar-invoice";
import type { IVisibleFields } from "@/interfaces/setting";
import { ArInvoice } from "@/lib/api-routes";
import { clientDateFormat, formatDateForApi } from "@/lib/date-utils";
import { formatNumber } from "@/lib/format-utils";
import { ARTransactionId, ModuleId, TableName } from "@/lib/utils";
import { useGetWithDatesAndPagination } from "@/hooks/use-common";
import { MasterDataGrid } from "@/components/table/master-data-grid";
import { FormInput } from "@/components/ui/form";
import type { MasterDataGridColumn } from "@/components/table/master-data-grid";

interface InvoiceTableProps {
  onInvoiceSelect: (invoice: IArInvoiceHd | undefined) => void;
  onFilterChange: (filters: IArInvoiceFilter) => void;
  initialFilters?: IArInvoiceFilter;
  pageSize: number;
  onCloseAction?: () => void;
  visible?: IVisibleFields;
  isDialogOpen?: boolean;
}

const DEFAULT_PAGE_SIZE = 15;

export default function InvoiceTable({
  onInvoiceSelect,
  onFilterChange,
  initialFilters,
  pageSize: _pageSize,
  onCloseAction,
  visible = {} as IVisibleFields,
  isDialogOpen = false,
}: InvoiceTableProps) {
  const { decimals } = require("@/stores/auth-store").useAuthStore();
  const amtDec = decimals[0]?.amtDec ?? 2;
  const locAmtDec = decimals[0]?.locAmtDec ?? 2;
  const dateFormat = decimals[0]?.dateFormat ?? clientDateFormat;

  const today = useMemo(() => new Date(), []);
  const defaultStart = useMemo(
    () => format(new Date(today.getFullYear(), today.getMonth() - 1, 1), "yyyy-MM-dd"),
    [today],
  );
  const defaultEnd = useMemo(
    () => format(new Date(today.getFullYear(), today.getMonth() + 1, 0), "yyyy-MM-dd"),
    [today],
  );

  const form = useForm({
    defaultValues: {
      startDate: initialFilters?.startDate ?? defaultStart,
      endDate: initialFilters?.endDate ?? defaultEnd,
      filterSearch: initialFilters?.search ?? "",
    },
  });

  const [searchQuery, setSearchQuery] = useState(initialFilters?.search ?? "");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    typeof _pageSize === "number" && _pageSize > 0 ? _pageSize : DEFAULT_PAGE_SIZE,
  );
  const [hasSearched, setHasSearched] = useState(false);
  const [isAllTime, setIsAllTime] = useState(false);
  const [isAllTimeCommitted, setIsAllTimeCommitted] = useState(false);
  const [searchStartDate, setSearchStartDate] = useState(
    initialFilters?.startDate ? formatDateForApi(String(initialFilters.startDate)) ?? defaultStart : defaultStart,
  );
  const [searchEndDate, setSearchEndDate] = useState(
    initialFilters?.endDate ? formatDateForApi(String(initialFilters.endDate)) ?? defaultEnd : defaultEnd,
  );

  useEffect(() => {
    if (isDialogOpen) setHasSearched(true);
  }, [isDialogOpen]);

  const { data: response, isLoading } = useGetWithDatesAndPagination<IArInvoiceHd>(
    ArInvoice.get,
    TableName.arInvoice,
    searchQuery,
    searchStartDate ?? "",
    searchEndDate ?? "",
    currentPage,
    pageSize,
    isAllTimeCommitted,
    undefined,
    hasSearched,
  );

  const data = response?.data ?? [];
  const totalRecords = response?.totalRecords ?? data.length;

  const handleSearch = () => {
    setSearchQuery(form.getValues("filterSearch") ?? "");
    setIsAllTimeCommitted(isAllTime);
    const start = form.getValues("startDate");
    const end = form.getValues("endDate");
    setSearchStartDate(isAllTime ? "" : (formatDateForApi(start) ?? defaultStart));
    setSearchEndDate(isAllTime ? "" : (formatDateForApi(end) ?? defaultEnd));
    setHasSearched(true);
    setCurrentPage(1);
    onFilterChange({
      ...initialFilters,
      startDate: start,
      endDate: end,
      search: form.getValues("filterSearch"),
      pageNumber: 1,
      pageSize,
    } as IArInvoiceFilter);
  };

  const dateCell = (field: keyof IArInvoiceHd) =>
    (props: { dataItem?: IArInvoiceHd; tdProps?: React.TdHTMLAttributes<HTMLTableCellElement> | null }) => {
      const d = props.dataItem?.[field] as Date | string | null | undefined;
      const val = d ? format(new Date(d), dateFormat) : "-";
      return (
        <td {...(props.tdProps ?? {})} className="k-table-td">
          {val}
        </td>
      );
    };

  const columns: MasterDataGridColumn[] = [
    { field: "invoiceId", title: "Invoice Id", width: 90 },
    { field: "invoiceNo", title: "Invoice No", width: 120 },
    { field: "referenceNo", title: "Reference No", width: 120 },
    { field: "suppInvoiceNo", title: "Supp Invoice No", width: 120 },
    {
      field: "accountDate",
      title: "Account Date",
      width: 110,
      cells: { data: dateCell("accountDate") },
    },
    {
      field: "trnDate",
      title: "Trn Date",
      width: 110,
      cells: { data: dateCell("trnDate") },
    },
    {
      field: "dueDate",
      title: "Due Date",
      width: 110,
      cells: { data: dateCell("dueDate") },
    },
    {
      field: "deliveryDate",
      title: "Delivery Date",
      width: 110,
      cells: { data: dateCell("deliveryDate") },
    },
    { field: "customerCode", title: "Customer Code", width: 100 },
    { field: "customerName", title: "Customer Name", width: 150 },
    { field: "currencyCode", title: "Currency", width: 80 },
    { field: "creditTermName", title: "Credit Term", width: 100 },
    { field: "bankName", title: "Bank", width: 120 },
    {
      field: "totAmt",
      title: "Total Amount",
      width: 100,
      cells: {
        data: (props: { dataItem?: IArInvoiceHd; tdProps?: React.TdHTMLAttributes<HTMLTableCellElement> | null }) => (
          <td {...(props.tdProps ?? {})} className="k-table-td">
            <div className="text-right">
              {formatNumber(props.dataItem?.totAmt ?? 0, amtDec)}
            </div>
          </td>
        ),
      },
    },
    {
      field: "gstAmt",
      title: "VAT Amount",
      width: 100,
      cells: {
        data: (props: { dataItem?: IArInvoiceHd; tdProps?: React.TdHTMLAttributes<HTMLTableCellElement> | null }) => (
          <td {...(props.tdProps ?? {})} className="k-table-td">
            <div className="text-right">
              {formatNumber(props.dataItem?.gstAmt ?? 0, amtDec)}
            </div>
          </td>
        ),
      },
    },
    {
      field: "totAmtAftGst",
      title: "Total After VAT",
      width: 110,
      cells: {
        data: (props: { dataItem?: IArInvoiceHd; tdProps?: React.TdHTMLAttributes<HTMLTableCellElement> | null }) => (
          <td {...(props.tdProps ?? {})} className="k-table-td">
            <div className="text-right">
              {formatNumber(props.dataItem?.totAmtAftGst ?? 0, amtDec)}
            </div>
          </td>
        ),
      },
    },
    {
      field: "totLocalAmt",
      title: "Local Amount",
      width: 100,
      cells: {
        data: (props: { dataItem?: IArInvoiceHd; tdProps?: React.TdHTMLAttributes<HTMLTableCellElement> | null }) => (
          <td {...(props.tdProps ?? {})} className="k-table-td">
            <div className="text-right">
              {formatNumber(props.dataItem?.totLocalAmt ?? 0, locAmtDec)}
            </div>
          </td>
        ),
      },
    },
    {
      field: "payAmt",
      title: "Payment",
      width: 100,
      cells: {
        data: (props: { dataItem?: IArInvoiceHd; tdProps?: React.TdHTMLAttributes<HTMLTableCellElement> | null }) => (
          <td {...(props.tdProps ?? {})} className="k-table-td">
            <div className="text-right">
              {formatNumber(props.dataItem?.payAmt ?? 0, amtDec)}
            </div>
          </td>
        ),
      },
    },
    {
      field: "balAmt",
      title: "Balance",
      width: 100,
      cells: {
        data: (props: { dataItem?: IArInvoiceHd; tdProps?: React.TdHTMLAttributes<HTMLTableCellElement> | null }) => (
          <td {...(props.tdProps ?? {})} className="k-table-td">
            <div className="text-right">
              {formatNumber(props.dataItem?.balAmt ?? 0, amtDec)}
            </div>
          </td>
        ),
      },
    },
    { field: "remarks", title: "Remarks", width: 150 },
    { field: "jobOrderNo", title: "Job Order", width: 120 },
    { field: "vesselName", title: "Vessel", width: 100 },
    { field: "portName", title: "Port", width: 100 },
    { field: "serviceCategoryName", title: "Service Category", width: 130 },
    { field: "createBy", title: "Create By", width: 90 },
    {
      field: "createDate",
      title: "Create Date",
      width: 130,
      cells: { data: dateCell("createDate") },
    },
    { field: "editBy", title: "Edit By", width: 90 },
    {
      field: "editDate",
      title: "Edit Date",
      width: 130,
      cells: { data: dateCell("editDate") },
    },
  ];

  return (
    <div className="w-full overflow-auto">
      <div className="mb-2 flex flex-wrap items-center gap-3 rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">From:</span>
          <Input
            value={String(form.watch("startDate") ?? "")}
            onChange={(e) => form.setValue("startDate", e.value ?? "")}
            disabled={isAllTime}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">To:</span>
          <Input
            value={String(form.watch("endDate") ?? "")}
            onChange={(e) => form.setValue("endDate", e.value ?? "")}
            disabled={isAllTime}
          />
        </div>
        <Input
          value={form.watch("filterSearch")}
          onChange={(e) => form.setValue("filterSearch", e.value ?? "")}
          placeholder="Search..."
          style={{ width: 180 }}
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAllTime}
            onChange={(e) => setIsAllTime(e.target.checked)}
          />
          All data
        </label>
        <Button themeColor="primary" onClick={handleSearch} disabled={isLoading}>
          Search
        </Button>
        {onCloseAction && (
          <Button fillMode="outline" onClick={onCloseAction} className="ml-auto">
            <X className="mr-1 h-4 w-4" />
            Close
          </Button>
        )}
      </div>

      <MasterDataGrid
        data={data}
        columns={columns}
        dataItemKey="invoiceId"
        pageable
        pageSize={pageSize}
        skip={(currentPage - 1) * pageSize}
        total={totalRecords}
        currentPage={currentPage}
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
        serverSidePagination
        actions={{ onView: (item) => onInvoiceSelect(item) }}
        showView
        showEdit={false}
        showDelete={false}
      />
    </div>
  );
}
