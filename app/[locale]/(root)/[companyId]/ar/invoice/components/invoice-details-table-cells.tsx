"use client";

import { useState } from "react";
import { NumericTextBox, Input } from "@progress/kendo-react-inputs";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import type { IArInvoiceDt } from "@/interfaces/ar-invoice";
import type {
  IChartOfAccountLookup,
  IDepartmentLookup,
  IGstLookup,
  IPortLookup,
  IProductLookup,
  IUomLookup,
  IVesselLookup,
  IBargeLookup,
} from "@/interfaces/lookup";
import { formatNumber } from "@/lib/format-utils";
import { format } from "date-fns";
import { ChartOfAccountMultiColumn } from "@/components/ui/multicolumn/chart-of-account-multicolumn";
import { DepartmentCombobox } from "@/components/ui/combobox/department-combobox";
import { ProductCombobox } from "@/components/ui/combobox/product-combobox";
import { UomCombobox } from "@/components/ui/combobox/uom-combobox";
import { GstCombobox } from "@/components/ui/combobox/gst-combobox";
import { VesselCombobox } from "@/components/ui/combobox/vessel-combobox";
import { PortCombobox } from "@/components/ui/combobox/port-combobox";
import { BargeCombobox } from "@/components/ui/combobox/barge-combobox";

const EDIT_INPUT_CLASS = "k-input k-input-md k-input-solid k-textbox w-full min-h-8";

export type InvoiceDetailCellProps = {
  dataItem: IArInvoiceDt;
  isEditing?: boolean;
  field: string;
  decimals?: number;
  onValueChange?: (field: string, value: string | number | Date | null) => void;
};

export function InvoiceDetailReadOnlyNumber({
  dataItem,
  field,
  value,
}: InvoiceDetailCellProps & { value?: number }) {
  const raw =
    value ??
    ((dataItem as unknown as Record<string, unknown>)[field] as number | undefined);
  return (
    <div className="text-right">{raw != null ? String(raw) : "—"}</div>
  );
}

// Isolated editor: local state prevents parent re-renders from resetting the input
// while the user is typing. Commits to parent only on blur.
function NumberCellEditor({
  initialValue,
  decimals,
  onCommit,
}: {
  initialValue: number | null;
  decimals: number;
  onCommit: (value: number) => void;
}) {
  const [localVal, setLocalVal] = useState<number | null>(initialValue);
  return (
    <NumericTextBox
      className={EDIT_INPUT_CLASS}
      value={localVal}
      format={`n${decimals}`}
      min={0}
      spinners={false}
      onChange={(e) => setLocalVal(e.value ?? null)}
      onBlur={() => onCommit(localVal ?? 0)}
    />
  );
}

export function InvoiceDetailNumberCell({
  dataItem,
  field,
  decimals = 2,
  onValueChange,
  isEditing,
}: InvoiceDetailCellProps) {
  const value = (dataItem as unknown as Record<string, unknown>)[field] as
    | number
    | undefined;

  if (isEditing && onValueChange) {
    // key on itemNo+field remounts the editor (resets local state) only when switching rows.
    return (
      <NumberCellEditor
        key={`${dataItem.itemNo}-${field}`}
        initialValue={value ?? null}
        decimals={decimals}
        onCommit={(v) => onValueChange(field, v)}
      />
    );
  }
  return (
    <div className="text-right">
      {value != null ? formatNumber(value, decimals) : "—"}
    </div>
  );
}

function TextCellEditor({
  initialValue,
  onCommit,
}: {
  initialValue: string;
  onCommit: (value: string) => void;
}) {
  const [localVal, setLocalVal] = useState(initialValue);
  return (
    <Input
      className={EDIT_INPUT_CLASS}
      value={localVal}
      onChange={(e) => setLocalVal(e.value ?? "")}
      onBlur={() => onCommit(localVal)}
    />
  );
}

export function InvoiceDetailTextCell({
  dataItem,
  field,
  onValueChange,
  isEditing,
}: InvoiceDetailCellProps) {
  const value =
    ((dataItem as unknown as Record<string, unknown>)[field] as string | undefined) ??
    "";

  if (isEditing && onValueChange) {
    return (
      <TextCellEditor
        key={`${dataItem.itemNo}-${field}`}
        initialValue={value}
        onCommit={(v) => onValueChange(field, v)}
      />
    );
  }
  return <span className="block truncate">{value || "—"}</span>;
}

export function InvoiceDetailDateCell({
  dataItem,
  field,
  onValueChange,
  isEditing,
}: InvoiceDetailCellProps) {
  const raw = (dataItem as unknown as Record<string, unknown>)[field];
  const dateValue = raw instanceof Date ? raw : raw ? new Date(String(raw)) : null;
  const isValidDate = dateValue instanceof Date && !isNaN(dateValue.getTime());

  if (isEditing && onValueChange) {
    return (
      <DatePicker
        className="w-full"
        value={isValidDate ? dateValue : null}
        onChange={(e) => onValueChange(field, e.value ?? null)}
        format="dd/MM/yyyy"
      />
    );
  }
  return (
    <div className="text-right">
      {isValidDate ? format(dateValue!, "dd/MM/yyyy") : "—"}
    </div>
  );
}

