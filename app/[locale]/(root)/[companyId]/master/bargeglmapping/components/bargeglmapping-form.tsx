"use client";

import { useEffect } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { FormCheckbox } from "@/components/ui/form";
import { BargeCombobox } from "@/components/ui/combobox/barge-combobox";
import { ChartOfAccountCombobox } from "@/components/ui/combobox/chart-of-account-combobox";
import type { IBargeGLMapping } from "@/interfaces/bargeglmapping";
import {
  bargeGLMappingSchema,
  type BargeGLMappingSchemaType,
} from "@/schemas/bargeglmapping";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { Controller, useForm } from "react-hook-form";
import type {
  IBargeLookup,
  IChartOfAccountLookup,
} from "@/interfaces/lookup";

export interface BargeGLMappingFormProps {
  initialData?: IBargeGLMapping | null;
  companyId: string;
  onSubmitAction: (data: Partial<IBargeGLMapping>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function BargeGLMappingForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: BargeGLMappingFormProps) {
  const t = useNamespaceTranslations("bargeGLMapping");
  const tc = useNamespaceTranslations("common");
  const isEdit = !!(initialData?.bargeId && initialData?.glId);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BargeGLMappingSchemaType>({
    resolver: zodResolver(bargeGLMappingSchema),
    defaultValues: {
      bargeId: initialData?.bargeId ?? 0,
      glId: initialData?.glId ?? 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      bargeId: initialData.bargeId,
      glId: initialData.glId,
      isActive: initialData.isActive ?? true,
    });
  }, [initialData, reset]);

  const onFormSubmit = (data: BargeGLMappingSchemaType) =>
    onSubmitAction({ ...data, companyId: Number(companyId) });

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          name="bargeId"
          control={control}
          render={({ field }) => (
            <BargeCombobox
              label={tc("barge")}
              value={
                field.value
                  ? ({
                      bargeId: field.value,
                      bargeName: initialData?.bargeName ?? "",
                    } as IBargeLookup)
                  : null
              }
              onChange={(v) => {
                field.onChange(v?.bargeId ?? 0);
                if (v) setValue("bargeId", v.bargeId);
              }}
              isRequired
              isDisable={isEdit || isViewMode}
              error={errors.bargeId?.message}
            />
          )}
        />
        <Controller
          name="glId"
          control={control}
          render={({ field }) => (
            <ChartOfAccountCombobox
              companyId={Number(companyId)}
              label={tc("chartOfAccount")}
              value={
                field.value
                  ? ({
                      glId: field.value,
                      glCode: initialData?.glCode ?? "",
                      glName: initialData?.glName ?? "",
                    } as IChartOfAccountLookup)
                  : null
              }
              onChange={(v) => {
                field.onChange(v?.glId ?? 0);
                if (v) setValue("glId", v.glId);
              }}
              isRequired
              isDisable={isEdit || isViewMode}
              error={errors.glId?.message}
            />
          )}
        />
        <FormCheckbox
          control={control}
          name="isActive"
          label={tc("activeStatus")}
          disabled={isViewMode || isLoading}
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
          {isLoading ? tc("saving") : isEdit ? tc("update") : tc("create")}
        </Button>
      </div>
    </form>
  );
}
