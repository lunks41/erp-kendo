"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { CountryCombobox } from "@/components/ui/combobox/country-combobox";
import { FormInput, FormSwitch, FormTextArea } from "@/components/ui/form";
import { useCountryLookup } from "@/hooks/use-lookup";
import type { ICountryLookup } from "@/interfaces/lookup";
import type { IPortRegion } from "@/interfaces/portregion";
import {
  portregionSchema,
  type PortRegionSchemaType,
} from "@/schemas/portregion";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { useForm } from "react-hook-form";

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
  const isEdit = !!initialData?.portRegionId;

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
          isDisable={isLoading}
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
          {isLoading
            ? t("saving")
            : isEdit
              ? t("updatePortRegion")
              : t("createPortRegion")}
        </Button>
      </div>
    </form>
  );
}
