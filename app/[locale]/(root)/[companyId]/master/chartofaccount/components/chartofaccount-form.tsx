"use client";

import {
  AccountGroupCombobox,
  AccountTypeCombobox,
  COACategoryCombobox,
} from "@/components/ui/combobox";
import {
  FormCheckbox,
  FormInput,
  FormNumericInput,
  FormTextArea,
} from "@/components/ui/form";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { IChartOfAccount } from "@/interfaces/chartofaccount";
import { formatDateTime } from "@/lib/date-utils";
import {
  chartofAccountSchema,
  type ChartOfAccountSchemaType,
} from "@/schemas/chartofaccount";
import { useAuthStore } from "@/stores/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const defaultBooleans = {
  isSysControl: false,
  isDeptMandatory: false,
  isBargeMandatory: false,
  isJobSpecific: false,
  isBankAccount: false,
  isOperational: false,
  isPayableAccount: false,
  isReceivableAccount: false,
  isUniversal: false,
};

export interface ChartOfAccountFormProps {
  initialData?: IChartOfAccount | null;
  companyId: string;
  onSubmitAction: (data: Partial<IChartOfAccount>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function ChartOfAccountForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: ChartOfAccountFormProps) {
  const t = useNamespaceTranslations("chartOfAccount");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const isEdit = !!initialData?.glId;
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChartOfAccountSchemaType>({
    resolver: zodResolver(chartofAccountSchema),
    defaultValues: {
      glId: initialData?.glId ?? 0,
      glCode: initialData?.glCode ?? "",
      glName: initialData?.glName ?? "",
      accTypeId: Number(initialData?.accTypeId) || 0,
      accGroupId: Number(initialData?.accGroupId) || 0,
      coaCategoryId1: Number(initialData?.coaCategoryId1) || 0,
      coaCategoryId2: Number(initialData?.coaCategoryId2) ?? 0,
      coaCategoryId3: Number(initialData?.coaCategoryId3) ?? 0,
      seqNo: initialData?.seqNo ?? 0,
      isActive: initialData?.isActive ?? true,
      remarks: initialData?.remarks ?? "",
      ...defaultBooleans,
    },
  });

  const accTypeId = watch("accTypeId");
  const accGroupId = watch("accGroupId");
  const coaCategoryId1 = watch("coaCategoryId1");
  const coaCategoryId2 = watch("coaCategoryId2");
  const coaCategoryId3 = watch("coaCategoryId3");

  useEffect(() => {
    if (!initialData) return;
    reset({
      glId: initialData.glId,
      glCode: initialData.glCode ?? "",
      glName: initialData.glName ?? "",
      accTypeId: Number(initialData.accTypeId) || 0,
      accGroupId: Number(initialData.accGroupId) || 0,
      coaCategoryId1: Number(initialData.coaCategoryId1) || 0,
      coaCategoryId2: Number(initialData.coaCategoryId2) ?? 0,
      coaCategoryId3: Number(initialData.coaCategoryId3) ?? 0,
      seqNo: initialData.seqNo ?? 0,
      isActive: initialData.isActive ?? true,
      remarks: initialData.remarks ?? "",
      isSysControl: initialData.isSysControl ?? false,
      isDeptMandatory: initialData.isDeptMandatory ?? false,
      isBargeMandatory: initialData.isBargeMandatory ?? false,
      isJobSpecific: initialData.isJobSpecific ?? false,
      isBankAccount: initialData.isBankAccount ?? false,
      isOperational: initialData.isOperational ?? false,
      isPayableAccount: initialData.isPayableAccount ?? false,
      isReceivableAccount: initialData.isReceivableAccount ?? false,
      isUniversal: initialData.isUniversal ?? false,
    });
  }, [initialData, reset]);

  const onFormSubmit = (data: ChartOfAccountSchemaType) => {
    onSubmitAction({
      ...data,
      companyId: Number(companyId),
    });
  };

  const handleAccountTypeChange = useCallback(
    (v: { accTypeId?: number } | null) => {
      setValue("accTypeId", v?.accTypeId ?? 0, { shouldValidate: true });
    },
    [setValue],
  );
  const handleAccountGroupChange = useCallback(
    (v: { accGroupId?: number } | null) => {
      setValue("accGroupId", v?.accGroupId ?? 0, { shouldValidate: true });
    },
    [setValue],
  );
  const handleCategory1Change = useCallback(
    (v: { coaCategoryId?: number } | null) => {
      setValue("coaCategoryId1", v?.coaCategoryId ?? 0, {
        shouldValidate: true,
      });
    },
    [setValue],
  );
  const handleCategory2Change = useCallback(
    (v: { coaCategoryId?: number } | null) => {
      setValue("coaCategoryId2", v?.coaCategoryId ?? 0, {
        shouldValidate: true,
      });
    },
    [setValue],
  );
  const handleCategory3Change = useCallback(
    (v: { coaCategoryId?: number } | null) => {
      setValue("coaCategoryId3", v?.coaCategoryId ?? 0, {
        shouldValidate: true,
      });
    },
    [setValue],
  );

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormInput
          control={control}
          name="glCode"
          label={t("glCode")}
          isRequired
          isDisable={isEdit}
          error={errors.glCode?.message}
          valid={!errors.glCode}
        />
        <FormInput
          control={control}
          name="glName"
          label={t("glName")}
          isRequired
          isDisable={isViewMode}
          error={errors.glName?.message}
          valid={!errors.glName}
        />

        <AccountTypeCombobox
          value={accTypeId ? { accTypeId } : null}
          onChange={handleAccountTypeChange}
          label={t("accountType")}
          isRequired
          isDisable={isViewMode || isLoading}
          placeholder={t("selectAccountType")}
          error={errors.accTypeId?.message}
        />
        <AccountGroupCombobox
          value={accGroupId ? { accGroupId } : null}
          onChange={handleAccountGroupChange}
          label={t("accountGroup")}
          isRequired
          isDisable={isViewMode || isLoading}
          placeholder={t("selectAccountGroup")}
          error={errors.accGroupId?.message}
        />
        <COACategoryCombobox
          variant={1}
          value={coaCategoryId1 ? { coaCategoryId: coaCategoryId1 } : null}
          onChange={handleCategory1Change}
          label={t("category1")}
          isRequired
          isDisable={isViewMode || isLoading}
          placeholder={t("selectCategory1")}
          error={errors.coaCategoryId1?.message}
        />
        <COACategoryCombobox
          variant={2}
          includeNone
          value={
            coaCategoryId2 != null ? { coaCategoryId: coaCategoryId2 } : null
          }
          onChange={handleCategory2Change}
          label={t("category2")}
          isDisable={isViewMode || isLoading}
          placeholder={t("selectCategory2")}
        />
        <COACategoryCombobox
          variant={3}
          includeNone
          value={
            coaCategoryId3 != null ? { coaCategoryId: coaCategoryId3 } : null
          }
          onChange={handleCategory3Change}
          label={t("category3")}
          isDisable={isViewMode || isLoading}
          placeholder={t("selectCategory3")}
        />

        <FormNumericInput
          control={control}
          name="seqNo"
          label={tc("seqNo")}
          format={0}
          alignRight={false}
          disabled={isViewMode}
          error={errors.seqNo?.message}
        />
        <FormTextArea
          control={control}
          name="remarks"
          label={tc("remarks")}
          isDisable={isViewMode}
          rows={3}
          className="sm:col-span-3"
          error={errors.remarks?.message}
          valid={!errors.remarks}
        />

        {/* Boolean account behaviour flags (compact grid) */}
        <div className="sm:col-span-3 grid grid-cols-1 gap-2 md:grid-cols-6 [&>div]:flex [&>div]:flex-col [&>div]:items-start">
          <FormCheckbox
            control={control}
            name="isSysControl"
            label={t("systemControl")}
            disabled={isLoading}
          />
          <FormCheckbox
            control={control}
            name="isJobSpecific"
            label={t("jobControl")}
            disabled={isLoading}
          />
          <FormCheckbox
            control={control}
            name="isBankAccount"
            label={t("bankControl")}
            disabled={isLoading}
          />
          <FormCheckbox
            control={control}
            name="isDeptMandatory"
            label={t("deptMandatory")}
            disabled={isLoading}
          />
          <FormCheckbox
            control={control}
            name="isBargeMandatory"
            label={t("bargeMandatory")}
            disabled={isLoading}
          />
          <FormCheckbox
            control={control}
            name="isOperational"
            label={t("operational")}
            disabled={isLoading}
          />
          <FormCheckbox
            control={control}
            name="isPayableAccount"
            label={t("payableAccount")}
            disabled={isLoading}
          />
          <FormCheckbox
            control={control}
            name="isReceivableAccount"
            label={t("receivableAccount")}
            disabled={isLoading}
          />
          <FormCheckbox
            control={control}
            name="isUniversal"
            label={t("universal")}
            disabled={isLoading}
          />
          <FormCheckbox
            control={control}
            name="isActive"
            label={tc("activeStatus")}
            disabled={isLoading}
          />
        </div>
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
              ? t("updateChartOfAccount")
              : t("createChartOfAccount")}
        </Button>
      </div>
    </form>
  );
}
