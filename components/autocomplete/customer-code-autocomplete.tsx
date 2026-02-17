"use client"

/**
 * Customer Code selector - uses ComboBox (Kendo AutoComplete only accepts string value).
 * ComboBox provides the same type-to-filter UX for customer code lookup.
 */
import { ComboBox } from "@progress/kendo-react-dropdowns"
import { useAuthStore } from "@/stores/auth-store"
import { useCompanyCustomerLookup, useCustomerLookup } from "@/hooks/use-lookup"
import type { ICustomerLookup } from "@/interfaces/lookup"

export interface CustomerCodeAutoCompleteProps {
  value?: ICustomerLookup | null
  onChange?: (value: ICustomerLookup | null) => void
  onBlur?: () => void
  disabled?: boolean
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

export function CustomerCodeAutoComplete({
  value = null,
  onChange,
  onBlur,
  disabled = false,
  placeholder = "Type customer code...",
  dataItemKey = "customerId",
  textField = "customerCode",
  companyId: propsCompanyId,
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
}: CustomerCodeAutoCompleteProps) {
  const storeCompanyId = useAuthStore((s) =>
    s.currentCompany?.companyId ? parseInt(s.currentCompany.companyId, 10) : 0
  )
  const effectiveCompanyId = propsCompanyId ?? storeCompanyId

  const companyLookup = useCompanyCustomerLookup(effectiveCompanyId)
  const globalLookup = useCustomerLookup()

  const { data = [], isLoading } =
    effectiveCompanyId > 0 ? companyLookup : globalLookup

  return (
    <ComboBox
      id={id}
      data={data}
      value={value ?? undefined}
      onChange={(e) => onChange?.(e.value ?? null)}
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
      allowCustom={false}
    />
  )
}