export function InvoiceDetailAmountCell({
  dataItem,
  field,
  decimals = 2,
}: InvoiceDetailCellProps) {
  const value = (dataItem as unknown as Record<string, unknown>)[field] as
    | number
    | undefined;
  return (
    <div className="text-right">
      {value != null ? formatNumber(value, decimals) : "—"}
    </div>
  );
}

export function InvoiceDetailProductCell({
  dataItem,
  onValueChange,
  isEditing,
}: InvoiceDetailCellProps) {
  const currentId = (dataItem as unknown as Record<string, unknown>).productId as
    | number
    | undefined;
  const value: IProductLookup | null =
    currentId && currentId > 0
      ? ({
          productId: currentId,
          productCode:
            ((dataItem as unknown as Record<string, unknown>).productCode as string) ??
            "",
          productName:
            ((dataItem as unknown as Record<string, unknown>).productName as string) ??
            "",
        } as IProductLookup)
      : null;

  if (isEditing && onValueChange) {
    return (
      <ProductCombobox
        value={value}
        onChange={(v) => {
          onValueChange("productId", v?.productId ?? 0);
          onValueChange("productCode", v?.productCode ?? "");
          onValueChange("productName", v?.productName ?? "");
        }}
        placeholder="Select Product..."
        className="w-full min-w-0"
      />
    );
  }

  const display =
    ((dataItem as unknown as Record<string, unknown>).productName as string) ??
    ((dataItem as unknown as Record<string, unknown>).productCode as string) ??
    "";

  return <span className="block truncate">{display || "—"}</span>;
}

export function InvoiceDetailChartOfAccountCell({
  dataItem,
  onValueChange,
  isEditing,
}: InvoiceDetailCellProps) {
  const glId = (dataItem as unknown as Record<string, unknown>).glId as
    | number
    | undefined;
  const value: IChartOfAccountLookup | null =
    glId && glId > 0
      ? ({
          glId,
          glCode:
            ((dataItem as unknown as Record<string, unknown>).glCode as string) ??
            "",
          glName:
            ((dataItem as unknown as Record<string, unknown>).glName as string) ??
            "",
        } as IChartOfAccountLookup)
      : null;

  if (isEditing && onValueChange) {
    return (
      <ChartOfAccountMultiColumn
        value={value}
        onChange={(v) => {
          onValueChange("glId", v?.glId ?? 0);
          onValueChange("glCode", v?.glCode ?? "");
          onValueChange("glName", v?.glName ?? "");
        }}
        placeholder="Select Chart of Account..."
        className="w-full min-w-0"
      />
    );
  }

  const glName =
    ((dataItem as unknown as Record<string, unknown>).glName as string) ?? "";
  return <span className="block truncate">{glName || "—"}</span>;
}

export function InvoiceDetailDepartmentCell({
  dataItem,
  onValueChange,
  isEditing,
}: InvoiceDetailCellProps) {
  const departmentId = (dataItem as unknown as Record<string, unknown>)
    .departmentId as number | undefined;
  const value: IDepartmentLookup | null =
    departmentId && departmentId > 0
      ? ({
          departmentId,
          departmentCode:
            ((dataItem as unknown as Record<string, unknown>)
              .departmentCode as string) ?? "",
          departmentName:
            ((dataItem as unknown as Record<string, unknown>)
              .departmentName as string) ?? "",
        } as IDepartmentLookup)
      : null;

  if (isEditing && onValueChange) {
    return (
      <DepartmentCombobox
        value={value}
        onChange={(v) => {
          onValueChange("departmentId", v?.departmentId ?? 0);
          onValueChange("departmentCode", v?.departmentCode ?? "");
          onValueChange("departmentName", v?.departmentName ?? "");
        }}
        placeholder="Select Department..."
        className="w-full min-w-0"
      />
    );
  }

  const departmentName =
    ((dataItem as unknown as Record<string, unknown>).departmentName as string) ??
    "";
  return <span className="block truncate">{departmentName || "—"}</span>;
}

export function InvoiceDetailUomCell({
  dataItem,
  onValueChange,
  isEditing,
}: InvoiceDetailCellProps) {
  const uomId = (dataItem as unknown as Record<string, unknown>).uomId as
    | number
    | undefined;
  const value: IUomLookup | null =
    uomId && uomId > 0
      ? ({
          uomId,
          uomCode:
            ((dataItem as unknown as Record<string, unknown>).uomCode as string) ??
            "",
          uomName:
            ((dataItem as unknown as Record<string, unknown>).uomName as string) ??
            "",
        } as IUomLookup)
      : null;

  if (isEditing && onValueChange) {
    return (
      <UomCombobox
        value={value}
        onChange={(v) => {
          onValueChange("uomId", v?.uomId ?? 0);
          onValueChange("uomCode", v?.uomCode ?? "");
          onValueChange("uomName", v?.uomName ?? "");
        }}
        placeholder="Select UOM..."
        className="w-full min-w-0"
        style={{ minWidth: 0 }}
      />
    );
  }

  const uomName =
    ((dataItem as unknown as Record<string, unknown>).uomName as string) ?? "";
  return <span className="block truncate">{uomName || "—"}</span>;
}

