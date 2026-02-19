"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { PortRegionCombobox } from "@/components/combobox/port-region-combobox";
import { FormField } from "@/components/form";
import { usePortregionLookup } from "@/hooks/use-lookup";
import type { IPortRegionLookup } from "@/interfaces/lookup";
import type { IPort } from "@/interfaces/port";
import { portSchema, type PortSchemaType } from "@/schemas/port";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { Input, Switch } from "@progress/kendo-react-inputs";
import { Controller, useForm } from "react-hook-form";

export interface PortFormProps {
  initialData?: IPort | null;
  companyId: string;
  onSubmitAction: (data: Partial<IPort>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
}

export function PortForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
}: PortFormProps) {
  const t = useTranslations("portForm");
  const tc = useTranslations("common");
  const isEdit = !!initialData?.portId;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PortSchemaType>({
    resolver: zodResolver(portSchema),
    defaultValues: {
      portId: initialData?.portId,
      portCode: initialData?.portCode ?? "",
      portName: initialData?.portName ?? "",
      portShortName: initialData?.portShortName ?? "",
      portRegionId: Number(initialData?.portRegionId) || 0,
      remarks: initialData?.remarks ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const portRegionId = watch("portRegionId");
  const portRegionIdNum = Number(portRegionId) || 0;
  const { data: portRegionData = [] } = usePortregionLookup();

  console.log("[PortForm] initialData:", {
    portId: initialData?.portId,
    portRegionId: initialData?.portRegionId,
    portRegionIdType:
      initialData?.portRegionId != null
        ? typeof initialData.portRegionId
        : "n/a",
    portRegionName: initialData?.portRegionName,
    portRegionCode: initialData?.portRegionCode,
  });
  console.log("[PortForm] form state:", {
    portRegionId,
    portRegionIdNum,
    portRegionDataLength: portRegionData.length,
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      portId: initialData.portId,
      portCode: initialData.portCode ?? "",
      portName: initialData.portName ?? "",
      portShortName: initialData.portShortName ?? "",
      portRegionId: Number(initialData.portRegionId) || 0,
      remarks: initialData.remarks ?? "",
      isActive: initialData.isActive ?? true,
    });
  }, [initialData, reset]);

  const handlePortRegionChange = (value: IPortRegionLookup | null) => {
    setValue("portRegionId", value?.portRegionId ?? 0, {
      shouldValidate: true,
    });
  };

  const onFormSubmit = (data: PortSchemaType) => {
    onSubmitAction({
      ...data,
      companyId: Number(companyId),
    });
  };

  const portRegionValue: IPortRegionLookup | null =
    portRegionIdNum > 0
      ? (portRegionData.find((r) => r.portRegionId === portRegionIdNum) ??
        (initialData && Number(initialData.portRegionId) === portRegionIdNum
          ? {
              portRegionId: portRegionIdNum,
              portRegionCode: initialData.portRegionCode ?? "",
              portRegionName: initialData.portRegionName ?? "",
            }
          : {
              portRegionId: portRegionIdNum,
              portRegionCode: "",
              portRegionName: "",
            }))
      : null;

  console.log(
    "[PortForm] portRegionValue passed to combobox:",
    portRegionValue,
  );

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label={t("portRegion")}
          isRequired
          error={errors.portRegionId?.message}
        >
          <PortRegionCombobox
            value={
              portRegionValue ??
              (portRegionId
                ? { portRegionId, portRegionCode: "", portRegionName: "" }
                : null)
            }
            onChange={handlePortRegionChange}
            disabled={isLoading}
            placeholder={t("selectPortRegion")}
          />
        </FormField>

        <FormField
          label={t("portCode")}
          isRequired
          error={errors.portCode?.message}
        >
          <Controller
            name="portCode"
            control={control}
            render={({ field }) => (
              <Input
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                onBlur={field.onBlur}
                disabled={isEdit}
                className="w-full"
                valid={!errors.portCode}
              />
            )}
          />
        </FormField>

        <FormField
          label={t("portName")}
          isRequired
          error={errors.portName?.message}
        >
          <Controller
            name="portName"
            control={control}
            render={({ field }) => (
              <Input
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                onBlur={field.onBlur}
                className="w-full"
                valid={!errors.portName}
              />
            )}
          />
        </FormField>

        <FormField
          label={t("portShortName")}
          error={errors.portShortName?.message}
        >
          <Controller
            name="portShortName"
            control={control}
            render={({ field }) => (
              <Input
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.value ?? "")}
                onBlur={field.onBlur}
                className="w-full"
                valid={!errors.portShortName}
              />
            )}
          />
        </FormField>

        <FormField
          label={t("remarks")}
          error={errors.remarks?.message}
          className="sm:col-span-2"
        >
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <textarea
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                rows={3}
                className="k-input w-full resize-y rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            )}
          />
        </FormField>

        <FormField label={t("activeStatus")} className="sm:col-span-2">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={(e) => field.onChange(e.value ?? false)}
                disabled={isLoading}
                onLabel={t("onLabel")}
                offLabel={t("offLabel")}
              />
            )}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
        <Button
          type="button"
          fillMode="flat"
          onClick={onCancelAction}
          disabled={isLoading}
        >
          {tc("cancel")}
        </Button>
        <Button type="submit" themeColor="primary" disabled={isLoading}>
          {isLoading ? t("saving") : isEdit ? t("updatePort") : t("createPort")}
        </Button>
      </div>
    </form>
  );
}
