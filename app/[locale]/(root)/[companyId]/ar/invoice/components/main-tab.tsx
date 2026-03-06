"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ArInvoiceHdSchemaType } from "@/schemas/ar-invoice";
import type { IMandatoryFields, IVisibleFields } from "@/interfaces/setting";
import InvoiceForm from "./invoice-form";
import {
  InvoiceDetailsGridInline,
  type InvoiceDetailItemChangePayload,
} from "./invoice-details-grid-inline";
import { DeleteConfirmation } from "@/components/ui/confirmation";
import { useAuthStore } from "@/stores/auth-store";
import { useUserSettingDefaults } from "@/hooks/use-settings";
import { recalculateAndSetHeaderTotals } from "@/helpers/ar-invoice-calculations";
import type { IArInvoiceDt } from "@/interfaces/ar-invoice";
import type { ArInvoiceDtSchemaType } from "@/schemas/ar-invoice";
import { getDefaultValues } from "./invoice-defaultvalues";
import { clientDateFormat } from "@/lib/date-utils";

interface MainProps {
  form: UseFormReturn<ArInvoiceHdSchemaType>;
  onSuccessAction: () => Promise<void>;
  isEdit: boolean;
  visible: IVisibleFields;
  required: IMandatoryFields;
  companyId: number;
  isCancelled?: boolean;
}

