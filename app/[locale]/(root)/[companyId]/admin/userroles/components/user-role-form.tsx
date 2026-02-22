"use client";

import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IUserRole } from "@/interfaces/admin";
import { UserRoleSchemaType, userRoleSchema } from "@/schemas/admin";
import { Form, FormInput, FormSwitch, FormTextArea, FormField } from "@/components/ui/form";
import { TextBox } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";

const defaultValues: UserRoleSchemaType = {
  userRoleId: 0,
  userRoleCode: "",
  userRoleName: "",
  remarks: "",
  isActive: true,
};

interface UserRoleFormProps {
  initialData?: IUserRole;
  submitAction: (data: UserRoleSchemaType) => void;
  onCancelAction?: () => void;
  isSubmitting?: boolean;
  isReadOnly?: boolean;
  onSaveConfirmation?: (data: UserRoleSchemaType) => void;
  onCodeBlur?: (code: string) => void;
}

export function UserRoleForm({
  initialData,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isReadOnly = false,
  onSaveConfirmation,
  onCodeBlur,
}: UserRoleFormProps) {
  const form = useForm<UserRoleSchemaType>({
    resolver: zodResolver(userRoleSchema),
    defaultValues: initialData
      ? {
          userRoleId: initialData.userRoleId ?? 0,
          userRoleCode: initialData.userRoleCode ?? "",
          userRoleName: initialData.userRoleName ?? "",
          remarks: initialData.remarks ?? "",
          isActive: initialData.isActive ?? true,
        }
      : defaultValues,
  });

  useEffect(() => {
    form.reset(
      initialData
        ? {
            userRoleId: initialData.userRoleId ?? 0,
            userRoleCode: initialData.userRoleCode ?? "",
            userRoleName: initialData.userRoleName ?? "",
            remarks: initialData.remarks ?? "",
            isActive: initialData.isActive ?? true,
          }
        : defaultValues
    );
  }, [initialData, form]);

  const onSubmit = (data: UserRoleSchemaType) => {
    if (onSaveConfirmation) onSaveConfirmation(data);
    else submitAction(data);
  };

  const handleCodeBlur = () => {
    const code = form.getValues("userRoleCode");
    if (code) onCodeBlur?.(code);
  };

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="userRoleCode"
              control={form.control}
              render={({ field }) => (
                <FormField
                  label="Role Code"
                  isRequired
                  error={form.formState.errors.userRoleCode?.message}
                >
                  <TextBox
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.value)}
                    onBlur={() => {
                      field.onBlur();
                      handleCodeBlur();
                    }}
                    disabled={isReadOnly || !!initialData}
                    placeholder="Enter role code"
                    valid={!form.formState.errors.userRoleCode}
                    fillMode="outline"
                    rounded="medium"
                    className="w-full"
                  />
                </FormField>
              )}
            />
            <FormInput
              control={form.control}
              name="userRoleName"
              label="Role Name"
              isRequired
              isDisable={isReadOnly}
              placeholder="Enter role name"
            />
          </div>
          <FormTextArea
            control={form.control}
            name="remarks"
            label="Remarks"
            isDisable={isReadOnly}
          />
          <FormSwitch
            control={form.control}
            name="isActive"
            label="Active Status"
            isDisable={isReadOnly}
          />
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button fillMode="flat" type="button" onClick={onCancelAction}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit" themeColor="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update User Role"
                    : "Create User Role"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
