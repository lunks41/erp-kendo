"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useResetPasswordV1 } from "@/hooks/use-admin";
import { Button } from "@progress/kendo-react-buttons";
import { TextBox } from "@progress/kendo-react-inputs";
import { FormField } from "@/components/ui/form";

interface ResetPasswordProps {
  userId: number;
  userCode: string;
  onCancelAction: () => void;
  onSuccessAction?: () => void;
}

export function ResetPassword({
  userId,
  userCode,
  onCancelAction,
  onSuccessAction,
}: ResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const resetMutation = useResetPasswordV1();

  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
    setErrors({});
  }, [userId]);

  const validate = () => {
    const e: { password?: string; confirm?: string } = {};
    if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const response = await resetMutation.mutateAsync({
        userId,
        userCode,
        userPassword: password,
        confirmPassword,
      });
      if (response.result === 1) {
        onSuccessAction?.();
      }
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <FormField label="New Password" isRequired error={errors.password}>
        <div className="relative">
          <TextBox
            value={password}
            onChange={(e) => {
              setPassword(String(e.value ?? ""));
              if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
            }}
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            fillMode="outline"
            rounded="medium"
            className="w-full pr-10"
          />
          <Button
            type="button"
            fillMode="flat"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </FormField>
      <FormField label="Confirm Password" isRequired error={errors.confirm}>
        <div className="relative">
          <TextBox
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(String(e.value ?? ""));
              if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined }));
            }}
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            fillMode="outline"
            rounded="medium"
            className="w-full pr-10"
          />
          <Button
            type="button"
            fillMode="flat"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </FormField>
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button fillMode="flat" onClick={onCancelAction} disabled={resetMutation.isPending}>
          Cancel
        </Button>
        <Button
          themeColor="primary"
          onClick={handleSubmit}
          disabled={resetMutation.isPending || !password || !confirmPassword}
        >
          {resetMutation.isPending ? "Resetting..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
