"use client";

import { useEffect } from "react";
import { IBank } from "@/interfaces/bank";
import { bankSchema } from "@/schemas/bank";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { CurrencyCombobox } from "@/components/ui/combobox";
import {
  FormField,
  FormInput,
  FormCheckbox,
  FormTextArea,
} from "@/components/ui/form";
import { Form } from "@/components/ui/form";

interface BankFormProps {
  initialData?: IBank | null;
  onSaveAction: (data: z.infer<typeof bankSchema>) => void;
}

export default function BankForm({
  initialData,
  onSaveAction,
}: BankFormProps) {
  const form = useForm<z.infer<typeof bankSchema>>({
    resolver: zodResolver(bankSchema),
    defaultValues: initialData
      ? {
          bankId: initialData.bankId ?? 0,
          bankCode: initialData.bankCode ?? "",
          bankName: initialData.bankName ?? "",
          currencyId: initialData.currencyId ?? 0,
          accountNo: initialData.accountNo ?? "",
          swiftCode: initialData.swiftCode ?? "",
          iban: initialData.iban ?? "",
          remarks1: initialData.remarks1 ?? "",
          remarks2: initialData.remarks2 ?? "",
          remarks3: initialData.remarks3 ?? "",
          glId: initialData.glId ?? 0,
          isOwnBank: initialData.isOwnBank ?? false,
          isPettyCashBank: initialData.isPettyCashBank ?? false,
          isActive: initialData.isActive ?? true,
        }
      : {
          bankId: 0,
          bankCode: "",
          bankName: "",
          currencyId: 0,
          accountNo: "",
          swiftCode: "",
          iban: "",
          remarks1: "",
          remarks2: "",
          remarks3: "",
          glId: 0,
          isOwnBank: false,
          isPettyCashBank: false,
          isActive: true,
        },
  });

  const {
    control,
    setValue,
    reset,
    formState: { errors },
  } = form;
  const currencyId = Number(useWatch({ control, name: "currencyId" })) || 0;

  useEffect(() => {
    reset(
      initialData
        ? {
            bankId: initialData.bankId ?? 0,
            bankCode: initialData.bankCode ?? "",
            bankName: initialData.bankName ?? "",
            currencyId: initialData.currencyId ?? 0,
            accountNo: initialData.accountNo ?? "",
            swiftCode: initialData.swiftCode ?? "",
            iban: initialData.iban ?? "",
            remarks1: initialData.remarks1 ?? "",
            remarks2: initialData.remarks2 ?? "",
            remarks3: initialData.remarks3 ?? "",
            glId: initialData.glId ?? 0,
            isOwnBank: initialData.isOwnBank ?? false,
            isPettyCashBank: initialData.isPettyCashBank ?? false,
            isActive: initialData.isActive ?? true,
          }
        : {
            bankId: 0,
            bankCode: "",
            bankName: "",
            currencyId: 0,
            accountNo: "",
            swiftCode: "",
            iban: "",
            remarks1: "",
            remarks2: "",
            remarks3: "",
            glId: 0,
            isOwnBank: false,
            isPettyCashBank: false,
            isActive: true,
          },
    );
  }, [initialData, reset]);

  const onSubmit = (data: z.infer<typeof bankSchema>) => {
    const processedData = {
      ...data,
      bankId: Number(data.bankId),
      currencyId: Number(data.currencyId),
      glId: data.glId != null ? Number(data.glId) : undefined,
    };
    onSaveAction(processedData);
  };

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid gap-2">
            <div className="grid grid-cols-6 gap-2">
              <FormInput
                control={control}
                name="bankCode"
                label="Bank Code"
                isRequired
                error={errors.bankCode?.message}
                valid={!errors.bankCode}
              />
              <FormInput
                control={control}
                name="bankName"
                label="Bank Name"
                isRequired
                error={errors.bankName?.message}
                valid={!errors.bankName}
              />
              <CurrencyCombobox
                value={currencyId ? { currencyId } : null}
                onChange={(v) =>
                  setValue("currencyId", v?.currencyId ?? 0, {
                    shouldValidate: true,
                  })
                }
                label="Currency"
                isRequired
                error={errors.currencyId?.message}
              />
              <FormInput
                control={control}
                name="accountNo"
                label="Account No"
                error={errors.accountNo?.message}
                valid={!errors.accountNo}
              />
              <FormInput
                control={control}
                name="swiftCode"
                label="SWIFT Code"
                error={errors.swiftCode?.message}
                valid={!errors.swiftCode}
              />
              <FormInput
                control={control}
                name="iban"
                label="IBAN"
                error={errors.iban?.message}
                valid={!errors.iban}
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
              <FormTextArea
                control={control}
                name="remarks1"
                label="Remarks"
                error={errors.remarks1?.message}
                valid={!errors.remarks1}
              />
              <FormCheckbox
                control={control}
                name="isOwnBank"
                label="Own Bank"
              />
              <FormCheckbox
                control={control}
                name="isPettyCashBank"
                label="Petty Cash Bank"
              />
              <FormCheckbox
                control={control}
                name="isActive"
                label="Active Status"
              />
            </div>
          </div>
          <button
            type="submit"
            id="bank-form-submit"
            className="hidden"
            aria-hidden="true"
          />
        </form>
      </Form>
    </div>
  );
}
