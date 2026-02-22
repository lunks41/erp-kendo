"use client";

import { format } from "date-fns";
import type { ApiResponse } from "@/interfaces/auth";
import type { IPaymentHistoryDetails } from "@/interfaces/history";
import { useAuthStore } from "@/stores/auth-store";
import { formatNumber } from "@/lib/format-utils";
import { ARTransactionId, ModuleId, TableName } from "@/lib/utils";
import { useGetPaymentDetails } from "@/hooks/use-histoy";
import { AccountBaseTable } from "@/components/table/table-account";

interface PaymentDetailsProps {
  invoiceId: string;
}

export default function PaymentDetails({ invoiceId }: PaymentDetailsProps) {
  const { decimals } = useAuthStore();
  const amtDec = decimals[0]?.amtDec ?? 2;
  const locAmtDec = decimals[0]?.locAmtDec ?? 2;
  const dateFormat = decimals[0]?.dateFormat ?? "dd/MM/yyyy";

  const { data } = useGetPaymentDetails<IPaymentHistoryDetails>(
    Number(ModuleId.ar),
    Number(ARTransactionId.invoice),
    invoiceId,
    { enabled: !!invoiceId && invoiceId !== "0" },
  );

  const response = data as ApiResponse<IPaymentHistoryDetails> | undefined;
  const tableData = response?.data ?? [];

  const columns = [
    { field: "documentNo", title: "Document No" },
    { field: "referenceNo", title: "Reference No" },
    {
      field: "accountDate",
      title: "Account Date",
      cell: ({ dataItem }: { dataItem: IPaymentHistoryDetails }) => {
        const d = dataItem.accountDate;
        return d ? format(new Date(String(d)), dateFormat) : "-";
      },
    },
    {
      field: "totAmt",
      title: "Total Amount",
      cell: ({ dataItem }: { dataItem: IPaymentHistoryDetails }) => (
        <div className="text-right">
          {formatNumber(dataItem.totAmt ?? 0, amtDec)}
        </div>
      ),
    },
    {
      field: "totLocalAmt",
      title: "Local Amount",
      cell: ({ dataItem }: { dataItem: IPaymentHistoryDetails }) => (
        <div className="text-right">
          {formatNumber(dataItem.totLocalAmt ?? 0, locAmtDec)}
        </div>
      ),
    },
  ];

  return (
    <div className="rounded border p-4">
      <h3 className="mb-3 font-medium">Payment Details</h3>
      <AccountBaseTable
        data={tableData}
        columns={columns}
        moduleId={ModuleId.ar}
        transactionId={ARTransactionId.invoice}
        tableName={TableName.paymentDetails}
        emptyMessage="No payment details."
        accessorId="documentId"
        showActions={false}
      />
    </div>
  );
}
