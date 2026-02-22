"use client";

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Key } from "lucide-react";
import type { IUser } from "@/interfaces/admin";
import { UserSchemaType, userSchema } from "@/schemas/admin";
import { Form, FormInput, FormSwitch, FormTextArea, FormField } from "@/components/ui/form";
import { TextBox } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { UserGroupCombobox } from "@/components/ui/combobox/user-group-combobox";
import { UserRoleCombobox } from "@/components/ui/combobox/user-role-combobox";
import { EmployeeCombobox } from "@/components/ui/combobox/employee-combobox";
import { ResetPassword } from "./reset-password";

const defaultValues: UserSchemaType = {
  userId: 0,
  userCode: "",
  userName: "",
  userEmail: "",
  userGroupId: 0,
  userRoleId: 0,
  employeeId: 0,
  isActive: true,
  isLocked: false,
  remarks: "",
};

interface UserFormProps {
  initialData?: IUser;
  submitAction: (data: UserSchemaType) => void;
  onCancelAction?: () => void;
  isSubmitting?: boolean;
  isReadOnly?: boolean;
  onSaveConfirmation?: (data: UserSchemaType) => void;
  onCodeBlur?: (code: string) => void;
}

export function UserForm({
  initialData,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isReadOnly = false,
  onSaveConfirmation,
  onCodeBlur,
}: UserFormProps) {
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const form = useForm<UserSchemaType>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData
      ? {
          userId: initialData.userId ?? 0,
          userCode: initialData.userCode ?? "",
          userName: initialData.userName ?? "",
          userEmail: initialData.userEmail ?? "",
          userGroupId: initialData.userGroupId ?? 0,
          userRoleId: initialData.userRoleId ?? 0,
          employeeId: initialData.employeeId ?? 0,
          isActive: initialData.isActive ?? true,
          isLocked: initialData.isLocked ?? false,
          remarks: initialData.remarks ?? "",
        }
      : defaultValues,
  });

  useEffect(() => {
    form.reset(
      initialData
        ? {
            userId: initialData.userId ?? 0,
            userCode: initialData.userCode ?? "",
            userName: initialData.userName ?? "",
            userEmail: initialData.userEmail ?? "",
            userGroupId: initialData.userGroupId ?? 0,
            userRoleId: initialData.userRoleId ?? 0,
            employeeId: initialData.employeeId ?? 0,
            isActive: initialData.isActive ?? true,
            isLocked: initialData.isLocked ?? false,
            remarks: initialData.remarks ?? "",
          }
        : defaultValues
    );
  }, [initialData, form]);

  const onSubmit = (data: UserSchemaType) => {
    if (onSaveConfirmation) {
      onSaveConfirmation(data);
    } else {
      submitAction(data);
    }
  };

  const handleCodeBlur = () => {
    const code = form.getValues("userCode");
    if (code) onCodeBlur?.(code);
  };

  const userGroupId = form.watch("userGroupId");
  const userRoleId = form.watch("userRoleId");
  const employeeId = form.watch("employeeId");

  const userGroupValue =
    userGroupId > 0
      ? ({ userGroupId, userGroupCode: "", userGroupName: "" } as import("@/interfaces/lookup").IUserGroupLookup)
      : null;
  const userRoleValue =
    userRoleId > 0
      ? ({ userRoleId, userRoleCode: "", userRoleName: "" } as import("@/interfaces/lookup").IUserRoleLookup)
      : null;
  const employeeValue =
    employeeId > 0
      ? ({ employeeId, employeeCode: "", employeeName: "" } as import("@/interfaces/lookup").IEmployeeLookup)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Controller
              name="userCode"
              control={form.control}
              render={({ field }) => (
                <FormField label="User Code" isRequired error={form.formState.errors.userCode?.message}>
                  <TextBox
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.value)}
                    onBlur={() => {
                      field.onBlur();
                      handleCodeBlur();
                    }}
                    disabled={isReadOnly || !!initialData}
                    placeholder="Enter user code"
                    valid={!form.formState.errors.userCode}
                    fillMode="outline"
                    rounded="medium"
                    className="w-full"
                  />
                </FormField>
              )}
            />
            <FormInput
              control={form.control}
              name="userName"
              label="Username"
              isRequired
              isDisable={isReadOnly}
              placeholder="Enter username"
            />
            <FormInput
              control={form.control}
              name="userEmail"
              label="Email"
              isRequired
              isDisable={isReadOnly}
              placeholder="Enter email"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Controller
              name="userGroupId"
              control={form.control}
              render={({ field }) => (
                <UserGroupCombobox
                  value={userGroupValue}
                  onChange={(v) => field.onChange(v?.userGroupId ?? 0)}
                  label="Group"
                  isRequired
                  isDisable={isReadOnly}
                />
              )}
            />
            <Controller
              name="userRoleId"
              control={form.control}
              render={({ field }) => (
                <UserRoleCombobox
                  value={userRoleValue}
                  onChange={(v) => field.onChange(v?.userRoleId ?? 0)}
                  label="Role"
                  isRequired
                  isDisable={isReadOnly}
                />
              )}
            />
            <Controller
              name="employeeId"
              control={form.control}
              render={({ field }) => (
                <EmployeeCombobox
                  value={employeeValue}
                  onChange={(v) => field.onChange(v?.employeeId ?? 0)}
                  label="Employee"
                  isDisable={isReadOnly}
                />
              )}
            />
          </div>
          <FormTextArea
            control={form.control}
            name="remarks"
            label="Remarks"
            isDisable={isReadOnly}
            placeholder="Enter remarks"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormSwitch
              control={form.control}
              name="isActive"
              label="Active Status"
              isDisable={isReadOnly}
            />
            <FormSwitch
              control={form.control}
              name="isLocked"
              label="Lock Status"
              isDisable={isReadOnly}
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
            {initialData && !isReadOnly && (
              <Button
                type="button"
                fillMode="flat"
                onClick={() => setIsResetPasswordOpen(true)}
                className="flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Reset Password
              </Button>
            )}
            <Button fillMode="flat" type="button" onClick={onCancelAction}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button
                type="submit"
                themeColor="primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update User"
                    : "Create User"}
              </Button>
            )}
          </div>
        </form>
      </Form>

      {isResetPasswordOpen && initialData && (
        <Dialog
          title="Reset Password"
          onClose={() => setIsResetPasswordOpen(false)}
          width={420}
        >
          <ResetPassword
            userId={initialData.userId}
            userCode={initialData.userCode}
            onCancelAction={() => setIsResetPasswordOpen(false)}
            onSuccessAction={() => setIsResetPasswordOpen(false)}
          />
        </Dialog>
      )}
    </div>
  );
}
