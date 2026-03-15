"use client";

import { useEffect } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { FormCheckbox } from "@/components/ui/form";
import { AccountSetupCombobox } from "@/components/ui/combobox/account-setup-combobox";
import { CurrencyCombobox } from "@/components/ui/combobox/currency-combobox";
import { ChartOfAccountCombobox } from "@/components/ui/combobox/chart-of-account-combobox";
import type { IAccountSetupDt } from "@/interfaces/accountsetup";
import {
  accountSetupDtSchema,
  type AccountSetupDtSchemaType,
} from "@/schemas/accountsetup";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { Controller, useForm } from "react-hook-form";
import type {
  IAccountSetupLookup,
  IChartOfAccountLookup,
  ICurrencyLookup,
} from "@/interfaces/lookup";

export interface AccountSetupDtFormProps {
  initialData?: IAccountSetupDt | null;
  companyId: string;
  onSubmitAction: (data: Partial<IAccountSetupDt>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function AccountSetupDtForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: AccountSetupDtFormProps) {
  const t = useNamespaceTranslations("accountSetupDt");
  const tc = useNamespaceTranslations("common");
  const isEdit = !!(initialData?.accSetupId && initialData?.currencyId && initialData?.glId);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AccountSetupDtSchemaType>({
    resolver: zodResolver(accountSetupDtSchema),
    defaultValues: {
      accSetupId: initialData?.accSetupId ?? 0,
      currencyId: initialData?.currencyId ?? 0,
      glId: initialData?.glId ?? 0,
      applyAllCurr: initialData?.applyAllCurr ?? false,
    },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      accSetupId: initialData.accSetupId,
      currencyId: initialData.currencyId,
      glId: initialData.glId,
      applyAllCurr: initialData.applyAllCurr ?? false,
    });
  }, [initialData, reset]);

  const onFormSubmit = (data: AccountSetupDtSchemaType) =>
    onSubmitAction({ ...data, companyId: Number(companyId) });

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          name="accSetupId"
          control={control}
          render={({ field }) => (
            <AccountSetupCombobox
              label={tc("accountSetup")}
              value={
                field.value
                  ? ({
                      accSetupId: field.value,
                      accSetupName: initialData?.accSetupName ?? "",
                    } as IAccountSetupLookup)
                  : null
              }
              onChange={(v) => {
                field.onChange(v?.accSetupId ?? 0);
                if (v) setValue("accSetupId", v.accSetupId);
              }}
              isRequired
              isDisable={isEdit || isViewMode}
              error={errors.accSetupId?.message}
            />
          )}
        />
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
                      currencyCode: initialData?.currencyName ? "" : "",
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
        <div className="sm:col-span-2">
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
        </div>
        <FormCheckbox
          control={control}
          name="applyAllCurr"
          label={t("applyAllCurr")}
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
