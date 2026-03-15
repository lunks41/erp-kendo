"use client";

import { useEffect, useState } from "react";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  FormInput,
  FormCheckbox,
  FormTextArea,
} from "@/components/ui/form";
import type { IGstCategory } from "@/interfaces/gst";
import { formatDateTime } from "@/lib/date-utils";
import {
  gstCategorySchema,
  type GstCategorySchemaType,
} from "@/schemas/gst-category";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";

export interface GstCategoryFormProps {
  initialData?: IGstCategory | null;
  companyId: string;
  onSubmitAction: (data: Partial<IGstCategory>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function GstCategoryForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: GstCategoryFormProps) {
  const t = useNamespaceTranslations("gstCategory");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const isEdit = !!initialData?.gstCategoryId;
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GstCategorySchemaType>({
    resolver: zodResolver(gstCategorySchema),
    defaultValues: {
      gstCategoryId: initialData?.gstCategoryId,
      gstCategoryCode: initialData?.gstCategoryCode ?? "",
      gstCategoryName: initialData?.gstCategoryName ?? "",
      remarks: initialData?.remarks ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });
  useEffect(() => {
    if (!initialData) return;
    reset({
      gstCategoryId: initialData.gstCategoryId,
      gstCategoryCode: initialData.gstCategoryCode ?? "",
      gstCategoryName: initialData.gstCategoryName ?? "",
      remarks: initialData.remarks ?? "",
      isActive: initialData.isActive ?? true,
    });
  }, [initialData, reset]);
  const onFormSubmit = (data: GstCategorySchemaType) =>
    onSubmitAction({ ...data, companyId: Number(companyId) });
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormInput
          control={control}
          name="gstCategoryCode"
          label={t("gstCategoryCode")}
          isRequired
          isDisable={isEdit}
          error={errors.gstCategoryCode?.message}
          valid={!errors.gstCategoryCode}
        />
        <FormInput
          control={control}
          name="gstCategoryName"
          label={t("gstCategoryName")}
          isRequired
          isDisable={isViewMode}
          error={errors.gstCategoryName?.message}
          valid={!errors.gstCategoryName}
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
      {isEdit && initialData && (
        <div className="rounded-md border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => setAuditTrailOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            <span>{tc("viewAuditTrail")}</span>
            {auditTrailOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {auditTrailOpen && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-slate-200 px-2.5 py-2 dark:border-slate-700">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {tc("createdBy")}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {initialData.createBy || "—"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDateTime(initialData.createDate, datetimeFormat) || "—"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {tc("lastModifiedBy")}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {initialData.editBy || "—"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDateTime(initialData.editDate, datetimeFormat) || "—"}
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
          {isLoading ? tc("saving") : isEdit ? tc("update") : tc("create")}
        </Button>
      </div>
    </form>
  );
}
