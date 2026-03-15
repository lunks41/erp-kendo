"use client";

import { useEffect } from "react";
import {
  FormInput,
  FormCheckbox,
  FormTextArea,
} from "@/components/ui/form";
import type { IAccountSetupCategory } from "@/interfaces/accountsetup";
import {
  accountSetupCategorySchema,
} from "@/schemas/accountsetup";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { useForm } from "react-hook-form";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";

const schemaForForm = accountSetupCategorySchema.partial({
  accSetupCategoryId: true,
});
type AccountSetupCategoryFormValues = {
  accSetupCategoryId?: number;
  accSetupCategoryCode: string;
  accSetupCategoryName: string;
  isActive: boolean;
  remarks?: string;
};

export interface AccountSetupCategoryFormProps {
  initialData?: IAccountSetupCategory | null;
  companyId: string;
  onSubmitAction: (data: Partial<IAccountSetupCategory>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function AccountSetupCategoryForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: AccountSetupCategoryFormProps) {
  const t = useNamespaceTranslations("accountSetupCategory");
  const tc = useNamespaceTranslations("common");
  const isEdit = !!initialData?.accSetupCategoryId;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountSetupCategoryFormValues>({
    resolver: zodResolver(schemaForForm),
    defaultValues: {
      accSetupCategoryId: initialData?.accSetupCategoryId,
      accSetupCategoryCode: initialData?.accSetupCategoryCode ?? "",
      accSetupCategoryName: initialData?.accSetupCategoryName ?? "",
      remarks: initialData?.remarks ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });
  useEffect(() => {
    if (!initialData) return;
    reset({
      accSetupCategoryId: initialData.accSetupCategoryId,
      accSetupCategoryCode: initialData.accSetupCategoryCode ?? "",
      accSetupCategoryName: initialData.accSetupCategoryName ?? "",
      remarks: initialData.remarks ?? "",
      isActive: initialData.isActive ?? true,
    });
  }, [initialData, reset]);
  const onFormSubmit = (data: AccountSetupCategoryFormValues) =>
    onSubmitAction({ ...data, companyId: Number(companyId) });
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormInput
          control={control}
          name="accSetupCategoryCode"
          label={t("accSetupCategoryCode")}
          isRequired
          isDisable={isEdit}
          error={errors.accSetupCategoryCode?.message}
          valid={!errors.accSetupCategoryCode}
        />
        <FormInput
          control={control}
          name="accSetupCategoryName"
          label={t("accSetupCategoryName")}
          isRequired
          isDisable={isViewMode}
          error={errors.accSetupCategoryName?.message}
          valid={!errors.accSetupCategoryName}
        />
        <FormTextArea
          control={control}
          name="remarks"
          label={tc("remarks")}
          isDisable={isViewMode}
          rows={3}
          className="sm:col-span-2"
          error={errors.remarks?.message}
          valid={!errors.remarks}
        />
        <FormCheckbox
          control={control}
          name="isActive"
          label={tc("activeStatus")}
          disabled={isLoading}
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
