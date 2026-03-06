"use client";

import { useCallback, useSyncExternalStore, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import {
  usePersist,
  useDelete,
  useGetWithPagination,
} from "@/hooks/use-common";
import { PortRegion } from "@/lib/api-routes";
import type { IPortRegion } from "@/interfaces/portregion";
import { ConfirmationDialog } from "@/components/ui/confirmation";
import { TableSkeleton } from "@/components/skeleton";
import { PortRegionForm } from "./components/portregion-form";
import { MasterTransactionId, ModuleId } from "@/lib/utils";
import { usePermissionStore } from "@/stores/permission-store";
import { useUserSettingDefaults } from "@/hooks/use-settings";
import { PortRegionTable } from "./components/portregion-table";

export default function PortRegionMasterPage() {
  const t = useTranslations("portRegionPage");
  const moduleId = ModuleId.master;
  const transactionId = MasterTransactionId.portRegion;

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

  const permissionsLoaded = Object.keys(permissions).length > 0;
  const portRegionPermission = getPermissions(moduleId, transactionId);
  const hasNoRights =
    mounted && permissionsLoaded && portRegionPermission === undefined;

  const [searchFilter, setSearchFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<IPortRegion | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<Partial<IPortRegion> | null>(null);
  const [selectedItem, setSelectedItem] = useState<IPortRegion | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const preferredPageSize = defaults?.common?.masterGridTotalRecords || 50;
  const [pageSize, setPageSize] = useState<number | null>(null);
  const effectivePageSize = pageSize ?? preferredPageSize;

  const { data: response, isLoading } = useGetWithPagination<IPortRegion>(
    `${PortRegion.get}`,
    "portRegions",
    searchFilter,
    currentPage,
    effectivePageSize,
    { enabled: !defaultsLoading },
  );

  const data = response?.data ?? [];
  const totalRecords = response?.totalRecords ?? 0;
  const saveMutation = usePersist<IPortRegion>(PortRegion.add);
  const deleteMutation = useDelete(PortRegion.delete);

  const invalidateList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["portRegions"] });
  }, [queryClient]);

  const handleAdd = useCallback(() => {
    setSelectedItem(null);
    setViewMode(false);
    setDialogOpen(true);
  }, []);

  const handleView = useCallback((item: IPortRegion) => {
    setSelectedItem(item);
    setViewMode(true);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((item: IPortRegion) => {
    setSelectedItem(item);
    setViewMode(false);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback((item: IPortRegion) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync(String(itemToDelete.portRegionId));
      await invalidateList();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      // Error handled by mutation
    }
  }, [itemToDelete, deleteMutation, invalidateList]);

  const handleFormSubmit = useCallback((payload: Partial<IPortRegion>) => {
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
    } catch {
      // Error handled by mutation
    }
  }, [pendingSaveData, saveMutation, invalidateList]);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedItem(null);
  }, []);

  const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(() => invalidateList(), [invalidateList]);
  const handleSearchSubmit = useCallback(() => {
    setSearchFilter(searchInput);
    setCurrentPage(1);
  }, [searchInput]);
  const handleSearchClear = useCallback(() => {
    setSearchInput("");
    setSearchFilter("");
    setCurrentPage(1);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
          <MapPin className="h-5 w-5 text-rose-500" />
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
          <PortRegionTable
            data={data}
            totalRecords={totalRecords}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={mounted && canCreate ? handleAdd : undefined}
            onRefresh={handleRefresh}
            searchFilter={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onSearchClear={handleSearchClear}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
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
                ? "View Port Region"
                : "Edit Port Region"
              : "Create Port Region"
          }
          onClose={handleCloseDialog}
          width={560}
        >
          {viewMode && selectedItem ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Code</span>
                  <p className="font-medium">{selectedItem.portRegionCode}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Name</span>
                  <p className="font-medium">{selectedItem.portRegionName}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">Country</span>
                  <p className="font-medium">{selectedItem.countryName || "—"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">Remarks</span>
                  <p className="font-medium">{selectedItem.remarks || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Active</span>
                  <p className="font-medium">{selectedItem.isActive ? "Yes" : "No"}</p>
                </div>
              </div>
              <DialogActionsBar>
                <Button themeColor="primary" onClick={handleCloseDialog}>
                  Close
                </Button>
              </DialogActionsBar>
            </div>
          ) : (
            <>
              {!selectedItem && (
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Add a new port region and link it to a country.
                </p>
              )}
              <PortRegionForm
                key={selectedItem?.portRegionId ?? "new"}
                initialData={selectedItem}
                companyId={companyId}
                onSubmitAction={handleFormSubmit}
                onCancelAction={handleCloseDialog}
                isLoading={saveMutation.isPending}
                isViewMode={viewMode}
              />
            </>
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
        title={selectedItem ? "Update Port Region" : "Create Port Region"}
        message={
          selectedItem
            ? `Are you sure you want to update port region "${selectedItem.portRegionName}"?`
            : "Are you sure you want to create this port region?"
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
        title="Delete Port Region"
        message={
          itemToDelete
            ? `Are you sure you want to delete port region "${itemToDelete.portRegionName}"? This action cannot be undone.`
            : "Are you sure you want to delete this item?"
        }
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
