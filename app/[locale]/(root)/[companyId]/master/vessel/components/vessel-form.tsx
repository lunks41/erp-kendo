"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { VesselTypeCombobox } from "@/components/ui/combobox/vessel-type-combobox";
import { FormInput, FormSwitch, FormTextArea } from "@/components/ui/form";
import { useVesselTypeLookup } from "@/hooks/use-lookup";
import type { IVesselTypeLookup } from "@/interfaces/lookup";
import type { IVessel } from "@/interfaces/vessel";
import { formatDateTime } from "@/lib/date-utils";
import { vesselSchema, type VesselSchemaType } from "@/schemas/vessel";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";

export interface VesselFormProps {
  initialData?: IVessel | null;
  companyId: string;
  onSubmitAction: (data: Partial<IVessel>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function VesselForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: VesselFormProps) {
  const t = useTranslations("vesselForm");
  const tc = useTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const isEdit = !!initialData?.vesselId;
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VesselSchemaType>({
    resolver: zodResolver(vesselSchema),
    defaultValues: {
      vesselId: initialData?.vesselId ?? 0,
      vesselCode: initialData?.vesselCode ?? "",
      vesselName: initialData?.vesselName ?? "",
      callSign: initialData?.callSign ?? "",
      imoCode: initialData?.imoCode ?? "",
      grt: initialData?.grt ?? "",
      licenseNo: initialData?.licenseNo ?? "",
      flag: initialData?.flag ?? "",
      nrt: initialData?.nrt ?? undefined,
      loa: initialData?.loa ?? undefined,
      dwt: initialData?.dwt ?? undefined,
      vesselTypeId: Number(initialData?.vesselTypeId) || 0,
      remarks: initialData?.remarks ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const vesselTypeId = watch("vesselTypeId");
  const vesselTypeIdNum = Number(vesselTypeId) || 0;
  const { data: vesselTypeData = [] } = useVesselTypeLookup();

  useEffect(() => {
    if (!initialData) return;
    reset({
      vesselId: initialData.vesselId,
      vesselCode: initialData.vesselCode ?? "",
      vesselName: initialData.vesselName ?? "",
      callSign: initialData.callSign ?? "",
      imoCode: initialData.imoCode ?? "",
      grt: initialData.grt ?? "",
      licenseNo: initialData.licenseNo ?? "",
      flag: initialData.flag ?? "",
      nrt: initialData.nrt ?? undefined,
      loa: initialData.loa ?? undefined,
      dwt: initialData.dwt ?? undefined,
      vesselTypeId: Number(initialData.vesselTypeId) || 0,
      remarks: initialData.remarks ?? "",
      isActive: initialData.isActive ?? true,
    });
  }, [initialData, reset]);

  const handleVesselTypeChange = (value: IVesselTypeLookup | null) => {
    setValue("vesselTypeId", value?.vesselTypeId ?? 0, {
      shouldValidate: true,
    });
  };

  const onFormSubmit = (data: VesselSchemaType) => {
    onSubmitAction({
      ...data,
      grt: data.grt?.trim() || undefined,
      licenseNo: data.licenseNo?.trim() || undefined,
      flag: data.flag?.trim() || undefined,
      nrt: data.nrt?.trim() || undefined,
      loa: data.loa?.trim() || undefined,
      dwt: data.dwt?.trim() || undefined,
      remarks: data.remarks?.trim() || undefined,
      companyId: Number(companyId),
    });
  };

  const vesselTypeValue: IVesselTypeLookup | null =
    vesselTypeIdNum > 0
      ? (vesselTypeData.find((v) => v.vesselTypeId === vesselTypeIdNum) ??
        (initialData && Number(initialData.vesselTypeId) === vesselTypeIdNum
          ? {
              vesselTypeId: vesselTypeIdNum,
              vesselTypeCode: initialData.vesselTypeCode ?? "",
              vesselTypeName: initialData.vesselTypeName ?? "",
            }
          : {
              vesselTypeId: vesselTypeIdNum,
              vesselTypeCode: "",
              vesselTypeName: "",
            }))
      : null;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormInput
          control={control}
          name="vesselCode"
          label={t("vesselCode")}
          isRequired
          isDisable={isEdit}
          error={errors.vesselCode?.message}
          valid={!errors.vesselCode}
        />
        <FormInput
          control={control}
          name="vesselName"
          label={t("vesselName")}
          isRequired
          isDisable={isViewMode}
          error={errors.vesselName?.message}
          valid={!errors.vesselName}
        />
        <FormInput
          control={control}
          name="callSign"
          label={t("callSign")}
          isRequired
          isDisable={isViewMode}
          error={errors.callSign?.message}
          valid={!errors.callSign}
        />
        <FormInput
          control={control}
          name="imoCode"
          label={t("imoCode")}
          isRequired
          isDisable={isViewMode}
          error={errors.imoCode?.message}
          valid={!errors.imoCode}
        />
        <VesselTypeCombobox
          value={vesselTypeValue}
          onChange={handleVesselTypeChange}
          isDisable={isViewMode || isLoading}
          placeholder={t("selectVesselType")}
          label={t("vesselType")}
          isRequired
          error={errors.vesselTypeId?.message}
        />
        <FormInput
          control={control}
          name="grt"
          label={t("grt")}
          isDisable={isViewMode}
          error={errors.grt?.message}
          valid={!errors.grt}
        />
        <FormInput
          control={control}
          name="licenseNo"
          label={t("licenseNo")}
          isDisable={isViewMode}
          error={errors.licenseNo?.message}
          valid={!errors.licenseNo}
        />
        <FormInput
          control={control}
          name="flag"
          label={t("flag")}
          isDisable={isViewMode}
          error={errors.flag?.message}
          valid={!errors.flag}
        />
        <FormInput
          control={control}
          name="nrt"
          label={t("nrt")}
          isDisable={isViewMode}
          error={errors.nrt?.message}
          valid={!errors.nrt}
        />
        <FormInput
          control={control}
          name="loa"
          label={t("loa")}
          isDisable={isViewMode}
          error={errors.loa?.message}
          valid={!errors.loa}
        />
        <FormInput
          control={control}
          name="dwt"
          label={t("dwt")}
          isDisable={isViewMode}
          error={errors.dwt?.message}
          valid={!errors.dwt}
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
          {isLoading ? t("saving") : isEdit ? t("updateVessel") : t("createVessel")}
        </Button>
      </div>
    </form>
  );
}
