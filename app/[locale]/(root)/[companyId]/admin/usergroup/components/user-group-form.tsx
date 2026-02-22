"use client";

import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IUserGroup } from "@/interfaces/admin";
import { UserGroupSchemaType, userGroupSchema } from "@/schemas/admin";
import { Form, FormInput, FormSwitch, FormTextArea, FormField } from "@/components/ui/form";
import { TextBox } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";

const defaultValues: UserGroupSchemaType = {
  userGroupId: 0,
  userGroupCode: "",
  userGroupName: "",
  remarks: "",
  isActive: true,
};

interface UserGroupFormProps {
  initialData?: IUserGroup;
  submitAction: (data: UserGroupSchemaType) => void;
  onCancelAction?: () => void;
  isSubmitting?: boolean;
  isReadOnly?: boolean;
  onSaveConfirmation?: (data: UserGroupSchemaType) => void;
  onCodeBlur?: (code: string) => void;
}

export function UserGroupForm({
  initialData,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isReadOnly = false,
  onSaveConfirmation,
  onCodeBlur,
}: UserGroupFormProps) {
  const form = useForm<UserGroupSchemaType>({
    resolver: zodResolver(userGroupSchema),
    defaultValues: initialData
      ? {
          userGroupId: initialData.userGroupId ?? 0,
          userGroupCode: initialData.userGroupCode ?? "",
          userGroupName: initialData.userGroupName ?? "",
          remarks: initialData.remarks ?? "",
          isActive: initialData.isActive ?? true,
        }
      : defaultValues,
  });

  useEffect(() => {
    form.reset(
      initialData
        ? {
            userGroupId: initialData.userGroupId ?? 0,
            userGroupCode: initialData.userGroupCode ?? "",
            userGroupName: initialData.userGroupName ?? "",
            remarks: initialData.remarks ?? "",
            isActive: initialData.isActive ?? true,
          }
        : defaultValues
    );
  }, [initialData, form]);

  const onSubmit = (data: UserGroupSchemaType) => {
    if (onSaveConfirmation) onSaveConfirmation(data);
    else submitAction(data);
  };

  const handleCodeBlur = () => {
    const code = form.getValues("userGroupCode");
    if (code) onCodeBlur?.(code);
  };

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="userGroupCode"
              control={form.control}
              render={({ field }) => (
                <FormField
                  label="Group Code"
                  isRequired
                  error={form.formState.errors.userGroupCode?.message}
                >
                  <TextBox
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.value)}
                    onBlur={() => {
                      field.onBlur();
                      handleCodeBlur();
                    }}
                    disabled={isReadOnly || !!initialData}
                    placeholder="Enter group code"
                    valid={!form.formState.errors.userGroupCode}
                    fillMode="outline"
                    rounded="medium"
                    className="w-full"
                  />
                </FormField>
              )}
            />
            <FormInput
              control={form.control}
              name="userGroupName"
              label="Group Name"
              isRequired
              isDisable={isReadOnly}
              placeholder="Enter group name"
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
                    ? "Update User Group"
                    : "Create User Group"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
