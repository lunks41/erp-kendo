"use client";

import { useEffect, useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Checkbox } from "@progress/kendo-react-inputs";
import {
  useVisibleFieldbyidGet,
  useVisibleFieldSave,
} from "@/hooks/use-settings";
import { ModuleCombobox } from "@/components/ui/combobox/module-combobox";
import { SaveConfirmation } from "@/components/ui/confirmation";
import { toast } from "@/components/layout/notification-container";
import type { IModuleLookup } from "@/interfaces/lookup";
import type { IVisibleFields } from "@/interfaces/setting";
import type { IApiSuccessResponse } from "@/interfaces/auth";

const VISIBLE_COLUMNS: { field: keyof IVisibleFields; label: string }[] = [
  { field: "m_ProductId", label: "Product" },
  { field: "m_QTY", label: "QTY" },
  { field: "m_BillQTY", label: "Bill QTY" },
  { field: "m_UomId", label: "UOM" },
  { field: "m_UnitPrice", label: "Unit Price" },
  { field: "m_Remarks", label: "Remarks" },
  { field: "m_GstId", label: "GST" },
  { field: "m_GstClaimDate", label: "GST Claim Date" },
  { field: "m_TrnDate", label: "Trn Date" },
  { field: "m_DeliveryDate", label: "Delivery Date" },
  { field: "m_DepartmentId", label: "Department" },
  { field: "m_JobOrderId", label: "Job Order" },
  { field: "m_EmployeeId", label: "Employee" },
  { field: "m_PortId", label: "Port" },
  { field: "m_VesselId", label: "Vessel" },
  { field: "m_BargeId", label: "Barge" },
  { field: "m_VoyageId", label: "Voyage" },
  { field: "m_SupplyDate", label: "Supply Date" },
  { field: "m_BankId", label: "Bank" },
  { field: "m_CtyCurr", label: "Cty Curr" },
  { field: "m_PayeeTo", label: "Payee To" },
  { field: "m_ServiceCategoryId", label: "Service Category" },
  { field: "m_OtherRemarks", label: "Other Remarks" },
  { field: "m_JobOrderIdHd", label: "Job Order (Hd)" },
  { field: "m_PortIdHd", label: "Port (Hd)" },
  { field: "m_VesselIdHd", label: "Vessel (Hd)" },
  { field: "m_AdvRecAmt", label: "Adv Rec Amt" },
  { field: "m_BankChgGLId", label: "Bank Chg GL" },
  { field: "m_InvoiceDate", label: "Invoice Date" },
  { field: "m_InvoiceNo", label: "Invoice No" },
  { field: "m_SupplierName", label: "Supplier Name" },
  { field: "m_GstNo", label: "GST No" },
  { field: "m_DebitNoteNo", label: "Debit Note No" },
  { field: "m_BargeIdHd", label: "Barge (Hd)" },
];

type VisibleResponse = IApiSuccessResponse<IVisibleFields[]>;

export function VisibleTable() {
  const [selectedModuleId, setSelectedModuleId] = useState<number>(0);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [rows, setRows] = useState<IVisibleFields[]>([]);

  const {
    data: visibleResponse,
    isLoading,
    isError,
    refetch,
  } = useVisibleFieldbyidGet(selectedModuleId);
  const { mutate: saveVisible, isPending } = useVisibleFieldSave();

  useEffect(() => {
    if (visibleResponse && selectedModuleId > 0) {
      const res = visibleResponse as VisibleResponse;
      if (res.result === 1 && Array.isArray(res.data)) {
        setRows(res.data);
      } else {
        setRows([]);
      }
    } else {
      setRows([]);
    }
  }, [visibleResponse, selectedModuleId]);

  const onSubmit = () => setShowSaveConfirmation(true);

  const handleConfirmSave = () => {
    saveVisible(
      { data: rows },
      {
        onSuccess: (response) => {
          const r = response as VisibleResponse;
          if (r.result === -1) {
            toast.error(r.message || "Failed to save visible fields");
            return;
          }
          if (r.result === 1) {
            toast.success(r.message || "Visible fields saved successfully");
            refetch();
          }
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to save visible fields"
          );
        },
      }
    );
  };

  const handleCheckChange = (
    moduleId: number,
    transactionId: number,
    field: keyof IVisibleFields,
    checked: boolean
  ) => {
    setRows((prev) =>
      prev.map((r) =>
        r.moduleId === moduleId && r.transactionId === transactionId
          ? { ...r, [field]: checked }
          : r
      )
    );
  };

  const toModule = (id: number): IModuleLookup | null =>
    id > 0 ? ({ moduleId: id, moduleCode: "", moduleName: "" } as IModuleLookup) : null;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border p-8">
        <p className="text-rose-500">Failed to load visible field settings</p>
        <Button fillMode="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <ModuleCombobox
            forMandatory={false}
            value={toModule(selectedModuleId)}
            onChange={(v) => setSelectedModuleId(v?.moduleId ?? 0)}
            label="Module"
            placeholder="Select module..."
          />
          {selectedModuleId > 0 && (
            <Button
              type="submit"
              themeColor="primary"
              size="medium"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          )}
        </div>

        {selectedModuleId > 0 && (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="h-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ) : rows.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No visible field settings for this module
              </p>
            ) : (
              <div className="border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 dark:bg-slate-800">
                      <th className="px-3 py-2 text-left font-medium">
                        Transaction
                      </th>
                      {VISIBLE_COLUMNS.slice(0, 12).map(({ field, label }) => (
                        <th
                          key={field}
                          className="px-2 py-2 text-center font-medium"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr
                        key={`${row.moduleId}-${row.transactionId}-${idx}`}
                        className="border-b"
                      >
                        <td className="px-3 py-2">
                          {row.transactionName ?? row.transactionId}
                        </td>
                        {VISIBLE_COLUMNS.slice(0, 12).map(({ field }) => (
                          <td key={field} className="px-2 py-1 text-center">
                            <Checkbox
                              checked={
                                (row[field as keyof IVisibleFields] as boolean) ??
                                false
                              }
                              onChange={(e) =>
                                handleCheckChange(
                                  row.moduleId,
                                  row.transactionId,
                                  field as keyof IVisibleFields,
                                  e.value ?? false
                                )
                              }
                              size="small"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </form>

      <SaveConfirmation
        title="Save Visible Fields"
        itemName="visible field settings"
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={isPending}
        operationType="update"
      />
    </div>
  );
}
