"use client";

import { useEffect } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import {
  FormNumericInput,
  FormCheckbox,
} from "@/components/ui/form";
import { CreditTermCombobox } from "@/components/ui/combobox/credit-term-combobox";
import type { ICreditTermDt } from "@/interfaces/creditterm";
import {
  credittermDtSchema,
  type CreditTermDtSchemaType,
} from "@/schemas/creditterm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { Controller, useForm } from "react-hook-form";
import type { ICreditTermLookup } from "@/interfaces/lookup";

export interface CreditTermDtFormProps {
  initialData?: ICreditTermDt | null;
  companyId: string;
  onSubmitAction: (data: Partial<ICreditTermDt>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function CreditTermDtForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: CreditTermDtFormProps) {
  const t = useNamespaceTranslations("creditTermDt");
  const tc = useNamespaceTranslations("common");
  const isEdit = !!initialData?.creditTermId;
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreditTermDtSchemaType>({
    resolver: zodResolver(credittermDtSchema),
    defaultValues: {
      creditTermId: initialData?.creditTermId ?? 0,
      fromDay: initialData?.fromDay ?? 0,
      toDay: initialData?.toDay ?? 0,
      dueDay: initialData?.dueDay ?? 0,
      noMonth: initialData?.noMonth ?? 0,
      isEndOfMonth: initialData?.isEndOfMonth ?? false,
    },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      creditTermId: initialData.creditTermId,
      fromDay: initialData.fromDay ?? 0,
      toDay: initialData.toDay ?? 0,
      dueDay: initialData.dueDay ?? 0,
      noMonth: initialData.noMonth ?? 0,
      isEndOfMonth: initialData.isEndOfMonth ?? false,
    });
  }, [initialData, reset]);

  const onFormSubmit = (data: CreditTermDtSchemaType) =>
    onSubmitAction({ ...data, companyId: Number(companyId) });

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          name="creditTermId"
          control={control}
          render={({ field }) => (
            <CreditTermCombobox
              label={t("creditTerm")}
              value={
                field.value
                  ? ({
                      creditTermId: field.value,
                      creditTermCode: initialData?.creditTermCode ?? "",
                      creditTermName: initialData?.creditTermName ?? "",
                    } as ICreditTermLookup)
                  : null
              }
              onChange={(v) => {
                field.onChange(v?.creditTermId ?? 0);
                if (v) setValue("creditTermId", v.creditTermId);
              }}
              isRequired
              isDisable={isEdit || isViewMode}
              error={errors.creditTermId?.message}
            />
          )}
        />
        <FormNumericInput
          control={control}
          name="fromDay"
          label={t("fromDay")}
          isRequired
          format={0}
          disabled={isViewMode}
          error={errors.fromDay?.message}
        />
        <FormNumericInput
          control={control}
          name="toDay"
          label={t("toDay")}
          isRequired
          format={0}
          disabled={isViewMode}
          error={errors.toDay?.message}
        />
        <FormNumericInput
          control={control}
          name="dueDay"
          label={t("dueDay")}
          isRequired
          format={0}
          disabled={isViewMode}
          error={errors.dueDay?.message}
        />
        <FormNumericInput
          control={control}
          name="noMonth"
          label={t("noMonth")}
          format={0}
          disabled={isViewMode}
          error={errors.noMonth?.message}
        />
        <FormCheckbox
          control={control}
          name="isEndOfMonth"
          label={t("isEndOfMonth")}
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
