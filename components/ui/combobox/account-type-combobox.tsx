"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ComboBox,
  ComboBoxFilterChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { filterBy, FilterDescriptor } from "@progress/kendo-data-query";
import { FormField, REQUIRED_FIELD_BOX_CLASS } from "@/components/ui/form";
import { useAccountTypeLookup } from "@/hooks/use-lookup";
import type { IAccountTypeLookup } from "@/interfaces/lookup";

export interface AccountTypeComboboxProps {
  /** Selected item or partial { accTypeId } for resolution from data */
  value?: IAccountTypeLookup | { accTypeId?: number } | null;
  onChange?: (value: IAccountTypeLookup | null) => void;
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

export function AccountTypeCombobox({
  value = null,
  onChange,
  onBlur,
  isDisable = false,
  placeholder = "Select account type...",
  label,
  isRequired = false,
  error,
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
}: AccountTypeComboboxProps) {
  const { data = [], isLoading } = useAccountTypeLookup();
  const [filteredData, setFilteredData] = useState<IAccountTypeLookup[]>(data);
  const dataItemKey = "accTypeId";
  const textField = "accTypeName";

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
    const idRaw = (value as { accTypeId?: number }).accTypeId;
    if (idRaw == null) return null;
    const idNum = Number(idRaw);
    if (!idNum) return null;
    const found = data.find((item) => Number(item.accTypeId) === idNum);
    return found ?? (value as IAccountTypeLookup);
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
