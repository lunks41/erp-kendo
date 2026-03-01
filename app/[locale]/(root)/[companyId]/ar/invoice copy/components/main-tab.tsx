"use client";

import { useState, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ArInvoiceHdSchemaType } from "@/schemas/ar-invoice";
import type { IMandatoryFields, IVisibleFields } from "@/interfaces/setting";
import InvoiceForm from "./invoice-form";
import InvoiceDetailsForm from "./invoice-details-form";
import InvoiceDetailsTable from "./invoice-details-table";
import { DeleteConfirmation } from "@/components/ui/confirmation";
import { useAuthStore } from "@/stores/auth-store";
import { useUserSettingDefaults } from "@/hooks/use-settings";
import { recalculateAndSetHeaderTotals } from "@/helpers/ar-invoice-calculations";
import type { IArInvoiceDt } from "@/interfaces/ar-invoice";
import type { ArInvoiceDtSchemaType } from "@/schemas/ar-invoice";

interface MainProps {
  form: UseFormReturn<ArInvoiceHdSchemaType>;
  onSuccessAction: () => Promise<void>;
  isEdit: boolean;
  visible: IVisibleFields;
  required: IMandatoryFields;
  companyId: number;
  isCancelled?: boolean;
}

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
  const [editingDetail, setEditingDetail] = useState<ArInvoiceDtSchemaType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const dataDetails = form.watch("data_details") ?? [];

  const dec = decimals[0] ?? { amtDec: 2, locAmtDec: 2, ctyAmtDec: 2 };
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

  const handleAddRow = (rowData: IArInvoiceDt) => {
    const current = form.getValues("data_details") ?? [];
    if (editingDetail) {
      const updated = current.map((item) =>
        item.itemNo === editingDetail.itemNo ? rowData : item,
      );
      form.setValue("data_details", updated as ArInvoiceDtSchemaType[], {
        shouldDirty: true,
      });
      setEditingDetail(null);
    } else {
      form.setValue(
        "data_details",
        [...current, rowData] as ArInvoiceDtSchemaType[],
        { shouldDirty: true },
      );
    }
    recalculateHeaderTotals();
  };

  const handleDelete = (itemNo: number) => {
    setItemToDelete(itemNo);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete == null) return;
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

  const handleEdit = (detail: IArInvoiceDt) => {
    setEditingDetail(detail as ArInvoiceDtSchemaType);
  };

  const handleCancelEdit = () => {
    setEditingDetail(null);
  };

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

      {/* Details (Add New) - always visible */}
      <div className="rounded border border-slate-200 p-3 dark:border-slate-700">
        <InvoiceDetailsForm
          Hdform={form}
          onAddRowAction={handleAddRow}
          onCancelEdit={handleCancelEdit}
          editingDetail={editingDetail}
          companyId={companyId}
          visible={visible}
          required={required}
          existingDetails={dataDetails as ArInvoiceDtSchemaType[]}
          defaultGlId={defaults?.ar?.invoiceGlId ?? 0}
          defaultUomId={defaults?.common?.uomId ?? 0}
          defaultGstId={defaults?.common?.gstId ?? 0}
          isCancelled={isCancelled}
        />
      </div>

      <InvoiceDetailsTable
        data={(dataDetails as IArInvoiceDt[]) ?? []}
        visible={visible}
        onDeleteAction={handleDelete}
        onEditAction={handleEdit}
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
