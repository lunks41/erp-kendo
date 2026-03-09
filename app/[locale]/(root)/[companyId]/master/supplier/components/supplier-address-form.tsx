"use client";

import { useEffect, useMemo, useState } from "react";
import { ISupplierAddress } from "@/interfaces/supplier";
import {
  SupplierAddressSchemaType,
  supplierAddressSchema,
} from "@/schemas/supplier";
import { useAuthStore } from "@/stores/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { Button } from "@progress/kendo-react-buttons";
import { Badge } from "@progress/kendo-react-indicators";
import {
  ExpansionPanel,
  ExpansionPanelContent,
} from "@progress/kendo-react-layout";

import { CountryCombobox } from "@/components/ui/combobox";
import { FormInput, FormCheckbox, FormTextArea } from "@/components/ui/form";
import { useCountryLookup } from "@/hooks/use-lookup";
import { Form } from "@/components/ui/form";

const defaultAddressSchemaType: SupplierAddressSchemaType = {
  supplierId: 0,
  addressId: 0,
  address1: "",
  address2: "",
  address3: "",
  address4: "",
  pinCode: "",
  countryId: 0,
  phoneNo: "",
  faxNo: "",
  emailAdd: "",
  webUrl: "",
  isActive: true,
  isDefaultAdd: false,
  isDeliveryAdd: false,
  isFinAdd: false,
  isSalesAdd: false,
};

interface SupplierAddressFormProps {
  initialData?: ISupplierAddress;
  supplierId?: number;
  submitAction: (data: SupplierAddressSchemaType) => void;
  onCancelAction?: () => void;
  isSubmitting?: boolean;
  isReadOnly?: boolean;
}

