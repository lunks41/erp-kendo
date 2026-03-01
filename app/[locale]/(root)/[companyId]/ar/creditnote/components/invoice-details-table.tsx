"use client";

import type { IArInvoiceDt } from "@/interfaces/ar-invoice";
import type { IVisibleFields } from "@/interfaces/setting";
import { useAuthStore } from "@/stores/auth-store";
import { ARTransactionId, ModuleId, TableName } from "@/lib/utils";
import { AccountBaseTable } from "@/components/table/table-account";
import { formatNumber } from "@/lib/format-utils";

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

  const columns = [
    { field: "itemNo", title: "Item No", cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => <div className="text-right">{dataItem.itemNo}</div> },
    { field: "seqNo", title: "Seq No", cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => <div className="text-right">{dataItem.seqNo}</div> },
    { field: "docItemNo", title: "Doc Item No", cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => <div className="text-right">{dataItem.docItemNo}</div> },
    ...(visible?.m_ProductId ? [{ field: "productCode", title: "Product Code" }, { field: "productName", title: "Product" }] : []),
    { field: "glCode", title: "Code" },
    { field: "glName", title: "Account" },
    ...(visible?.m_DepartmentId ? [{ field: "departmentCode", title: "Dept Code" }, { field: "departmentName", title: "Department" }] : []),
    ...(visible?.m_QTY ? [
      { field: "qty", title: "Qty", cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => <div className="text-right">{dataItem.qty}</div> },
      { field: "billQTY", title: "Bill Qty", cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => <div className="text-right">{dataItem.billQTY}</div> },
    ] : []),
    ...(visible?.m_UomId ? [{ field: "uomCode", title: "UOM Code" }, { field: "uomName", title: "UOM" }] : []),
    ...(visible?.m_UnitPrice ? [{ field: "unitPrice", title: "Price", cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => <div className="text-right">{formatNumber(dataItem.unitPrice, amtDec)}</div> }] : []),
    { field: "totAmt", title: "Amount", cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => <div className="text-right">{formatNumber(dataItem.totAmt, amtDec)}</div> },
    { field: "totLocalAmt", title: "Local Amount", cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => <div className="text-right">{formatNumber(dataItem.totLocalAmt, locAmtDec)}</div> },
    ...(visible?.m_Remarks !== false ? [{ field: "remarks", title: "Remarks" }] : []),
    ...(visible?.m_DebitNoteNo !== false ? [{ field: "debitNoteNo", title: "Debit Note No" }] : []),
    ...(visible?.m_GstId ? [
      { field: "gstName", title: "Gst" },
      { field: "gstPercentage", title: "VAT %", cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => <div className="text-right">{formatNumber(dataItem.gstPercentage, 2)}</div> },
      { field: "gstAmt", title: "VAT Amount", cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => <div className="text-right">{formatNumber(dataItem.gstAmt ?? 0, amtDec)}</div> },
      { field: "gstLocalAmt", title: "VAT Local", cell: ({ dataItem }: { dataItem: IArInvoiceDt }) => <div className="text-right">{formatNumber(dataItem.gstLocalAmt ?? 0, locAmtDec)}</div> },
    ] : []),
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
