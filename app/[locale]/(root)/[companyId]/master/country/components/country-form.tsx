"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { FormInput, FormSwitch, FormTextArea } from "@/components/ui/form";
import type { ICountry } from "@/interfaces/country";
import { countrySchema, type CountrySchemaType } from "@/schemas/country";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { useForm } from "react-hook-form";

export interface CountryFormProps {
  initialData?: ICountry | null;
  companyId: string;
  onSubmitAction: (data: Partial<ICountry>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function CountryForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: CountryFormProps) {
  const t = useTranslations("countryForm");
  const tc = useTranslations("common");
  const isEdit = !!initialData?.countryId;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CountrySchemaType>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      countryId: initialData?.countryId ?? 0,
      countryCode: initialData?.countryCode ?? "",
      countryName: initialData?.countryName ?? "",
      phoneCode: initialData?.phoneCode ?? "",
      remarks: initialData?.remarks ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      countryId: initialData.countryId ?? 0,
      countryCode: initialData.countryCode ?? "",
      countryName: initialData.countryName ?? "",
      phoneCode: initialData.phoneCode ?? "",
      remarks: initialData.remarks ?? "",
      isActive: initialData.isActive ?? true,
    });
  }, [initialData, reset]);

  const onFormSubmit = (data: CountrySchemaType) => {
    onSubmitAction({
      ...data,
      companyId: Number(companyId),
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormInput
          control={control}
          name="countryCode"
          label={t("countryCode")}
          isRequired
          isDisable={isEdit}
          error={errors.countryCode?.message}
          valid={!errors.countryCode}
        />
        <FormInput
          control={control}
          name="countryName"
          label={t("countryName")}
          isRequired
          isDisable={isViewMode}
          error={errors.countryName?.message}
          valid={!errors.countryName}
        />
        <FormInput
          control={control}
          name="phoneCode"
          label={t("phoneCode")}
          isDisable={isViewMode}
          error={errors.phoneCode?.message}
          valid={!errors.phoneCode}
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
          {isLoading ? t("saving") : isEdit ? t("updateCountry") : t("createCountry")}
        </Button>
      </div>
    </form>
  );
}
