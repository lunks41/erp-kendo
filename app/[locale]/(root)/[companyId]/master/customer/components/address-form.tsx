"use client"

import { useEffect, useMemo, useState } from "react"
import { ICustomerAddress } from "@/interfaces/customer"
import {
  CustomerAddressSchemaType,
  customerAddressSchema,
} from "@/schemas/customer"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { Button } from "@progress/kendo-react-buttons"
import { Badge } from "@progress/kendo-react-indicators"
import { ExpansionPanel, ExpansionPanelContent } from "@progress/kendo-react-layout"

import { CountryCombobox } from "@/components/ui/combobox"
import { FormInput, FormSwitch, FormTextArea } from "@/components/ui/form"
import { useCountryLookup } from "@/hooks/use-lookup"
import { Form } from "@/components/ui/form"

// Default values for the address form
const defaultAddressSchemaType: CustomerAddressSchemaType = {
  customerId: 0,
  addressId: 0,
  billName: "",
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
}

interface CustomerAddressFormProps {
  initialData?: ICustomerAddress
  customerId?: number
  submitAction: (data: CustomerAddressSchemaType) => void
  onCancelAction?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

export function CustomerAddressForm({
  initialData,
  customerId,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isReadOnly = false,
}: CustomerAddressFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const [auditExpanded, setAuditExpanded] = useState(false)

  // Validate that customerId is provided and valid
  if (!customerId || customerId <= 0) {
    throw new Error("Valid customerId is required for address form")
  }
  const form = useForm<CustomerAddressSchemaType>({
    resolver: zodResolver(customerAddressSchema),
    defaultValues: initialData
      ? {
          customerId: initialData.customerId ?? customerId,
          addressId: initialData.addressId ?? 0,
          address1: initialData.address1 ?? "",
          billName: initialData.billName ?? "",
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
          customerId: customerId,
        },
  })
  const { control, setValue, watch } = form
  const countryId = Number(watch("countryId")) || 0
  const { data: countryData = [] } = useCountryLookup()
  const countryValue = useMemo(
    () =>
      countryId > 0
        ? countryData.find((c) => c.countryId === countryId) ??
          (initialData && initialData.countryId === countryId
            ? { countryId, countryCode: "", countryName: "" }
            : null)
        : null,
    [countryId, countryData, initialData]
  )

  const onSubmit = (data: CustomerAddressSchemaType) => {
    console.log("Form submitted with data:", data)
    console.log("Form validation errors:", form.formState.errors)

    // Process the form data according to CustomerAddressSchemaType schema
    const addressData = {
      ...data,
      // Convert numeric fields and handle null values
      customerId: data.customerId ? Number(data.customerId) : customerId,
      addressId: data.addressId ? Number(data.addressId) : 0,
      countryId: data.countryId ? Number(data.countryId) : 0,

      // Handle string fields
      address1: data.address1 || "",
      address2: data.address2 || "",
      address3: data.address3 || "",
      address4: data.address4 || "",
      pinCode: data.pinCode ?? "",
      phoneNo: data.phoneNo || "",
      faxNo: data.faxNo || "",
      emailAdd: data.emailAdd || "",
      webUrl: data.webUrl || "",

      // Boolean fields
      isActive: data.isActive ?? true,
      isDefaultAdd: data.isDefaultAdd ?? false,
      isDeliveryAdd: data.isDeliveryAdd ?? false,
      isFinAdd: data.isFinAdd ?? false,
      isSalesAdd: data.isSalesAdd ?? false,
    }

    console.log("Processed address data:", addressData)
    console.log("Calling submitAction...")
    submitAction(addressData)
  }

  useEffect(() => {
    form.reset(
      initialData
        ? {
            customerId: initialData.customerId ?? customerId,
            addressId: initialData.addressId ?? 0,
            address1: initialData.address1 ?? "",
            billName: initialData.billName ?? "",
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
            customerId: customerId,
          }
    )
  }, [initialData, customerId, form])

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log("Form validation failed:", errors)
          })}
          className="space-y-4"
        >
          <div className="grid gap-2">
            <FormInput
              control={control}
              name="billName"
              label="Bill Name"
              isRequired
              isDisable={isReadOnly}
              error={form.formState.errors.billName?.message}
              valid={!form.formState.errors.billName}
            />
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
                isRequired
                isDisable={isReadOnly}
                rows={2}
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
                onChange={(v) => setValue("countryId", v?.countryId ?? 0, { shouldValidate: true })}
                label="Country"
                isRequired
                error={form.formState.errors.countryId?.message}
              />
              <FormInput
                control={control}
                name="phoneNo"
                label="Phone Number"
                isRequired
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

            <div className="grid grid-cols-6 gap-2">
              <FormSwitch
                control={control}
                name="isActive"
                label="Active Status"
                isDisable={isReadOnly}
              />
              <FormSwitch
                control={control}
                name="isDefaultAdd"
                label="Default Address"
                isDisable={isReadOnly}
              />
              <FormSwitch
                control={control}
                name="isDeliveryAdd"
                label="Delivery Address"
                isDisable={isReadOnly}
              />
              <FormSwitch
                control={control}
                name="isFinAdd"
                label="Finance Address"
                isDisable={isReadOnly}
              />
              <FormSwitch
                control={control}
                name="isSalesAdd"
                label="Sales Address"
                isDisable={isReadOnly}
              />
            </div>

            {/* Audit Information Section */}
            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <div className="space-y-2">
                  <div className="border-border border-b pb-4"></div>
                  <ExpansionPanel
                    expanded={auditExpanded}
                    onAction={(e) => setAuditExpanded(e.expanded)}
                    title="View Audit Trail"
                    subtitle={
                      initialData.createDate || initialData.editDate ? (
                        <Badge themeColor="secondary" fillMode="outline" size="small">
                          {initialData.createDate ? "Created" : ""}
                          {initialData.editDate ? (initialData.createDate ? " • " : "") + "Modified" : ""}
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
                              <span className="text-foreground text-sm font-medium">Created By</span>
                              <Badge themeColor="secondary" fillMode="outline" size="small">
                                {initialData.createBy}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {format(new Date(initialData.createDate), datetimeFormat)}
                            </div>
                          </div>
                        )}
                        {initialData.editBy && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-foreground text-sm font-medium">Last Modified By</span>
                              <Badge themeColor="secondary" fillMode="outline" size="small">
                                {initialData.editBy}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {initialData.editDate
                                ? format(new Date(initialData.editDate), datetimeFormat)
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
              <Button themeColor="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
