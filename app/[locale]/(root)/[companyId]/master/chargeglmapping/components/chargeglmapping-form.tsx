"use client";

import { useEffect } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { FormCheckbox } from "@/components/ui/form";
import { ChargeCombobox } from "@/components/ui/combobox/charge-combobox";
import { ChartOfAccountCombobox } from "@/components/ui/combobox/chart-of-account-combobox";
import type { IChargeGLMapping } from "@/interfaces/chargeglmapping";
import {
  chargeGLMappingSchema,
  type ChargeGLMappingSchemaType,
} from "@/schemas/chargeglmapping";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { Controller, useForm } from "react-hook-form";
import type {
  IChargeLookup,
  IChartOfAccountLookup,
} from "@/interfaces/lookup";

export interface ChargeGLMappingFormProps {
  initialData?: IChargeGLMapping | null;
  companyId: string;
  onSubmitAction: (data: Partial<IChargeGLMapping>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function ChargeGLMappingForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: ChargeGLMappingFormProps) {
  const t = useNamespaceTranslations("chargeGLMapping");
  const tc = useNamespaceTranslations("common");
  const isEdit = !!(initialData?.chargeId && initialData?.glId);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ChargeGLMappingSchemaType>({
    resolver: zodResolver(chargeGLMappingSchema),
    defaultValues: {
      chargeId: initialData?.chargeId ?? 0,
      glId: initialData?.glId ?? 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      chargeId: initialData.chargeId,
      glId: initialData.glId,
      isActive: initialData.isActive ?? true,
    });
  }, [initialData, reset]);

  const onFormSubmit = (data: ChargeGLMappingSchemaType) =>
    onSubmitAction({ ...data, companyId: Number(companyId) });

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          name="chargeId"
          control={control}
          render={({ field }) => (
            <ChargeCombobox
              label={tc("charge")}
              value={
                field.value
                  ? ({
                      chargeId: field.value,
                      chargeName: initialData?.chargeName ?? "",
                    } as IChargeLookup)
                  : null
              }
              onChange={(v) => {
                field.onChange(v?.chargeId ?? 0);
                if (v) setValue("chargeId", v.chargeId);
              }}
              isRequired
              isDisable={isEdit || isViewMode}
              error={errors.chargeId?.message}
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
