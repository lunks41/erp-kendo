"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CountryCombobox } from "@/components/ui/combobox/country-combobox";
import { FormInput, FormSwitch, FormTextArea } from "@/components/ui/form";
import { useCountryLookup } from "@/hooks/use-lookup";
import type { ICountryLookup } from "@/interfaces/lookup";
import type { IPortRegion } from "@/interfaces/portregion";
import { formatDateTime } from "@/lib/date-utils";
import { portregionSchema, type PortRegionSchemaType } from "@/schemas/portregion";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";

export interface PortRegionFormProps {
  initialData?: IPortRegion | null;
  companyId: string;
  onSubmitAction: (data: Partial<IPortRegion>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function PortRegionForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: PortRegionFormProps) {
  const t = useTranslations("portRegionForm");
  const tc = useTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const isEdit = !!initialData?.portRegionId;
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PortRegionSchemaType>({
    resolver: zodResolver(portregionSchema),
    defaultValues: {
      portRegionId: initialData?.portRegionId,
      portRegionCode: initialData?.portRegionCode ?? "",
      portRegionName: initialData?.portRegionName ?? "",
      countryId: Number(initialData?.countryId) || 0,
      remarks: initialData?.remarks ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const countryId = watch("countryId");
  const countryIdNum = Number(countryId) || 0;
  const { data: countryData = [] } = useCountryLookup();

  useEffect(() => {
    if (!initialData) return;
    reset({
      portRegionId: initialData.portRegionId,
      portRegionCode: initialData.portRegionCode ?? "",
      portRegionName: initialData.portRegionName ?? "",
      countryId: Number(initialData.countryId) || 0,
      remarks: initialData.remarks ?? "",
      isActive: initialData.isActive ?? true,
    });
  }, [initialData, reset]);

  const handleCountryChange = (value: ICountryLookup | null) => {
    setValue("countryId", value?.countryId ?? 0, {
      shouldValidate: true,
    });
  };

  const onFormSubmit = (data: PortRegionSchemaType) => {
    onSubmitAction({
      ...data,
      companyId: Number(companyId),
    });
  };

  const countryValue: ICountryLookup | null =
    countryIdNum > 0
      ? (countryData.find((c) => c.countryId === countryIdNum) ??
        (initialData && Number(initialData.countryId) === countryIdNum
          ? {
              countryId: countryIdNum,
              countryCode: initialData.countryCode ?? "",
              countryName: initialData.countryName ?? "",
            }
          : {
              countryId: countryIdNum,
              countryCode: "",
              countryName: "",
            }))
      : null;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormInput
          control={control}
          name="portRegionCode"
          label={t("portRegionCode")}
          isRequired
          isDisable={isEdit}
          error={errors.portRegionCode?.message}
          valid={!errors.portRegionCode}
        />
        <FormInput
          control={control}
          name="portRegionName"
          label={t("portRegionName")}
          isRequired
          isDisable={isViewMode}
          error={errors.portRegionName?.message}
          valid={!errors.portRegionName}
        />
        <CountryCombobox
          value={countryValue}
          onChange={handleCountryChange}
          isDisable={isViewMode || isLoading}
          placeholder={t("selectCountry")}
          label={t("country")}
          isRequired
          error={errors.countryId?.message}
        />
        <FormTextArea
          control={control}
          name="remarks"
          label={t("remarks")}
          isDisable={isViewMode}
          rows={3}
          className="sm:col-span-2"
          error={errors.remarks?.message}
          valid={!errors.remarks}
        />
        <FormSwitch
          control={control}
          name="isActive"
          label={t("activeStatus")}
          isDisable={isLoading}
          onLabel={t("onLabel")}
          offLabel={t("offLabel")}
          className="sm:col-span-2"
        />
      </div>

      {isEdit && initialData && (
        <div className="rounded-md border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => setAuditTrailOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            <span>{t("viewAuditTrail")}</span>
            <span className="flex items-center gap-1">
              <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {t("created")}
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {t("modified")}
              </span>
              {auditTrailOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </span>
          </button>
          {auditTrailOpen && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-slate-200 px-2.5 py-2 dark:border-slate-700">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {t("createdBy")}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {initialData.createBy || "—"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDateTime(initialData.createDate, datetimeFormat) || "—"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {t("lastModifiedBy")}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
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
          {isLoading ? t("saving") : isEdit ? t("updatePortRegion") : t("createPortRegion")}
        </Button>
      </div>
    </form>
  );
}
