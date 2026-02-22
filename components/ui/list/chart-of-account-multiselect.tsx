"use client"

import { MultiSelect } from "@progress/kendo-react-dropdowns"
import { useAuthStore } from "@/stores/auth-store"
import { useChartOfAccountLookup } from "@/hooks/use-lookup"
import type { IChartOfAccountLookup } from "@/interfaces/lookup"

export interface ChartOfAccountMultiSelectProps {
  value?: IChartOfAccountLookup[]
  onChange?: (value: IChartOfAccountLookup[]) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  companyId?: number | null
  dataItemKey?: string
  textField?: string
  fillMode?: "solid" | "flat" | "outline"
  rounded?: "small" | "medium" | "large" | "full" | "none"
  size?: "small" | "medium" | "large"
  className?: string
  id?: string
}

export function ChartOfAccountMultiSelect({
  value = [],
  onChange,
  onBlur,
  disabled = false,
  placeholder = "Select chart of accounts...",
  companyId: propsCompanyId,
  dataItemKey = "glId",
  textField = "glCode",
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
}: ChartOfAccountMultiSelectProps) {
  const storeCompanyId = useAuthStore((s) =>
    s.currentCompany?.companyId ? parseInt(s.currentCompany.companyId, 10) : 0
  )
  const effectiveCompanyId = propsCompanyId ?? storeCompanyId

  const { data = [], isLoading } = useChartOfAccountLookup(effectiveCompanyId)

  return (
    <MultiSelect
      id={id}
      data={data}
      value={value}
      onChange={(e) => onChange?.(e.value ?? [])}
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
    />
  )
}
