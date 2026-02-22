"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { TextBox } from "@progress/kendo-react-inputs";
import { FormField } from "./form-field";

export interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  isRequired?: boolean;
  isDisable?: boolean;
  className?: string;
  placeholder?: string;
  error?: string;
  /** Kendo Input valid prop (e.g. !errors.fieldName) */
  valid?: boolean;
}

/**
 * Reusable form field with Kendo Input and react-hook-form Controller.
 * Use this for text inputs so the same pattern (label, error, Kendo Input) is reused.
 */
export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  isRequired = false,
  isDisable = false,
  className = "",
  placeholder = "",
  error = "",
  valid = true,
}: FormInputProps<T>) {
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
          <TextBox
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.value)}
            onBlur={field.onBlur}
            disabled={isDisable}
            placeholder={placeholder}
            className="w-full"
            valid={valid}
            fillMode="outline"
            rounded="medium"
          />
        )}
      />
    </FormField>
  );
}
