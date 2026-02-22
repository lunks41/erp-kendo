"use client";

import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Loader } from "@progress/kendo-react-indicators";

export interface LoadConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad: () => void;
  onCancelAction?: () => void;
  code?: string;
  name?: string;
  typeLabel?: string;
  isLoading?: boolean;
}

export function LoadConfirmation({
  open,
  onOpenChange,
  onLoad,
  onCancelAction,
  code,
  name,
  typeLabel = "record",
  isLoading = false,
}: LoadConfirmationProps) {
  if (!open) return null;

  const handleClose = () => {
    onCancelAction?.();
    onOpenChange(false);
  };

  const handleLoad = () => {
    onLoad();
  };

  return (
    <Dialog
      title={`Load Existing ${typeLabel}`}
      onClose={handleClose}
      width={420}
      closeIcon={true}
    >
      <p className="py-2 text-sm text-slate-700 dark:text-slate-300">
        {code || name
          ? `A ${typeLabel} with code &quot;${code || ""}&quot; and name &quot;${name || ""}&quot; was found. Do you want to load it?`
          : `An existing ${typeLabel} was found. Do you want to load it?`}
      </p>
      <DialogActionsBar>
        <Button fillMode="flat" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button themeColor="primary" onClick={handleLoad} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader type="converging-spinner" size="small" className="mr-2" />
              Loading...
            </>
          ) : (
            "Load"
          )}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}
