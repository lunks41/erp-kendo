"use client";

import { useEffect } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { FormNumericInput } from "@/components/ui/form";
import { GstCombobox } from "@/components/ui/combobox/gst-combobox";
import type { IGstDt } from "@/interfaces/gst";
import { gstDtSchema, type GstDtSchemaType } from "@/schemas/gst";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Controller, useForm } from "react-hook-form";
import type { IGstLookup } from "@/interfaces/lookup";

export interface GstDtFormProps {
  initialData?: IGstDt | null;
  companyId: string;
  onSubmitAction: (data: Partial<IGstDt>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function GstDtForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: GstDtFormProps) {
  const t = useNamespaceTranslations("gstDt");
  const tc = useNamespaceTranslations("common");
  const isEdit = !!(initialData?.gstId && initialData?.validFrom);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GstDtSchemaType>({
    resolver: zodResolver(gstDtSchema),
    defaultValues: {
      gstId: initialData?.gstId ?? 0,
      gstPercentage: initialData?.gstPercentage ?? 0,
      validFrom: initialData?.validFrom
        ? new Date(initialData.validFrom)
        : new Date(),
    },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      gstId: initialData.gstId,
      gstPercentage: initialData.gstPercentage ?? 0,
      validFrom: initialData.validFrom
        ? new Date(initialData.validFrom)
        : new Date(),
    });
  }, [initialData, reset]);

  const onFormSubmit = (data: GstDtSchemaType) => {
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
          name="gstId"
          control={control}
          render={({ field }) => (
            <GstCombobox
              label={t("gst")}
              value={
                field.value
                  ? ({
                      gstId: field.value,
                      gstCode: initialData?.gstCode ?? "",
                      gstName: initialData?.gstName ?? "",
                    } as IGstLookup)
                  : null
              }
              onChange={(v) => {
                field.onChange(v?.gstId ?? 0);
                if (v) {
                  setValue("gstId", v.gstId);
                }
              }}
              isRequired
              isDisable={isEdit || isViewMode}
              error={errors.gstId?.message}
            />
          )}
        />
        <FormNumericInput
          control={control}
          name="gstPercentage"
          label={t("gstPercentage")}
          isRequired
          format={2}
          disabled={isViewMode}
          error={errors.gstPercentage?.message}
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
