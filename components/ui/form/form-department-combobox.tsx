"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { DepartmentCombobox } from "@/components/ui/combobox/department-combobox";
import { FormField } from "./form-field";
import type { IDepartmentLookup } from "@/interfaces/lookup";

export interface FormDepartmentComboboxProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  isRequired?: boolean;
  className?: string;
  placeholder?: string;
  /** Called to sync departmentCode, departmentName when selection changes */
  onSelect?: (v: IDepartmentLookup | null) => void;
}

/**
 * Form-integrated Department ComboBox.
 * Controller is inside - pass control and name.
 */
export function FormDepartmentCombobox<T extends FieldValues>({
  control,
  name,
  label = "Department",
  isRequired = false,
  className = "",
  placeholder = "Select Department...",
  onSelect,
}: FormDepartmentComboboxProps<T>) {
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
          <DepartmentCombobox
            value={
              (field.value as number) > 0
                ? ({ departmentId: field.value } as unknown as IDepartmentLookup)
                : null
            }
            onChange={(v) => {
              field.onChange(v?.departmentId ?? 0);
              onSelect?.(v);
            }}
            onBlur={field.onBlur}
            label={undefined}
            placeholder={placeholder}
            className="w-full min-w-0"
            style={{ minWidth: 0 }}
          />
        )}
      />
    </FormField>
  );
}
