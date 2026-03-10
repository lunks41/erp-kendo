"use client";

import { useEffect } from "react";
import { ISupplier } from "@/interfaces/supplier";
import { supplierSchema } from "@/schemas/supplier";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  AccountSetupCombobox,
  BankCombobox,
  CreditTermCombobox,
  CurrencyCombobox,
  CustomerCombobox,
} from "@/components/ui/combobox";
import {
  FormInput,
  FormCheckbox,
  FormTextArea,
} from "@/components/ui/form";
import { Form } from "@/components/ui/form";

interface SupplierFormProps {
  initialData?: ISupplier | null;
  onSaveAction: (data: z.infer<typeof supplierSchema>) => void;
}

export default function SupplierForm({
  initialData,
  onSaveAction,
}: SupplierFormProps) {
  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData
      ? {
          supplierId: initialData.supplierId ?? 0,
          supplierCode: initialData.supplierCode ?? "",
          supplierName: initialData.supplierName ?? "",
          supplierOtherName: initialData.supplierOtherName ?? "",
          supplierShortName: initialData.supplierShortName ?? "",
          supplierRegNo: initialData.supplierRegNo ?? "",
          currencyId: initialData.currencyId ?? 0,
          bankId: initialData.bankId ?? 0,
          creditTermId: initialData.creditTermId ?? 0,
          parentSupplierId: initialData.parentSupplierId ?? 0,
          accSetupId: initialData.accSetupId ?? 0,
          customerId: initialData.customerId ?? 0,
          isSupplier: initialData.isSupplier ?? true,
          isVendor: initialData.isVendor ?? false,
          isTrader: initialData.isTrader ?? false,
          isCustomer: initialData.isCustomer ?? false,
          isDiffGstGl: initialData.isDiffGstGl ?? false,
          remarks: initialData.remarks ?? "",
          isActive: initialData.isActive ?? true,
        }
      : {
          supplierId: 0,
          supplierCode: "",
          supplierName: "",
          supplierOtherName: "",
          supplierShortName: "",
          supplierRegNo: "",
          currencyId: 0,
          bankId: 0,
          creditTermId: 0,
          parentSupplierId: 0,
          accSetupId: 0,
          customerId: 0,
          isSupplier: true,
          isVendor: false,
          isTrader: false,
          isCustomer: false,
          isDiffGstGl: false,
          remarks: "",
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
  const bankId = Number(useWatch({ control, name: "bankId" })) || 0;
  const creditTermId = Number(useWatch({ control, name: "creditTermId" })) || 0;
  const accSetupId = Number(useWatch({ control, name: "accSetupId" })) || 0;
  const customerId = Number(useWatch({ control, name: "customerId" })) || 0;

  useEffect(() => {
    reset(
      initialData
        ? {
            supplierId: initialData.supplierId ?? 0,
            supplierCode: initialData.supplierCode ?? "",
            supplierName: initialData.supplierName ?? "",
            supplierOtherName: initialData.supplierOtherName ?? "",
            supplierShortName: initialData.supplierShortName ?? "",
            supplierRegNo: initialData.supplierRegNo ?? "",
            currencyId: initialData.currencyId ?? 0,
            bankId: initialData.bankId ?? 0,
            creditTermId: initialData.creditTermId ?? 0,
            parentSupplierId: initialData.parentSupplierId ?? 0,
            accSetupId: initialData.accSetupId ?? 0,
            customerId: initialData.customerId ?? 0,
            isSupplier: initialData.isSupplier ?? true,
            isVendor: initialData.isVendor ?? false,
            isTrader: initialData.isTrader ?? false,
            isCustomer: initialData.isCustomer ?? false,
            isDiffGstGl: initialData.isDiffGstGl ?? false,
            remarks: initialData.remarks ?? "",
            isActive: initialData.isActive ?? true,
          }
        : {
            supplierId: 0,
            supplierCode: "",
            supplierName: "",
            supplierOtherName: "",
            supplierShortName: "",
            supplierRegNo: "",
            currencyId: 0,
            bankId: 0,
            creditTermId: 0,
            parentSupplierId: 0,
            accSetupId: 0,
            customerId: 0,
            isSupplier: true,
            isVendor: false,
            isTrader: false,
            isCustomer: false,
            isDiffGstGl: false,
            remarks: "",
            isActive: true,
          },
    );
  }, [initialData, reset]);

  const onSubmit = (data: z.infer<typeof supplierSchema>) => {
    const processedData = {
      ...data,
      supplierId: Number(data.supplierId),
      currencyId: Number(data.currencyId),
      bankId: Number(data.bankId),
      creditTermId: Number(data.creditTermId),
      parentSupplierId: data.parentSupplierId != null ? Number(data.parentSupplierId) : 0,
      accSetupId: Number(data.accSetupId),
      customerId: data.customerId != null ? Number(data.customerId) : 0,
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
                name="supplierCode"
                label="Supplier Code"
                isRequired
                error={errors.supplierCode?.message}
                valid={!errors.supplierCode}
              />
              <FormInput
                control={control}
                name="supplierName"
                label="Supplier Name"
                isRequired
                error={errors.supplierName?.message}
                valid={!errors.supplierName}
              />
              <FormInput
                control={control}
                name="supplierOtherName"
                label="Other Name"
                error={errors.supplierOtherName?.message}
                valid={!errors.supplierOtherName}
              />
              <FormInput
                control={control}
                name="supplierShortName"
                label="Short Name"
                error={errors.supplierShortName?.message}
                valid={!errors.supplierShortName}
              />
              <FormInput
                control={control}
                name="supplierRegNo"
                label="Registration No (TRN)"
                error={errors.supplierRegNo?.message}
                valid={!errors.supplierRegNo}
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
            </div>
            <div className="grid grid-cols-6 gap-2">
              <BankCombobox
                value={bankId ? { bankId } : null}
                onChange={(v) =>
                  setValue("bankId", v?.bankId ?? 0, { shouldValidate: true })
                }
                label="Bank"
                isRequired
                error={errors.bankId?.message}
              />
              <CreditTermCombobox
                value={creditTermId ? { creditTermId } : null}
                onChange={(v) =>
                  setValue("creditTermId", v?.creditTermId ?? 0, {
                    shouldValidate: true,
                  })
                }
                label="Credit Term"
                isRequired
                error={errors.creditTermId?.message}
              />
              <AccountSetupCombobox
                value={accSetupId ? { accSetupId } : null}
                onChange={(v) =>
                  setValue("accSetupId", v?.accSetupId ?? 0, {
                    shouldValidate: true,
                  })
                }
                label="Account Setup"
                isRequired
                error={errors.accSetupId?.message}
              />
              <CustomerCombobox
                value={customerId ? { customerId } : null}
                onChange={(v) =>
                  setValue("customerId", v?.customerId ?? 0)
                }
                label="Customer"
              />
              <FormTextArea
                control={control}
                name="remarks"
                label="Remarks"
                error={errors.remarks?.message}
                valid={!errors.remarks}
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
              <FormCheckbox
                control={control}
                name="isSupplier"
                label="Is Supplier"
              />
              <FormCheckbox control={control} name="isVendor" label="Is Vendor" />
              <FormCheckbox control={control} name="isTrader" label="Is Trader" />
              <FormCheckbox
                control={control}
                name="isCustomer"
                label="Is Customer"
              />
              <FormCheckbox
                control={control}
                name="isDiffGstGl"
                label="Is Diff GST GL"
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
            id="supplier-form-submit"
            className="hidden"
            aria-hidden="true"
          />
        </form>
      </Form>
    </div>
  );
}