const roundTo = (value: number, decimals: number) => {
  if (!Number.isFinite(value)) return 0;
  if (!Number.isFinite(decimals) || decimals < 0) return value;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export default function Main({
  form,
  onSuccessAction,
  isEdit,
  visible,
  required,
  companyId,
  isCancelled = false,
}: MainProps) {
  const { decimals } = useAuthStore();
  const { defaults } = useUserSettingDefaults();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  /** ItemNo of the row currently in edit mode (shows comboboxes/inputs). Toggle via Edit (pencil) button. */
  const [editingItemNo, setEditingItemNo] = useState<number | null>(null);

  const dataDetails = (form.watch("data_details") ?? []) as IArInvoiceDt[];

  const dateFormat = decimals[0]?.dateFormat ?? clientDateFormat;
  const defaultDetail = useMemo(
    () => getDefaultValues(dateFormat).defaultInvoiceDetails,
    [dateFormat],
  );

  const dec = useMemo(
    () => decimals[0] ?? { amtDec: 2, locAmtDec: 2, ctyAmtDec: 2 },
    [decimals],
  );
  const recalculateHeaderTotals = useCallback(() => {
    const details = form.getValues("data_details") ?? [];
    recalculateAndSetHeaderTotals(
      form,
      details as IArInvoiceDt[],
      dec,
      visible,
    );
    form.trigger([
      "totAmt",
      "gstAmt",
      "totAmtAftGst",
      "totLocalAmt",
      "gstLocalAmt",
      "totLocalAmtAftGst",
    ]);
  }, [dec, form, visible]);

  useEffect(() => {
    if (!isEdit && !isCancelled && dataDetails.length === 0) {
      const base: IArInvoiceDt = {
        ...(defaultDetail as unknown as IArInvoiceDt),
        itemNo: 1,
        seqNo: 1,
        docItemNo: 1,
      };
      form.setValue("data_details", [base] as ArInvoiceDtSchemaType[], {
        shouldDirty: true,
      });
      recalculateHeaderTotals();
    }
  }, [
    isEdit,
    isCancelled,
    dataDetails.length,
    defaultDetail,
    form,
    recalculateHeaderTotals,
  ]);

  const handleItemChange = useCallback(
    ({ dataItem, field, value, dataIndex }: InvoiceDetailItemChangePayload) => {
      const current = (form.getValues("data_details") ?? []) as IArInvoiceDt[];
      if (!current || current.length === 0) return;

      const index =
        current[dataIndex]?.itemNo === dataItem.itemNo
          ? dataIndex
          : current.findIndex((d) => d.itemNo === dataItem.itemNo);

      if (index === -1) return;

      const updatedRow: IArInvoiceDt = {
        ...current[index],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [field]: value as any,
      };

      const exhRate = Number(form.getValues("exhRate") ?? 0) || 0;
      const amtDec = dec.amtDec ?? 2;
      const locAmtDec = dec.locAmtDec ?? 2;

      let rowWithCalcs: IArInvoiceDt = { ...updatedRow };

      // Recalculate line amount and local amount when quantity or price changes
      if (field === "qty" || field === "unitPrice") {
        const qty = Number(rowWithCalcs.qty ?? 0);
        const unitPrice = Number(rowWithCalcs.unitPrice ?? 0);
        const lineTotAmt = roundTo(qty * unitPrice, amtDec);
        rowWithCalcs = {
          ...rowWithCalcs,
          totAmt: lineTotAmt,
        };

        const lineTotLocalAmt = roundTo(lineTotAmt * exhRate, locAmtDec);
        rowWithCalcs.totLocalAmt = lineTotLocalAmt;
      }

      // If totAmt is edited directly, keep totLocalAmt in sync with exchange rate
      if (field === "totAmt") {
        const lineTotAmt = Number(rowWithCalcs.totAmt ?? 0);
        const lineTotLocalAmt = roundTo(lineTotAmt * exhRate, locAmtDec);
        rowWithCalcs.totLocalAmt = lineTotLocalAmt;
      }

      // When GST percentage changes, recalculate GST amounts
      if (field === "gstPercentage") {
        const lineTotAmt = Number(rowWithCalcs.totAmt ?? 0);
        const gstPercentage = Number(rowWithCalcs.gstPercentage ?? 0);
        const gstAmt = roundTo((lineTotAmt * gstPercentage) / 100, amtDec);
        rowWithCalcs.gstAmt = gstAmt;
        rowWithCalcs.gstLocalAmt = roundTo(gstAmt * exhRate, locAmtDec);
      }

      const next = [...current];
      next[index] = rowWithCalcs;

      form.setValue("data_details", next as ArInvoiceDtSchemaType[], {
        shouldDirty: true,
      });
      recalculateHeaderTotals();
    },
    [dec, form, recalculateHeaderTotals],
  );

  const handleEdit = useCallback((detail: IArInvoiceDt) => {
    setEditingItemNo((prev) => (prev === detail.itemNo ? null : detail.itemNo));
  }, []);

  const handleDelete = (itemNo: number) => {
    setItemToDelete(itemNo);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete == null) return;
    if (editingItemNo === itemToDelete) setEditingItemNo(null);
    const current = form.getValues("data_details") ?? [];
    form.setValue(
      "data_details",
      current.filter((d) => d.itemNo !== itemToDelete),
      { shouldDirty: true },
    );
    setShowDeleteConfirm(false);
    setItemToDelete(null);
    recalculateHeaderTotals();
  };

  const handleAddRow = useCallback(() => {
    const current = (form.getValues("data_details") ?? []) as IArInvoiceDt[];
    const nextItemNo =
      current.length > 0
        ? Math.max(...current.map((d) => Number(d.itemNo) || 0)) + 1
        : 1;

    const base = defaultDetail as unknown as IArInvoiceDt;
    const newRow: IArInvoiceDt = {
      ...base,
      itemNo: nextItemNo,
      seqNo: nextItemNo,
      docItemNo: nextItemNo,
    };

    const next = [...current, newRow];
    form.setValue("data_details", next as ArInvoiceDtSchemaType[], {
      shouldDirty: true,
    });
    setEditingItemNo(nextItemNo);
    recalculateHeaderTotals();
  }, [defaultDetail, form, recalculateHeaderTotals]);

  return (
    <div className="space-y-3">
      <InvoiceForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
        required={required}
        companyId={companyId}
        defaultCurrencyId={defaults?.ar?.currencyId ?? 0}
      />

      <InvoiceDetailsGridInline
        data={dataDetails as IArInvoiceDt[]}
        visible={visible}
        onItemChangeAction={handleItemChange}
        onDeleteAction={handleDelete}
        onEditAction={handleEdit}
        editingItemNo={editingItemNo}
        onAddRowAction={handleAddRow}
        isCancelled={isCancelled}
      />

      <DeleteConfirmation
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDelete}
        itemName={`Item ${itemToDelete}`}
      />
    </div>
  );
}
