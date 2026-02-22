"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Checkbox } from "@progress/kendo-react-inputs";
import { FormField } from "./form-field";

export interface FormCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  labelPlacement?: "before" | "after";
}

/**
 * Reusable form field with Kendo Checkbox and react-hook-form Controller.
 */
export function FormCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  error,
  className,
  disabled = false,
  labelPlacement = "after",
}: FormCheckboxProps<T>) {
  return (
    <FormField label={label} error={error} className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Checkbox
            checked={field.value ?? false}
            onChange={(e) => field.onChange(e.value ?? false)}
            onBlur={field.onBlur}
            disabled={disabled}
            label={undefined}
            labelPlacement={labelPlacement}
            valid={!error}
          />
        )}
      />
    </FormField>
  );
}
