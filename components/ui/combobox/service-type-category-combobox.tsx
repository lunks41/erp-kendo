"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ComboBox,
  ComboBoxFilterChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { filterBy, FilterDescriptor } from "@progress/kendo-data-query";
import { FormField, REQUIRED_FIELD_BOX_CLASS } from "@/components/ui/form";
import { useServiceTypeCategoryLookup } from "@/hooks/use-lookup";
import type { IServiceTypeCategoryLookup } from "@/interfaces/lookup";

export interface ServiceTypeCategoryComboboxProps {
  value?: IServiceTypeCategoryLookup | { serviceTypeCategoryId?: number } | null;
  onChange?: (value: IServiceTypeCategoryLookup | null) => void;
  onBlur?: () => void;
  isDisable?: boolean;
  placeholder?: string;
  label?: string;
  isRequired?: boolean;
  error?: string;
  fillMode?: "solid" | "flat" | "outline";
  rounded?: "small" | "medium" | "full" | "none";
  size?: "small" | "medium" | "large";
  className?: string;
  id?: string;
}

export function ServiceTypeCategoryCombobox({
  value = null,
  onChange,
  onBlur,
  isDisable = false,
  placeholder = "Select service type category...",
  label,
  isRequired = false,
  error,
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
}: ServiceTypeCategoryComboboxProps) {
  const { data = [], isLoading } = useServiceTypeCategoryLookup();
  const [filteredData, setFilteredData] = useState<IServiceTypeCategoryLookup[]>(data);
  const dataItemKey = "serviceTypeCategoryId";
  const textField = "serviceTypeCategoryName";

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const filterData = (filter: FilterDescriptor) =>
    filterBy(filteredData.slice(), filter);
  const filterChange = (event: ComboBoxFilterChangeEvent) => {
    setFilteredData(
      event.filter.value.length > 2 ? filterData(event.filter) : data.slice()
    );
  };

  const resolvedValue = useMemo(() => {
    if (value == null || (value as { serviceTypeCategoryId?: number }).serviceTypeCategoryId == null) return null;
    const id = Number((value as { serviceTypeCategoryId?: number }).serviceTypeCategoryId);
    if (!id) return null;
    const found = data.find((item) => Number(item.serviceTypeCategoryId) === id);
    return found ?? (value as IServiceTypeCategoryLookup);
  }, [value, data]);

  const dataWithValue = useMemo(() => {
    if (resolvedValue == null) return filteredData;
    const keyNum = Number((resolvedValue as unknown as Record<string, unknown>)[dataItemKey]);
    const exists = filteredData.some(
      (item) => Number((item as unknown as Record<string, unknown>)[dataItemKey]) === keyNum
    );
    return exists ? filteredData : [resolvedValue, ...filteredData];
  }, [filteredData, resolvedValue]);

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
      filterable
      loading={isLoading}
      fillMode={fillMode}
      rounded={rounded}
      size={size}
      className={`${className ?? ""} ${isRequired ? REQUIRED_FIELD_BOX_CLASS : ""}`.trim()}
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
