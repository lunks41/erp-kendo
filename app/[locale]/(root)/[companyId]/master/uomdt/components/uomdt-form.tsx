"use client";

import { useEffect } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { FormNumericInput } from "@/components/ui/form";
import { UomCombobox } from "@/components/ui/combobox/uom-combobox";
import type { IUomDt } from "@/interfaces/uom";
import { uomDtSchema, type UomDtSchemaType } from "@/schemas/uom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { Controller, useForm } from "react-hook-form";
import type { IUomLookup } from "@/interfaces/lookup";

export interface UomDtFormProps {
  initialData?: IUomDt | null;
  companyId: string;
  onSubmitAction: (data: Partial<IUomDt>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function UomDtForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: UomDtFormProps) {
  const t = useNamespaceTranslations("uomDt");
  const tc = useNamespaceTranslations("common");
  const isEdit = !!(initialData?.uomId && initialData?.packUomId);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UomDtSchemaType>({
    resolver: zodResolver(uomDtSchema),
    defaultValues: {
      uomId: initialData?.uomId ?? 0,
      packUomId: initialData?.packUomId ?? 0,
      uomFactor: initialData?.uomFactor ?? 0,
    },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      uomId: initialData.uomId,
      packUomId: initialData.packUomId,
      uomFactor: initialData.uomFactor ?? 0,
    });
  }, [initialData, reset]);

  const onFormSubmit = (data: UomDtSchemaType) =>
    onSubmitAction({ ...data, companyId: Number(companyId) });

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          name="uomId"
          control={control}
          render={({ field }) => (
            <UomCombobox
              label={t("uom")}
              value={
                field.value
                  ? ({
                      uomId: field.value,
                      uomCode: initialData?.uomCode ?? "",
                      uomName: initialData?.uomName ?? "",
                    } as IUomLookup)
                  : null
              }
              onChange={(v) => {
                field.onChange(v?.uomId ?? 0);
                if (v) setValue("uomId", v.uomId);
              }}
              isRequired
              isDisable={isEdit || isViewMode}
              error={errors.uomId?.message}
            />
          )}
        />
        <Controller
          name="packUomId"
          control={control}
          render={({ field }) => (
            <UomCombobox
              label={t("packUom")}
              value={
                field.value
                  ? ({
                      uomId: field.value,
                      uomCode: initialData?.packUomCode ?? "",
                      uomName: initialData?.packUomName ?? "",
                    } as IUomLookup)
                  : null
              }
              onChange={(v) => {
                field.onChange(v?.uomId ?? 0);
                if (v) setValue("packUomId", v.uomId);
              }}
              isRequired
              isDisable={isEdit || isViewMode}
              error={errors.packUomId?.message}
            />
          )}
        />
        <FormNumericInput
          control={control}
          name="uomFactor"
          label={t("uomFactor")}
          isRequired
          format={4}
          disabled={isViewMode}
          error={errors.uomFactor?.message}
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
