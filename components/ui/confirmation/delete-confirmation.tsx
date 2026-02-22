"use client";

import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Loader } from "@progress/kendo-react-indicators";

export interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onCancelAction?: () => void;
  title?: string;
  itemName?: string;
  isDeleting?: boolean;
}

export function DeleteConfirmation({
  open,
  onOpenChange,
  onConfirm,
  onCancelAction,
  title = "Delete",
  itemName = "item",
  isDeleting = false,
}: DeleteConfirmationProps) {
  if (!open) return null;

  const handleClose = () => {
    onCancelAction?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog title={title} onClose={handleClose} width={420} closeIcon={true}>
      <p className="py-2 text-sm text-slate-700 dark:text-slate-300">
        Are you sure you want to delete &quot;{itemName}&quot;? This action
        cannot be undone.
      </p>
      <DialogActionsBar>
        <Button fillMode="flat" onClick={handleClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          themeColor="error"
          onClick={handleConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader type="converging-spinner" size="small" className="mr-2" />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}
