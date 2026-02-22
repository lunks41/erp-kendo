"use client"

import { useEffect, useState } from "react"
import { ICustomerContact } from "@/interfaces/customer"
import {
  CustomerContactSchemaType,
  customerContactSchema,
} from "@/schemas/customer"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { Button } from "@progress/kendo-react-buttons"
import { Badge } from "@progress/kendo-react-indicators"
import { ExpansionPanel, ExpansionPanelContent } from "@progress/kendo-react-layout"

import { FormInput, FormSwitch } from "@/components/ui/form"
import { Form } from "@/components/ui/form"

// Default values for the contact form
const defaultContactSchemaType: CustomerContactSchemaType = {
  customerId: 0,
  contactId: 0,
  contactName: "",
  otherName: "",
  mobileNo: "",
  offNo: "",
  faxNo: "",
  emailAdd: "",
  isActive: true,
  isSales: false,
  isFinance: false,
  isDefault: false,
  messId: "",
  contactMessType: "",
}

interface CustomerContactFormProps {
  initialData?: ICustomerContact
  customerId?: number
  submitAction: (data: CustomerContactSchemaType) => void
  onCancelAction?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

export function CustomerContactForm({
  initialData,
  customerId,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isReadOnly = false,
}: CustomerContactFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const [auditExpanded, setAuditExpanded] = useState(false)

  // Validate that customerId is provided and valid
  if (!customerId || customerId <= 0) {
    throw new Error("Valid customerId is required for contact form")
  }
  const form = useForm<CustomerContactSchemaType>({
    resolver: zodResolver(customerContactSchema),
    defaultValues: initialData
      ? {
          customerId: initialData.customerId ?? customerId,
          contactId: initialData.contactId ?? 0,
          contactName: initialData.contactName ?? "",
          otherName: initialData.otherName ?? "",
          mobileNo: initialData.mobileNo ?? "",
          offNo: initialData.offNo ?? "",
          faxNo: initialData.faxNo ?? "",
          emailAdd: initialData.emailAdd ?? "",
          isActive: initialData.isActive ?? true,
          isSales: initialData.isSales ?? false,
          isFinance: initialData.isFinance ?? false,
          isDefault: initialData.isDefault ?? false,
          messId: initialData.messId ?? "",
          contactMessType: initialData.contactMessType ?? "",
        }
      : {
          ...defaultContactSchemaType,
          customerId: customerId,
        },
  })
  const { control } = form

  const onSubmit = (data: CustomerContactSchemaType) => {
    console.log("Form submitted with data:", data)
    console.log("Form validation errors:", form.formState.errors)

    // Process and handle null values according to CustomerContactSchemaType schema
    const contactData = {
      ...data,
      // Convert numeric fields
      customerId: data.customerId ? Number(data.customerId) : customerId,
      contactId: data.contactId ? Number(data.contactId) : 0,

      // Handle string fields
      contactName: data.contactName || "",
      otherName: data.otherName || "",
      mobileNo: data.mobileNo || "",
      offNo: data.offNo || "",
      faxNo: data.faxNo || "",
      emailAdd: data.emailAdd || "",
      messId: data.messId || "",
      contactMessType: data.contactMessType || "",

      // Boolean fields
      isActive: data.isActive ?? true,
      isDefault: data.isDefault ?? false,
      isFinance: data.isFinance ?? false,
      isSales: data.isSales ?? false,
    }
    console.log("Processed contact data:", contactData)
    console.log("Calling submitAction...")
    submitAction(contactData)
  }

  useEffect(() => {
    form.reset(
      initialData
        ? {
            customerId: initialData.customerId ?? customerId,
            contactId: initialData.contactId ?? 0,
            contactName: initialData.contactName ?? "",
            otherName: initialData.otherName ?? "",
            mobileNo: initialData.mobileNo ?? "",
            offNo: initialData.offNo ?? "",
            faxNo: initialData.faxNo ?? "",
            emailAdd: initialData.emailAdd ?? "",
            isActive: initialData.isActive ?? true,
            isSales: initialData.isSales ?? false,
            isFinance: initialData.isFinance ?? false,
            isDefault: initialData.isDefault ?? false,
            messId: initialData.messId ?? "",
            contactMessType: initialData.contactMessType ?? "",
          }
        : {
            ...defaultContactSchemaType,
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
          className="space-y-2"
        >
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <FormInput
                control={control}
                name="contactName"
                label="Contact Name"
                isRequired
                isDisable={isReadOnly}
                error={form.formState.errors.contactName?.message}
                valid={!form.formState.errors.contactName}
              />
              <FormInput
                control={control}
                name="otherName"
                label="Other Name"
                isDisable={isReadOnly}
              />
              <FormInput
                control={control}
                name="mobileNo"
                label="Mobile Number"
                isDisable={isReadOnly}
              />
              <FormInput
                control={control}
                name="offNo"
                label="Office Number"
                isDisable={isReadOnly}
              />
              <FormInput
                control={control}
                name="faxNo"
                label="Fax Number"
                isDisable={isReadOnly}
              />
              <FormInput
                control={control}
                name="emailAdd"
                label="Email Address"
                isDisable={isReadOnly}
              />
              <FormInput
                control={control}
                name="messId"
                label="MessId"
                isDisable={isReadOnly}
              />
              <FormInput
                control={control}
                name="contactMessType"
                label="Contact Mess Type"
                isDisable={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              <FormSwitch
                control={control}
                name="isActive"
                label="Active Status"
                isDisable={isReadOnly}
              />
              <FormSwitch
                control={control}
                name="isDefault"
                label="Default Contact"
                isDisable={isReadOnly}
              />
              <FormSwitch
                control={control}
                name="isSales"
                label="Sales Contact"
                isDisable={isReadOnly}
              />
              <FormSwitch
                control={control}
                name="isFinance"
                label="Finance Contact"
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
