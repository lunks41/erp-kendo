"use client";

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Button } from "@progress/kendo-react-buttons";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IApiSuccessResponse } from "@/interfaces/auth";
import type { IDocumentNoModuleTransactions } from "@/interfaces/lookup";
import {
  useModuleTransactionListGet,
  useNumberFormatDataById,
  useNumberFormatSave,
} from "@/hooks/use-settings";
import { documentNoFormSchema } from "@/schemas/setting";
import type { DocumentNoSchemaType } from "@/schemas/setting";
import { SaveConfirmation } from "@/components/ui/confirmation";
import { FormField, FormInput, FormNumericInput } from "@/components/ui/form";
import { toast } from "@/components/layout/notification-container";

type NumberFormatResponse = IApiSuccessResponse<{
  numberId?: number;
  moduleId?: number;
  transactionId?: number;
  prefix?: string;
  noDigits?: number;
}>;

export function DocumentNoForm() {
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [selectedModuleTransaction, setSelectedModuleTransaction] = useState<{
    moduleId: number;
    transactionId: number;
  } | null>(null);

  const { data: moduleTransactionResponse, isLoading: isLoadingList } =
    useModuleTransactionListGet();
  const { data: numberFormatResponse, refetch } = useNumberFormatDataById({
    moduleId: selectedModuleTransaction?.moduleId ?? 0,
    transactionId: selectedModuleTransaction?.transactionId ?? 0,
  });
  const { mutate: saveNumberFormat, isPending } = useNumberFormatSave();

  const form = useForm<DocumentNoSchemaType>({
    resolver: zodResolver(documentNoFormSchema),
    defaultValues: {
      moduleId: 0,
      transactionId: 0,
      prefix: "",
      noDigits: 5,
    },
  });

  const moduleTransactions: IDocumentNoModuleTransactions[] =
    (moduleTransactionResponse as IApiSuccessResponse<IDocumentNoModuleTransactions[]>)?.data ?? [];
  const options = moduleTransactions.map((mt) => ({
    id: `${mt.moduleId}-${mt.transactionId}`,
    value: { moduleId: mt.moduleId, transactionId: mt.transactionId },
    label: `${mt.moduleName} - ${mt.transactionName}`,
  }));

  const selectedOption =
    selectedModuleTransaction &&
    options.find(
      (o) =>
        o.value.moduleId === selectedModuleTransaction.moduleId &&
        o.value.transactionId === selectedModuleTransaction.transactionId
    );

  useEffect(() => {
    if (numberFormatResponse && selectedModuleTransaction) {
      const res = numberFormatResponse as NumberFormatResponse;
      if (res.result === 1 && res.data) {
        const d = res.data;
        form.reset({
          moduleId: d.moduleId ?? selectedModuleTransaction.moduleId,
          transactionId: d.transactionId ?? selectedModuleTransaction.transactionId,
          prefix: d.prefix ?? "",
          noDigits: d.noDigits ?? 5,
        });
      } else {
        form.reset({
          moduleId: selectedModuleTransaction.moduleId,
          transactionId: selectedModuleTransaction.transactionId,
          prefix: "",
          noDigits: 5,
        });
      }
    }
  }, [numberFormatResponse, selectedModuleTransaction, form]);

  const onSubmit = () => setShowSaveConfirmation(true);

  const handleConfirmSave = () => {
    const formData = form.getValues();
    const data = {
      moduleId: formData.moduleId ?? selectedModuleTransaction?.moduleId ?? 0,
      transactionId:
        formData.transactionId ?? selectedModuleTransaction?.transactionId ?? 0,
      prefix: formData.prefix ?? "",
      noDigits: formData.noDigits ?? 5,
    };
    saveNumberFormat(data, {
      onSuccess: (response) => {
        const r = response as NumberFormatResponse;
        if (r.result === -1) {
          toast.error(r.message || "Failed to save number format");
          return;
        }
        if (r.result === 1) {
          toast.success(r.message || "Number format saved successfully");
          refetch();
        }
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to save number format"
        );
      },
    });
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Document Number Format</h3>
        <p className="text-muted-foreground text-sm">
          Configure document numbering by module and transaction
        </p>
      </div>
      <div>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <FormField label="Module / Transaction">
                <DropDownList
                  data={options}
                  value={selectedOption ?? null}
                  onChange={(e) => {
                    const val = e.value?.value;
                    if (val) {
                      setSelectedModuleTransaction(val);
                    }
                  }}
                  textField="label"
                  dataItemKey="id"
                  fillMode="outline"
                  rounded="medium"
                  style={{ minWidth: 280 }}
                />
              </FormField>
              {selectedModuleTransaction && (
                <>
                  <FormInput
                    control={form.control}
                    name="prefix"
                    label="Prefix"
                    placeholder="e.g. INV"
                  />
                  <FormNumericInput
                    control={form.control}
                    name="noDigits"
                    label="Number of Digits"
                    format={0}
                  />
                  <Button
                    type="submit"
                    themeColor="primary"
                    size="medium"
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
            </div>
          </form>
        </FormProvider>

        <SaveConfirmation
          title="Save Document Number Format"
          itemName="number format"
          open={showSaveConfirmation}
          onOpenChange={setShowSaveConfirmation}
          onConfirm={handleConfirmSave}
          isSaving={isPending}
          operationType="update"
        />
      </div>
    </div>
  );
}
