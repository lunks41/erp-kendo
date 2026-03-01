"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { IArInvoiceHd } from "@/interfaces/ar-invoice";
import { useAuthStore } from "@/stores/auth-store";
import { formatNumber } from "@/lib/format-utils";
import { ARTransactionId, ModuleId, TableName } from "@/lib/utils";
import { useGetARInvoiceHistoryList, useGetARInvoiceHistoryDetails } from "@/hooks/use-ar";
import { AccountBaseTable } from "@/components/table/table-account";

interface EditVersionDetailsProps {
  invoiceId: string;
}

export default function EditVersionDetails({
  invoiceId,
}: EditVersionDetailsProps) {
  const { decimals } = useAuthStore();
  const amtDec = decimals[0]?.amtDec ?? 2;
  const locAmtDec = decimals[0]?.locAmtDec ?? 2;
  const dateFormat = decimals[0]?.dateFormat ?? "dd/MM/yyyy";

  const { data: historyData } = useGetARInvoiceHistoryList<IArInvoiceHd[]>(
    invoiceId,
    { enabled: !!invoiceId && invoiceId !== "0" },
  );

  const [selectedRow, setSelectedRow] = useState<IArInvoiceHd | null>(null);

  const { data: detailsData } = useGetARInvoiceHistoryDetails<IArInvoiceHd>(
    selectedRow?.invoiceId ?? "",
    selectedRow?.editVersion?.toString() ?? "",
    { enabled: !!selectedRow?.invoiceId && selectedRow.invoiceId !== "0" },
  );

  const raw = historyData?.result === 1 ? historyData.data : undefined;
  const tableData: IArInvoiceHd[] = Array.isArray(raw)
    ? (Array.isArray(raw[0]) ? (raw as unknown as IArInvoiceHd[][]).flat() : (raw as unknown as IArInvoiceHd[]))
    : [];

  const columns = [
    { field: "editVersion", title: "Version" },
    { field: "invoiceNo", title: "Invoice No" },
    { field: "referenceNo", title: "Reference No" },
    {
      field: "accountDate",
      title: "Account Date",
      cell: ({ dataItem }: { dataItem: IArInvoiceHd }) => {
        const d = dataItem.accountDate;
        return d ? format(new Date(String(d)), dateFormat) : "-";
      },
    },
    { field: "customerCode", title: "Customer Code" },
    {
      field: "totAmt",
      title: "Total Amount",
      cell: ({ dataItem }: { dataItem: IArInvoiceHd }) => (
        <div className="text-right">
          {formatNumber(dataItem.totAmt ?? 0, amtDec)}
        </div>
      ),
    },
    {
      field: "totLocalAmt",
      title: "Local Amount",
      cell: ({ dataItem }: { dataItem: IArInvoiceHd }) => (
        <div className="text-right">
          {formatNumber(dataItem.totLocalAmt ?? 0, locAmtDec)}
        </div>
      ),
    },
  ];

  return (
    <div className="rounded border p-4">
      <h3 className="mb-3 font-medium">Edit Version Details</h3>
      <AccountBaseTable
        data={tableData}
        columns={columns}
        moduleId={ModuleId.ar}
        transactionId={ARTransactionId.invoice}
        tableName={TableName.arInvoiceHistory}
        emptyMessage="No edit history."
        accessorId="invoiceId"
        onEditAction={(item) => setSelectedRow(item)}
        hideDelete
        showActions
      />
    </div>
  );
}
