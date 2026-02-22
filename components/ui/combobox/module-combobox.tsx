"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ComboBox,
  ComboBoxFilterChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { filterBy, FilterDescriptor } from "@progress/kendo-data-query";
import { FormField } from "@/components/ui/form";
import { useModuleLookup } from "@/hooks/use-lookup";
import type { IModuleLookup } from "@/interfaces/lookup";

export interface ModuleComboboxProps {
  /** true = mandatory modules, false = visible modules */
  forMandatory?: boolean;
  value?: IModuleLookup | null;
  onChange?: (value: IModuleLookup | null) => void;
  onBlur?: () => void;
  isDisable?: boolean;
  placeholder?: string;
  label?: string;
  isRequired?: boolean;
  error?: string;
  dataItemKey?: string;
  textField?: string;
  fillMode?: "solid" | "flat" | "outline";
  rounded?: "small" | "medium" | "full" | "none";
  size?: "small" | "medium" | "large";
  className?: string;
  id?: string;
}

/**
 * Module ComboBox for mandatory or visible field settings.
 * Uses useModuleLookup(IsVisible, IsMandatory) - forMandatory=true uses (true,true), else (true,false).
 */
export function ModuleCombobox({
  forMandatory = true,
  value = null,
  onChange,
  onBlur,
  isDisable = false,
  placeholder = "Select module...",
  label,
  isRequired = false,
  error,
  dataItemKey = "moduleId",
  textField = "moduleName",
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
}: ModuleComboboxProps) {
  const { data = [], isLoading } = useModuleLookup(true, forMandatory);
  const [filteredData, setFilteredData] = useState<IModuleLookup[]>(data);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const filterData = (filter: FilterDescriptor) => {
    const source = filteredData.slice();
    return filterBy(source, filter);
  };

  const filterChange = (event: ComboBoxFilterChangeEvent) => {
    const newData =
      event.filter.value.length > 2 ? filterData(event.filter) : data.slice();
    setFilteredData(newData);
  };

  const resolvedValue = useMemo(() => {
    if (value == null || value.moduleId == null) return null;
    const idVal = Number(value.moduleId);
    if (!idVal) return null;
    const found = data.find((item) => Number(item.moduleId) === idVal);
    return found ?? value;
  }, [value, data]);

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
