"use client";

import { useMemo, useState } from "react";
import {
  ComboBox,
  ComboBoxFilterChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { filterBy, FilterDescriptor } from "@progress/kendo-data-query";
import { FormField } from "@/components/ui/form";
import {
  useCOACategory1Lookup,
  useCOACategory2Lookup,
  useCOACategory3Lookup,
} from "@/hooks/use-lookup";
import type {
  ICOACategory1Lookup,
  ICOACategory2Lookup,
  ICOACategory3Lookup,
} from "@/interfaces/lookup";

const NONE_ITEM = {
  coaCategoryId: 0,
  coaCategoryCode: "",
  coaCategoryName: "",
};

type COACategoryLookup =
  | ICOACategory1Lookup
  | ICOACategory2Lookup
  | ICOACategory3Lookup;

export interface COACategoryComboboxProps {
  variant: 1 | 2 | 3;
  /** Selected item or partial { coaCategoryId } for resolution from data */
  value?: COACategoryLookup | { coaCategoryId?: number } | null;
  onChange?: (value: COACategoryLookup | null) => void;
  onBlur?: () => void;
  isDisable?: boolean;
  placeholder?: string;
  label?: string;
  isRequired?: boolean;
  error?: string;
  /** Include a "None" option for Category 2 and 3 so users can clear the selection */
  includeNone?: boolean;
  fillMode?: "solid" | "flat" | "outline";
  rounded?: "small" | "medium" | "full" | "none";
  size?: "small" | "medium" | "large";
  className?: string;
  id?: string;
}

export function COACategoryCombobox({
  variant,
  value = null,
  onChange,
  onBlur,
  isDisable = false,
  placeholder = "Select category...",
  label,
  isRequired = false,
  error,
  includeNone = false,
  fillMode = "outline",
  rounded = "medium",
  size = "medium",
  className,
  id,
}: COACategoryComboboxProps) {
  const lookup1 = useCOACategory1Lookup();
  const lookup2 = useCOACategory2Lookup();
  const lookup3 = useCOACategory3Lookup();

  const { data: rawData = [], isLoading } =
    variant === 1 ? lookup1 : variant === 2 ? lookup2 : lookup3;

  const data = useMemo(
    () =>
      includeNone ? [NONE_ITEM as COACategoryLookup, ...rawData] : rawData,
    [rawData, includeNone],
  );

  const [filterValue, setFilterValue] = useState("");
  const dataItemKey = "coaCategoryId";
  const textField = "coaCategoryName";

  const filteredData = useMemo(() => {
    if (!filterValue || filterValue.length <= 2) return data;
    return filterBy(data.slice(), {
      field: textField,
      value: filterValue,
      operator: "contains",
      ignoreCase: true,
    } as FilterDescriptor);
  }, [data, filterValue]);

  const filterChange = (event: ComboBoxFilterChangeEvent) => {
    setFilterValue(event.filter?.value ?? "");
  };

  const resolvedValue = useMemo(() => {
    if (value == null || value.coaCategoryId == null) return null;
    const idNum = Number(value.coaCategoryId);
    if (!idNum) return NONE_ITEM as COACategoryLookup;
    return data.find((item) => Number(item.coaCategoryId) === idNum) ?? value;
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

  const handleChange = (v: COACategoryLookup | null) => {
    if (v && Number(v.coaCategoryId) === 0) {
      onChange?.(null);
    } else {
      onChange?.(v);
    }
  };

  const combobox = (
    <ComboBox
      id={id}
      data={dataWithValue}
      value={resolvedValue}
      onFilterChange={filterChange}
      onChange={(e) => handleChange(e.value ?? null)}
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
