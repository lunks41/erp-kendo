"use client";

import { BankCombobox } from "@/components/ui/combobox/bank-combobox";
import { CreditTermCombobox } from "@/components/ui/combobox/credit-term-combobox";
import { CurrencyCombobox } from "@/components/ui/combobox/currency-combobox";
import { CustomerMultiColumn } from "@/components/ui/multicolumn/customer-multicolumn";
import { JobOrderCombobox } from "@/components/ui/combobox/job-order-combobox";
import { PortCombobox } from "@/components/ui/combobox/port-combobox";
import { ServiceCategoryCombobox } from "@/components/ui/combobox/service-category-combobox";
import { VesselCombobox } from "@/components/ui/combobox/vessel-combobox";
import {
  FormInput,
  FormNumericInput,
  FormTextArea,
  REQUIRED_FIELD_BOX_CLASS,
} from "@/components/ui/form";
import { setExchangeRate, setExchangeRateLocal } from "@/helpers/account";
import {
  recalculateAllDetailsLocalAndCtyAmounts,
  recalculateAndSetHeaderTotals,
} from "@/helpers/ar-invoice-calculations";
import type { IArInvoiceDt } from "@/interfaces/ar-invoice";
import type { ICurrencyLookup } from "@/interfaces/lookup";
import type { IMandatoryFields, IVisibleFields } from "@/interfaces/setting";
import { parseDate } from "@/lib/date-utils";
import { formatNumber } from "@/lib/format-utils";
import type {
  ArInvoiceDtSchemaType,
  ArInvoiceHdSchemaType,
} from "@/schemas/ar-invoice";
import { useAuthStore } from "@/stores/auth-store";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

interface InvoiceFormProps {
  form: UseFormReturn<ArInvoiceHdSchemaType>;
  onSuccessAction: () => Promise<void>;
  isEdit: boolean;
  visible: IVisibleFields;
  required: IMandatoryFields;
  companyId: number;
  defaultCurrencyId?: number;
}

