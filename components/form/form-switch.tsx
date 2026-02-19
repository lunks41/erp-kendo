"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Switch } from "@progress/kendo-react-inputs";
import { FormField } from "./form-field";

export interface FormSwitchProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  className?: string;
  isDisable?: boolean;
  onLabel?: string;
  offLabel?: string;
}

/**
 * Reusable form field with Kendo Switch and react-hook-form Controller.
 */
export function FormSwitch<T extends FieldValues>({
  control,
  name,
  label,
  error,
  className,
  isDisable,
  onLabel,
  offLabel,
}: FormSwitchProps<T>) {
  return (
    <FormField label={label} error={error} className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Switch
            checked={field.value ?? false}
            onChange={(e) => field.onChange(e.value ?? false)}
            disabled={isDisable}
            onLabel={onLabel}
            offLabel={offLabel}
          />
        )}
      />
    </FormField>
  );
}
