"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Copy, List, Printer, RotateCcw, Save, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/layout/notification-container";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Input } from "@progress/kendo-react-inputs";
import { Loader } from "@progress/kendo-react-indicators";
import {
  CancelConfirmation,
  DeleteConfirmation,
  LoadConfirmation,
  SaveConfirmation,
} from "@/components/ui/confirmation";
import { getById } from "@/lib/api-client";
import { ArInvoice } from "@/lib/api-routes";
import { clientDateFormat, formatDateForApi, parseDate } from "@/lib/date-utils";
import { ARTransactionId, ModuleId } from "@/lib/utils";
import { useDeleteWithRemarks, usePersist } from "@/hooks/use-common";
import { useGetRequiredFields, useGetVisibleFields } from "@/hooks/use-lookup";
import { useUserSettingDefaults } from "@/hooks/use-settings";
import { useAuthStore } from "@/stores/auth-store";
import { usePermissionStore } from "@/stores/permission-store";
import type { IArInvoiceFilter, IArInvoiceHd } from "@/interfaces/ar-invoice";
import type { IMandatoryFields, IVisibleFields } from "@/interfaces/setting";
import {
  ArInvoiceHdSchema,
  type ArInvoiceHdSchemaType,
} from "@/schemas/ar-invoice";

import History from "./components/history";
import { getDefaultValues } from "./components/invoice-defaultvalues";
import InvoiceTable from "./components/invoice-table";
import Main from "./components/main-tab";
import Other from "./components/other";

