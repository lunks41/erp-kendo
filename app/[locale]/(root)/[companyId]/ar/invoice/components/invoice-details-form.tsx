"use client";

import { forwardRef, useImperativeHandle, useMemo, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericTextBox } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseFormReturn } from "react-hook-form";
import type { ArInvoiceDtSchemaType, ArInvoiceHdSchemaType } from "@/schemas/ar-invoice";
import { ArInvoiceDtSchema } from "@/schemas/ar-invoice";
import type { IMandatoryFields, IVisibleFields } from "@/interfaces/setting";
import type { IArInvoiceDt } from "@/interfaces/ar-invoice";
import { ProductCombobox } from "@/components/ui/combobox/product-combobox";
import { UomCombobox } from "@/components/ui/combobox/uom-combobox";
import { GstCombobox } from "@/components/ui/combobox/gst-combobox";
import {
  FormField,
  FormTextArea,
  FormInput,
  FormNumericInput,
  FormChartOfAccountMultiColumn,
  FormDepartmentCombobox,
} from "@/components/ui/form";
import { useAuthStore } from "@/stores/auth-store";
import { getDefaultValues } from "./invoice-defaultvalues";
import { recalculateDetailFormAmounts } from "@/helpers/ar-invoice-calculations";
import { toast } from "@/components/layout/notification-container";

export interface InvoiceDetailsFormRef {
  recalculateAmounts?: (
    exchangeRate?: number,
    countryExchangeRate?: number
  ) => void;
}

interface InvoiceDetailsFormProps {
  Hdform: UseFormReturn<ArInvoiceHdSchemaType>;
  onAddRowAction?: (rowData: IArInvoiceDt) => void;
  onCancelEdit?: () => void;
  editingDetail?: ArInvoiceDtSchemaType | null;
  visible: IVisibleFields;
  required: IMandatoryFields;
  companyId: number;
  existingDetails?: ArInvoiceDtSchemaType[];
  defaultGlId?: number;
  defaultUomId?: number;
  defaultGstId?: number;
  isCancelled?: boolean;
}

const InvoiceDetailsForm = forwardRef<
  InvoiceDetailsFormRef,
  InvoiceDetailsFormProps
