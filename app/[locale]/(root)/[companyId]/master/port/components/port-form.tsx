"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { PortRegionCombobox } from "@/components/combobox/port-region-combobox";
import { FormInput, FormSwitch, FormTextArea } from "@/components/form";
import { usePortregionLookup } from "@/hooks/use-lookup";
import type { IPortRegionLookup } from "@/interfaces/lookup";
import type { IPort } from "@/interfaces/port";
import { portSchema, type PortSchemaType } from "@/schemas/port";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { useForm } from "react-hook-form";

export interface PortFormProps {
  initialData?: IPort | null;
  companyId: string;
  onSubmitAction: (data: Partial<IPort>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function PortForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
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

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <PortRegionCombobox
          value={
            portRegionValue ??
            (portRegionId
              ? { portRegionId, portRegionCode: "", portRegionName: "" }
              : null)
          }
          onChange={handlePortRegionChange}
          isDisable={isLoading}
          placeholder={t("selectPortRegion")}
          label={t("portRegion")}
          isRequired
          error={errors.portRegionId?.message}
        />

        <FormInput
          control={control}
          name="portCode"
          label={t("portCode")}
          isRequired
          isDisable={isEdit}
          error={errors.portCode?.message}
          valid={!errors.portCode}
        />

        <FormInput
          control={control}
          name="portName"
          label={t("portName")}
          isRequired
          isDisable={isViewMode}
          error={errors.portName?.message}
          valid={!errors.portName}
        />

        <FormInput
          control={control}
          name="portShortName"
          label={t("portShortName")}
          isDisable={isViewMode}
          error={errors.portShortName?.message}
          valid={!errors.portShortName}
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
