"use client";

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Button } from "@progress/kendo-react-buttons";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IApiSuccessResponse } from "@/interfaces/auth";
import type { IDecFormat } from "@/interfaces/setting";
import type { DecimalSchemaType } from "@/schemas/setting";
import { decimalFormSchema } from "@/schemas/setting";
import { useDecimalGet, useDecimalSave } from "@/hooks/use-settings";
import { SaveConfirmation } from "@/components/ui/confirmation";
import { FormField, FormNumericInput } from "@/components/ui/form";
import { toast } from "@/components/layout/notification-container";

const DATE_FORMAT_OPTIONS = [
  { value: "dd/MM/yyyy", label: "dd/MM/yyyy" },
  { value: "MM/dd/yyyy", label: "MM/dd/yyyy" },
  { value: "yyyy/MM/dd", label: "yyyy/MM/dd" },
  { value: "dd-MM-yyyy", label: "dd-MM-yyyy" },
  { value: "dd/MM/yyyy HH:mm:ss", label: "dd/MM/yyyy HH:mm:ss" },
  { value: "MM/dd/yyyy HH:mm:ss", label: "MM/dd/yyyy HH:mm:ss" },
  { value: "yyyy-MM-dd", label: "yyyy-MM-dd" },
  { value: "dd MMM yyyy", label: "dd MMM yyyy" },
];

type DecimalResponse = IApiSuccessResponse<IDecFormat>;

export function DecimalForm() {
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const {
    data: decimalResponse,
    isLoading,
    isError,
    refetch,
  } = useDecimalGet();
  const { mutate: saveDecimal, isPending } = useDecimalSave();

  const form = useForm<DecimalSchemaType>({
    resolver: zodResolver(decimalFormSchema),
    defaultValues: {
      amtDec: 2,
      locAmtDec: 2,
      ctyAmtDec: 2,
      priceDec: 2,
      qtyDec: 2,
      exhRateDec: 0,
      dateFormat: "dd/MM/yyyy",
      longDateFormat: "dd/MM/yyyy HH:mm:ss",
    },
  });

  useEffect(() => {
    if (decimalResponse) {
      const res = decimalResponse as DecimalResponse;
      if (res.result === -2) {
        toast.error("This record is locked and cannot be modified");
        return;
      }
      if (res.result === -1) {
        toast.error(res.message || "Failed to load decimal settings");
        return;
      }
      if (res.result === 1 && res.data) {
        const d = res.data;
        form.reset({
          amtDec: d.amtDec ?? 2,
          locAmtDec: d.locAmtDec ?? 2,
          ctyAmtDec: d.ctyAmtDec ?? 2,
          priceDec: d.priceDec ?? 2,
          qtyDec: d.qtyDec ?? 2,
          exhRateDec: d.exhRateDec ?? 0,
          dateFormat: d.dateFormat ?? "dd/MM/yyyy",
          longDateFormat: d.longDateFormat ?? "dd/MM/yyyy HH:mm:ss",
        });
      } else if (res.result === 1 && !res.data) {
        toast.warning("No decimal settings data available");
      }
    }
  }, [decimalResponse, form, toast]);

  const onSubmit = () => setShowSaveConfirmation(true);

  const handleConfirmSave = () => {
    const formData = form.getValues();
    const data: IDecFormat = {
      amtDec: formData.amtDec ?? 2,
      locAmtDec: formData.locAmtDec ?? 2,
      ctyAmtDec: formData.ctyAmtDec ?? 2,
      priceDec: formData.priceDec ?? 2,
      qtyDec: formData.qtyDec ?? 2,
      exhRateDec: formData.exhRateDec ?? 0,
      dateFormat: formData.dateFormat ?? "dd/MM/yyyy",
      longDateFormat: formData.longDateFormat ?? "dd/MM/yyyy HH:mm:ss",
    };
    saveDecimal(data, {
      onSuccess: (response) => {
        const r = response as DecimalResponse;
        if (r.result === -2) {
          toast.error("This record is locked");
          return;
        }
        if (r.result === -1) {
          toast.error(r.message || "Failed to save decimal settings");
          return;
        }
        if (r.result === 1) {
          toast.success(r.message || "Decimal settings saved successfully");
          refetch();
        }
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to save decimal settings"
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
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
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border p-8">
        <p className="text-rose-500">Failed to load decimal settings</p>
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
              <h3 className="text-xl font-semibold">Decimal Settings</h3>
              <p className="text-muted-foreground text-sm">
                Configure decimal places and date formats
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
            <FormNumericInput
              control={form.control}
              name="amtDec"
              label="Amount Decimals"
              format={2}
            />
            <FormNumericInput
              control={form.control}
              name="locAmtDec"
              label="Local Amount Decimals"
              format={2}
            />
            <FormNumericInput
              control={form.control}
              name="ctyAmtDec"
              label="Currency Amount Decimals"
              format={2}
            />
            <FormNumericInput
              control={form.control}
              name="priceDec"
              label="Price Decimals"
              format={2}
            />
            <FormNumericInput
              control={form.control}
              name="qtyDec"
              label="Quantity Decimals"
              format={2}
            />
            <FormNumericInput
              control={form.control}
              name="exhRateDec"
              label="Exchange Rate Decimals"
              format={0}
            />
            <Controller
              name="dateFormat"
              control={form.control}
              render={({ field }) => (
                <FormField label="Date Format" isRequired>
                  <DropDownList
                    data={DATE_FORMAT_OPTIONS}
                    value={
                      DATE_FORMAT_OPTIONS.find((o) => o.value === field.value) ??
                      null
                    }
                    onChange={(e) =>
                      field.onChange(e.value?.value ?? "dd/MM/yyyy")
                    }
                    textField="label"
                    dataItemKey="value"
                    fillMode="outline"
                    rounded="medium"
                  />
                </FormField>
              )}
            />
            <Controller
              name="longDateFormat"
              control={form.control}
              render={({ field }) => (
                <FormField label="Long Date Format" isRequired>
                  <DropDownList
                    data={DATE_FORMAT_OPTIONS}
                    value={
                      DATE_FORMAT_OPTIONS.find((o) => o.value === field.value) ??
                      null
                    }
                    onChange={(e) =>
                      field.onChange(e.value?.value ?? "dd/MM/yyyy HH:mm:ss")
                    }
                    textField="label"
                    dataItemKey="value"
                    fillMode="outline"
                    rounded="medium"
                  />
                </FormField>
              )}
            />
          </div>
        </form>
      </FormProvider>

      <SaveConfirmation
        title="Save Decimal Settings"
        itemName="decimal settings"
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={isPending}
        operationType="update"
      />
    </div>
  );
}