export default function InvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const companyId = params.companyId as string;
  const moduleId = ModuleId.ar;
  const transactionId = ARTransactionId.invoice;

  const { hasPermission } = usePermissionStore();
  const { decimals, user } = useAuthStore();
  const { defaults } = useUserSettingDefaults();
  const pageSize = defaults?.common?.trnGridTotalRecords || 100;

  const dateFormat = useMemo(
    () => decimals[0]?.dateFormat || clientDateFormat,
    [decimals],
  );

  const canView = hasPermission(moduleId, transactionId, "isRead");
  const canEdit = hasPermission(moduleId, transactionId, "isEdit");
  const canDelete = hasPermission(moduleId, transactionId, "isDelete");
  const canCreate = hasPermission(moduleId, transactionId, "isCreate");

  const [showListDialog, setShowListDialog] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showLoadConfirm, setShowLoadConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCloneConfirm, setShowCloneConfirm] = useState(false);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [invoice, setInvoice] = useState<ArInvoiceHdSchemaType | null>(null);
  const [searchNo, setSearchNo] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const defaultFilterStartDate = useMemo(
    () =>
      format(
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        "yyyy-MM-dd",
      ),
    [],
  );
  const defaultFilterEndDate = useMemo(
    () =>
      format(
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        "yyyy-MM-dd",
      ),
    [],
  );

  const [filters, setFilters] = useState<IArInvoiceFilter>({
    startDate: defaultFilterStartDate,
    endDate: defaultFilterEndDate,
    search: "",
    sortBy: "invoiceNo",
    sortOrder: "asc",
    pageNumber: 1,
    pageSize: pageSize,
  } as IArInvoiceFilter);

  const { data: visibleFieldsData } = useGetVisibleFields(moduleId, transactionId);
  const { data: requiredFieldsData } = useGetRequiredFields(moduleId, transactionId);
  const visible: IVisibleFields = visibleFieldsData ?? ({} as IVisibleFields);
  const required: IMandatoryFields = requiredFieldsData ?? ({} as IMandatoryFields);

  const defaultInvoiceValues = useMemo(
    () => getDefaultValues(dateFormat).defaultInvoice,
    [dateFormat],
  );

  const form = useForm<ArInvoiceHdSchemaType>({
    resolver: zodResolver(ArInvoiceHdSchema(required, visible)),
    defaultValues: invoice
      ? {
          ...invoice,
          data_details: invoice.data_details ?? [],
        }
      : {
          ...defaultInvoiceValues,
          createBy: user?.userName ?? "",
          createDate: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
          data_details: [],
        },
  });

  const saveMutation = usePersist<ArInvoiceHdSchemaType>(ArInvoice.add);
  const updateMutation = usePersist<ArInvoiceHdSchemaType>(ArInvoice.add);
  const deleteMutation = useDeleteWithRemarks(ArInvoice.delete);
  const unpostMutation = usePersist(ArInvoice.unpost);

  const transformToSchemaType = useCallback(
    (apiInvoice: IArInvoiceHd): ArInvoiceHdSchemaType => {
      const fmt = (val: Date | string | null | undefined) =>
        val ? format(parseDate(String(val)) ?? new Date(), dateFormat) : dateFormat;
      return {
        ...apiInvoice,
        invoiceId: apiInvoice.invoiceId?.toString() ?? "0",
        invoiceNo: apiInvoice.invoiceNo ?? "",
        referenceNo: apiInvoice.referenceNo ?? "",
        trnDate: fmt(apiInvoice.trnDate),
        accountDate: fmt(apiInvoice.accountDate),
        dueDate: fmt(apiInvoice.dueDate),
        deliveryDate: fmt(apiInvoice.deliveryDate),
        gstClaimDate: fmt(apiInvoice.gstClaimDate),
        createDate: apiInvoice.createDate ? fmt(apiInvoice.createDate) : "",
        editDate: apiInvoice.editDate ? fmt(apiInvoice.editDate) : undefined,
        cancelDate: apiInvoice.cancelDate ? fmt(apiInvoice.cancelDate) : undefined,
        data_details:
          apiInvoice.data_details?.map((d) => ({
            ...d,
            invoiceId: d.invoiceId?.toString() ?? "0",
            invoiceNo: d.invoiceNo ?? "",
            deliveryDate: d.deliveryDate ? fmt(d.deliveryDate) : "",
            supplyDate: d.supplyDate ? fmt(d.supplyDate) : "",
          })) ?? [],
      } as unknown as ArInvoiceHdSchemaType;
    },
    [dateFormat],
  );

  const loadInvoice = useCallback(
    async (opts: {
      invoiceId?: string | number | null;
      invoiceNo?: string | null;
      showLoader?: boolean;
    }) => {
      const { invoiceId: invId, invoiceNo: invNo, showLoader = false } = opts;
      const tid = String(invId ?? "").trim();
      const tno = String(invNo ?? "").trim();
      if (!tid && !tno) return null;
      if (showLoader) setIsLoadingInvoice(true);
      try {
        const response = await getById(
          `${ArInvoice.getByIdNo}/${tid || "0"}/${tno || ""}`,
        );
        if (response?.result === 1) {
          const raw = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          if (raw) {
            const mapped = transformToSchemaType(raw as unknown as IArInvoiceHd);
            setInvoice(mapped);
            form.reset(mapped);
            form.trigger();
            setSearchNo((mapped.invoiceNo ?? tno) || tid);
            return (mapped.invoiceNo ?? tno) || tid;
          }
        }
        toast.error(response?.message ?? "Failed to load invoice");
      } catch (e) {
        console.error(e);
        toast.error("Error loading invoice");
      } finally {
        if (showLoader) setIsLoadingInvoice(false);
      }
      return null;
    },
    [form, transformToSchemaType],
  );

  const handleSaveInvoice = async () => {
    if (isSaving || saveMutation.isPending || updateMutation.isPending) return;
    setIsSaving(true);
    try {
      const vals = form.getValues() as unknown as IArInvoiceHd;
      const validation = ArInvoiceHdSchema(required, visible).safeParse(vals);
      if (!validation.success) {
        validation.error.issues.forEach((i) => {
          const path = i.path.join(".") as keyof ArInvoiceHdSchemaType;
          form.setError(path, { message: i.message });
        });
        toast.error("Please fix validation errors");
        return;
      }
      const payload = {
        ...vals,
        trnDate: formatDateForApi(vals.trnDate) ?? "",
        accountDate: formatDateForApi(vals.accountDate) ?? "",
        dueDate: formatDateForApi(vals.dueDate) ?? "",
        deliveryDate: formatDateForApi(vals.deliveryDate) ?? "",
        gstClaimDate: formatDateForApi(vals.gstClaimDate) ?? "",
        data_details:
          vals.data_details?.map((d) => ({
            ...d,
            deliveryDate: formatDateForApi(d.deliveryDate) ?? "",
            supplyDate: formatDateForApi(d.supplyDate) ?? "",
          })) ?? [],
      };
      const res =
        Number(vals.invoiceId) === 0
          ? await saveMutation.mutateAsync(payload as unknown as Partial<ArInvoiceHdSchemaType>)
          : await updateMutation.mutateAsync(payload as unknown as Partial<ArInvoiceHdSchemaType>);
      if (res.result === 1) {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (data) {
          const mapped = transformToSchemaType(data as unknown as IArInvoiceHd);
          setInvoice(mapped);
          form.reset(mapped as unknown as ArInvoiceHdSchemaType);
          setSearchNo(mapped.invoiceNo ?? "");
        }
        setShowSaveConfirm(false);
        toast.success("Invoice saved successfully");
      } else {
        toast.error(res.message ?? "Failed to save");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving invoice");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvoiceDelete = async (cancelRemarks: string) => {
    if (!invoice) return;
    try {
      const res = await deleteMutation.mutateAsync({
        documentId: invoice.invoiceId ?? "",
        documentNo: invoice.invoiceNo ?? "",
        cancelRemarks,
      });
      if (res.result === 1) {
        setInvoice(null);
        setSearchNo("");
        form.reset({ ...defaultInvoiceValues, data_details: [] });
        setShowCancelConfirm(false);
        toast.success("Invoice cancelled");
      } else {
        toast.error(res.message ?? "Failed to cancel");
      }
    } catch {
      toast.error("Error cancelling invoice");
    }
  };

  const handleInvoiceReset = () => {
    setInvoice(null);
    setSearchNo("");
    form.reset({
      ...defaultInvoiceValues,
      createBy: user?.userName ?? "",
      createDate: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
      data_details: [],
    });
    setShowResetConfirm(false);
    toast.success("Form reset");
  };

  const handleInvoiceSelect = async (selected: IArInvoiceHd | undefined) => {
    if (!selected) return;
    await loadInvoice({
      invoiceId: selected.invoiceId ?? "0",
      invoiceNo: selected.invoiceNo ?? "",
    });
    setShowListDialog(false);
  };

  const handleSearchLoad = async () => {
    const trimmed = searchNo.trim();
    if (!trimmed) return;
    await loadInvoice({
      invoiceNo: trimmed,
      invoiceId: "0",
      showLoader: true,
    });
    setShowLoadConfirm(false);
  };

  const invoiceNo = form.watch("invoiceNo");
  const isEdit = Boolean(invoiceNo);
  const isCancelled = invoice?.isCancel === true;

  if (!visible || !required || Object.keys(visible).length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4">
      {/* Header: Tabs | Invoice Status (centered) | Action Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {/* Tabs - left */}
        <div className="flex shrink-0 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
          {(["Main", "Other", "History"] as const).map((tab, idx) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === idx
                  ? "bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Invoice status label - centered, purple-blue gradient */}
        <div className="flex flex-1 justify-center">
          <div
            className="min-w-[200px] rounded-lg px-4 py-2 text-center text-base font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
            }}
          >
            {isEdit ? `Invoice (Edit) - ${invoiceNo}` : "Invoice (New)"}
          </div>
        </div>

        {/* Action bar - right */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Input
            value={searchNo}
            onChange={(e) => setSearchNo(e.value ?? "")}
            onKeyDown={(e) =>
              e.key === "Enter" && searchNo.trim() && setShowLoadConfirm(true)
            }
            placeholder="Search Invoice No"
            style={{ width: 160 }}
            className="rounded-md"
          />
          <Button fillMode="outline" onClick={() => setShowListDialog(true)} className="flex min-w-[90px] items-center justify-center gap-1.5 px-4 py-2">
            <List className="h-4 w-4 shrink-0" />
            List
          </Button>
          <Button
            fillMode="solid"
            onClick={() => setShowSaveConfirm(true)}
            disabled={
              !canView ||
              isSaving ||
              isCancelled ||
              (isEdit && !canEdit) ||
              (!isEdit && !canCreate)
            }
            style={{
              backgroundColor: "#ea580c",
              borderColor: "#ea580c",
              color: "white",
            }}
            className="flex min-w-[90px] items-center justify-center gap-1.5 px-4 py-2 hover:opacity-90"
          >
            {isSaving || saveMutation.isPending ? (
              <Loader type="converging-spinner" size="small" className="shrink-0" />
            ) : (
              <Save className="h-4 w-4 shrink-0" />
            )}
            {isEdit ? "Update" : "Save"}
          </Button>
          <Button fillMode="outline" onClick={() => window.print()} className="flex min-w-[90px] items-center justify-center gap-1.5 px-4 py-2">
            <Printer className="h-4 w-4 shrink-0" />
            Print
          </Button>
          <Button fillMode="outline" onClick={() => setShowResetConfirm(true)} className="flex min-w-[90px] items-center justify-center gap-1.5 px-4 py-2">
            <RotateCcw className="h-4 w-4 shrink-0" />
            New
          </Button>
          <Button
            fillMode="outline"
            onClick={() => setShowCloneConfirm(true)}
            disabled={!invoice || invoice.invoiceId === "0" || isCancelled}
            className="flex min-w-[90px] items-center justify-center gap-1.5 px-4 py-2"
          >
            <Copy className="h-4 w-4 shrink-0" />
            Clone
          </Button>
          <Button
            fillMode="solid"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={
              !invoice ||
              invoice.invoiceId === "0" ||
              isCancelled ||
              !canDelete
            }
            style={{
              backgroundColor: "#dc2626",
              borderColor: "#dc2626",
              color: "white",
            }}
            className="flex min-w-[90px] items-center justify-center gap-1.5 px-4 py-2 hover:opacity-90"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            Cancel
          </Button>
          {isCancelled && (
            <span className="rounded bg-red-100 px-2 py-1 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              Cancelled
            </span>
          )}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <Main
          form={form}
          onSuccessAction={handleSaveInvoice}
          isEdit={isEdit}
          visible={visible}
          required={required}
          companyId={Number(companyId)}
          isCancelled={!!isCancelled}
        />
      )}
      {activeTab === 1 && <Other form={form} visible={visible} />}
      {activeTab === 2 && <History form={form} isEdit={isEdit} />}

      {showListDialog && (
      <Dialog
        title="Invoice List"
        onClose={() => setShowListDialog(false)}
        width="90vw"
        height="80vh"
      >
        <div className="h-[70vh] overflow-auto p-4">
          <InvoiceTable
            onInvoiceSelect={handleInvoiceSelect}
            onFilterChange={setFilters}
            initialFilters={filters}
            pageSize={pageSize || 50}
            onCloseAction={() => setShowListDialog(false)}
            visible={visible}
            isDialogOpen={showListDialog}
          />
        </div>
      </Dialog>
      )}

      <SaveConfirmation
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        onConfirm={handleSaveInvoice}
        itemName={invoice?.invoiceNo ?? "New Invoice"}
        operationType={invoice?.invoiceId && invoice.invoiceId !== "0" ? "update" : "create"}
        isSaving={isSaving || saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          setShowCancelConfirm(true);
        }}
        itemName={invoice?.invoiceNo}
        title="Cancel Invoice"
      />

      <CancelConfirmation
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        onConfirmAction={handleInvoiceDelete}
        itemName={invoice?.invoiceNo ?? "invoice"}
      />

      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={handleSearchLoad}
        code={searchNo}
        typeLabel="Invoice"
        isLoading={isLoadingInvoice}
      />

      {showResetConfirm && (
      <Dialog
        title="New Invoice"
        onClose={() => setShowResetConfirm(false)}
        width={400}
      >
        <p className="py-2 text-sm">
          This will clear all unsaved changes. Continue?
        </p>
        <div className="flex justify-end gap-2">
          <Button fillMode="flat" onClick={() => setShowResetConfirm(false)}>
            Cancel
          </Button>
          <Button themeColor="primary" onClick={handleInvoiceReset}>
            Reset
          </Button>
        </div>
      </Dialog>
      )}

      {showCloneConfirm && (
      <Dialog
        title="Clone Invoice"
        onClose={() => setShowCloneConfirm(false)}
        width={400}
      >
        <p className="py-2 text-sm">
          Create a copy as a new invoice?
        </p>
        <div className="flex justify-end gap-2">
          <Button fillMode="flat" onClick={() => setShowCloneConfirm(false)}>
            Cancel
          </Button>
          <Button
            themeColor="primary"
            onClick={() => {
              if (invoice) {
                const clone = {
                  ...invoice,
                  invoiceId: "0",
                  invoiceNo: "",
                  createBy: user?.userName ?? "",
                  createDate: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
                  data_details: invoice.data_details ?? [],
                } as ArInvoiceHdSchemaType;
                setInvoice(clone);
                form.reset(clone);
                setSearchNo("");
              }
              setShowCloneConfirm(false);
              toast.success("Invoice cloned");
            }}
          >
            Clone
          </Button>
        </div>
      </Dialog>
      )}
    </div>
  );
}
