"use client"

import { MultiColumnComboBox } from "@progress/kendo-react-dropdowns"
import { useAuthStore } from "@/stores/auth-store"
import { useChartOfAccountLookup } from "@/hooks/use-lookup"
import type { IChartOfAccountLookup } from "@/interfaces/lookup"

export interface ChartOfAccountMultiColumnProps {
  value?: IChartOfAccountLookup | null
  onChange?: (value: IChartOfAccountLookup | null) => void
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
  style?: React.CSSProperties
}

const COLUMNS = [
  { field: "glCode", header: "Code", width: 120 },
  { field: "glName", header: "Name", width: 280 },
]

export function ChartOfAccountMultiColumn({
  value = null,
  onChange,
  onBlur,
  disabled = false,
  placeholder = "Select chart of account...",
  companyId: propsCompanyId,
  dataItemKey = "glId",
  textField = "glCode",
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
  style,
}: ChartOfAccountMultiColumnProps) {
  const storeCompanyId = useAuthStore((s) =>
    s.currentCompany?.companyId ? parseInt(s.currentCompany.companyId, 10) : 0
  )
  const effectiveCompanyId = propsCompanyId ?? storeCompanyId

  const { data = [], isLoading } = useChartOfAccountLookup(effectiveCompanyId)

  return (
    <MultiColumnComboBox
      id={id}
      data={data}
      columns={COLUMNS}
      value={value}
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
      style={{ minWidth: 200, ...style }}
    />
  )
}
