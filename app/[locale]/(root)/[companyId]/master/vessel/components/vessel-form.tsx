"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { VesselTypeCombobox } from "@/components/ui/combobox/vessel-type-combobox";
import { FormInput, FormSwitch, FormTextArea } from "@/components/ui/form";
import { useVesselTypeLookup } from "@/hooks/use-lookup";
import type { IVesselTypeLookup } from "@/interfaces/lookup";
import type { IVessel } from "@/interfaces/vessel";
import { vesselSchema, type VesselSchemaType } from "@/schemas/vessel";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { useForm } from "react-hook-form";

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
  const isEdit = !!initialData?.vesselId;

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
      nrt: initialData?.nrt ?? "",
      loa: initialData?.loa ?? "",
      dwt: initialData?.dwt ?? "",
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
      vesselId: initialData.vesselId ?? 0,
      vesselCode: initialData.vesselCode ?? "",
      vesselName: initialData.vesselName ?? "",
      callSign: initialData.callSign ?? "",
      imoCode: initialData.imoCode ?? "",
      grt: initialData.grt ?? "",
      licenseNo: initialData.licenseNo ?? "",
      flag: initialData.flag ?? "",
      nrt: initialData.nrt ?? "",
      loa: initialData.loa ?? "",
      dwt: initialData.dwt ?? "",
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
    const payload: Partial<IVessel> = {
      ...data,
      companyId: Number(companyId),
      nrt: data.nrt ?? undefined,
      loa: data.loa ?? undefined,
      dwt: data.dwt ?? undefined,
    };
    onSubmitAction(payload);
  };

  const vesselTypeValue: IVesselTypeLookup | null =
    vesselTypeIdNum > 0
      ? (vesselTypeData.find((r) => r.vesselTypeId === vesselTypeIdNum) ??
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
          isDisable={isLoading}
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
