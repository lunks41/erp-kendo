"use client";

import { useEffect } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { FormNumericInput } from "@/components/ui/form";
import { TaxCombobox } from "@/components/ui/combobox/tax-combobox";
import type { ITaxDt } from "@/interfaces/tax";
import { taxDtSchema, type TaxDtSchemaType } from "@/schemas/tax";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Controller, useForm } from "react-hook-form";
import type { ITaxLookup } from "@/interfaces/lookup";

export interface TaxDtFormProps {
  initialData?: ITaxDt | null;
  companyId: string;
  onSubmitAction: (data: Partial<ITaxDt>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function TaxDtForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: TaxDtFormProps) {
  const t = useNamespaceTranslations("taxDt");
  const tc = useNamespaceTranslations("common");
  const isEdit = !!(initialData?.taxId && initialData?.validFrom);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaxDtSchemaType>({
    resolver: zodResolver(taxDtSchema),
    defaultValues: {
      taxId: initialData?.taxId ?? 0,
      taxPercentage: initialData?.taxPercentage ?? 0,
      validFrom: initialData?.validFrom
        ? new Date(initialData.validFrom)
        : new Date(),
    },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      taxId: initialData.taxId,
      taxPercentage: initialData.taxPercentage ?? 0,
      validFrom: initialData.validFrom
        ? new Date(initialData.validFrom)
        : new Date(),
    });
  }, [initialData, reset]);

  const onFormSubmit = (data: TaxDtSchemaType) => {
    const validFromValue =
      data.validFrom instanceof Date
        ? data.validFrom.toISOString()
        : String(data.validFrom);
    onSubmitAction({
      ...data,
      companyId: Number(companyId),
      validFrom: validFromValue,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          name="taxId"
          control={control}
          render={({ field }) => (
            <TaxCombobox
              label={t("tax")}
              value={
                field.value
                  ? ({
                      taxId: field.value,
                      taxCode: initialData?.taxCode ?? "",
                      taxName: initialData?.taxName ?? "",
                    } as ITaxLookup)
                  : null
              }
              onChange={(v) => {
                field.onChange(v?.taxId ?? 0);
                if (v) setValue("taxId", v.taxId);
              }}
              isRequired
              isDisable={isEdit || isViewMode}
              error={errors.taxId?.message}
            />
          )}
        />
        <FormNumericInput
          control={control}
          name="taxPercentage"
          label={t("taxPercentage")}
          isRequired
          format={2}
          disabled={isViewMode}
          error={errors.taxPercentage?.message}
        />
        <div className="sm:col-span-2">
          <Controller
            name="validFrom"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("validFrom")} <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={field.value ? new Date(field.value) : new Date()}
                  onChange={(e) => field.onChange(e.value)}
                  onBlur={field.onBlur}
                  disabled={isViewMode}
                  format="dd/MM/yyyy"
                  fillMode="outline"
                  rounded="medium"
                  className="w-full"
                />
                {errors.validFrom && (
                  <span className="text-xs text-red-500">
                    {errors.validFrom.message}
                  </span>
                )}
              </div>
            )}
          />
        </div>
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
