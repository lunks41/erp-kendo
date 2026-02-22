"use client";

import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";

export type ConfirmationType = "save" | "delete" | "cancel" | "reset" | "confirm";

const CONFIG: Record<
  ConfirmationType,
  { title: string; confirmLabel: string; themeColor: "primary" | "error" | "warning" | "secondary" }
> = {
  save: {
    title: "Confirm Save",
    confirmLabel: "Save",
    themeColor: "primary",
  },
  delete: {
    title: "Confirm Delete",
    confirmLabel: "Delete",
    themeColor: "error",
  },
  cancel: {
    title: "Confirm Cancel",
    confirmLabel: "Yes, Cancel",
    themeColor: "secondary",
  },
  reset: {
    title: "Confirm Reset",
    confirmLabel: "Reset",
    themeColor: "warning",
  },
  confirm: {
    title: "Confirm",
    confirmLabel: "Confirm",
    themeColor: "primary",
  },
};

export interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  type?: ConfirmationType;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  width?: number | string;
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  type = "confirm",
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  loading = false,
  width = 400,
}: ConfirmationDialogProps) {
  if (!open) return null;

  const config = CONFIG[type];
  const dialogTitle = title ?? config.title;
  const confirmText = confirmLabel ?? config.confirmLabel;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog
      title={dialogTitle}
      onClose={onClose}
      width={width}
      closeIcon={true}
    >
      <p className="py-2 text-sm text-slate-700 dark:text-slate-300">
        {message}
      </p>
      <DialogActionsBar>
        <Button
          type="button"
          fillMode="flat"
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          themeColor={config.themeColor}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Please wait..." : confirmText}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}
