"use client";

import { useEffect, useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Checkbox } from "@progress/kendo-react-inputs";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import {
  useMandatoryFieldbyidGet,
  useMandatoryFieldSave,
} from "@/hooks/use-settings";
import { ModuleCombobox } from "@/components/ui/combobox/module-combobox";
import { SaveConfirmation } from "@/components/ui/confirmation";
import { toast } from "@/components/layout/notification-container";
import type { IModuleLookup } from "@/interfaces/lookup";
import type { IMandatoryFields } from "@/interfaces/setting";
import type { IApiSuccessResponse } from "@/interfaces/auth";

const MANDATORY_COLUMNS: { field: keyof IMandatoryFields; label: string }[] = [
  { field: "m_ProductId", label: "Product" },
  { field: "m_GLId", label: "GL" },
  { field: "m_QTY", label: "QTY" },
  { field: "m_UomId", label: "UOM" },
  { field: "m_UnitPrice", label: "Unit Price" },
  { field: "m_TotAmt", label: "Total Amount" },
  { field: "m_Remarks", label: "Remarks" },
  { field: "m_GstId", label: "GST" },
  { field: "m_DeliveryDate", label: "Delivery Date" },
  { field: "m_DepartmentId", label: "Department" },
  { field: "m_JobOrderId", label: "Job Order" },
  { field: "m_EmployeeId", label: "Employee" },
  { field: "m_PortId", label: "Port" },
  { field: "m_VesselId", label: "Vessel" },
  { field: "m_BargeId", label: "Barge" },
  { field: "m_VoyageId", label: "Voyage" },
  { field: "m_SupplyDate", label: "Supply Date" },
  { field: "m_ReferenceNo", label: "Reference No" },
  { field: "m_SuppInvoiceNo", label: "Supp Invoice No" },
  { field: "m_BankId", label: "Bank" },
  { field: "m_PaymentTypeId", label: "Payment Type" },
  { field: "m_Remarks_Hd", label: "Remarks (Hd)" },
  { field: "m_Address1", label: "Address 1" },
  { field: "m_Address2", label: "Address 2" },
  { field: "m_Address3", label: "Address 3" },
  { field: "m_Address4", label: "Address 4" },
  { field: "m_PinCode", label: "Pin Code" },
  { field: "m_CountryId", label: "Country" },
  { field: "m_PhoneNo", label: "Phone No" },
  { field: "m_ContactName", label: "Contact Name" },
  { field: "m_MobileNo", label: "Mobile No" },
  { field: "m_EmailAdd", label: "Email" },
];

type MandatoryResponse = IApiSuccessResponse<IMandatoryFields[]>;

export function MandatoryTable() {
  const [selectedModuleId, setSelectedModuleId] = useState<number>(0);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [rows, setRows] = useState<IMandatoryFields[]>([]);

  const {
    data: mandatoryResponse,
    isLoading,
    isError,
    refetch,
  } = useMandatoryFieldbyidGet(selectedModuleId);
  const { mutate: saveMandatory, isPending } = useMandatoryFieldSave();

  useEffect(() => {
    if (mandatoryResponse && selectedModuleId > 0) {
      const res = mandatoryResponse as MandatoryResponse;
      if (res.result === 1 && Array.isArray(res.data)) {
        setRows(res.data);
      } else {
        setRows([]);
      }
    } else {
      setRows([]);
    }
  }, [mandatoryResponse, selectedModuleId]);

  const onSubmit = () => setShowSaveConfirmation(true);

  const handleConfirmSave = () => {
    const data = rows;
    saveMandatory(
      { data },
      {
        onSuccess: (response) => {
          const r = response as MandatoryResponse;
          if (r.result === -1) {
            toast.error(r.message || "Failed to save mandatory fields");
            return;
          }
          if (r.result === 1) {
            toast.success(r.message || "Mandatory fields saved successfully");
            refetch();
          }
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to save mandatory fields"
          );
        },
      }
    );
  };

  const handleCheckChange = (
    moduleId: number,
    transactionId: number,
    field: keyof IMandatoryFields,
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
        <p className="text-rose-500">Failed to load mandatory field settings</p>
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
              forMandatory={true}
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
                  No mandatory field settings for this module
                </p>
              ) : (
                <div className="border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50 dark:bg-slate-800">
                        <th className="px-3 py-2 text-left font-medium">
                          Transaction
                        </th>
                        {MANDATORY_COLUMNS.slice(0, 12).map(({ field, label }) => (
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
                          {MANDATORY_COLUMNS.slice(0, 12).map(({ field }) => (
                            <td key={field} className="px-2 py-1 text-center">
                              <Checkbox
                                checked={
                                  (row[field as keyof IMandatoryFields] as boolean) ??
                                  false
                                }
                                onChange={(e) =>
                                  handleCheckChange(
                                    row.moduleId,
                                    row.transactionId,
                                    field as keyof IMandatoryFields,
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
        title="Save Mandatory Fields"
        itemName="mandatory field settings"
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={isPending}
        operationType="update"
      />
    </div>
  );
}
