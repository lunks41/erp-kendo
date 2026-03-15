"use client";

import { useEffect } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { FormNumericInput } from "@/components/ui/form";
import { CurrencyCombobox } from "@/components/ui/combobox/currency-combobox";
import type { ICurrencyLocalDt } from "@/interfaces/currency";
import {
  currencyLocalDtSchema,
  type CurrencyLocalDtSchemaType,
} from "@/schemas/currency";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Controller, useForm } from "react-hook-form";
import type { ICurrencyLookup } from "@/interfaces/lookup";

export interface CurrencyLocalDtFormProps {
  initialData?: ICurrencyLocalDt | null;
  companyId: string;
  onSubmitAction: (data: Partial<ICurrencyLocalDt>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function CurrencyLocalDtForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: CurrencyLocalDtFormProps) {
  const t = useNamespaceTranslations("currencyLocalDt");
  const tc = useNamespaceTranslations("common");
  const isEdit = !!(initialData?.currencyId && initialData?.validFrom);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CurrencyLocalDtSchemaType>({
    resolver: zodResolver(currencyLocalDtSchema),
    defaultValues: {
      currencyId: initialData?.currencyId ?? 0,
      exhRate: initialData?.exhRate ?? 0,
      validFrom: initialData?.validFrom
        ? new Date(initialData.validFrom)
        : new Date(),
    },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      currencyId: initialData.currencyId,
      exhRate: initialData.exhRate ?? 0,
      validFrom: initialData.validFrom
        ? new Date(initialData.validFrom)
        : new Date(),
    });
  }, [initialData, reset]);

  const onFormSubmit = (data: CurrencyLocalDtSchemaType) => {
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
          name="currencyId"
          control={control}
          render={({ field }) => (
            <CurrencyCombobox
              label={tc("currency")}
              value={
                field.value
                  ? ({
                      currencyId: field.value,
                      currencyCode: initialData?.currencyCode ?? "",
                      currencyName: initialData?.currencyName ?? "",
                    } as ICurrencyLookup)
                  : null
              }
              onChange={(v) => {
                field.onChange(v?.currencyId ?? 0);
                if (v) setValue("currencyId", v.currencyId);
              }}
              isRequired
              isDisable={isEdit || isViewMode}
              error={errors.currencyId?.message}
            />
          )}
        />
        <FormNumericInput
          control={control}
          name="exhRate"
          label={tc("exchangeRate")}
          isRequired
          format={6}
          disabled={isViewMode}
          error={errors.exhRate?.message}
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
