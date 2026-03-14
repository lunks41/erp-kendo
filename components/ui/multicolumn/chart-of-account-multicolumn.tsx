"use client"

import { useState, useCallback, useMemo } from "react"
import { MultiColumnComboBox } from "@progress/kendo-react-dropdowns"
import type { ComboBoxFilterChangeEvent } from "@progress/kendo-react-dropdowns"
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

/** Filters accounts: code startsWith query OR name contains query (case-insensitive) */
function filterAccounts(data: IChartOfAccountLookup[], query: string): IChartOfAccountLookup[] {
  if (!query) return data
  const q = query.toLowerCase()
  return data.filter(
    (a) =>
      a.glCode?.toLowerCase().startsWith(q) ||
      a.glName?.toLowerCase().includes(q),
  )
}

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
  const { data: allData = [], isLoading } = useChartOfAccountLookup(effectiveCompanyId)
  const [filteredData, setFilteredData] = useState<IChartOfAccountLookup[]>(allData)

  // Auto-resolve full account object from allData when glName is missing (e.g. on edit load)
  const resolvedValue = useMemo(() => {
    if (!value) return null
    if (value.glName) return value
    return allData.find((a) => a.glId === value.glId) ?? value
  }, [value, allData])

  const handleFilterChange = useCallback(
    (e: ComboBoxFilterChangeEvent) => {
      const query = e.filter?.value ?? ""
      setFilteredData(filterAccounts(allData, query))
    },
    [allData],
  )

  return (
    <MultiColumnComboBox
      id={id}
      data={filteredData.length > 0 || isLoading ? filteredData : allData}
      columns={COLUMNS}
      value={resolvedValue}
      onChange={(e) => {
        setFilteredData(allData)
        onChange?.((e.value ?? null) as IChartOfAccountLookup | null)
      }}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      dataItemKey={dataItemKey}
      textField={textField}
      filterable
      onFilterChange={handleFilterChange}
      loading={isLoading}
      fillMode={fillMode}
      rounded={rounded}
      size={size}
      className={className}
      style={{ minWidth: 200, ...style }}
    />
  )
}
