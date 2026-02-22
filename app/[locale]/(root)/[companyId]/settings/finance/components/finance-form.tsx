"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Controller } from "react-hook-form";
import { Button } from "@progress/kendo-react-buttons";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IApiSuccessResponse } from "@/interfaces/auth";
import type { IFinance } from "@/interfaces/setting";
import type { FinanceSettingSchemaType } from "@/schemas/setting";
import { financeSettingSchema } from "@/schemas/setting";
import { useChartOfAccountLookup } from "@/hooks/use-lookup";
import { useFinanceGet, useFinanceSave } from "@/hooks/use-settings";
import { ChartOfAccountCombobox } from "@/components/ui/combobox/chart-of-account-combobox";
import { CurrencyCombobox } from "@/components/ui/combobox/currency-combobox";
import { SaveConfirmation } from "@/components/ui/confirmation";
import { toast } from "@/components/layout/notification-container";
import type { IChartOfAccountLookup } from "@/interfaces/lookup";

type FinanceResponse = IApiSuccessResponse<IFinance>;

export function FinanceForm() {
  const params = useParams();
  const companyId = Number(params?.companyId ?? 0);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const {
    data: financeResponse,
    isLoading,
    isError,
    refetch,
  } = useFinanceGet();
  const { data: chartOfAccounts = [], isLoading: isLoadingChartOfAccounts } =
    useChartOfAccountLookup(companyId);
  const { mutate: saveFinance, isPending } = useFinanceSave();

  const form = useForm<FinanceSettingSchemaType>({
    resolver: zodResolver(financeSettingSchema),
    defaultValues: {
      base_CurrencyId: 0,
      local_CurrencyId: 0,
      exhGain_GlId: 0,
      exhLoss_GlId: 0,
      bankCharge_GlId: 0,
      adjCharge_GlId: 0,
      profitLoss_GlId: 0,
      retEarning_GlId: 0,
      saleGst_GlId: 0,
      purGst_GlId: 0,
      saleDef_GlId: 0,
      purDef_GlId: 0,
    },
  });

  useEffect(() => {
    if (
      financeResponse &&
      !isLoadingChartOfAccounts &&
      chartOfAccounts.length > 0
    ) {
      const res = financeResponse as FinanceResponse;
      if (res.result === -2) {
        toast.error("This record is locked and cannot be modified");
        return;
      }
      if (res.result === -1) {
        toast.error(res.message || "Failed to load finance settings");
        return;
      }
      if (res.result === 1 && res.data) {
        const d = res.data;
        form.reset({
          base_CurrencyId: d.base_CurrencyId ?? 0,
          local_CurrencyId: d.local_CurrencyId ?? 0,
          exhGain_GlId: d.exhGain_GlId ?? 0,
          exhLoss_GlId: d.exhLoss_GlId ?? 0,
          bankCharge_GlId: d.bankCharge_GlId ?? 0,
          adjCharge_GlId: d.adjCharge_GlId ?? 0,
          profitLoss_GlId: d.profitLoss_GlId ?? 0,
          retEarning_GlId: d.retEarning_GlId ?? 0,
          saleGst_GlId: d.saleGst_GlId ?? 0,
          purGst_GlId: d.purGst_GlId ?? 0,
          saleDef_GlId: d.saleDef_GlId ?? 0,
          purDef_GlId: d.purDef_GlId ?? 0,
        });
      } else if (res.result === 1 && !res.data) {
        toast.warning("No finance settings data available");
      }
    }
  }, [financeResponse, form, isLoadingChartOfAccounts, chartOfAccounts, toast]);

  const onSubmit = () => setShowSaveConfirmation(true);

  const handleConfirmSave = () => {
    const formData = form.getValues();
    const data: IFinance = {
      base_CurrencyId: formData.base_CurrencyId ?? 0,
      local_CurrencyId: formData.local_CurrencyId ?? 0,
      exhGain_GlId: formData.exhGain_GlId ?? 0,
      exhLoss_GlId: formData.exhLoss_GlId ?? 0,
      bankCharge_GlId: formData.bankCharge_GlId ?? 0,
      adjCharge_GlId: formData.adjCharge_GlId ?? 0,
      profitLoss_GlId: formData.profitLoss_GlId ?? 0,
      retEarning_GlId: formData.retEarning_GlId ?? 0,
      saleGst_GlId: formData.saleGst_GlId ?? 0,
      purGst_GlId: formData.purGst_GlId ?? 0,
      saleDef_GlId: formData.saleDef_GlId ?? 0,
      purDef_GlId: formData.purDef_GlId ?? 0,
    };
    saveFinance(data, {
      onSuccess: (response) => {
        const r = response as FinanceResponse;
        if (r.result === -2) {
          toast.error("This record is locked");
          return;
        }
        if (r.result === -1) {
          toast.error(r.message || "Failed to save finance settings");
          return;
        }
        if (r.result === 1) {
          toast.success(r.message || "Finance settings saved successfully");
          refetch();
        }
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to save finance settings"
        );
      },
    });
  };

  const toCoA = (id: number | undefined): IChartOfAccountLookup | null =>
    (id ?? 0) > 0
      ? (chartOfAccounts.find((c) => Number(c.glId) === (id ?? 0)) ?? ({
          glId: id ?? 0,
          glCode: "",
          glName: "",
        } as IChartOfAccountLookup))
      : null;
  const toCurrency = (id: number | undefined) =>
    (id ?? 0) > 0
      ? {
          currencyId: id ?? 0,
          currencyCode: "",
          currencyName: "",
          isMultiply: false,
        }
      : null;

  if (isLoading || isLoadingChartOfAccounts) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-rose-500">Failed to load finance settings</p>
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
              <h3 className="text-xl font-semibold">Finance Settings</h3>
              <p className="text-muted-foreground text-sm">
                Configure base and local currencies, and GL account mappings
              </p>
            </div>
            <Button
              type="submit"
              themeColor="primary"
              size="medium"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Controller
              name="base_CurrencyId"
              control={form.control}
              render={({ field }) => (
                <CurrencyCombobox
                  value={toCurrency(field.value)}
                  onChange={(v) => field.onChange(v?.currencyId ?? 0)}
                  label="Base Currency"
                  isRequired
                />
              )}
            />
            <Controller
              name="local_CurrencyId"
              control={form.control}
              render={({ field }) => (
                <CurrencyCombobox
                  value={toCurrency(field.value)}
                  onChange={(v) => field.onChange(v?.currencyId ?? 0)}
                  label="Local Currency"
                  isRequired
                />
              )}
            />
            <Controller
              name="exhGain_GlId"
              control={form.control}
              render={({ field }) => (
                <ChartOfAccountCombobox
                  companyId={companyId}
                  value={toCoA(field.value)}
                  onChange={(v) => field.onChange(v?.glId ?? 0)}
                  label="Exchange Gain GL"
                  isRequired
                />
              )}
            />
            <Controller
              name="exhLoss_GlId"
              control={form.control}
              render={({ field }) => (
                <ChartOfAccountCombobox
                  companyId={companyId}
                  value={toCoA(field.value)}
                  onChange={(v) => field.onChange(v?.glId ?? 0)}
                  label="Exchange Loss GL"
                  isRequired
                />
              )}
            />
            <Controller
              name="bankCharge_GlId"
              control={form.control}
              render={({ field }) => (
                <ChartOfAccountCombobox
                  companyId={companyId}
                  value={toCoA(field.value)}
                  onChange={(v) => field.onChange(v?.glId ?? 0)}
                  label="Bank Charges GL"
                  isRequired
                />
              )}
            />
            <Controller
              name="adjCharge_GlId"
              control={form.control}
              render={({ field }) => (
                <ChartOfAccountCombobox
                  companyId={companyId}
                  value={toCoA(field.value)}
                  onChange={(v) => field.onChange(v?.glId ?? 0)}
                  label="Adjustment Charge GL"
                />
              )}
            />
            <Controller
              name="profitLoss_GlId"
              control={form.control}
              render={({ field }) => (
                <ChartOfAccountCombobox
                  companyId={companyId}
                  value={toCoA(field.value)}
                  onChange={(v) => field.onChange(v?.glId ?? 0)}
                  label="Profit & Loss GL"
                  isRequired
                />
              )}
            />
            <Controller
              name="retEarning_GlId"
              control={form.control}
              render={({ field }) => (
                <ChartOfAccountCombobox
                  companyId={companyId}
                  value={toCoA(field.value)}
                  onChange={(v) => field.onChange(v?.glId ?? 0)}
                  label="Retained Earnings GL"
                  isRequired
                />
              )}
            />
            <Controller
              name="saleGst_GlId"
              control={form.control}
              render={({ field }) => (
                <ChartOfAccountCombobox
                  companyId={companyId}
                  value={toCoA(field.value)}
                  onChange={(v) => field.onChange(v?.glId ?? 0)}
                  label="Sales GST GL"
                  isRequired
                />
              )}
            />
            <Controller
              name="purGst_GlId"
              control={form.control}
              render={({ field }) => (
                <ChartOfAccountCombobox
                  companyId={companyId}
                  value={toCoA(field.value)}
                  onChange={(v) => field.onChange(v?.glId ?? 0)}
                  label="Purchase GST GL"
                  isRequired
                />
              )}
            />
            <Controller
              name="saleDef_GlId"
              control={form.control}
              render={({ field }) => (
                <ChartOfAccountCombobox
                  companyId={companyId}
                  value={toCoA(field.value)}
                  onChange={(v) => field.onChange(v?.glId ?? 0)}
                  label="Sales Deferred GL"
                  isRequired
                />
              )}
            />
            <Controller
              name="purDef_GlId"
              control={form.control}
              render={({ field }) => (
                <ChartOfAccountCombobox
                  companyId={companyId}
                  value={toCoA(field.value)}
                  onChange={(v) => field.onChange(v?.glId ?? 0)}
                  label="Purchase Deferred GL"
                  isRequired
                />
              )}
            />
          </div>
        </form>
      </FormProvider>

      <SaveConfirmation
        title="Save Finance Settings"
        itemName="finance settings"
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={isPending}
        operationType="update"
      />
    </div>
  );
}
