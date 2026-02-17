"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { Input, Switch } from "@progress/kendo-react-inputs";
import { PortRegionDropdownList } from "@/components/dropdownlist";
import type { IPort } from "@/interfaces/port";
import type { IPortRegionLookup } from "@/interfaces/lookup";
import { portSchema, type PortSchemaType } from "@/schemas/port";

export interface PortFormProps {
  initialData?: IPort | null;
  companyId: string;
  onSubmit: (data: Partial<IPort>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PortForm({
  initialData,
  companyId,
  onSubmit,
  onCancel,
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

  const handlePortRegionChange = (value: IPortRegionLookup | null) => {
    setValue("portRegionId", value?.portRegionId ?? 0, {
      shouldValidate: true,
    });
  };

  const onFormSubmit = (data: PortSchemaType) => {
    onSubmit({
      ...data,
      companyId: Number(companyId),
    });
  };

  const portRegionValue: IPortRegionLookup | null =
    portRegionId > 0
      ? initialData && initialData.portRegionId === portRegionId
        ? {
            portRegionId: initialData.portRegionId,
            portRegionCode: initialData.portRegionCode ?? "",
            portRegionName: initialData.portRegionName ?? "",
          }
        : { portRegionId, portRegionCode: "", portRegionName: "" }
      : null;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Port Region <span className="text-rose-500">*</span>
          </label>
          <PortRegionDropdownList
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
          {errors.portRegionId && (
            <p className="mt-1 text-sm text-rose-500">{errors.portRegionId.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Port Code <span className="text-rose-500">*</span>
          </label>
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
          {errors.portCode && (
            <p className="mt-1 text-sm text-rose-500">{errors.portCode.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Port Name <span className="text-rose-500">*</span>
          </label>
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
          {errors.portName && (
            <p className="mt-1 text-sm text-rose-500">{errors.portName.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Port Short Name
          </label>
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
          {errors.portShortName && (
            <p className="mt-1 text-sm text-rose-500">{errors.portShortName.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Remarks
          </label>
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
          {errors.remarks && (
            <p className="mt-1 text-sm text-rose-500">{errors.remarks.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Active Status
          </label>
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
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
        <Button type="button" fillMode="flat" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" themeColor="primary" disabled={isLoading}>
          {isLoading ? "Saving..." : isEdit ? "Update Port" : "Create Port"}
        </Button>
      </div>
    </form>
  );
}
