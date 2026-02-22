"use client"

/**
 * Customer Code selector - uses ComboBox (Kendo AutoComplete only accepts string value).
 * ComboBox provides the same type-to-filter UX for customer code lookup.
 * Supports both standalone (value/onChange) and form-integrated (control/name) usage.
 */
import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { Controller } from "react-hook-form"
import { ComboBox } from "@progress/kendo-react-dropdowns"
import { useAuthStore } from "@/stores/auth-store"
import { FormField } from "@/components/ui/form"
import { useCompanyCustomerLookup, useCustomerLookup } from "@/hooks/use-lookup"
import type { ICustomerLookup } from "@/interfaces/lookup"

export interface CustomerCodeAutoCompleteProps<T extends FieldValues = FieldValues> {
  /** Form mode: control + name for react-hook-form integration */
  control?: Control<T>
  name?: FieldPath<T>
  /** FormField: label, isRequired, error (as per port-region-combobox) */
  label?: string
  isRequired?: boolean
  error?: string
  /** Standalone mode: controlled value */
  value?: ICustomerLookup | null
  onChange?: (value: ICustomerLookup | string | null) => void
  onBlur?: () => void
  disabled?: boolean
  /** When true, user can enter a code not in the list (for new customer) */
  allowCustom?: boolean
  placeholder?: string
  dataItemKey?: string
  textField?: string
  companyId?: number | null
  fillMode?: "solid" | "flat" | "outline"
  rounded?: "small" | "medium" | "full" | "none"
  size?: "small" | "medium" | "large"
  className?: string
  id?: string
}

function resolveValueFromCode(
  code: string,
  data: ICustomerLookup[],
  existingName?: string
): ICustomerLookup | null {
  const trimmed = String(code ?? "").trim()
  if (!trimmed) return null
  const found = data.find(
    (c) => String(c.customerCode ?? "").toLowerCase() === trimmed.toLowerCase()
  )
  if (found) return found
  return {
    customerId: 0,
    customerCode: trimmed,
    customerName: existingName ?? "",
    currencyId: 0,
    creditTermId: 0,
    bankId: 0,
  }
}

export function CustomerCodeAutoComplete<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  isRequired = false,
  error,
  value = null,
  onChange,
  onBlur,
  disabled = false,
  allowCustom = false,
  placeholder = "Type customer code...",
  dataItemKey = "customerId",
  textField = "customerCode",
  companyId: propsCompanyId,
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
}: CustomerCodeAutoCompleteProps<T>) {
  const storeCompanyId = useAuthStore((s) =>
    s.currentCompany?.companyId ? parseInt(s.currentCompany.companyId, 10) : 0
  )
  const effectiveCompanyId = propsCompanyId ?? storeCompanyId

  const companyLookup = useCompanyCustomerLookup(effectiveCompanyId)
  const globalLookup = useCustomerLookup()

  const { data = [], isLoading } =
    effectiveCompanyId > 0 ? companyLookup : globalLookup

  const combobox = (val: ICustomerLookup | null, onValChange: (v: ICustomerLookup | string | null) => void) => (
    <ComboBox
      id={id}
      data={data}
      value={val ?? undefined}
      onChange={(e) => {
        const v = e.value ?? null
        onValChange(v as ICustomerLookup | string | null)
      }}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      dataItemKey={dataItemKey}
      textField={textField}
      filterable
      loading={isLoading}
      fillMode={fillMode}
      rounded={rounded}
      size={size}
      className={className}
      style={{ minWidth: 200 }}
      allowCustom={allowCustom}
    />
  )

  if (control && name) {
    return (
      <FormField label={label ?? "Customer Code"} isRequired={isRequired} error={error}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const displayValue = resolveValueFromCode(
              String(field.value ?? ""),
              data
            )
            return combobox(displayValue, (v) => {
              const code =
                typeof v === "string"
                  ? v
                  : (v as ICustomerLookup | null)?.customerCode ?? ""
              field.onChange(code)
              onChange?.(v)
            })
          }}
        />
      </FormField>
    )
  }

  if (label != null) {
    return (
      <FormField label={label} isRequired={isRequired} error={error}>
        {combobox(value, onChange ?? (() => {}))}
      </FormField>
    )
  }

  return combobox(value, onChange ?? (() => {}))
}
