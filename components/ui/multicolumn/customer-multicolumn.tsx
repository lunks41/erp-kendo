"use client"

import { useState, useCallback, useMemo } from "react"
import { MultiColumnComboBox } from "@progress/kendo-react-dropdowns"
import type { MultiColumnComboBoxFilterChangeEvent } from "@progress/kendo-react-dropdowns"
import { useAuthStore } from "@/stores/auth-store"
import { useCustomerLookup, useCompanyCustomerLookup } from "@/hooks/use-lookup"
import type { ICustomerLookup } from "@/interfaces/lookup"

export interface CustomerMultiColumnProps {
  value?: ICustomerLookup | null
  onChange?: (value: ICustomerLookup | null) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  /** Pass companyId to scope the list to a specific company, otherwise loads all. */
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
  { field: "customerCode", header: "Code", width: 110 },
  { field: "customerName", header: "Name", width: 300 },
]

/** Filters customers: code startsWith query OR name contains query (case-insensitive) */
function filterCustomers(data: ICustomerLookup[], query: string): ICustomerLookup[] {
  if (!query) return data
  const q = query.toLowerCase()
  return data.filter(
    (c) =>
      c.customerCode?.toLowerCase().startsWith(q) ||
      c.customerName?.toLowerCase().includes(q),
  )
}

/** Inner component that always uses company-scoped lookup */
function CustomerMultiColumnCompany({
  companyId,
  ...rest
}: CustomerMultiColumnProps & { companyId: number }) {
  const { data = [], isLoading } = useCompanyCustomerLookup(companyId)
  return <CustomerMultiColumnUI allData={data} isLoading={isLoading} {...rest} />
}

/** Inner component that uses global lookup (no company filter) */
function CustomerMultiColumnGlobal(props: CustomerMultiColumnProps) {
  const { data = [], isLoading } = useCustomerLookup()
  return <CustomerMultiColumnUI allData={data} isLoading={isLoading} {...props} />
}

function CustomerMultiColumnUI({
  allData,
  isLoading,
  value = null,
  onChange,
  onBlur,
  disabled = false,
  placeholder = "Select Customer...",
  dataItemKey = "customerId",
  textField = "customerName",
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
  style,
}: CustomerMultiColumnProps & { allData: ICustomerLookup[]; isLoading: boolean }) {
  const [filteredData, setFilteredData] = useState<ICustomerLookup[]>(allData)

  // Auto-resolve full customer object from allData when customerName is missing (e.g. on edit load)
  const resolvedValue = useMemo(() => {
    if (!value) return null
    if (value.customerName) return value
    return allData.find((c) => c.customerId === value.customerId) ?? value
  }, [value, allData])

  const handleFilterChange = useCallback(
    (e: MultiColumnComboBoxFilterChangeEvent) => {
      const query = e.filter?.value ?? ""
      setFilteredData(filterCustomers(allData, query))
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
        // Reset filter list on selection
        setFilteredData(allData)
        onChange?.((e.value ?? null) as ICustomerLookup | null)
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

export function CustomerMultiColumn(props: CustomerMultiColumnProps) {
  const storeCompanyId = useAuthStore((s) =>
    s.currentCompany?.companyId ? parseInt(s.currentCompany.companyId, 10) : 0
  )
  const effectiveCompanyId =
    props.companyId != null ? props.companyId : storeCompanyId

  if (effectiveCompanyId > 0) {
    return <CustomerMultiColumnCompany {...props} companyId={effectiveCompanyId} />
  }
  return <CustomerMultiColumnGlobal {...props} />
}
