"use client";

import { useEffect, useState } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FormInput, FormNumericInput } from "@/components/ui/form";
import type { ILoanType } from "@/interfaces/loantype";
import { formatDateTime } from "@/lib/date-utils";
import { loanTypeSchema, type LoanTypeSchemaType } from "@/schemas/loantype";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";

export interface LoanTypeFormProps {
  initialData?: ILoanType | null;
  companyId: string;
  onSubmitAction: (data: Partial<ILoanType>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function LoanTypeForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: LoanTypeFormProps) {
  const t = useNamespaceTranslations("loanType");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const isEdit = !!initialData?.loanTypeId;
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanTypeSchemaType>({
    resolver: zodResolver(loanTypeSchema),
    defaultValues: {
      loanTypeId: initialData?.loanTypeId,
      loanTypeCode: initialData?.loanTypeCode ?? "",
      loanTypeName: initialData?.loanTypeName ?? "",
      interestRatePct: initialData?.interestRatePct ?? 0,
      maxTermMonths: initialData?.maxTermMonths ?? 12,
      minTermMonths: initialData?.minTermMonths ?? 1,
    },
  });
  useEffect(() => {
    if (!initialData) return;
    reset({
      loanTypeId: initialData.loanTypeId,
      loanTypeCode: initialData.loanTypeCode ?? "",
      loanTypeName: initialData.loanTypeName ?? "",
      interestRatePct: initialData.interestRatePct ?? 0,
      maxTermMonths: initialData.maxTermMonths ?? 12,
      minTermMonths: initialData.minTermMonths ?? 1,
    });
  }, [initialData, reset]);
  const onFormSubmit = (data: LoanTypeSchemaType) =>
    onSubmitAction({ ...data, companyId: Number(companyId) });
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormInput
          control={control}
          name="loanTypeCode"
          label={t("loanTypeCode")}
          isRequired
          isDisable={isEdit}
          error={errors.loanTypeCode?.message}
          valid={!errors.loanTypeCode}
        />
        <FormInput
          control={control}
          name="loanTypeName"
          label={t("loanTypeName")}
          isRequired
          isDisable={isViewMode}
          error={errors.loanTypeName?.message}
          valid={!errors.loanTypeName}
        />
        <FormNumericInput
          control={control}
          name="interestRatePct"
          label={t("interestRatePct")}
          disabled={isViewMode}
          format={2}
          alignRight={false}
          error={errors.interestRatePct?.message}
        />
        <FormNumericInput
          control={control}
          name="minTermMonths"
          label={t("minTermMonths")}
          disabled={isViewMode}
          format={0}
          alignRight={false}
          error={errors.minTermMonths?.message}
        />
        <FormNumericInput
          control={control}
          name="maxTermMonths"
          label={t("maxTermMonths")}
          disabled={isViewMode}
          format={0}
          alignRight={false}
          error={errors.maxTermMonths?.message}
        />
      </div>
      {isEdit && initialData && (
        <div className="rounded-md border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => setAuditTrailOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            <span>{tc("viewAuditTrail")}</span>
            <span className="flex items-center gap-1">
              <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {tc("created")}
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {tc("modified")}
              </span>
              {auditTrailOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </span>
          </button>
          {auditTrailOpen && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-slate-200 px-2.5 py-2 dark:border-slate-700">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {tc("createdBy")}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {initialData.createBy || "—"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDateTime(initialData.createDate, datetimeFormat) ||
                      "—"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {tc("lastModifiedBy")}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {initialData.editBy || "—"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDateTime(initialData.editDate, datetimeFormat) ||
                      "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
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
          {isLoading
            ? t("saving")
            : isEdit
              ? t("updateLoanType")
              : t("createLoanType")}
        </Button>
      </div>
    </form>
  );
}