export function SupplierAddressForm({
  initialData,
  supplierId,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isReadOnly = false,
}: SupplierAddressFormProps) {
  const { decimals } = useAuthStore();
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss";
  const [auditExpanded, setAuditExpanded] = useState(false);

  if (!supplierId || supplierId <= 0) {
    throw new Error("Valid supplierId is required for supplier address form");
  }

  const form = useForm<SupplierAddressSchemaType>({
    resolver: zodResolver(supplierAddressSchema),
    defaultValues: initialData
      ? {
          supplierId: initialData.supplierId ?? supplierId,
          addressId: initialData.addressId ?? 0,
          address1: initialData.address1 ?? "",
          address2: initialData.address2 ?? "",
          address3: initialData.address3 ?? "",
          address4: initialData.address4 ?? "",
          pinCode: initialData.pinCode ?? "",
          countryId: initialData.countryId ?? 0,
          phoneNo: initialData.phoneNo ?? "",
          faxNo: initialData.faxNo ?? "",
          emailAdd: initialData.emailAdd ?? "",
          webUrl: initialData.webUrl ?? "",
          isActive: initialData.isActive ?? true,
          isDefaultAdd: initialData.isDefaultAdd ?? false,
          isDeliveryAdd: initialData.isDeliveryAdd ?? false,
          isFinAdd: initialData.isFinAdd ?? false,
          isSalesAdd: initialData.isSalesAdd ?? false,
        }
      : {
          ...defaultAddressSchemaType,
          supplierId: supplierId,
        },
  });

  const { control, setValue, watch } = form;
  const countryId = Number(watch("countryId")) || 0;
  const { data: countryData = [] } = useCountryLookup();
  const countryValue = useMemo(
    () =>
      countryId > 0
        ? (countryData.find((c) => c.countryId === countryId) ??
          (initialData && initialData.countryId === countryId
            ? { countryId, countryCode: "", countryName: "" }
            : null))
        : null,
    [countryId, countryData, initialData],
  );

  const onSubmit = (data: SupplierAddressSchemaType) => {
    const addressData = {
      ...data,
      supplierId: data.supplierId ? Number(data.supplierId) : supplierId,
      addressId: data.addressId ? Number(data.addressId) : 0,
      countryId: data.countryId ? Number(data.countryId) : 0,
      address1: data.address1 || "",
      address2: data.address2 || "",
      address3: data.address3 || "",
      address4: data.address4 || "",
      pinCode: data.pinCode ?? "",
      phoneNo: data.phoneNo || "",
      faxNo: data.faxNo || "",
      emailAdd: data.emailAdd || "",
      webUrl: data.webUrl || "",
      isActive: data.isActive ?? true,
      isDefaultAdd: data.isDefaultAdd ?? false,
      isDeliveryAdd: data.isDeliveryAdd ?? false,
      isFinAdd: data.isFinAdd ?? false,
      isSalesAdd: data.isSalesAdd ?? false,
    };
    submitAction(addressData);
  };

  useEffect(() => {
    form.reset(
      initialData
        ? {
            supplierId: initialData.supplierId ?? supplierId,
            addressId: initialData.addressId ?? 0,
            address1: initialData.address1 ?? "",
            address2: initialData.address2 ?? "",
            address3: initialData.address3 ?? "",
            address4: initialData.address4 ?? "",
            pinCode: initialData.pinCode ?? "",
            countryId: initialData.countryId ?? 0,
            phoneNo: initialData.phoneNo ?? "",
            faxNo: initialData.faxNo ?? "",
            emailAdd: initialData.emailAdd ?? "",
            webUrl: initialData.webUrl ?? "",
            isActive: initialData.isActive ?? true,
            isDefaultAdd: initialData.isDefaultAdd ?? false,
            isDeliveryAdd: initialData.isDeliveryAdd ?? false,
            isFinAdd: initialData.isFinAdd ?? false,
            isSalesAdd: initialData.isSalesAdd ?? false,
          }
        : {
            ...defaultAddressSchemaType,
            supplierId: supplierId,
          },
    );
  }, [initialData, supplierId, form]);

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <FormTextArea
                control={control}
                name="address1"
                label="Address Line 1"
                isRequired
                isDisable={isReadOnly}
                rows={2}
                error={form.formState.errors.address1?.message}
                valid={!form.formState.errors.address1}
              />
              <FormTextArea
                control={control}
                name="address2"
                label="Address Line 2"
                rows={2}
                isDisable={isReadOnly}
                error={form.formState.errors.address2?.message}
                valid={!form.formState.errors.address2}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FormTextArea
                control={control}
                name="address3"
                label="Address Line 3"
                isDisable={isReadOnly}
                rows={2}
              />
              <FormTextArea
                control={control}
                name="address4"
                label="Address Line 4"
                isDisable={isReadOnly}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <FormInput
                control={control}
                name="pinCode"
                label="PIN Code"
                isDisable={isReadOnly}
              />
              <CountryCombobox
                value={countryValue}
                onChange={(v) =>
                  setValue("countryId", v?.countryId ?? 0, {
                    shouldValidate: true,
                  })
                }
                label="Country"
                isRequired
                error={form.formState.errors.countryId?.message}
              />
              <FormInput
                control={control}
                name="phoneNo"
                label="Phone Number"
                isDisable={isReadOnly}
                error={form.formState.errors.phoneNo?.message}
                valid={!form.formState.errors.phoneNo}
              />
              <FormInput
                control={control}
                name="emailAdd"
                label="Email Address"
                isDisable={isReadOnly}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FormInput
                control={control}
                name="faxNo"
                label="Fax Number"
                isDisable={isReadOnly}
              />
              <FormInput
                control={control}
                name="webUrl"
                label="Web URL"
                isDisable={isReadOnly}
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
              <FormCheckbox
                control={control}
                name="isActive"
                label="Active Status"
                disabled={isReadOnly}
              />
              <FormCheckbox
                control={control}
                name="isDefaultAdd"
                label="Default Address"
                disabled={isReadOnly}
              />
              <FormCheckbox
                control={control}
                name="isDeliveryAdd"
                label="Delivery Address"
                disabled={isReadOnly}
              />
              <FormCheckbox
                control={control}
                name="isFinAdd"
                label="Finance Address"
                disabled={isReadOnly}
              />
              <FormCheckbox
                control={control}
                name="isSalesAdd"
                label="Sales Address"
                disabled={isReadOnly}
              />
            </div>

            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <div className="space-y-2">
                  <div className="border-border border-b pb-4" />
                  <ExpansionPanel
                    expanded={auditExpanded}
                    onAction={(e) => setAuditExpanded(e.expanded)}
                    title="View Audit Trail"
                    subtitle={
                      initialData.createDate || initialData.editDate ? (
                        <Badge
                          themeColor="secondary"
                          fillMode="outline"
                          size="small"
                        >
                          {initialData.createDate ? "Created" : ""}
                          {initialData.editDate
                            ? (initialData.createDate ? " • " : "") + "Modified"
                            : ""}
                        </Badge>
                      ) : undefined
                    }
                    className="rounded border border-slate-200 dark:border-slate-600"
                  >
                    <ExpansionPanelContent>
                      <div className="grid grid-cols-1 gap-6 px-2 py-4 md:grid-cols-2">
                        {initialData.createDate && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-foreground text-sm font-medium">
                                Created By
                              </span>
                              <Badge
                                themeColor="secondary"
                                fillMode="outline"
                                size="small"
                              >
                                {initialData.createBy}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {format(
                                new Date(initialData.createDate),
                                datetimeFormat,
                              )}
                            </div>
                          </div>
                        )}
                        {initialData.editBy && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-foreground text-sm font-medium">
                                Last Modified By
                              </span>
                              <Badge
                                themeColor="secondary"
                                fillMode="outline"
                                size="small"
                              >
                                {initialData.editBy}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {initialData.editDate
                                ? format(
                                    new Date(initialData.editDate),
                                    datetimeFormat,
                                  )
                                : "-"}
                            </div>
                          </div>
                        )}
                      </div>
                    </ExpansionPanelContent>
                  </ExpansionPanel>
                </div>
              )}
          </div>
          <div className="flex justify-end gap-2">
            <Button fillMode="flat" type="button" onClick={onCancelAction}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button
                themeColor="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
