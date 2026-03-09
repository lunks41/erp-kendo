"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ComboBox,
  ComboBoxFilterChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { filterBy, FilterDescriptor } from "@progress/kendo-data-query";
import { FormField } from "@/components/ui/form";
import { useOrderTypeCategoryLookup } from "@/hooks/use-lookup";
import type { IOrderTypeCategoryLookup } from "@/interfaces/lookup";

export interface OrderTypeCategoryComboboxProps {
  value?: IOrderTypeCategoryLookup | { orderTypeCategoryId?: number } | null;
  onChange?: (value: IOrderTypeCategoryLookup | null) => void;
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

export function OrderTypeCategoryCombobox({
  value = null,
  onChange,
  onBlur,
  isDisable = false,
  placeholder = "Select order type category...",
  label,
  isRequired = false,
  error,
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
}: OrderTypeCategoryComboboxProps) {
  const { data = [], isLoading } = useOrderTypeCategoryLookup();
  const [filteredData, setFilteredData] = useState<IOrderTypeCategoryLookup[]>(data);
  const dataItemKey = "orderTypeCategoryId";
  const textField = "orderTypeCategoryName";

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
    if (value == null || (value as { orderTypeCategoryId?: number }).orderTypeCategoryId == null) return null;
    const id = Number((value as { orderTypeCategoryId?: number }).orderTypeCategoryId);
    if (!id) return null;
    const found = data.find((item) => Number(item.orderTypeCategoryId) === id);
    return found ?? (value as IOrderTypeCategoryLookup);
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
