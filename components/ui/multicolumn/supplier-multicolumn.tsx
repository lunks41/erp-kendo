"use client"

import { useState, useCallback, useMemo } from "react"
import { MultiColumnComboBox } from "@progress/kendo-react-dropdowns"
import type { MultiColumnComboBoxFilterChangeEvent } from "@progress/kendo-react-dropdowns"
import { useSupplierLookup } from "@/hooks/use-lookup"
import type { ISupplierLookup } from "@/interfaces/lookup"

export interface SupplierMultiColumnProps {
  value?: ISupplierLookup | null
  onChange?: (value: ISupplierLookup | null) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
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
  { field: "supplierCode", header: "Code", width: 110 },
  { field: "supplierName", header: "Name", width: 300 },
]

/** Filters suppliers: code startsWith query OR name contains query (case-insensitive) */
function filterSuppliers(data: ISupplierLookup[], query: string): ISupplierLookup[] {
  if (!query) return data
  const q = query.toLowerCase()
  return data.filter(
    (s) =>
      s.supplierCode?.toLowerCase().startsWith(q) ||
      s.supplierName?.toLowerCase().includes(q),
  )
}

export function SupplierMultiColumn({
  value = null,
  onChange,
  onBlur,
  disabled = false,
  placeholder = "Select Supplier...",
  dataItemKey = "supplierId",
  textField = "supplierName",
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
  style,
}: SupplierMultiColumnProps) {
  const { data: allData = [], isLoading } = useSupplierLookup()
  const [filteredData, setFilteredData] = useState<ISupplierLookup[]>(allData)

  // Auto-resolve full supplier object from allData when supplierName is missing (e.g. on edit load)
  const resolvedValue = useMemo(() => {
    if (!value) return null
    if (value.supplierName) return value
    return allData.find((s) => s.supplierId === value.supplierId) ?? value
  }, [value, allData])

  const handleFilterChange = useCallback(
    (e: MultiColumnComboBoxFilterChangeEvent) => {
      const query = e.filter?.value ?? ""
      setFilteredData(filterSuppliers(allData, query))
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
        onChange?.((e.value ?? null) as ISupplierLookup | null)
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