export default function InvoiceForm({
  form,
  onSuccessAction,
  isEdit,
  visible,
  required,
  companyId,
  defaultCurrencyId = 0,
}: InvoiceFormProps) {
  const { decimals } = useAuthStore();
  const amtDec = decimals[0]?.amtDec ?? 2;
  const locAmtDec = decimals[0]?.locAmtDec ?? 2;
  const exhRateDec = decimals[0]?.exhRateDec ?? 6;
  const dateFormat = decimals[0]?.dateFormat ?? "dd/MM/yyyy";

  const customerId = form.watch("customerId") ?? 0;
  const customerName = form.watch("customerName") ?? "";
  const currencyId = form.watch("currencyId") ?? 0;
  const jobOrderId = form.watch("jobOrderId") ?? 0;
  const vesselId = form.watch("vesselId") ?? 0;
  const portId = form.watch("portId") ?? 0;
  const serviceCategoryId = form.watch("serviceCategoryId") ?? 0;

  const customerValue =
    customerId > 0
      ? ({
          customerId,
          customerName: String(customerName ?? ""),
        } as unknown as import("@/interfaces/lookup").ICustomerLookup)
      : null;
  const currencyValue =
    currencyId > 0
      ? ({
          currencyId,
          currencyName: "",
        } as import("@/interfaces/lookup").ICurrencyLookup)
      : null;

  const handleCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      const currencyIdValue = selectedCurrency?.currencyId ?? 0;
      const accountDate = form.getValues("accountDate");

      if (!currencyIdValue || !accountDate) {
        form.setValue("currencyId", currencyIdValue);
        return;
      }

      await setExchangeRate(form, exhRateDec, visible);
      if (visible?.m_CtyCurr) {
        await setExchangeRateLocal(form, exhRateDec);
      }

      const formDetails = form.getValues("data_details") as
        | IArInvoiceDt[]
        | undefined;
      if (!formDetails || formDetails.length === 0) {
        return;
      }

      const exchangeRate = form.getValues("exhRate") || 0;
      const countryExchangeRate = form.getValues("ctyExhRate") || 0;

      const updatedDetails = recalculateAllDetailsLocalAndCtyAmounts(
        formDetails as IArInvoiceDt[],
        exchangeRate,
        countryExchangeRate,
        decimals[0],
        !!visible?.m_CtyCurr,
      );

      form.setValue(
        "data_details",
        updatedDetails as unknown as ArInvoiceDtSchemaType[],
        {
          shouldDirty: true,
          shouldTouch: true,
        },
      );

      recalculateAndSetHeaderTotals(
        form,
        updatedDetails as IArInvoiceDt[],
        decimals[0],
        visible,
      );
    },
    [decimals, exhRateDec, form, visible],
  );

  return (
    <div className="flex flex-col gap-2 lg:flex-row">
      {/* Left: form fields - 6 per row */}
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Row 1: Account Date, Customer, Reference No, Credit Terms, Due Date, Bank */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rose-600 dark:text-rose-400">
              Account Date <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="accountDate"
              control={form.control}
              render={({ field }) => (
                <DatePicker
                  value={
                    typeof field.value === "string"
                      ? (parseDate(field.value) ?? new Date())
                      : (field.value ?? new Date())
                  }
                  onChange={(e) =>
                    field.onChange(e.value ? e.value : field.value)
                  }
                  format={dateFormat}
                  fillMode="outline"
                  rounded="medium"
                  size="medium"
                  className={`w-full ${REQUIRED_FIELD_BOX_CLASS}`}
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rose-600 dark:text-rose-400">
              Customer <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="customerId"
              control={form.control}
              render={({ field }) => (
                <CustomerMultiColumn
                  value={customerValue}
                  onChange={async (v) => {
                    field.onChange(v?.customerId ?? 0);
                    form.setValue("customerName", v?.customerName ?? "");
                    if (v && !isEdit) {
                      const newCurrencyId = v?.currencyId ?? 0;
                      form.setValue("currencyId", newCurrencyId);
                      form.setValue("creditTermId", v?.creditTermId ?? 0);
                      form.setValue("bankId", v?.bankId ?? 0);

                      if (newCurrencyId) {
                        await handleCurrencyChange({
                          currencyId: newCurrencyId,
                        } as ICurrencyLookup);
                      }
                    }
                  }}
                  companyId={companyId}
                  placeholder="Select Customer..."
                  fillMode="outline"
                  rounded="medium"
                  size="medium"
                  className={`w-full ${REQUIRED_FIELD_BOX_CLASS}`}
                />
              )}
            />
          </div>
          <FormInput
            control={form.control}
            name="referenceNo"
            label="Reference No"
            isRequired={!!required?.m_ReferenceNo}
          />
          <Controller
            name="creditTermId"
            control={form.control}
            render={({ field }) => (
              <CreditTermCombobox
                value={
                  (field.value as number) > 0
                    ? ({
                        creditTermId: field.value,
                        creditTermName: "",
                      } as import("@/interfaces/lookup").ICreditTermLookup)
                    : null
                }
                onChange={(v) => field.onChange(v?.creditTermId ?? 0)}
                label="Credit Terms"
                isRequired
                placeholder="Select CreditTerm..."
              />
            )}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Due Date</label>
            <Controller
              name="dueDate"
              control={form.control}
              render={({ field }) => (
                <DatePicker
                  value={
                    typeof field.value === "string"
                      ? (parseDate(field.value) ?? new Date())
                      : (field.value ?? new Date())
                  }
                  onChange={(e) =>
                    field.onChange(e.value ? e.value : field.value)
                  }
                  format={dateFormat}
                  fillMode="outline"
                  rounded="medium"
                  size="medium"
                  className="w-full"
                />
              )}
            />
          </div>
          {visible?.m_BankId && (
            <Controller
              name="bankId"
              control={form.control}
              render={({ field }) => (
                <BankCombobox
                  value={
                    (field.value as number) > 0
                      ? ({
                          bankId: field.value,
                          bankName: "",
                        } as import("@/interfaces/lookup").IBankLookup)
                      : null
                  }
                  onChange={(v) => field.onChange(v?.bankId ?? 0)}
                  label="Bank"
                  placeholder="Select Bank..."
                />
              )}
            />
          )}
          {/* Row 2: Currency, Exchange Rate, Job Order, Vessel, Port, Service Category */}
          <div>
            <Controller
              name="currencyId"
              control={form.control}
              render={({ field }) => (
                <CurrencyCombobox
                  value={currencyValue}
                  onChange={async (v) => {
                    field.onChange(v?.currencyId ?? 0);
                    await handleCurrencyChange(v as ICurrencyLookup | null);
                  }}
                  label="Currency"
                  isRequired
                />
              )}
            />
          </div>
          <FormNumericInput
            control={form.control}
            name="exhRate"
            label="Exchange Rate"
            format={exhRateDec}
          />
          {visible?.m_JobOrderIdHd !== false && (
            <Controller
              name="jobOrderId"
              control={form.control}
              render={({ field }) => (
                <JobOrderCombobox
                  value={
                    (field.value as number) > 0
                      ? ({
                          jobOrderId: field.value,
                          jobOrderNo: form.watch("jobOrderNo") ?? "",
                        } as import("@/interfaces/lookup").IJobOrderLookup)
                      : null
                  }
                  onChange={(v) => {
                    field.onChange(v?.jobOrderId ?? 0);
                    form.setValue("jobOrderNo", v?.jobOrderNo ?? "");
                  }}
                  label="Job Order"
                  placeholder="Select JobOrder..."
                />
              )}
            />
          )}
          {visible?.m_VesselIdHd !== false && (
            <Controller
              name="vesselId"
              control={form.control}
              render={({ field }) => (
                <VesselCombobox
                  value={
                    (field.value as number) > 0
                      ? ({
                          vesselId: field.value,
                          vesselName: form.watch("vesselName") ?? "",
                        } as unknown as import("@/interfaces/lookup").IVesselLookup)
                      : null
                  }
                  onChange={(v) => {
                    field.onChange(v?.vesselId ?? 0);
                    if (v) {
                      form.setValue(
                        "vesselCode" as keyof ArInvoiceHdSchemaType,
                        v.vesselCode ?? "",
                      );
                      form.setValue(
                        "vesselName" as keyof ArInvoiceHdSchemaType,
                        v.vesselName ?? "",
                      );
                    }
                  }}
                  label="Vessel"
                  placeholder="Select Vessel..."
                />
              )}
            />
          )}
          {visible?.m_PortIdHd !== false && (
            <Controller
              name="portId"
              control={form.control}
              render={({ field }) => (
                <PortCombobox
                  value={
                    (field.value as number) > 0
                      ? ({
                          portId: field.value,
                          portName: form.watch("portName") ?? "",
                        } as unknown as import("@/interfaces/lookup").IPortLookup)
                      : null
                  }
                  onChange={(v) => {
                    field.onChange(v?.portId ?? 0);
                    if (v) {
                      form.setValue(
                        "portCode" as keyof ArInvoiceHdSchemaType,
                        v.portCode ?? "",
                      );
                      form.setValue(
                        "portName" as keyof ArInvoiceHdSchemaType,
                        v.portName ?? "",
                      );
                    }
                  }}
                  label="Port"
                  placeholder="Select Port..."
                />
              )}
            />
          )}
          {visible?.m_ServiceCategoryId !== false && (
            <Controller
              name="serviceCategoryId"
              control={form.control}
              render={({ field }) => (
                <ServiceCategoryCombobox
                  value={
                    (field.value as number) > 0
                      ? ({
                          serviceCategoryId: field.value,
                          serviceCategoryName:
                            form.watch("serviceCategoryName") ?? "",
                        } as unknown as import("@/interfaces/lookup").IServiceCategoryLookup)
                      : null
                  }
                  onChange={(v) => {
                    field.onChange(v?.serviceCategoryId ?? 0);
                    if (v) {
                      form.setValue(
                        "serviceCategoryName" as keyof ArInvoiceHdSchemaType,
                        v.serviceCategoryName ?? "",
                      );
                    }
                  }}
                  label="Service Category"
                  placeholder="Select ServiceType..."
                />
              )}
            />
          )}

          {/* Remarks - full width */}
          <div className="col-span-6">
            <FormTextArea
              control={form.control}
              name="remarks"
              label="Remarks"
              isRequired={!!required?.m_Remarks_Hd}
            />
          </div>
        </div>
      </div>

      {/* Right: Summary Box - alongside form rows */}
      <div className="shrink-0 self-start rounded border border-blue-200 bg-blue-50/50 p-4 lg:w-72 dark:border-blue-800 dark:bg-blue-900/20">
        <h4 className="mb-3 font-medium">Summary</h4>
        <div className="grid grid-cols-[minmax(64px,auto)_1fr_1fr] gap-x-6 gap-y-2 text-sm">
          <div className="font-medium text-slate-600 dark:text-slate-400">
            {" "}
          </div>
          <div className="text-right font-medium text-slate-600 dark:text-slate-400">
            Trns
          </div>
          <div className="text-right font-medium text-slate-600 dark:text-slate-400">
            Local
          </div>
          <div>Amt</div>
          <div className="text-right font-medium tabular-nums">
            {formatNumber(form.watch("totAmt") ?? 0, amtDec)}
          </div>
          <div className="text-right font-medium tabular-nums">
            {formatNumber(form.watch("totLocalAmt") ?? 0, locAmtDec)}
          </div>
          <div>GST</div>
          <div className="text-right font-medium tabular-nums">
            {formatNumber(form.watch("gstAmt") ?? 0, amtDec)}
          </div>
          <div className="text-right font-medium tabular-nums">
            {formatNumber(form.watch("gstLocalAmt") ?? 0, locAmtDec)}
          </div>
          <div>Total</div>
          <div className="text-right font-medium tabular-nums">
            {formatNumber(form.watch("totAmtAftGst") ?? 0, amtDec)}
          </div>
          <div className="text-right font-medium tabular-nums">
            {formatNumber(form.watch("totLocalAmtAftGst") ?? 0, locAmtDec)}
          </div>
          <div>Payment</div>
          <div className="text-right font-medium tabular-nums">
            {formatNumber(form.watch("payAmt") ?? 0, amtDec)}
          </div>
          <div className="text-right font-medium tabular-nums">
            {formatNumber(form.watch("payLocalAmt") ?? 0, locAmtDec)}
          </div>
          <div>Balance</div>
          <div className="text-right font-medium tabular-nums">
            {formatNumber(form.watch("balAmt") ?? 0, amtDec)}
          </div>
          <div className="text-right font-medium tabular-nums">
            {formatNumber(form.watch("balLocalAmt") ?? 0, locAmtDec)}
          </div>
        </div>
      </div>
    </div>
  );
}
