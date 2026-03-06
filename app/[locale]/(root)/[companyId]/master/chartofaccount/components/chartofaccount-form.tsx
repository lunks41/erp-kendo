"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ComboBox } from "@progress/kendo-react-dropdowns";
import { Controller } from "react-hook-form";
import {
  FormCheckbox,
  FormInput,
  FormNumericInput,
  FormSwitch,
  FormTextArea,
} from "@/components/ui/form";
import { formatDateTime } from "@/lib/date-utils";
import {
  useAccountTypeLookup,
  useAccountGroupLookup,
  useCOACategory1Lookup,
  useCOACategory2Lookup,
  useCOACategory3Lookup,
} from "@/hooks/use-lookup";
import type { IChartOfAccount } from "@/interfaces/chartofaccount";
import {
  chartofAccountSchema,
  type ChartOfAccountSchemaType,
} from "@/schemas/chartofaccount";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";

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
  const t = useTranslations("chartOfAccountForm");
  const tc = useTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const isEdit = !!initialData?.glId;
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);

  const { data: accTypeData = [] } = useAccountTypeLookup();
  const { data: accGroupData = [] } = useAccountGroupLookup();
  const { data: cat1Data = [] } = useCOACategory1Lookup();
  const { data: cat2Data = [] } = useCOACategory2Lookup();
  const { data: cat3Data = [] } = useCOACategory3Lookup();

  const cat2WithNone = useMemo(
    () => [
      { coaCategoryId: 0, coaCategoryCode: "", coaCategoryName: "—" },
      ...cat2Data,
    ],
    [cat2Data],
  );
  const cat3WithNone = useMemo(
    () => [
      { coaCategoryId: 0, coaCategoryCode: "", coaCategoryName: "—" },
      ...cat3Data,
    ],
    [cat3Data],
  );

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

  const accTypeValue = accTypeId
    ? (accTypeData.find((x) => x.accTypeId === accTypeId) ?? null)
    : null;
  const accGroupValue = accGroupId
    ? (accGroupData.find((x) => x.accGroupId === accGroupId) ?? null)
    : null;
  const cat1Value = coaCategoryId1
    ? (cat1Data.find((x) => x.coaCategoryId === coaCategoryId1) ?? null)
    : null;
  const cat2Value =
    coaCategoryId2 !== undefined && coaCategoryId2 !== null
      ? (cat2WithNone.find((x) => x.coaCategoryId === coaCategoryId2) ?? null)
      : null;
  const cat3Value =
    coaCategoryId3 !== undefined && coaCategoryId3 !== null
      ? (cat3WithNone.find((x) => x.coaCategoryId === coaCategoryId3) ?? null)
      : null;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

        <Controller
          name="accTypeId"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("accountType")} <span className="text-red-500">*</span>
              </label>
              <ComboBox
                data={accTypeData}
                value={accTypeValue}
                onChange={({ value }) =>
                  setValue("accTypeId", value?.accTypeId ?? 0, {
                    shouldValidate: true,
                  })
                }
                textField="accTypeName"
                dataItemKey="accTypeId"
                disabled={isViewMode || isLoading}
                placeholder={t("selectAccountType")}
                fillMode="outline"
                rounded="medium"
                size="medium"
              />
              {errors.accTypeId && (
                <span className="text-xs text-red-500">
                  {errors.accTypeId.message}
                </span>
              )}
            </div>
          )}
        />
        <Controller
          name="accGroupId"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("accountGroup")} <span className="text-red-500">*</span>
              </label>
              <ComboBox
                data={accGroupData}
                value={accGroupValue}
                onChange={({ value }) =>
                  setValue("accGroupId", value?.accGroupId ?? 0, {
                    shouldValidate: true,
                  })
                }
                textField="accGroupName"
                dataItemKey="accGroupId"
                disabled={isViewMode || isLoading}
                placeholder={t("selectAccountGroup")}
                fillMode="outline"
                rounded="medium"
                size="medium"
              />
              {errors.accGroupId && (
                <span className="text-xs text-red-500">
                  {errors.accGroupId.message}
                </span>
              )}
            </div>
          )}
        />
        <Controller
          name="coaCategoryId1"
          control={control}
          render={() => (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("category1")} <span className="text-red-500">*</span>
              </label>
              <ComboBox
                data={cat1Data}
                value={cat1Value}
                onChange={({ value }) =>
                  setValue("coaCategoryId1", value?.coaCategoryId ?? 0, {
                    shouldValidate: true,
                  })
                }
                textField="coaCategoryName"
                dataItemKey="coaCategoryId"
                disabled={isViewMode || isLoading}
                placeholder={t("selectCategory1")}
                fillMode="outline"
                rounded="medium"
                size="medium"
              />
              {errors.coaCategoryId1 && (
                <span className="text-xs text-red-500">
                  {errors.coaCategoryId1.message}
                </span>
              )}
            </div>
          )}
        />
        <Controller
          name="coaCategoryId2"
          control={control}
          render={() => (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("category2")}
              </label>
              <ComboBox
                data={cat2WithNone}
                value={cat2Value}
                onChange={({ value }) =>
                  setValue("coaCategoryId2", value?.coaCategoryId ?? 0, {
                    shouldValidate: true,
                  })
                }
                textField="coaCategoryName"
                dataItemKey="coaCategoryId"
                disabled={isViewMode || isLoading}
                placeholder={t("selectCategory2")}
                fillMode="outline"
                rounded="medium"
                size="medium"
              />
            </div>
          )}
        />
        <Controller
          name="coaCategoryId3"
          control={control}
          render={() => (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("category3")}
              </label>
              <ComboBox
                data={cat3WithNone}
                value={cat3Value}
                onChange={({ value }) =>
                  setValue("coaCategoryId3", value?.coaCategoryId ?? 0, {
                    shouldValidate: true,
                  })
                }
                textField="coaCategoryName"
                dataItemKey="coaCategoryId"
                disabled={isViewMode || isLoading}
                placeholder={t("selectCategory3")}
                fillMode="outline"
                rounded="medium"
                size="medium"
              />
            </div>
          )}
        />

        <FormNumericInput
          control={control}
          name="seqNo"
          label={t("seqNo")}
          format={0}
          alignRight={false}
          disabled={isViewMode}
          error={errors.seqNo?.message}
        />
        <FormTextArea
          control={control}
          name="remarks"
          label={t("remarks")}
          isDisable={isViewMode}
          rows={3}
          className="sm:col-span-2"
          error={errors.remarks?.message}
          valid={!errors.remarks}
        />

        {/* Boolean account behaviour flags (compact grid) */}
        <div className="sm:col-span-2 grid grid-cols-1 gap-2 md:grid-cols-3">
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
        </div>

        <FormSwitch
          control={control}
          name="isActive"
          label={t("activeStatus")}
          isDisable={isLoading}
          onLabel={t("onLabel")}
          offLabel={t("offLabel")}
          className="sm:col-span-2"
        />
      </div>

      {isEdit && initialData && (
        <div className="rounded-md border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => setAuditTrailOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            <span>{t("viewAuditTrail")}</span>
            <span className="flex items-center gap-1">
              <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {t("created")}
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {t("modified")}
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
                  {t("createdBy")}
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
                  {t("lastModifiedBy")}
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
