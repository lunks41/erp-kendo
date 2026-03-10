"use client";

import {
  FormCheckbox,
  FormInput,
  FormNumericInput,
  FormTextArea,
} from "@/components/ui/form";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import type { ICarrier } from "@/interfaces/carrier";
import { formatDateTime } from "@/lib/date-utils";
import { carrierSchema, type CarrierSchemaType } from "@/schemas/carrier";
import { useAuthStore } from "@/stores/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export interface CarrierFormProps {
  initialData?: ICarrier | null;
  companyId: string;
  onSubmitAction: (data: Partial<ICarrier>) => void;
  onCancelAction: () => void;
  isLoading?: boolean;
  isViewMode?: boolean;
}

export function CarrierForm({
  initialData,
  companyId,
  onSubmitAction,
  onCancelAction,
  isLoading = false,
  isViewMode = false,
}: CarrierFormProps) {
  const t = useNamespaceTranslations("carrier");
  const tc = useNamespaceTranslations("common");
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat ?? "dd/MM/yyyy HH:mm:ss";
  const isEdit = !!initialData?.carrierId;
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarrierSchemaType>({
    resolver: zodResolver(carrierSchema),
    defaultValues: {
      carrierId: initialData?.carrierId,
      carrierCode: initialData?.carrierCode ?? "",
      carrierName: initialData?.carrierName ?? "",
      seqNo: initialData?.seqNo ?? 0,
      remarks: initialData?.remarks ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      carrierId: initialData.carrierId,
      carrierCode: initialData.carrierCode ?? "",
      carrierName: initialData.carrierName ?? "",
      seqNo: initialData.seqNo ?? 0,
      remarks: initialData.remarks ?? "",
      isActive: initialData.isActive ?? true,
    });
  }, [initialData, reset]);

  const onFormSubmit = (data: CarrierSchemaType) => {
    onSubmitAction({ ...data, companyId: Number(companyId) });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormInput
          control={control}
          name="carrierCode"
          label={t("carrierCode")}
          isRequired
          isDisable={isEdit}
          error={errors.carrierCode?.message}
          valid={!errors.carrierCode}
        />
        <FormInput
          control={control}
          name="carrierName"
          label={t("carrierName")}
          isRequired
          isDisable={isViewMode}
          error={errors.carrierName?.message}
          valid={!errors.carrierName}
        />
        <FormNumericInput
          control={control}
          name="seqNo"
          label={t("seqNo")}
          disabled={isViewMode}
          format={0}
          alignRight={false}
          error={errors.seqNo?.message}
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
                <span className="text-[10px] font-medium uppercase text-slate-400 dark:text-slate-500">
                  {tc("createdBy")}
                </span>
                <span className="text-[11px]">
                  {initialData.createBy || "—"}{" "}
                  {formatDateTime(initialData.createDate, datetimeFormat)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase text-slate-400 dark:text-slate-500">
                  {tc("lastModifiedBy")}
                </span>
                <span className="text-[11px]">
                  {initialData.editBy || "—"}{" "}
                  {formatDateTime(initialData.editDate, datetimeFormat)}
                </span>
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
