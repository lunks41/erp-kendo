"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ComboBox,
  ComboBoxFilterChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { filterBy, FilterDescriptor } from "@progress/kendo-data-query";
import { FormField } from "@/components/ui/form";
import { useJobOrderLookup } from "@/hooks/use-lookup";
import type { IJobOrderLookup } from "@/interfaces/lookup";

/**
 * Job Order ComboBox with ERP-style filtering:
 * - Basic: filterable + loading indicator
 * - Minimum filter length: filtering only after N characters (reduces noise, better UX for masters)
 * For very large lists (e.g. customers, COA), consider Filtering with Remote Data + Virtualization.
 */
export interface JobOrderComboboxProps {
  value?: IJobOrderLookup | null;
  onChange?: (value: IJobOrderLookup | null) => void;
  onBlur?: () => void;
  isDisable?: boolean;
  placeholder?: string;
  label?: string;
  isRequired?: boolean;
  error?: string;
  dataItemKey?: string;
  textField?: string;
  allowCustom?: boolean;
  /** Minimum characters before filtering applies (ERP-friendly; 0 = filter from first character) */
  minFilterLength?: number;
  fillMode?: "solid" | "flat" | "outline";
  rounded?: "small" | "medium" | "full" | "none";
  size?: "small" | "medium" | "large";
  className?: string;
  id?: string;
}

export function JobOrderCombobox({
  value = null,
  onChange,
  onBlur,
  isDisable = false,
  placeholder = "Select job order...",
  label,
  isRequired = false,
  error,
  dataItemKey = "jobOrderId",
  textField = "jobOrderNo",
  allowCustom = false,
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
}: JobOrderComboboxProps) {
  const { data = [], isLoading } = useJobOrderLookup();
  const [filteredData, setFilteredData] = useState<IJobOrderLookup[]>(data);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const filterData = (filter: FilterDescriptor) => {
    const source = filteredData.slice();
    return filterBy(source, filter);
  };

  const filterChange = (event: ComboBoxFilterChangeEvent) => {
    const newData =
      event.filter.value.length > 3 ? filterData(event.filter) : data.slice();
    setFilteredData(newData);
  };

  // Resolve value to an item in data so ComboBox can match (reference + dataItemKey).
  const resolvedValue = useMemo(() => {
    if (value == null || value.jobOrderId == null) return null;
    const id = Number(value.jobOrderId);
    if (!id) return null;
    const found = data.find((item) => Number(item.jobOrderId) === id);
    return found ?? value;
  }, [value, data]);

  // Ensure current value is in the list so ComboBox can display it after filtering.
  const dataWithValue = useMemo(() => {
    if (resolvedValue == null) return filteredData;
    const keyVal = (resolvedValue as unknown as Record<string, unknown>)[
      dataItemKey
    ];
    if (keyVal == null) return filteredData;
    const keyNum = Number(keyVal);
    const exists = filteredData.some((item) => {
      const itemKey = (item as unknown as Record<string, unknown>)[dataItemKey];
      return Number(itemKey) === keyNum;
    });
    if (exists) return filteredData;
    return [resolvedValue, ...filteredData];
  }, [filteredData, resolvedValue, dataItemKey]);

  const combobox = (
    <ComboBox
      id={id}
      data={dataWithValue}
      value={resolvedValue}
      onFilterChange={filterChange}
      onChange={(e) => onChange?.(e.value ?? null)}
      onBlur={onBlur}
      disabled={isDisable}
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
  );

  if (label != null) {
    return (
      <FormField label={label} isRequired={isRequired} error={error}>
        {combobox}
      </FormField>
    );
  }

  return combobox;
}
