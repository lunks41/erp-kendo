"use client";

import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Loader } from "@progress/kendo-react-indicators";

export interface SaveConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onCancelAction?: () => void;
  title?: string;
  itemName?: string;
  operationType?: "create" | "update";
  isSaving?: boolean;
}

export function SaveConfirmation({
  open,
  onOpenChange,
  onConfirm,
  onCancelAction,
  title = "Save",
  itemName = "item",
  operationType = "update",
  isSaving = false,
}: SaveConfirmationProps) {
  if (!open) return null;

  const handleClose = () => {
    onCancelAction?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  const confirmTitle = title || (operationType === "create" ? "Create" : "Update");
  const message =
    operationType === "create"
      ? `Are you sure you want to create "${itemName}"?`
      : `Are you sure you want to update "${itemName}"?`;

  return (
    <Dialog
      title={confirmTitle}
      onClose={handleClose}
      width={420}
      closeIcon={true}
    >
      <p className="py-2 text-sm text-slate-700 dark:text-slate-300">
        {message}
      </p>
      <DialogActionsBar>
        <Button fillMode="flat" onClick={handleClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button themeColor="primary" onClick={handleConfirm} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader type="converging-spinner" size="small" className="mr-2" />
              Saving...
            </>
          ) : operationType === "create" ? (
            "Create"
          ) : (
            "Update"
          )}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}
