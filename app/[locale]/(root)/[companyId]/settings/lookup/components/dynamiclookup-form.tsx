"use client";

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Button } from "@progress/kendo-react-buttons";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IApiSuccessResponse } from "@/interfaces/auth";
import type { DynamicLookupSchemaType } from "@/schemas/setting";
import { dynamicLookupFormSchema } from "@/schemas/setting";
import { useDynamicLookupGet, useDynamicLookupSave } from "@/hooks/use-settings";
import { SaveConfirmation } from "@/components/ui/confirmation";
import { FormNumericInput, FormSwitch } from "@/components/ui/form";
import { toast } from "@/components/layout/notification-container";

type DynamicLookupResponse = IApiSuccessResponse<DynamicLookupSchemaType>;

export function DynamicLookupForm() {
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const {
    data: dynamicLookupResponse,
    isLoading,
    isError,
    refetch,
  } = useDynamicLookupGet();
  const { mutate: saveDynamicLookup, isPending } = useDynamicLookupSave();

  const form = useForm<DynamicLookupSchemaType>({
    resolver: zodResolver(dynamicLookupFormSchema),
    defaultValues: {
      isBarge: false,
      isVessel: false,
      isVoyage: false,
      isCustomer: false,
      isSupplier: false,
      isProduct: false,
      isJobOrder: false,
      bargeCount: 0,
      vesselCount: 0,
      voyageCount: 0,
      customerCount: 0,
      supplierCount: 0,
      productCount: 0,
      jobOrderCount: 0,
    },
  });

  useEffect(() => {
    if (dynamicLookupResponse) {
      const res = dynamicLookupResponse as DynamicLookupResponse;
      if (res.result === -2) {
        toast.error("This record is locked and cannot be modified");
        return;
      }
      if (res.result === -1) {
        toast.error(res.message || "Failed to load dynamic lookup settings");
        return;
      }
      if (res.result === 1 && res.data) {
        const d = res.data;
        form.reset({
          isBarge: d.isBarge ?? false,
          isVessel: d.isVessel ?? false,
          isVoyage: d.isVoyage ?? false,
          isCustomer: d.isCustomer ?? false,
          isSupplier: d.isSupplier ?? false,
          isProduct: d.isProduct ?? false,
          isJobOrder: d.isJobOrder ?? false,
          bargeCount: d.bargeCount ?? 0,
          vesselCount: d.vesselCount ?? 0,
          voyageCount: d.voyageCount ?? 0,
          customerCount: d.customerCount ?? 0,
          supplierCount: d.supplierCount ?? 0,
          productCount: d.productCount ?? 0,
          jobOrderCount: d.jobOrderCount ?? 0,
        });
      } else if (res.result === 1 && !res.data) {
        toast.warning("No dynamic lookup settings data available");
      }
    }
  }, [dynamicLookupResponse, form, toast]);

  const onSubmit = () => setShowSaveConfirmation(true);

  const handleConfirmSave = () => {
    const formData = form.getValues();
    const data: DynamicLookupSchemaType = {
      isBarge: formData.isBarge ?? false,
      isVessel: formData.isVessel ?? false,
      isVoyage: formData.isVoyage ?? false,
      isCustomer: formData.isCustomer ?? false,
      isSupplier: formData.isSupplier ?? false,
      isProduct: formData.isProduct ?? false,
      isJobOrder: formData.isJobOrder ?? false,
      bargeCount: formData.bargeCount ?? 0,
      vesselCount: formData.vesselCount ?? 0,
      voyageCount: formData.voyageCount ?? 0,
      customerCount: formData.customerCount ?? 0,
      supplierCount: formData.supplierCount ?? 0,
      productCount: formData.productCount ?? 0,
      jobOrderCount: formData.jobOrderCount ?? 0,
    };
    saveDynamicLookup(
      { data },
      {
        onSuccess: (response) => {
          const r = response as DynamicLookupResponse;
          if (r.result === -2) {
            toast.error("This record is locked");
            return;
          }
          if (r.result === -1) {
            toast.error(
              r.message || "Failed to save dynamic lookup settings"
            );
            return;
          }
          if (r.result === 1) {
            toast.success(
              r.message || "Dynamic lookup settings saved successfully"
            );
            refetch();
          }
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to save dynamic lookup settings"
          );
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 14 }).map((_, i) => (
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
        <p className="text-rose-500">Failed to load dynamic lookup settings</p>
        <Button fillMode="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Dynamic Lookup Settings</h3>
              <p className="text-muted-foreground text-sm">
                Configure lookup visibility and row counts for dropdowns
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FormSwitch
              control={form.control}
              name="isBarge"
              label="Barge"
            />
            <FormSwitch
              control={form.control}
              name="isVessel"
              label="Vessel"
            />
            <FormSwitch
              control={form.control}
              name="isVoyage"
              label="Voyage"
            />
            <FormSwitch
              control={form.control}
              name="isCustomer"
              label="Customer"
            />
            <FormSwitch
              control={form.control}
              name="isSupplier"
              label="Supplier"
            />
            <FormSwitch
              control={form.control}
              name="isProduct"
              label="Product"
            />
            <FormSwitch
              control={form.control}
              name="isJobOrder"
              label="Job Order"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FormNumericInput
              control={form.control}
              name="bargeCount"
              label="Barge Count"
              format={0}
            />
            <FormNumericInput
              control={form.control}
              name="vesselCount"
              label="Vessel Count"
              format={0}
            />
            <FormNumericInput
              control={form.control}
              name="voyageCount"
              label="Voyage Count"
              format={0}
            />
            <FormNumericInput
              control={form.control}
              name="customerCount"
              label="Customer Count"
              format={0}
            />
            <FormNumericInput
              control={form.control}
              name="supplierCount"
              label="Supplier Count"
              format={0}
            />
            <FormNumericInput
              control={form.control}
              name="productCount"
              label="Product Count"
              format={0}
            />
            <FormNumericInput
              control={form.control}
              name="jobOrderCount"
              label="Job Order Count"
              format={0}
            />
          </div>
        </form>
      </FormProvider>

      <SaveConfirmation
        title="Save Dynamic Lookup Settings"
        itemName="dynamic lookup settings"
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={isPending}
        operationType="update"
      />
    </div>
  );
}