export function InvoiceDetailGstCell({
  dataItem,
  onValueChange,
  isEditing,
}: InvoiceDetailCellProps) {
  const gstId = (dataItem as unknown as Record<string, unknown>).gstId as
    | number
    | undefined;
  const value: IGstLookup | null =
    gstId && gstId > 0
      ? ({
          gstId,
          gstName:
            ((dataItem as unknown as Record<string, unknown>).gstName as string) ??
            "",
          gstPercentage:
            ((dataItem as unknown as Record<string, unknown>)
              .gstPercentage as number) ?? 0,
        } as IGstLookup)
      : null;

  if (isEditing && onValueChange) {
    return (
      <GstCombobox
        value={value}
        onChange={(v) => {
          onValueChange("gstId", v?.gstId ?? 0);
          onValueChange("gstName", v?.gstName ?? "");
          // gstPercentage is fetched from the API (date-dependent) via handleItemChange
          // when gstId changes — do NOT set it from the combobox lookup here.
        }}
        placeholder="Select GST..."
        className="w-full min-w-0"
        style={{ minWidth: 0 }}
      />
    );
  }

  const gstName =
    ((dataItem as unknown as Record<string, unknown>).gstName as string) ?? "";
  return <span className="block truncate">{gstName || "—"}</span>;
}

export function InvoiceDetailVesselCell({
  dataItem,
  onValueChange,
  isEditing,
}: InvoiceDetailCellProps) {
  const vesselId = (dataItem as unknown as Record<string, unknown>).vesselId as
    | number
    | undefined;
  const value: IVesselLookup | null =
    vesselId && vesselId > 0
      ? ({
          vesselId,
          vesselName:
            ((dataItem as unknown as Record<string, unknown>).vesselName as string) ??
            "",
        } as IVesselLookup)
      : null;

  if (isEditing && onValueChange) {
    return (
      <VesselCombobox
        value={value}
        onChange={(v) => {
          onValueChange("vesselId", v?.vesselId ?? 0);
          onValueChange("vesselName", v?.vesselName ?? "");
        }}
        placeholder="Select Vessel..."
        className="w-full min-w-0"
      />
    );
  }

  const vesselName =
    ((dataItem as unknown as Record<string, unknown>).vesselName as string) ?? "";
  return <span className="block truncate">{vesselName || "—"}</span>;
}

export function InvoiceDetailPortCell({
  dataItem,
  onValueChange,
  isEditing,
}: InvoiceDetailCellProps) {
  const portId = (dataItem as unknown as Record<string, unknown>).portId as
    | number
    | undefined;
  const value: IPortLookup | null =
    portId && portId > 0
      ? ({
          portId,
          portCode:
            ((dataItem as unknown as Record<string, unknown>).portCode as string) ??
            "",
          portName:
            ((dataItem as unknown as Record<string, unknown>).portName as string) ??
            "",
        } as IPortLookup)
      : null;

  if (isEditing && onValueChange) {
    return (
      <PortCombobox
        value={value}
        onChange={(v) => {
          onValueChange("portId", v?.portId ?? 0);
          onValueChange("portCode", v?.portCode ?? "");
          onValueChange("portName", v?.portName ?? "");
        }}
        placeholder="Select Port..."
        className="w-full min-w-0"
      />
    );
  }

  const portName =
    ((dataItem as unknown as Record<string, unknown>).portName as string) ?? "";
  return <span className="block truncate">{portName || "—"}</span>;
}

export function InvoiceDetailBargeCell({
  dataItem,
  onValueChange,
  isEditing,
}: InvoiceDetailCellProps) {
  const bargeId = (dataItem as unknown as Record<string, unknown>).bargeId as
    | number
    | undefined;
  const value: IBargeLookup | null =
    bargeId && bargeId > 0
      ? ({
          bargeId,
          bargeCode:
            ((dataItem as unknown as Record<string, unknown>).bargeCode as string) ??
            "",
          bargeName:
            ((dataItem as unknown as Record<string, unknown>).bargeName as string) ??
            "",
        } as IBargeLookup)
      : null;

  if (isEditing && onValueChange) {
    return (
      <BargeCombobox
        value={value}
        onChange={(v) => {
          onValueChange("bargeId", v?.bargeId ?? 0);
          onValueChange("bargeCode", v?.bargeCode ?? "");
          onValueChange("bargeName", v?.bargeName ?? "");
        }}
        placeholder="Select Barge..."
        className="w-full min-w-0"
      />
    );
  }

  const bargeName =
    ((dataItem as unknown as Record<string, unknown>).bargeName as string) ?? "";
  return <span className="block truncate">{bargeName || "—"}</span>;
}

