"use client"

import { ComboBox } from "@progress/kendo-react-dropdowns"
import { usePortregionLookup } from "@/hooks/use-lookup"
import type { IPortRegionLookup } from "@/interfaces/lookup"

export interface PortRegionComboboxProps {
  value?: IPortRegionLookup | null
  onChange?: (value: IPortRegionLookup | null) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  dataItemKey?: string
  textField?: string
  allowCustom?: boolean
  fillMode?: "solid" | "flat" | "outline"
  rounded?: "small" | "medium" | "full" | "none"
  size?: "small" | "medium" | "large"
  className?: string
  id?: string
}

export function PortRegionCombobox({
  value = null,
  onChange,
  onBlur,
  disabled = false,
  placeholder = "Select port region...",
  dataItemKey = "portRegionId",
  textField = "portRegionName",
  allowCustom = false,
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
}: PortRegionComboboxProps) {
  const { data = [], isLoading } = usePortregionLookup()

  return (
    <ComboBox
      id={id}
      data={data}
      value={value}
      onChange={(e) => onChange?.(e.value ?? null)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      dataItemKey={dataItemKey}
      textField={textField}
      allowCustom={allowCustom}
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