>(function InvoiceDetailsForm(
  {
    Hdform,
    onAddRowAction,
    onCancelEdit,
    editingDetail,
    visible,
    required,
    companyId,
    existingDetails = [],
    defaultGlId = 0,
    defaultUomId = 0,
    defaultGstId = 0,
    isCancelled = false,
  },
  ref
) {
  const { decimals } = useAuthStore();
  const amtDec = decimals[0]?.amtDec ?? 2;
  const locAmtDec = decimals[0]?.locAmtDec ?? 2;
  const qtyDec = decimals[0]?.qtyDec ?? 2;
  const priceDec = decimals[0]?.priceDec ?? 2;
  const dateFormat = decimals[0]?.dateFormat ?? "dd/MM/yyyy";

  const defaultDetails = useMemo(
    () => getDefaultValues(dateFormat).defaultInvoiceDetails,
    [dateFormat],
  );

  const getNextItemNo = () => {
    if (existingDetails.length === 0) return 1;
    return Math.max(...existingDetails.map((d) => d.itemNo ?? 0)) + 1;
  };

  const createDefaultValues = (itemNo: number): ArInvoiceDtSchemaType => ({
    ...defaultDetails,
    itemNo,
    seqNo: itemNo,
    docItemNo: itemNo,
    glId: defaultGlId || defaultDetails.glId,
    uomId: defaultUomId || defaultDetails.uomId,
    gstId: defaultGstId || defaultDetails.gstId,
  } as ArInvoiceDtSchemaType);

  const form = useForm<ArInvoiceDtSchemaType>({
    resolver: zodResolver(ArInvoiceDtSchema(required, visible)),
    defaultValues: editingDetail
      ? (editingDetail as ArInvoiceDtSchemaType)
      : createDefaultValues(getNextItemNo()),
  });

  useEffect(() => {
    if (editingDetail) {
      form.reset(editingDetail as ArInvoiceDtSchemaType);
    } else {
      form.reset(createDefaultValues(getNextItemNo()));
    }
  }, [editingDetail, existingDetails.length]);

  const recalculateAmounts = (
    exchangeRate?: number,
    countryExchangeRate?: number
  ) => {
    recalculateDetailFormAmounts(
      form,
      Hdform,
      decimals[0] ?? { amtDec: 2, locAmtDec: 2, ctyAmtDec: 2 },
      visible,
      exchangeRate,
      countryExchangeRate
    );
  };

  useImperativeHandle(ref, () => ({ recalculateAmounts }));

  const handleAdd = form.handleSubmit((vals) => {
    const invoiceId = Hdform.getValues("invoiceId") ?? "0";
    const invoiceNo = Hdform.getValues("invoiceNo") ?? "";
    const itemNo = editingDetail?.itemNo ?? getNextItemNo();
    const row: IArInvoiceDt = {
      ...vals,
      invoiceId,
      invoiceNo,
      itemNo,
      seqNo: itemNo,
      docItemNo: itemNo,
    } as IArInvoiceDt;
    onAddRowAction?.(row);
    form.reset(createDefaultValues(getNextItemNo()));
    toast.success(editingDetail ? "Row updated" : "Row added");
  });

  const exhRate = Hdform.watch("exhRate") ?? 0;
  const totAmt = form.watch("totAmt") ?? 0;
  const totLocalAmt = totAmt * exhRate;

  return (
    <form
      onSubmit={handleAdd}
      className={`space-y-2 ${isCancelled ? "pointer-events-none opacity-50" : ""}`}
    >
      {/* Row 1: Item No / Seq No (combined), Chart Of Account, Department, Quantity, UOM, Unit Price, Total Amount, Total Local Amount */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8 *:min-w-0">
      <div className="col-span-1 grid grid-cols-2 gap-2">
        <FormNumericInput
          control={form.control}
          name="itemNo"
          label="Item No"
          format={0}
          alignRight={false}
          disabled
        />
        <FormNumericInput
          control={form.control}
          name="seqNo"
          label="Seq No"
          format={0}
          alignRight={false}
          disabled
        />
      </div>
      <FormChartOfAccountMultiColumn
        control={form.control}
        name="glId"
        companyId={companyId}
        label="Chart Of Account"
        isRequired={!!required?.m_GLId}
        className="min-w-0"
        glCode={form.watch("glCode")}
        glName={form.watch("glName")}
        onSelect={(v) => {
          form.setValue("glCode", v?.glCode ?? "");
          form.setValue("glName", v?.glName ?? "");
        }}
      />
      {visible?.m_DepartmentId && (
        <FormDepartmentCombobox
          control={form.control}
          name="departmentId"
          label="Department"
          className="min-w-0"
          placeholder="Select Department..."
          onSelect={(v) => {
            form.setValue("departmentCode", v?.departmentCode ?? "");
            form.setValue("departmentName", v?.departmentName ?? "");
          }}
        />
      )}
      {visible?.m_QTY && (
        <FormNumericInput
          control={form.control}
          name="qty"
          label="Quantity"
          format={qtyDec}
          isRequired={!!required?.m_QTY}
        />
      )}
      {visible?.m_UomId && (
        <div className="min-w-0">
          <label className="mb-1 block text-sm font-medium">UOM</label>
          <Controller
            name="uomId"
            control={form.control}
            render={({ field }) => (
            <UomCombobox
              className="w-full min-w-0"
              style={{ minWidth: 0 }}
              value={
                  (field.value as number) > 0
                    ? ({ uomId: field.value, uomName: form.watch("uomName") ?? "" } as import("@/interfaces/lookup").IUomLookup)
                    : null
                }
                onChange={(v) => {
                  field.onChange(v?.uomId ?? 0);
                  form.setValue("uomCode", v?.uomCode ?? "");
                  form.setValue("uomName", v?.uomName ?? "");
                }}
                label=""
              />
            )}
          />
        </div>
      )}

      {visible?.m_UnitPrice && (
        <FormNumericInput
          control={form.control}
          name="unitPrice"
          label="Unit Price"
          format={priceDec}
        />
      )}

      <FormNumericInput
        control={form.control}
        name="totAmt"
        label="Total Amount"
        format={amtDec}
      />

      <FormField label="Total Local Amount">
        <NumericTextBox
          value={form.watch("totLocalAmt") ?? totLocalAmt}
          disabled
          format={`n${locAmtDec}`}
          fillMode="outline"
          rounded="medium"
          spinners={false}
          className="w-full [&_input]:text-right"
        />
      </FormField>
      </div>

      {/* Row 2: VAT, VAT %, VAT Amount, VAT Local Amount, Remarks, Debit Note No */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6 *:min-w-0">
      {visible?.m_ProductId && (
        <div className="min-w-0">
          <label className="mb-1 block text-sm font-medium">Product</label>
          <Controller
            name="productId"
            control={form.control}
            render={({ field }) => (
              <ProductCombobox
                value={
                  (field.value as number) > 0
                    ? ({ productId: field.value, productName: form.watch("productName") ?? "" } as import("@/interfaces/lookup").IProductLookup)
                    : null
                }
                onChange={(v) => {
                  field.onChange(v?.productId ?? 0);
                  form.setValue("productCode", v?.productCode ?? "");
                  form.setValue("productName", v?.productName ?? "");
                }}
                label=""
                placeholder="Select Product..."
              />
            )}
          />
        </div>
      )}
      {visible?.m_GstId && (
        <>
        <div className="min-w-0">
          <Controller
            name="gstId"
            control={form.control}
            render={({ field }) => (
            <GstCombobox
              className="w-full min-w-0"
              style={{ minWidth: 0 }}
              value={
                  (field.value as number) > 0
                    ? ({ gstId: field.value, gstName: form.watch("gstName") ?? "" } as import("@/interfaces/lookup").IGstLookup)
                    : null
                }
                onChange={(v) => {
                  field.onChange(v?.gstId ?? 0);
                  form.setValue("gstName", v?.gstName ?? "");
                  form.setValue("gstPercentage", v?.gstPercentage ?? 0);
                }}
                label="VAT"
                isRequired={!!required?.m_GstId}
                placeholder="Select VAT..."
              />
            )}
          />
        </div>
        <FormNumericInput
          control={form.control}
          name="gstPercentage"
          label="VAT Percentage"
          format={2}
        />
        <FormNumericInput
          control={form.control}
          name="gstAmt"
          label="VAT Amount"
          format={amtDec}
        />
        <FormNumericInput
          control={form.control}
          name="gstLocalAmt"
          label="VAT Local Amount"
          format={locAmtDec}
          disabled
        />
        </>
      )}
      {(visible?.m_Remarks !== false || visible?.m_DebitNoteNo !== false) && (
        <>
        {visible?.m_Remarks !== false && (
          <FormTextArea
            control={form.control}
            name="remarks"
            label="Remarks"
            isRequired={!!required?.m_Remarks}
          />
        )}
        {visible?.m_DebitNoteNo !== false && (
          <FormInput
            control={form.control}
            name="debitNoteNo"
            label="Debit Note No"
          />
        )}
        </>
      )}
      </div>

      <div className="flex items-end gap-2 pt-1">
        <Button
          type="submit"
          themeColor={editingDetail ? "primary" : "success"}
        >
          {editingDetail ? "Update" : "Add"}
        </Button>
        {onCancelEdit && (
          <Button type="button" fillMode="outline" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
});

export default InvoiceDetailsForm;
