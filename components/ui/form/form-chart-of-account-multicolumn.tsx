"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { ChartOfAccountMultiColumn } from "@/components/ui/multicolumn";
import { FormField } from "./form-field";
import type { IChartOfAccountLookup } from "@/interfaces/lookup";

export interface FormChartOfAccountMultiColumnProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  companyId: number;
  label?: string;
  isRequired?: boolean;
  className?: string;
  placeholder?: string;
  /** Display values when value not in dropdown data */
  glCode?: string;
  glName?: string;
  /** Called to sync glCode, glName when selection changes */
  onSelect?: (v: IChartOfAccountLookup | null) => void;
}

/**
 * Form-integrated Chart of Account with multicolumn (Code, Name).
 * Controller is inside - pass control and name.
 */
export function FormChartOfAccountMultiColumn<T extends FieldValues>({
  control,
  name,
  companyId,
  label = "Chart Of Account",
  isRequired = false,
  className = "",
  placeholder = "Select Chart of Account...",
  glCode,
  glName,
  onSelect,
}: FormChartOfAccountMultiColumnProps<T>) {
  return (
    <FormField
      label={label}
      isRequired={isRequired}
      className={className}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <ChartOfAccountMultiColumn
            value={
              (field.value as number) > 0
                ? ({ glId: field.value, glCode: glCode ?? "", glName: glName ?? "" } as unknown as IChartOfAccountLookup)
                : null
            }
            onChange={(v) => {
              field.onChange(v?.glId ?? 0);
              onSelect?.(v);
            }}
            onBlur={field.onBlur}
            companyId={companyId}
            placeholder={placeholder}
            className="w-full min-w-0"
            style={{ minWidth: 0 }}
          />
        )}
      />
    </FormField>
  );
}
