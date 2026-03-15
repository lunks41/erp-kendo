"use client";

import { useEffect, useState } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CountryCombobox } from "@/components/ui/combobox/country-combobox";
import {
  FormInput,
  FormCheckbox,
  FormTextArea,
} from "@/components/ui/form";
import type { IWorkLocation } from "@/interfaces/worklocation";
import { formatDateTime } from "@/lib/date-utils";
import {
  workLocationSchema,
  type WorkLocationSchemaType,
} from "@/schemas/work-location";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";

export interface WorkLocationFormProps {
  initialData?: IWorkLocation | null;
  companyId: string;
  onSubmitAction: (data: Partial<IWorkLocation>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function WorkLocationForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: WorkLocationFormProps) {
  const t = useNamespaceTranslations("workLocation");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const isEdit = !!initialData?.workLocationId;
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<WorkLocationSchemaType>({
    resolver: zodResolver(workLocationSchema),
    defaultValues: {
      workLocationId: initialData?.workLocationId,
      workLocationCode: initialData?.workLocationCode ?? "",
      workLocationName: initialData?.workLocationName ?? "",
      address1: initialData?.address1 ?? "",
      address2: initialData?.address2 ?? "",
      city: initialData?.city ?? "",
      postalCode: initialData?.postalCode ?? "",
      countryId: initialData?.countryId ?? 0,
      isActive: initialData?.isActive ?? true,
    },
  });
  const countryId = watch("countryId");
  useEffect(() => {
    if (!initialData) return;
    reset({
      workLocationId: initialData.workLocationId,
      workLocationCode: initialData.workLocationCode ?? "",
      workLocationName: initialData.workLocationName ?? "",
      address1: initialData.address1 ?? "",
      address2: initialData.address2 ?? "",
      city: initialData.city ?? "",
      postalCode: initialData.postalCode ?? "",
      countryId: initialData.countryId ?? 0,
      isActive: initialData.isActive ?? true,
    });
  }, [initialData, reset]);
  const handleCountryChange = (value: { countryId?: number } | null) => {
    setValue("countryId", value?.countryId ?? 0, { shouldValidate: true });
  };
  const onFormSubmit = (data: WorkLocationSchemaType) =>
    onSubmitAction({ ...data, companyId: Number(companyId) });
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormInput
          control={control}
          name="workLocationCode"
          label={t("workLocationCode")}
          isDisable={isEdit}
          error={errors.workLocationCode?.message}
          valid={!errors.workLocationCode}
        />
        <FormInput
          control={control}
          name="workLocationName"
          label={t("workLocationName")}
          isRequired
          isDisable={isViewMode}
          error={errors.workLocationName?.message}
          valid={!errors.workLocationName}
        />
        <div className="sm:col-span-2">
          <CountryCombobox
            value={countryId ? { countryId } : null}
            onChange={handleCountryChange}
            label={tc("country")}
            isRequired
            isDisable={isViewMode}
            error={errors.countryId?.message}
          />
        </div>
        <FormInput
          control={control}
          name="address1"
          label={tc("address1")}
          isDisable={isViewMode}
          className="sm:col-span-2"
          error={errors.address1?.message}
          valid={!errors.address1}
        />
        <FormInput
          control={control}
          name="address2"
          label={tc("address2")}
          isDisable={isViewMode}
          className="sm:col-span-2"
          error={errors.address2?.message}
          valid={!errors.address2}
        />
        <FormInput
          control={control}
          name="city"
          label={tc("city")}
          isDisable={isViewMode}
          error={errors.city?.message}
          valid={!errors.city}
        />
        <FormInput
          control={control}
          name="postalCode"
          label={tc("pinCode")}
          isDisable={isViewMode}
          error={errors.postalCode?.message}
          valid={!errors.postalCode}
        />
        <FormCheckbox
          control={control}
          name="isActive"
          label={tc("activeStatus")}
          disabled={isLoading}
        />
      </div>
      {isEdit && initialData && (
        <div className="rounded-md border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => setAuditTrailOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            <span>{tc("viewAuditTrail")}</span>
            {auditTrailOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {auditTrailOpen && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-slate-200 px-2.5 py-2 dark:border-slate-700">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {tc("createdBy")}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {initialData.createBy || "—"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDateTime(initialData.createDate, datetimeFormat) || "—"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {tc("lastModifiedBy")}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {initialData.editBy || "—"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDateTime(initialData.editDate, datetimeFormat) || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
        <Button
          type="button"
          fillMode="flat"
          onClick={onCancelAction}
          disabled={isLoading}
        >
          {tc("cancel")}
        </Button>
        <Button type="submit" themeColor="primary" disabled={isLoading}>
          {isLoading ? tc("saving") : isEdit ? tc("update") : tc("create")}
        </Button>
      </div>
    </form>
  );
}
