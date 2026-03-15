"use client";

import type { MasterDataGridColumn } from "@/components/table/master-data-grid";
import { MasterDataGrid } from "@/components/table/master-data-grid";
import { useGetWithDatesAndPagination } from "@/hooks/use-common";
import type { IArInvoiceFilter, IArInvoiceHd } from "@/interfaces/ar-invoice";
import type { IVisibleFields } from "@/interfaces/setting";
import { ArInvoice } from "@/lib/api-routes";
import { clientDateFormat, formatDateForApi } from "@/lib/date-utils";
import { formatNumber } from "@/lib/format-utils";
import { ARTransactionId, ModuleId, TableName } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { format } from "date-fns";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

interface InvoiceTableProps {
  onInvoiceSelectAction: (invoice: IArInvoiceHd | undefined) => void;
  onFilterChangeAction: (filters: IArInvoiceFilter) => void;
  initialFilters?: IArInvoiceFilter;
  pageSize: number;
  onCloseAction?: () => void;
  visible?: IVisibleFields;
  isDialogOpen?: boolean;
}

const DEFAULT_PAGE_SIZE = 15;

export default function InvoiceTable({
  onInvoiceSelectAction,
  onFilterChangeAction,
  initialFilters,
  pageSize: _pageSize,
  onCloseAction,
  visible = {} as IVisibleFields,
  isDialogOpen = false,
}: InvoiceTableProps) {
  void visible; // reserved for future column visibility
  const { decimals } = useAuthStore();
  const amtDec = decimals[0]?.amtDec ?? 2;
  const locAmtDec = decimals[0]?.locAmtDec ?? 2;
  const dateFormat = decimals[0]?.dateFormat ?? clientDateFormat;

  const today = useMemo(() => new Date(), []);
  const defaultStart = useMemo(
    () =>
      format(
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        "yyyy-MM-dd",
      ),
    [today],
  );
  const defaultEnd = useMemo(
    () =>
      format(
        new Date(today.getFullYear(), today.getMonth() + 1, 0),
        "yyyy-MM-dd",
      ),
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
    typeof _pageSize === "number" && _pageSize > 0
      ? _pageSize
      : DEFAULT_PAGE_SIZE,
  );
  const [hasSearched, setHasSearched] = useState(false);
  const [isAllTime, setIsAllTime] = useState(false);
  const [isAllTimeCommitted, setIsAllTimeCommitted] = useState(false);
  const [searchStartDate, setSearchStartDate] = useState(
    initialFilters?.startDate
      ? (formatDateForApi(String(initialFilters.startDate)) ?? defaultStart)
      : defaultStart,
  );
  const [searchEndDate, setSearchEndDate] = useState(
    initialFilters?.endDate
      ? (formatDateForApi(String(initialFilters.endDate)) ?? defaultEnd)
      : defaultEnd,
  );

  useEffect(() => {
    if (isDialogOpen) setHasSearched(true);
  }, [isDialogOpen]);

  const { data: response, isLoading } =
    useGetWithDatesAndPagination<IArInvoiceHd>(
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
    setSearchStartDate(
      isAllTime ? "" : (formatDateForApi(start) ?? defaultStart),
    );
    setSearchEndDate(isAllTime ? "" : (formatDateForApi(end) ?? defaultEnd));
    setHasSearched(true);
    setCurrentPage(1);
    onFilterChangeAction({
      ...initialFilters,
      startDate: start,
      endDate: end,
      search: form.getValues("filterSearch"),
      pageNumber: 1,
      pageSize,
    } as IArInvoiceFilter);
  };

  const handleCancel = () => {
    form.reset({
      startDate: defaultStart,
      endDate: defaultEnd,
      filterSearch: "",
    });
    setIsAllTime(false);
  };

  type CellProps = {
    dataItem?: IArInvoiceHd;
    tdProps?: React.TdHTMLAttributes<HTMLTableCellElement> | null;
  };

  const dateCell = (field: keyof IArInvoiceHd) => {
    const DateCell = (props: CellProps) => {
      const d = props.dataItem?.[field] as Date | string | null | undefined;
      const val = d ? format(new Date(d), dateFormat) : "-";
      return (
        <td {...(props.tdProps ?? {})} className="k-table-td">
          {val}
        </td>
      );
    };
    DateCell.displayName = `InvoiceTableDate_${String(field)}`;
    return DateCell;
  };

  function NumericCell({
    dataItem,
    tdProps,
    field,
    decimals: dec,
  }: CellProps & { field: keyof IArInvoiceHd; decimals: number }) {
    return (
      <td {...(tdProps ?? {})} className="k-table-td">
        <div className="text-right">
          {formatNumber(Number(dataItem?.[field] ?? 0), dec)}
        </div>
      </td>
    );
  }
  NumericCell.displayName = "InvoiceTableNumericCell";

  const numericCell = (field: keyof IArInvoiceHd, decimals: number) => {
    const Cell = (props: CellProps) => (
      <NumericCell {...props} field={field} decimals={decimals} />
    );
    Cell.displayName = `InvoiceTableNumeric_${String(field)}`;
    return Cell;
  };

  const columns: MasterDataGridColumn[] = [
    {
      field: "invoiceId",
      title: "Invoice Id",
      width: 90,
      minWidth: 90,
      hidden: true,
    },
    { field: "invoiceNo", title: "Invoice No", width: 120, minWidth: 120 },
    { field: "referenceNo", title: "Reference No", width: 120, minWidth: 120 },
    {
      field: "suppInvoiceNo",
      title: "Supp Invoice No",
      width: 120,
      minWidth: 120,
      hidden: true,
    },
    {
      field: "accountDate",
      title: "Account Date",
      width: 110,
      minWidth: 110,
      cells: { data: dateCell("accountDate") },
    },
    {
      field: "trnDate",
      title: "Trn Date",
      width: 110,
      minWidth: 110,
      cells: { data: dateCell("trnDate") },
      hidden: true,
    },
    {
      field: "dueDate",
      title: "Due Date",
      width: 110,
      minWidth: 110,
      cells: { data: dateCell("dueDate") },
    },
    {
      field: "deliveryDate",
      title: "Delivery Date",
      width: 110,
      minWidth: 110,
      cells: { data: dateCell("deliveryDate") },
      hidden: true,
    },
    {
      field: "customerCode",
      title: "Customer Code",
      width: 100,
      minWidth: 100,
      hidden: true,
    },
    {
      field: "customerName",
      title: "Customer Name",
      width: 150,
      minWidth: 150,
    },
    { field: "currencyCode", title: "Currency", width: 80, minWidth: 80 },
    {
      field: "creditTermName",
      title: "Credit Term",
      width: 100,
      minWidth: 100,
    },
    { field: "bankName", title: "Bank", width: 120, minWidth: 120 },
    {
      field: "totAmt",
      title: "Total Amount",
      width: 100,
      minWidth: 100,
      cells: { data: numericCell("totAmt", amtDec) },
      aggregate: "sum",
      aggregateDecimals: amtDec,
      aggregateLabel: "Total",
    },
    {
      field: "gstAmt",
      title: "GST Amount",
      width: 100,
      minWidth: 100,
      cells: { data: numericCell("gstAmt", amtDec) },
      aggregate: "sum",
      aggregateDecimals: amtDec,
    },
    {
      field: "totAmtAftGst",
      title: "Total After GST",
      width: 110,
      minWidth: 110,
      cells: { data: numericCell("totAmtAftGst", amtDec) },
      aggregate: "sum",
      aggregateDecimals: amtDec,
    },
    {
      field: "totLocalAmt",
      title: "Local Amount",
      width: 100,
      minWidth: 100,
      cells: { data: numericCell("totLocalAmt", locAmtDec) },
      aggregate: "sum",
      aggregateDecimals: locAmtDec,
    },
    {
      field: "payAmt",
      title: "Payment",
      width: 100,
      minWidth: 100,
      cells: { data: numericCell("payAmt", amtDec) },
      aggregate: "sum",
      aggregateDecimals: amtDec,
    },
    {
      field: "balAmt",
      title: "Balance",
      width: 100,
      minWidth: 100,
      cells: { data: numericCell("balAmt", amtDec) },
      aggregate: "sum",
      aggregateDecimals: amtDec,
    },
    { field: "remarks", title: "Remarks", width: 150, minWidth: 150 },
    { field: "jobOrderNo", title: "Job Order", width: 120, minWidth: 120 },
    { field: "vesselName", title: "Vessel", width: 100, minWidth: 100 },
    { field: "portName", title: "Port", width: 100, minWidth: 100 },
    {
      field: "serviceCategoryName",
      title: "Service Category",
      width: 130,
      minWidth: 130,
    },
    { field: "createBy", title: "Create By", width: 90, minWidth: 90 },
    {
      field: "createDate",
      title: "Create Date",
      width: 130,
      minWidth: 130,
      cells: { data: dateCell("createDate") },
    },
    { field: "editBy", title: "Edit By", width: 90, minWidth: 90 },
    {
      field: "editDate",
      title: "Edit Date",
      width: 130,
      minWidth: 130,
      cells: { data: dateCell("editDate") },
    },
  ];

  return (
    <div
      className={
        isDialogOpen
          ? "flex min-h-0 w-full flex-1 flex-col overflow-hidden"
          : "w-full overflow-auto"
      }
    >
      <div
        className={
          isDialogOpen
            ? "mb-1 flex shrink-0 flex-wrap items-center gap-2 rounded border p-2"
            : "mb-2 flex flex-wrap items-center gap-3 rounded-lg border p-3"
        }
      >
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
        <Button
          themeColor="primary"
          onClick={handleSearch}
          disabled={isLoading}
        >
          Search
        </Button>
        <Button fillMode="outline" onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
        {onCloseAction && (
          <Button
            fillMode="outline"
            onClick={onCloseAction}
            className="ml-auto"
          >
            <X className="mr-1 h-4 w-4" />
            Close
          </Button>
        )}
      </div>

      <div
        className={
          isDialogOpen ? "min-h-0 w-full min-w-0 flex-1 overflow-hidden" : ""
        }
      >
        <MasterDataGrid
          data={data}
          columns={columns}
          dataItemKey="invoiceId"
          pageable
          pageSize={pageSize}
          total={totalRecords}
          currentPage={currentPage}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setCurrentPage(1);
          }}
          serverSidePagination
          actions={{ onView: (item) => onInvoiceSelectAction(item) }}
          showView
          showEdit={false}
          showDelete={false}
          tableName={TableName.arInvoice}
          moduleId={ModuleId.ar}
          transactionId={ARTransactionId.invoice}
          tableHeight={isDialogOpen ? "calc(90vh - 140px)" : undefined}
        />
      </div>
    </div>
  );
}
