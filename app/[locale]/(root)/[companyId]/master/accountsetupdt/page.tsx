"use client";

import { TableSkeleton } from "@/components/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation";
import {
  useDelete,
  useGetWithPagination,
  usePersist,
} from "@/hooks/use-common";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { useUserSettingDefaults } from "@/hooks/use-settings";
import type { IAccountSetupDt } from "@/interfaces/accountsetup";
import { AccountSetupDt } from "@/lib/api-routes";
import { MasterTransactionId, ModuleId } from "@/lib/utils";
import { usePermissionStore } from "@/stores/permission-store";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";
import { AccountSetupDtForm } from "./components/accountsetupdt-form";
import { AccountSetupDtTable } from "./components/accountsetupdt-table";

export default function AccountSetupDtMasterPage() {
  const t = useNamespaceTranslations("accountSetupDt");
  const tc = useNamespaceTranslations("common");
  const moduleId = ModuleId.master;
  const transactionId = MasterTransactionId.accountSetupDt;
  const queryClient = useQueryClient();
  const { hasPermission, getPermissions, permissions } = usePermissionStore();
  const canView = hasPermission(moduleId, transactionId, "isRead");
  const canEdit = hasPermission(moduleId, transactionId, "isEdit");
  const canDelete = hasPermission(moduleId, transactionId, "isDelete");
  const canCreate = hasPermission(moduleId, transactionId, "isCreate");
  const { defaults, isLoading: defaultsLoading } = useUserSettingDefaults();
  const params = useParams();
  const companyId = (params?.companyId as string) ?? "";
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const hasNoRights =
    mounted &&
    Object.keys(permissions).length > 0 &&
    getPermissions(moduleId, transactionId) === undefined;
  const [searchFilter, setSearchFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<IAccountSetupDt | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] =
    useState<Partial<IAccountSetupDt> | null>(null);
  const [selectedItem, setSelectedItem] = useState<IAccountSetupDt | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | null>(null);
  const effectivePageSize =
    pageSize ?? (defaults?.common?.masterGridTotalRecords || 50);
  const { data: response, isLoading } = useGetWithPagination<IAccountSetupDt>(
    `${AccountSetupDt.get}`,
    "accountSetupDt",
    searchFilter,
    currentPage,
    effectivePageSize,
    { enabled: !defaultsLoading },
  );
  const data = response?.data ?? [];
  const totalRecords = response?.totalRecords ?? 0;
  const saveMutation = usePersist<IAccountSetupDt>(AccountSetupDt.add);
  const deleteMutation = useDelete(AccountSetupDt.delete);
  const invalidateList = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["accountSetupDt"] }),
    [queryClient],
  );
  const handleAdd = useCallback(() => {
    setSelectedItem(null);
    setViewMode(false);
    setDialogOpen(true);
  }, []);
  const handleView = useCallback((item: IAccountSetupDt) => {
    setSelectedItem(item);
    setViewMode(true);
    setDialogOpen(true);
  }, []);
  const handleEdit = useCallback((item: IAccountSetupDt) => {
    setSelectedItem(item);
    setViewMode(false);
    setDialogOpen(true);
  }, []);
  const handleDelete = useCallback((item: IAccountSetupDt) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }, []);
  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync(
        `${itemToDelete.accSetupId}/${itemToDelete.currencyId}/${itemToDelete.glId}`,
      );
      await invalidateList();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {}
  }, [itemToDelete, deleteMutation, invalidateList]);
  const handleFormSubmit = useCallback((payload: Partial<IAccountSetupDt>) => {
    setPendingSaveData(payload);
    setSaveDialogOpen(true);
  }, []);
  const handleSaveConfirm = useCallback(async () => {
    if (!pendingSaveData) return;
    try {
      await saveMutation.mutateAsync(pendingSaveData);
      await invalidateList();
      setDialogOpen(false);
      setSelectedItem(null);
      setSaveDialogOpen(false);
      setPendingSaveData(null);
    } catch {}
  }, [pendingSaveData, saveMutation, invalidateList]);
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedItem(null);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
          <FileText className="h-5 w-5 text-rose-500" />
          {t("title")}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t("description")}
        </p>
      </div>
      <div>
        {hasNoRights ? (
          <TableSkeleton showLock rowCount={10} columnCount={6} />
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <AccountSetupDtTable
            data={data}
            totalRecords={totalRecords}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={mounted && canCreate ? handleAdd : undefined}
            onRefresh={invalidateList}
            searchFilter={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={() => {
              setSearchFilter(searchInput);
              setCurrentPage(1);
            }}
            onSearchClear={() => {
              setSearchInput("");
              setSearchFilter("");
              setCurrentPage(1);
            }}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
            currentPage={currentPage}
            pageSize={effectivePageSize}
            serverSidePagination
            moduleId={moduleId}
            transactionId={transactionId}
            canEdit={mounted ? canEdit : false}
            canDelete={mounted ? canDelete : false}
            canView={mounted ? canView : false}
            canCreate={mounted ? canCreate : false}
          />
        )}
      </div>
      {dialogOpen && (
        <Dialog
          title={
            selectedItem
              ? viewMode
                ? t("viewAccountSetupDt")
                : t("editAccountSetupDt")
              : t("createAccountSetupDt")
          }
          onClose={handleCloseDialog}
          width={560}
        >
          {viewMode && selectedItem ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {tc("accountSetup")}
                  </span>
                  <p className="font-medium">{selectedItem.accSetupName}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {tc("currency")}
                  </span>
                  <p className="font-medium">{selectedItem.currencyName}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    {tc("chartOfAccount")}
                  </span>
                  <p className="font-medium">
                    {selectedItem.glCode} - {selectedItem.glName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("applyAllCurr")}
                  </span>
                  <p className="font-medium">
                    {selectedItem.applyAllCurr ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              <DialogActionsBar>
                <Button themeColor="primary" onClick={handleCloseDialog}>
                  {tc("close")}
                </Button>
              </DialogActionsBar>
            </div>
          ) : (
            <AccountSetupDtForm
              key={
                selectedItem
                  ? `${selectedItem.accSetupId}-${selectedItem.currencyId}-${selectedItem.glId}`
                  : "new"
              }
              initialData={selectedItem}
              companyId={companyId}
              onSubmitAction={handleFormSubmit}
              onCancelAction={handleCloseDialog}
              isLoading={saveMutation.isPending}
              isViewMode={viewMode}
            />
          )}
        </Dialog>
      )}
      <ConfirmationDialog
        open={saveDialogOpen}
        onClose={() => {
          setSaveDialogOpen(false);
          setPendingSaveData(null);
        }}
        onConfirm={handleSaveConfirm}
        type="save"
        title={selectedItem ? t("updateAccountSetupDt") : t("createAccountSetupDt")}
        message={
          selectedItem
            ? `Update account setup "${selectedItem.accSetupName}" detail?`
            : "Create this account setup detail?"
        }
        confirmLabel={selectedItem ? "Update" : "Save"}
        loading={saveMutation.isPending}
      />
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        type="delete"
        title={t("deleteAccountSetupDt")}
        message={
          itemToDelete
            ? `Delete account setup "${itemToDelete.accSetupName}" detail?`
            : "Delete this item?"
        }
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
