"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { TextArea } from "@progress/kendo-react-inputs";
import { FormField } from "./form-field";

export interface FormTextAreaProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  isRequired?: boolean;
  error?: string;
  className?: string;
  isDisable?: boolean;
  placeholder?: string;
  /** Kendo TextArea valid prop (e.g. !errors.fieldName) */
  valid?: boolean;
  /** Initial number of rows */
  rows?: number;
}

/**
 * Reusable form field with Kendo TextArea and react-hook-form Controller.
 */
export function FormTextArea<T extends FieldValues>({
  control,
  name,
  label,
  isRequired = false,
  error,
  className,
  isDisable,
  placeholder,
  valid = true,
  rows = 3,
}: FormTextAreaProps<T>) {
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
          <TextArea
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.value)}
            onBlur={field.onBlur}
            disabled={isDisable}
            placeholder={placeholder}
            rows={rows}
            className="w-full resize-y"
            valid={valid}
          />
        )}
      />
    </FormField>
  );
}
