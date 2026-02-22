"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Controller } from "react-hook-form";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Button } from "@progress/kendo-react-buttons";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IApiSuccessResponse } from "@/interfaces/auth";
import type { DefaultSettingSchemaType } from "@/schemas/setting";
import { defaultSettingSchema } from "@/schemas/setting";
import { useChartOfAccountLookup } from "@/hooks/use-lookup";
import {
  useDefaultSettingGet,
  useDefaultSettingSave,
} from "@/hooks/use-settings";
import { ChartOfAccountCombobox } from "@/components/ui/combobox/chart-of-account-combobox";
import { CurrencyCombobox } from "@/components/ui/combobox/currency-combobox";
import { GstCombobox } from "@/components/ui/combobox/gst-combobox";
import { UomCombobox } from "@/components/ui/combobox/uom-combobox";
import { SaveConfirmation } from "@/components/ui/confirmation";
import { FormField } from "@/components/ui/form";
import { toast } from "@/components/layout/notification-container";
import type { IChartOfAccountLookup } from "@/interfaces/lookup";

const GRID_OPTIONS = [50, 100, 500].map((v) => ({ value: v, label: String(v) }));

type DefaultSettingResponse = IApiSuccessResponse<DefaultSettingSchemaType>;

export function DefaultForm() {
  const params = useParams();
  const companyId = Number(params?.companyId ?? 0);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const {
    data: defaultSettingResponse,
    isLoading,
    isError,
    refetch,
  } = useDefaultSettingGet();
  const { data: chartOfAccounts = [], isLoading: isLoadingChartOfAccounts } =
    useChartOfAccountLookup(companyId);
  const { mutate: saveDefaultSettings, isPending } = useDefaultSettingSave();

  const form = useForm<DefaultSettingSchemaType>({
    resolver: zodResolver(defaultSettingSchema),
    defaultValues: {
      trn_Grd_TotRec: 50,
      m_Grd_TotRec: 50,
      ar_IN_GLId: 0,
      ar_CN_GLId: 0,
      ar_DN_GLId: 0,
      ap_IN_GLId: 0,
      ap_CN_GLId: 0,
      ap_DN_GLId: 0,
      ar_CurrencyId: 0,
      ap_CurrencyId: 0,
      cb_CurrencyId: 0,
      gl_CurrencyId: 0,
      gstId: 0,
      uomId: 0,
    },
  });

  useEffect(() => {
    if (
      defaultSettingResponse &&
      !isLoadingChartOfAccounts &&
      chartOfAccounts.length > 0
    ) {
      const res = defaultSettingResponse as DefaultSettingResponse;
      if (res.result === -2) {
        toast.error("This record is locked and cannot be modified");
        return;
      }
      if (res.result === -1) {
        toast.error(res.message || "Failed to load default settings");
        return;
      }
      if (res.result === 1 && res.data) {
        form.reset({
          trn_Grd_TotRec: res.data.trn_Grd_TotRec ?? 50,
          m_Grd_TotRec: res.data.m_Grd_TotRec ?? 50,
          ar_IN_GLId: res.data.ar_IN_GLId ?? 0,
          ar_CN_GLId: res.data.ar_CN_GLId ?? 0,
          ar_DN_GLId: res.data.ar_DN_GLId ?? 0,
          ap_IN_GLId: res.data.ap_IN_GLId ?? 0,
          ap_CN_GLId: res.data.ap_CN_GLId ?? 0,
          ap_DN_GLId: res.data.ap_DN_GLId ?? 0,
          ar_CurrencyId: res.data.ar_CurrencyId ?? 0,
          ap_CurrencyId: res.data.ap_CurrencyId ?? 0,
          cb_CurrencyId: res.data.cb_CurrencyId ?? 0,
          gl_CurrencyId: res.data.gl_CurrencyId ?? 0,
          gstId: res.data.gstId ?? 0,
          uomId: res.data.uomId ?? 0,
        });
      } else if (res.result === 1 && !res.data) {
        toast.warning("No default settings data available");
      }
    }
  }, [defaultSettingResponse, form, isLoadingChartOfAccounts, chartOfAccounts, toast]);

  const onSubmit = () => setShowSaveConfirmation(true);

  const handleConfirmSave = () => {
    const formData = form.getValues();
    const data = {
      trn_Grd_TotRec: formData.trn_Grd_TotRec ?? 0,
      m_Grd_TotRec: formData.m_Grd_TotRec ?? 0,
      ar_IN_GLId: formData.ar_IN_GLId ?? 0,
      ar_CN_GLId: formData.ar_CN_GLId ?? 0,
      ar_DN_GLId: formData.ar_DN_GLId ?? 0,
      ap_IN_GLId: formData.ap_IN_GLId ?? 0,
      ap_CN_GLId: formData.ap_CN_GLId ?? 0,
      ap_DN_GLId: formData.ap_DN_GLId ?? 0,
      ar_CurrencyId: formData.ar_CurrencyId ?? 0,
      ap_CurrencyId: formData.ap_CurrencyId ?? 0,
      cb_CurrencyId: formData.cb_CurrencyId ?? 0,
      gl_CurrencyId: formData.gl_CurrencyId ?? 0,
      gstId: formData.gstId ?? 0,
      uomId: formData.uomId ?? 0,
    };
    saveDefaultSettings(data, {
      onSuccess: (response) => {
        const r = response as DefaultSettingResponse;
        if (r.result === -2) {
          toast.error("This record is locked");
          return;
        }
        if (r.result === -1) {
          toast.error(r.message || "Failed to save default settings");
          return;
        }
        if (r.result === 1) {
          toast.success(r.message || "Default settings saved successfully");
          refetch();
        }
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to save default settings");
      },
    });
  };

  const toCoA = (id: number | undefined): IChartOfAccountLookup | null =>
    (id ?? 0) > 0
      ? (chartOfAccounts.find((c) => Number(c.glId) === (id ?? 0)) ?? ({ glId: id ?? 0, glCode: "", glName: "" } as IChartOfAccountLookup))
      : null;
  const toCurrency = (id: number | undefined) =>
    (id ?? 0) > 0 ? { currencyId: id ?? 0, currencyCode: "", currencyName: "", isMultiply: false } : null;
  const toGst = (id: number | undefined) =>
    (id ?? 0) > 0 ? { gstId: id ?? 0, gstCode: "", gstName: "", gstPercentage: 0 } : null;
  const toUom = (id: number | undefined) =>
    (id ?? 0) > 0 ? { uomId: id ?? 0, uomCode: "", uomName: "" } : null;

  if (isLoading || isLoadingChartOfAccounts) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-rose-500">Failed to load default settings</p>
        <Button fillMode="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Default Settings</h3>
              <p className="text-muted-foreground text-sm">
                Configure grid records and GL account mappings
              </p>
            </div>
            <Button type="submit" themeColor="primary" size="medium" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Controller
              name="trn_Grd_TotRec"
              control={form.control}
              render={({ field }) => (
                <FormField label="Transaction Grid Records" isRequired>
                  <DropDownList
                    data={GRID_OPTIONS}
                    value={GRID_OPTIONS.find((o) => o.value === field.value) ?? null}
                    onChange={(e) => field.onChange(e.value?.value ?? 50)}
                    textField="label"
                    dataItemKey="value"
                    fillMode="outline"
                    rounded="medium"
                  />
                </FormField>
              )}
            />
            <Controller
              name="m_Grd_TotRec"
              control={form.control}
              render={({ field }) => (
                <FormField label="Master Grid Records" isRequired>
                  <DropDownList
                    data={GRID_OPTIONS}
                    value={GRID_OPTIONS.find((o) => o.value === field.value) ?? null}
                    onChange={(e) => field.onChange(e.value?.value ?? 50)}
                    textField="label"
                    dataItemKey="value"
                    fillMode="outline"
                    rounded="medium"
                  />
                </FormField>
              )}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Accounts Receivable</h4>
            <div className="grid gap-4 md:grid-cols-4">
              <Controller
                name="ar_IN_GLId"
                control={form.control}
                render={({ field }) => (
                  <ChartOfAccountCombobox
                    companyId={companyId}
                    value={toCoA(field.value)}
                    onChange={(v) => field.onChange(v?.glId ?? 0)}
                    label="Invoice GL Account"
                    isRequired
                  />
                )}
              />
              <Controller
                name="ar_CN_GLId"
                control={form.control}
                render={({ field }) => (
                  <ChartOfAccountCombobox
                    companyId={companyId}
                    value={toCoA(field.value)}
                    onChange={(v) => field.onChange(v?.glId ?? 0)}
                    label="Credit Note GL Account"
                    isRequired
                  />
                )}
              />
              <Controller
                name="ar_DN_GLId"
                control={form.control}
                render={({ field }) => (
                  <ChartOfAccountCombobox
                    companyId={companyId}
                    value={toCoA(field.value)}
                    onChange={(v) => field.onChange(v?.glId ?? 0)}
                    label="Debit Note GL Account"
                    isRequired
                  />
                )}
              />
              <Controller
                name="ar_CurrencyId"
                control={form.control}
                render={({ field }) => (
                  <CurrencyCombobox
                    value={toCurrency(field.value)}
                    onChange={(v) => field.onChange(v?.currencyId ?? 0)}
                    label="Default Currency"
                    isRequired
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Accounts Payable</h4>
            <div className="grid gap-4 md:grid-cols-4">
              <Controller
                name="ap_IN_GLId"
                control={form.control}
                render={({ field }) => (
                  <ChartOfAccountCombobox
                    companyId={companyId}
                    value={toCoA(field.value)}
                    onChange={(v) => field.onChange(v?.glId ?? 0)}
                    label="Invoice GL Account"
                    isRequired
                  />
                )}
              />
              <Controller
                name="ap_CN_GLId"
                control={form.control}
                render={({ field }) => (
                  <ChartOfAccountCombobox
                    companyId={companyId}
                    value={toCoA(field.value)}
                    onChange={(v) => field.onChange(v?.glId ?? 0)}
                    label="Credit Note GL Account"
                    isRequired
                  />
                )}
              />
              <Controller
                name="ap_DN_GLId"
                control={form.control}
                render={({ field }) => (
                  <ChartOfAccountCombobox
                    companyId={companyId}
                    value={toCoA(field.value)}
                    onChange={(v) => field.onChange(v?.glId ?? 0)}
                    label="Debit Note GL Account"
                    isRequired
                  />
                )}
              />
              <Controller
                name="ap_CurrencyId"
                control={form.control}
                render={({ field }) => (
                  <CurrencyCombobox
                    value={toCurrency(field.value)}
                    onChange={(v) => field.onChange(v?.currencyId ?? 0)}
                    label="Default Currency"
                    isRequired
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Default GST, UOM & Currencies</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="gstId"
                control={form.control}
                render={({ field }) => (
                  <GstCombobox
                    value={toGst(field.value)}
                    onChange={(v) => field.onChange(v?.gstId ?? 0)}
                    label="Default GST"
                    isRequired
                  />
                )}
              />
              <Controller
                name="uomId"
                control={form.control}
                render={({ field }) => (
                  <UomCombobox
                    value={toUom(field.value)}
                    onChange={(v) => field.onChange(v?.uomId ?? 0)}
                    label="Default Unit of Measurement"
                    isRequired
                  />
                )}
              />
              <Controller
                name="cb_CurrencyId"
                control={form.control}
                render={({ field }) => (
                  <CurrencyCombobox
                    value={toCurrency(field.value)}
                    onChange={(v) => field.onChange(v?.currencyId ?? 0)}
                    label="Cash & Bank Currency"
                    isRequired
                  />
                )}
              />
              <Controller
                name="gl_CurrencyId"
                control={form.control}
                render={({ field }) => (
                  <CurrencyCombobox
                    value={toCurrency(field.value)}
                    onChange={(v) => field.onChange(v?.currencyId ?? 0)}
                    label="General Ledger Currency"
                    isRequired
                  />
                )}
              />
            </div>
          </div>
        </form>
      </FormProvider>

      <SaveConfirmation
        title="Save Default Settings"
        itemName="default settings"
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={isPending}
        operationType="update"
      />
    </div>
  );
}
