"use client";

import { useAuthStore } from "@/stores/auth-store";
import { format, parse, isValid } from "date-fns";
import { parseDate } from "@/lib/date-utils";
import { formatNumber } from "@/lib/format-utils";

interface AccountDetailsProps {
  createBy: string;
  createDate: string;
  editBy: string | null;
  editDate: string | null;
  cancelBy: string | null;
  cancelDate: string | null;
  balanceAmt: number;
  balanceBaseAmt: number;
  paymentAmt: number;
  paymentBaseAmt: number;
}

function safeFormatDate(
  dateValue: string | Date | null | undefined,
  formatStr = "dd/MM/yyyy HH:mm",
): string {
  if (!dateValue) return "";
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? "" : format(dateValue, formatStr);
  }
  if (typeof dateValue === "string" && dateValue.includes("T")) {
    const d = new Date(dateValue);
    return !isNaN(d.getTime()) ? format(d, formatStr) : "";
  }
  if (typeof dateValue === "string") {
    const fmts = [
      "dd/MM/yyyy HH:mm:ss",
      "dd/MM/yyyy HH:mm",
      "yyyy-MM-dd HH:mm:ss",
      "yyyy-MM-dd HH:mm",
    ];
    for (const fmt of fmts) {
      try {
        const p = parse(dateValue, fmt, new Date());
        if (isValid(p)) return format(p, formatStr);
      } catch {
        continue;
      }
    }
  }
  const d = parseDate(String(dateValue));
  return d ? format(d, formatStr) : "";
}

export default function AccountDetails({
  createBy,
  createDate,
  editBy,
  editDate,
  cancelBy,
  cancelDate,
  balanceAmt,
  balanceBaseAmt,
  paymentAmt,
  paymentBaseAmt,
}: AccountDetailsProps) {
  const { decimals } = useAuthStore();
  const amtDec = decimals[0]?.amtDec ?? 2;
  const locAmtDec = decimals[0]?.locAmtDec ?? 2;
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";

  return (
    <div className="rounded border p-4">
      <h3 className="mb-3 font-medium">Account Details</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Created By</span>
            <span>{createBy} {safeFormatDate(createDate, datetimeFormat)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Last Edited By</span>
            <span>{editBy ?? "-"} {editDate ? safeFormatDate(editDate, datetimeFormat) : ""}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Cancelled By</span>
            <span>{cancelBy ?? "-"} {cancelDate ? safeFormatDate(cancelDate, datetimeFormat) : ""}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Balance Amount</span>
            <span className="font-medium">{formatNumber(balanceAmt, amtDec)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Balance Base Amount</span>
            <span className="font-medium">{formatNumber(balanceBaseAmt, locAmtDec)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Payment Amount</span>
            <span className="font-medium">{formatNumber(paymentAmt, amtDec)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Payment Base Amount</span>
            <span className="font-medium">{formatNumber(paymentBaseAmt, locAmtDec)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
