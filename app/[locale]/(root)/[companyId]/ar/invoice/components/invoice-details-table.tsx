"use client";

import type { IArInvoiceDt } from "@/interfaces/ar-invoice";
import type { IVisibleFields } from "@/interfaces/setting";
import { useAuthStore } from "@/stores/auth-store";
import { ARTransactionId, ModuleId, TableName } from "@/lib/utils";
import { AccountBaseTable } from "@/components/table/table-account";
import type { AccountBaseTableColumn } from "@/components/table/table-account";
import {
  InvoiceDetailReadOnlyNumber,
  InvoiceDetailNumberCell,
  InvoiceDetailAmountCell,
} from "./invoice-details-table-cells";

interface InvoiceDetailsTableProps {
  data: IArInvoiceDt[];
  visible: IVisibleFields;
  onDeleteAction?: (itemNo: number) => void;
  onBulkDeleteAction?: (selectedItemNos: number[]) => void;
  onEditAction?: (detail: IArInvoiceDt) => void;
  isCancelled?: boolean;
}

export default function InvoiceDetailsTable({
  data,
  visible,
  onDeleteAction,
  onBulkDeleteAction,
  onEditAction,
  isCancelled = false,
}: InvoiceDetailsTableProps) {
  const { decimals } = useAuthStore();
  const amtDec = decimals[0]?.amtDec ?? 2;
  const locAmtDec = decimals[0]?.locAmtDec ?? 2;

  const handleDelete = (id: string) => {
    onDeleteAction?.(Number(id));
  };

  const handleBulkDelete = (ids: string[]) => {
    onBulkDeleteAction?.(ids.map(Number));
  };

  const columns: AccountBaseTableColumn<IArInvoiceDt>[] = [
    {
      field: "itemNo",
      title: "Item No",
      cell: ({ dataItem }) => (
        <InvoiceDetailReadOnlyNumber dataItem={dataItem} field="itemNo" />
      ),
    },
    {
      field: "seqNo",
      title: "Seq No",
      cell: ({ dataItem }) => (
        <InvoiceDetailReadOnlyNumber dataItem={dataItem} field="seqNo" />
      ),
    },
    {
      field: "docItemNo",
      title: "Doc Item No",
      cell: ({ dataItem }) => (
        <InvoiceDetailReadOnlyNumber dataItem={dataItem} field="docItemNo" />
      ),
    },
    ...(visible?.m_ProductId
      ? [
          { field: "productCode", title: "Product Code" },
          { field: "productName", title: "Product" },
        ]
      : []),
    { field: "glCode", title: "Code" },
    { field: "glName", title: "Account" },
    ...(visible?.m_DepartmentId
      ? [
          { field: "departmentCode", title: "Dept Code" },
          { field: "departmentName", title: "Department" },
        ]
      : []),
    ...(visible?.m_QTY
      ? [
          {
            field: "qty",
            title: "Qty",
            cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => (
              <InvoiceDetailNumberCell
                dataItem={dataItem}
                field="qty"
                decimals={0}
              />
            ),
          },
          {
            field: "billQTY",
            title: "Bill Qty",
            cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => (
              <InvoiceDetailNumberCell
                dataItem={dataItem}
                field="billQTY"
                decimals={0}
              />
            ),
          },
        ]
      : []),
    ...(visible?.m_UomId
      ? [
          { field: "uomCode", title: "UOM Code" },
          { field: "uomName", title: "UOM" },
        ]
      : []),
    ...(visible?.m_UnitPrice
      ? [
          {
            field: "unitPrice",
            title: "Price",
            cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => (
              <InvoiceDetailNumberCell
                dataItem={dataItem}
                field="unitPrice"
                decimals={amtDec}
              />
            ),
          },
        ]
      : []),
    {
      field: "totAmt",
      title: "Amount",
      cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => (
        <InvoiceDetailAmountCell
          dataItem={dataItem}
          field="totAmt"
          decimals={amtDec}
        />
      ),
    },
    {
      field: "totLocalAmt",
      title: "Local Amount",
      cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => (
        <InvoiceDetailAmountCell
          dataItem={dataItem}
          field="totLocalAmt"
          decimals={locAmtDec}
        />
      ),
    },
    ...(visible?.m_Remarks !== false ? [{ field: "remarks", title: "Remarks" }] : []),
    ...(visible?.m_DebitNoteNo !== false
      ? [{ field: "debitNoteNo", title: "Debit Note No" }]
      : []),
    ...(visible?.m_GstId
      ? [
          { field: "gstName", title: "Gst" },
          {
            field: "gstPercentage",
            title: "VAT %",
            cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => (
              <InvoiceDetailNumberCell
                dataItem={dataItem}
                field="gstPercentage"
                decimals={2}
              />
            ),
          },
          {
            field: "gstAmt",
            title: "VAT Amount",
            cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => (
              <InvoiceDetailAmountCell
                dataItem={dataItem}
                field="gstAmt"
                decimals={amtDec}
              />
            ),
          },
          {
            field: "gstLocalAmt",
            title: "VAT Local",
            cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => (
              <InvoiceDetailAmountCell
                dataItem={dataItem}
                field="gstLocalAmt"
                decimals={locAmtDec}
              />
            ),
          },
        ]
      : []),
    { field: "deliveryDate", title: "Delivery Date" },
    { field: "supplyDate", title: "Supply Date" },
    { field: "vesselName", title: "Vessel" },
    { field: "portName", title: "Port" },
    { field: "supplierName", title: "Supplier" },
    { field: "apInvoiceNo", title: "AP Invoice No" },
  ];

  return (
    <div className="px-2 py-2">
      <AccountBaseTable
        data={data}
        columns={columns}
        moduleId={ModuleId.ar}
        transactionId={ARTransactionId.invoice}
        tableName={TableName.arInvoiceDt}
        emptyMessage="No invoice details found."
        accessorId="itemNo"
        onDeleteAction={handleDelete}
        onEditAction={onEditAction}
        showHeader
        showActions
        hideEdit={isCancelled}
        hideDelete={isCancelled}
        hideCheckbox={isCancelled}
      />
    </div>
  );
}
