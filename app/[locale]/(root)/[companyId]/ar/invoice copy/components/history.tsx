"use client";

import type { UseFormReturn } from "react-hook-form";
import type { ArInvoiceHdSchemaType } from "@/schemas/ar-invoice";
import { useAuthStore } from "@/stores/auth-store";
import { formatNumber } from "@/lib/format-utils";
import { format } from "date-fns";
import { parseDate } from "@/lib/date-utils";
import AccountDetails from "./history/account-details";
import PaymentDetails from "./history/payment-details";
import GLPostDetails from "./history/gl-post-details";
import EditVersionDetails from "./history/edit-version-details";

interface HistoryProps {
  form: UseFormReturn<ArInvoiceHdSchemaType>;
  isEdit: boolean;
}

export default function History({ form, isEdit: _isEdit }: HistoryProps) {
  const { decimals } = useAuthStore();
  const dateFormat = decimals[0]?.dateFormat ?? "dd/MM/yyyy";
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  const accountDetails = {
    createBy: form.getValues("createBy") ?? "",
    createDate: form.getValues("createDate") ?? "",
    editBy: form.getValues("editBy") ?? "",
    editDate: form.getValues("editDate") ?? "",
    cancelBy: form.getValues("cancelBy") ?? "",
    cancelDate: form.getValues("cancelDate") ?? "",
    balanceAmt: Number(form.getValues("balAmt") ?? 0),
    balanceBaseAmt: Number(form.getValues("balLocalAmt") ?? 0),
    paymentAmt: Number(form.getValues("payAmt") ?? 0),
    paymentBaseAmt: Number(form.getValues("payLocalAmt") ?? 0),
  };

  const invoiceId = form.getValues("invoiceId") ?? "";

  return (
    <div className="space-y-4">
      <AccountDetails {...accountDetails} />
      <PaymentDetails invoiceId={invoiceId} />
      <GLPostDetails invoiceId={invoiceId} />
      <EditVersionDetails invoiceId={invoiceId} />
    </div>
  );
}
