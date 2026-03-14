"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ComboBox,
  ComboBoxFilterChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { filterBy, FilterDescriptor } from "@progress/kendo-data-query";
import { FormField, REQUIRED_FIELD_BOX_CLASS } from "@/components/ui/form";
import { useAccountGroupLookup } from "@/hooks/use-lookup";
import type { IAccountGroupLookup } from "@/interfaces/lookup";

export interface AccountGroupComboboxProps {
  /** Selected item or partial { accGroupId } for resolution from data */
  value?: IAccountGroupLookup | { accGroupId?: number } | null;
  onChange?: (value: IAccountGroupLookup | null) => void;
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

export function AccountGroupCombobox({
  value = null,
  onChange,
  onBlur,
  isDisable = false,
  placeholder = "Select account group...",
  label,
  isRequired = false,
  error,
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
}: AccountGroupComboboxProps) {
  const { data = [], isLoading } = useAccountGroupLookup();
  const [filteredData, setFilteredData] = useState<IAccountGroupLookup[]>(data);
  const dataItemKey = "accGroupId";
  const textField = "accGroupName";

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const filterChange = (event: ComboBoxFilterChangeEvent) => {
    const value = event.filter?.value ?? "";
    if (value.length > 2) {
      setFilteredData(
        filterBy(data.slice(), {
          field: textField,
          operator: "contains",
          value,
          ignoreCase: true,
        } as FilterDescriptor),
      );
    } else {
      setFilteredData(data.slice());
    }
  };

  const resolvedValue = useMemo(() => {
    if (value == null) return null;
    const idRaw = (value as { accGroupId?: number }).accGroupId;
    if (idRaw == null) return null;
    const idNum = Number(idRaw);
    if (!idNum) return null;
    const found = data.find((item) => Number(item.accGroupId) === idNum);
    return found ?? (value as IAccountGroupLookup);
  }, [value, data]);

  const dataWithValue = useMemo(() => {
    if (resolvedValue == null) return filteredData;
    const keyNum = Number(
      (resolvedValue as unknown as Record<string, unknown>)[dataItemKey],
    );
    const exists = filteredData.some(
      (item) =>
        Number((item as unknown as Record<string, unknown>)[dataItemKey]) ===
        keyNum,
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
