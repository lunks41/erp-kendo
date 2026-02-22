"use client";

import { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Loader } from "@progress/kendo-react-indicators";
import { TextArea } from "@progress/kendo-react-inputs";

export interface CancelConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmAction: (cancelRemarks: string) => void | Promise<void>;
  onCancelAction?: () => void;
  title?: string;
  itemName?: string;
  description?: string;
  isCancelling?: boolean;
}

export function CancelConfirmation({
  open,
  onOpenChange,
  onConfirmAction,
  onCancelAction,
  title = "Cancel Invoice",
  itemName = "invoice",
  description = "Please provide a reason for cancelling this invoice.",
  isCancelling = false,
}: CancelConfirmationProps) {
  const [remarks, setRemarks] = useState("");

  if (!open) return null;

  const handleClose = () => {
    setRemarks("");
    onCancelAction?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    await onConfirmAction(remarks);
    setRemarks("");
    onOpenChange(false); // Parent may also close; ensure UI resets
  };

  return (
    <Dialog title={title} onClose={handleClose} width={480} closeIcon>
      <div className="space-y-3 py-2">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {description}
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Cancel Remarks
          </label>
          <TextArea
            value={remarks}
            onChange={(e) => setRemarks(e.value ?? "")}
            rows={3}
            className="w-full"
          />
        </div>
      </div>
      <DialogActionsBar>
        <Button fillMode="flat" onClick={handleClose} disabled={isCancelling}>
          Close
        </Button>
        <Button
          themeColor="error"
          onClick={handleConfirm}
          disabled={isCancelling || !remarks.trim()}
        >
          {isCancelling ? (
            <>
              <Loader
                type="converging-spinner"
                size="small"
                className="mr-2"
              />
              Cancelling...
            </>
          ) : (
            `Cancel ${itemName}`
          )}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}
