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
      width: 80,
      minWidth: 80,
      cell: ({ dataItem }) => (
        <InvoiceDetailReadOnlyNumber dataItem={dataItem} field="itemNo" />
      ),
    },
    {
      field: "seqNo",
      title: "Seq No",
      width: 60,
      minWidth: 60,
      cell: ({ dataItem }) => (
        <InvoiceDetailReadOnlyNumber dataItem={dataItem} field="seqNo" />
      ),
    },
    {
      field: "docItemNo",
      title: "Doc Item No",
      width: 90,
      minWidth: 90,
      cell: ({ dataItem }) => (
        <InvoiceDetailReadOnlyNumber dataItem={dataItem} field="docItemNo" />
      ),
    },
    ...(visible?.m_ProductId
      ? [
          { field: "productCode", title: "Product Code", width: 100, minWidth: 100 },
          { field: "productName", title: "Product", width: 200, minWidth: 200 },
        ]
      : []),
    { field: "glCode", title: "Code", width: 80, minWidth: 80 },
    { field: "glName", title: "Account", width: 220, minWidth: 220 },
    ...(visible?.m_DepartmentId
      ? [
          { field: "departmentCode", title: "Dept Code", width: 90, minWidth: 90 },
          { field: "departmentName", title: "Department", width: 200, minWidth: 200 },
        ]
      : []),
    ...(visible?.m_QTY
      ? [
          {
            field: "qty",
            title: "Qty",
            width: 70,
            minWidth: 70,
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
            width: 70,
            minWidth: 70,
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
          { field: "uomCode", title: "UOM Code", width: 80, minWidth: 80 },
          { field: "uomName", title: "UOM", width: 140, minWidth: 140 },
        ]
      : []),
    ...(visible?.m_UnitPrice
      ? [
          {
            field: "unitPrice",
            title: "Price",
            width: 100,
            minWidth: 100,
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
      width: 110,
      minWidth: 110,
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
      width: 110,
      minWidth: 110,
      cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => (
        <InvoiceDetailAmountCell
          dataItem={dataItem}
          field="totLocalAmt"
          decimals={locAmtDec}
        />
      ),
    },
    ...(visible?.m_Remarks !== false
      ? [{ field: "remarks", title: "Remarks", width: 120, minWidth: 120 }]
      : []),
    ...(visible?.m_DebitNoteNo !== false
      ? [{ field: "debitNoteNo", title: "Debit Note No", width: 110, minWidth: 110 }]
      : []),
    ...(visible?.m_GstId
      ? [
          { field: "gstName", title: "GST", width: 140, minWidth: 140 },
          {
            field: "gstPercentage",
            title: "GST %",
            width: 80,
            minWidth: 80,
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
            title: "GST Amount",
            width: 100,
            minWidth: 100,
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
            title: "GST Local",
            width: 100,
            minWidth: 100,
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
    { field: "deliveryDate", title: "Delivery Date", width: 120, minWidth: 120 },
    { field: "supplyDate", title: "Supply Date", width: 120, minWidth: 120 },
    { field: "vesselName", title: "Vessel", width: 140, minWidth: 140 },
    { field: "portName", title: "Port", width: 140, minWidth: 140 },
    { field: "supplierName", title: "Supplier", width: 120, minWidth: 120 },
    { field: "apInvoiceNo", title: "AP Invoice No", width: 120, minWidth: 120 },
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
        onBulkDeleteAction={handleBulkDelete}
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
