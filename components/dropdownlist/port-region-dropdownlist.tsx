"use client"

import { DropDownList } from "@progress/kendo-react-dropdowns"
import { usePortregionLookup } from "@/hooks/use-lookup"
import type { IPortRegionLookup } from "@/interfaces/lookup"

export interface PortRegionDropdownListProps {
  value?: IPortRegionLookup | null
  onChange?: (value: IPortRegionLookup | null) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  dataItemKey?: string
  textField?: string
  fillMode?: "solid" | "flat" | "outline"
  rounded?: "small" | "medium" | "full" | "none"
  size?: "small" | "medium" | "large"
  className?: string
  id?: string
}

export function PortRegionDropdownList({
  value = null,
  onChange,
  onBlur,
  disabled = false,
  placeholder = "Select port region...",
  dataItemKey = "portRegionId",
  textField = "portRegionName",
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
}: PortRegionDropdownListProps) {
  const { data = [], isLoading } = usePortregionLookup()

  return (
    <DropDownList
      id={id}
      data={data}
      value={value}
      onChange={(e) => onChange?.(e.value ?? null)}
      onBlur={onBlur}
      disabled={disabled}
      defaultItem={
        placeholder
          ? ({
              portRegionId: 0,
              portRegionCode: "",
              portRegionName: placeholder,
            } as IPortRegionLookup)
          : undefined
      }
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
