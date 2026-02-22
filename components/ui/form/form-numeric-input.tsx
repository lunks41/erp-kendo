"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { NumericTextBox } from "@progress/kendo-react-inputs";
import { FormField } from "./form-field";

export interface FormNumericInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  isRequired?: boolean;
  disabled?: boolean;
  className?: string;
  /** Decimal places format (e.g. 2 for n2, 0 for n0) */
  format?: string | number;
  /** Text alignment: right for amounts/quantities, left for item/seq numbers */
  alignRight?: boolean;
  error?: string;
}

/**
 * Reusable numeric input with right-aligned numbers for amounts/quantities.
 * Wraps Kendo NumericTextBox with FormField.
 */
export function FormNumericInput<T extends FieldValues>({
  control,
  name,
  label,
  isRequired = false,
  disabled = false,
  className = "",
  format = 2,
  alignRight = true,
  error = "",
}: FormNumericInputProps<T>) {
  const fmt = typeof format === "number" ? `n${format}` : format;
  return (
    <FormField
      label={label}
      isRequired={isRequired}
      error={error}
      className={className}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <NumericTextBox
            value={field.value ?? 0}
            onChange={(e) => field.onChange(e.value ?? 0)}
            onBlur={field.onBlur}
            disabled={disabled}
            format={fmt}
            fillMode="outline"
            rounded="medium"
            spinners={false}
            className={`w-full ${alignRight ? "[&_input]:text-right" : ""}`}
          />
        )}
      />
    </FormField>
  );
}
