"use client";

import { useEffect, useMemo } from "react";
import { ICustomer } from "@/interfaces/customer";
import { customerSchema } from "@/schemas/customer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  AccountSetupCombobox,
  BankCombobox,
  CreditTermCombobox,
  CurrencyCombobox,
  CustomerCombobox,
  SupplierCombobox,
} from "@/components/ui/combobox";
import {
  FormField,
  FormInput,
  FormCheckbox,
  FormTextArea,
} from "@/components/ui/form";
import { useCustomerLookup } from "@/hooks/use-lookup";
import { CustomerCodeAutoComplete } from "@/components/ui/autocomplete/customer-code-autocomplete";
import { Form } from "@/components/ui/form";

interface CustomerFormProps {
  initialData?: ICustomer | null;
  onSaveAction: (customer: ICustomer) => void;
  onCustomerLookup?: (customerCode: string, customerName: string) => void;
}

export default function CustomerForm({
  initialData,
  onSaveAction,
  onCustomerLookup,
}: CustomerFormProps) {
  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues:
      initialData ||
      ({
        customerId: 0,
        companyId: 0,
        customerCode: "",
        customerName: "",
        customerOtherName: "",
        customerShortName: "",
        customerRegNo: "",
        currencyId: 0,
        bankId: 0,
        creditTermId: 0,
        parentCustomerId: 0,
        accSetupId: 0,
        supplierId: 0,
        isCustomer: true,
        isVendor: false,
        isTrader: false,
        isSupplier: false,
        isCredit: false,
        remarks: "",
        isActive: true,
      } as z.infer<typeof customerSchema>),
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;
  const bankId = Number(watch("bankId")) || 0;
  const currencyId = Number(watch("currencyId")) || 0;
  const creditTermId = Number(watch("creditTermId")) || 0;
  const accSetupId = Number(watch("accSetupId")) || 0;
  const parentCustomerId = Number(watch("parentCustomerId")) || 0;
  const supplierId = Number(watch("supplierId")) || 0;

  const { data: customerData = [] } = useCustomerLookup();

  const customerCodeValue = useMemo(() => {
    const code = String(watch("customerCode") ?? "").trim();
    if (!code) return null;
    const found = customerData.find(
      (c) => String(c.customerCode ?? "").toLowerCase() === code.toLowerCase()
    );
    if (found) return found;
    return {
      customerId: 0,
      customerCode: code,
      customerName: initialData?.customerName ?? "",
      currencyId: 0,
      creditTermId: 0,
      bankId: 0,
    };
  }, [watch("customerCode"), customerData, initialData?.customerName]);

  useEffect(() => {
    reset(
      initialData || {
        customerId: 0,
        customerCode: "",
        customerName: "",
        customerOtherName: "",
        customerShortName: "",
        customerRegNo: "",
        currencyId: 0,
        bankId: 0,
        creditTermId: 0,
        parentCustomerId: 0,
        accSetupId: 0,
        supplierId: 0,
        isCustomer: true,
        isVendor: false,
        isTrader: false,
        isSupplier: false,
        isCredit: false,
        remarks: "",
        isActive: true,
      },
    );
  }, [initialData, reset]);

  const onSubmit = (data: z.infer<typeof customerSchema>) => {
    // Convert string values to numbers for numeric fields
    const processedData = {
      ...data,
      customerId: Number(data.customerId),
      currencyId: Number(data.currencyId),
      bankId: Number(data.bankId),
      creditTermId: Number(data.creditTermId),
      parentCustomerId: Number(data.parentCustomerId),
      accSetupId: Number(data.accSetupId),
      supplierId: Number(data.supplierId),
    };
    onSaveAction(processedData as ICustomer);
  };

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid gap-2">
            <div className="grid grid-cols-6 gap-2">
              <FormField
                label="Customer Code"
                isRequired
                error={errors.customerCode?.message}
              >
                <CustomerCodeAutoComplete
                  value={customerCodeValue}
                  onChange={(v) => {
                    const code =
                      typeof v === "string"
                        ? v
                        : (v as { customerCode?: string } | null)?.customerCode ??
                          "";
                    setValue("customerCode", code, { shouldValidate: true });
                    if (
                      v &&
                      typeof v !== "string" &&
                      (v as { customerId?: number }).customerId &&
                      onCustomerLookup
                    ) {
                      const item = v as {
                        customerCode: string;
                        customerName?: string;
                      };
                      onCustomerLookup(item.customerCode, item.customerName ?? "0");
                    }
                  }}
                  disabled={
                    initialData?.customerId ? initialData.customerId > 0 : false
                  }
                  allowCustom={!initialData?.customerId || initialData.customerId === 0}
                  placeholder="Type customer code..."
                />
              </FormField>
              <FormInput
                control={control}
                name="customerName"
                label="Customer Name"
                isRequired
                error={errors.customerName?.message}
                valid={!errors.customerName}
              />

              <FormInput
                control={control}
                name="customerOtherName"
                label="Other Name"
                error={errors.customerOtherName?.message}
                valid={!errors.customerOtherName}
              />
              <FormInput
                control={control}
                name="customerShortName"
                label="Short Name"
                error={errors.customerShortName?.message}
                valid={!errors.customerShortName}
              />

              <FormInput
                control={control}
                name="customerRegNo"
                label="Registration No (TRN)"
                error={errors.customerRegNo?.message}
                valid={!errors.customerRegNo}
              />
              <BankCombobox
                value={bankId ? { bankId } : null}
                onChange={(v) =>
                  setValue("bankId", v?.bankId ?? 0, { shouldValidate: true })
                }
                label="Bank"
                isRequired
                error={errors.bankId?.message}
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
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
              <CustomerCombobox
                value={parentCustomerId ? { customerId: parentCustomerId } : null}
                onChange={(v) =>
                  setValue("parentCustomerId", v?.customerId ?? 0)
                }
                label="Parent Customer"
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

              <SupplierCombobox
                value={supplierId ? { supplierId } : null}
                onChange={(v) => setValue("supplierId", v?.supplierId ?? 0)}
                label="Supplier"
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
                name="isCustomer"
                label="Is Customer"
              />
              <FormCheckbox control={control} name="isVendor" label="Is Vendor" />
              <FormCheckbox control={control} name="isTrader" label="Is Trader" />
              <FormCheckbox
                control={control}
                name="isSupplier"
                label="Is Supplier"
              />
              <FormCheckbox control={control} name="isCredit" label="Is Credit" />
              <FormCheckbox
                control={control}
                name="isActive"
                label="Active Status"
              />
            </div>
          </div>

          {/* Hidden submit button for external trigger */}
          <button
            type="submit"
            id="customer-form-submit"
            className="hidden"
            aria-hidden="true"
          />
        </form>
      </Form>
    </div>
  );
}
