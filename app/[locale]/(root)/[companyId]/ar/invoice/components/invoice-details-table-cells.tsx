"use client";

import { NumericTextBox } from "@progress/kendo-react-inputs";
import { Input } from "@progress/kendo-react-inputs";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import type { IArInvoiceDt } from "@/interfaces/ar-invoice";
import { formatNumber } from "@/lib/format-utils";
import { format } from "date-fns";

const EDIT_INPUT_CLASS = "k-input k-input-md k-input-solid k-textbox w-full min-h-8";

export type InvoiceDetailCellProps = {
  dataItem: IArInvoiceDt & { inEdit?: boolean };
  field: string;
  decimals?: number;
  onValueChange?: (field: string, value: string | number | Date | null) => void;
};

export function InvoiceDetailReadOnlyNumber({
  dataItem,
  field,
  value,
}: InvoiceDetailCellProps & { value?: number }) {
  const raw = value ?? (dataItem as unknown as Record<string, unknown>)[field] as number | undefined;
  return (
    <div className="text-right">
      {raw != null ? String(raw) : "—"}
    </div>
  );
}

export function InvoiceDetailNumberCell({
  dataItem,
  field,
  decimals = 2,
  onValueChange,
}: InvoiceDetailCellProps) {
  const isEditing = dataItem.inEdit === true;
  const value = (dataItem as unknown as Record<string, unknown>)[field] as number | undefined;

  if (isEditing && onValueChange) {
    return (
      <NumericTextBox
        className={EDIT_INPUT_CLASS}
        value={value ?? null}
        format={`n${decimals}`}
        min={0}
        onChange={(e) => onValueChange(field, e.value ?? 0)}
      />
    );
  }
  return (
    <div className="text-right">
      {value != null ? formatNumber(value, decimals) : "—"}
    </div>
  );
}

export function InvoiceDetailTextCell({
  dataItem,
  field,
  onValueChange,
}: InvoiceDetailCellProps) {
  const isEditing = dataItem.inEdit === true;
  const value = (dataItem as unknown as Record<string, unknown>)[field] as string | undefined ?? "";

  if (isEditing && onValueChange) {
    return (
      <Input
        className={EDIT_INPUT_CLASS}
        value={value}
        onChange={(e) => onValueChange(field, e.value ?? "")}
      />
    );
  }
  return <span className="block truncate">{value || "—"}</span>;
}

export function InvoiceDetailDateCell({
  dataItem,
  field,
  onValueChange,
}: InvoiceDetailCellProps) {
  const isEditing = dataItem.inEdit === true;
  const raw = (dataItem as unknown as Record<string, unknown>)[field];
  const dateValue = raw instanceof Date ? raw : raw ? new Date(String(raw)) : null;

  if (isEditing && onValueChange) {
    return (
      <DatePicker
        className="w-full"
        value={dateValue}
        onChange={(e) => onValueChange(field, e.value ?? null)}
        format="dd/MM/yyyy"
      />
    );
  }
  return (
    <div className="text-right">
      {dateValue ? format(dateValue, "dd/MM/yyyy") : "—"}
    </div>
  );
}

export function InvoiceDetailAmountCell({
  dataItem,
  field,
  decimals = 2,
}: InvoiceDetailCellProps) {
  const value = (dataItem as unknown as Record<string, unknown>)[field] as number | undefined;
  return (
    <div className="text-right">
      {value != null ? formatNumber(value, decimals) : "—"}
    </div>
  );
}
