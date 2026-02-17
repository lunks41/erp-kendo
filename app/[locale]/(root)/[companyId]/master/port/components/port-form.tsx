"use client";

import { PortRegionCombobox } from "@/components/combobox";
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
  const isEdit = !!initialData?.portId;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PortSchemaType>({
    resolver: zodResolver(portSchema),
    defaultValues: {
      portId: initialData?.portId,
      portCode: initialData?.portCode ?? "",
      portName: initialData?.portName ?? "",
      portShortName: initialData?.portShortName ?? "",
      portRegionId: initialData?.portRegionId ?? 0,
      remarks: initialData?.remarks ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const portRegionId = watch("portRegionId");
  const { data: portRegionData = [] } = usePortregionLookup();

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
    portRegionId > 0
      ? portRegionData.find((r) => r.portRegionId === portRegionId) ??
        (initialData && initialData.portRegionId === portRegionId
          ? {
              portRegionId: initialData.portRegionId,
              portRegionCode: initialData.portRegionCode ?? "",
              portRegionName: initialData.portRegionName ?? "",
            }
          : { portRegionId, portRegionCode: "", portRegionName: "" })
      : null;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="Port Region"
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
            placeholder="Select PortRegion..."
          />
        </FormField>

        <FormField
          label="Port Code"
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
          label="Port Name"
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
          label="Port Short Name"
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
          label="Remarks"
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

        <FormField label="Active Status" className="sm:col-span-2">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={(e) => field.onChange(e.value ?? false)}
                disabled={isLoading}
                onLabel="ON"
                offLabel="OFF"
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
          Cancel
        </Button>
        <Button type="submit" themeColor="primary" disabled={isLoading}>
          {isLoading ? "Saving..." : isEdit ? "Update Port" : "Create Port"}
        </Button>
      </div>
    </form>
  );
}
