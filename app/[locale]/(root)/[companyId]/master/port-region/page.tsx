"use client";

import { useEffect, useState } from "react";
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
import { PortRegionForm } from "./components/port-region-form";
import { MasterTransactionId, ModuleId } from "@/lib/utils";
import { usePermissionStore } from "@/stores/permission-store";
import { useUserSettingDefaults } from "@/hooks/use-settings";
import { PortRegionTable } from "./components/port-region-table";

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
  const [mounted, setMounted] = useState(false);

  const permissionsLoaded = Object.keys(permissions).length > 0;
  const portRegionPermission = getPermissions(moduleId, transactionId);
  const hasNoPortRegionRights =
    mounted && permissionsLoaded && portRegionPermission === undefined;

  const [searchFilter, setSearchFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [portRegionToDelete, setPortRegionToDelete] =
    useState<IPortRegion | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] =
    useState<Partial<IPortRegion> | null>(null);
  const [selectedPortRegion, setSelectedPortRegion] =
    useState<IPortRegion | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const preferredPageSize = defaults?.common?.masterGridTotalRecords || 50;
  const [pageSize, setPageSize] = useState<number | null>(null);
  const effectivePageSize = pageSize ?? preferredPageSize;

  useEffect(() => setMounted(true), []);

  const { data: portRegionsResponse, isLoading } =
    useGetWithPagination<IPortRegion>(
      `${PortRegion.get}`,
      "portregions",
      searchFilter,
      currentPage,
      effectivePageSize,
      { enabled: !defaultsLoading },
    );

  const portRegions = portRegionsResponse?.data ?? [];
  const totalRecords = portRegionsResponse?.totalRecords ?? 0;
  const saveMutation = usePersist<IPortRegion>(PortRegion.add);
  const deleteMutation = useDelete(PortRegion.delete);

  const handleAdd = () => {
    setSelectedPortRegion(null);
    setViewMode(false);
    setDialogOpen(true);
  };

  const handleView = (item: IPortRegion) => {
    setSelectedPortRegion(item);
    setViewMode(true);
    setDialogOpen(true);
  };

  const handleEdit = (item: IPortRegion) => {
    setSelectedPortRegion(item);
    setViewMode(false);
    setDialogOpen(true);
  };

  const handleDelete = (item: IPortRegion) => {
    setPortRegionToDelete(item);
    setDeleteDialogOpen(true);
  };

  const portRegionsQueryKey = [
    "portregions",
    searchFilter,
    currentPage,
    effectivePageSize,
  ];

  const handleDeleteConfirm = async () => {
    if (!portRegionToDelete) return;
    try {
      await deleteMutation.mutateAsync(String(portRegionToDelete.portRegionId));
      await queryClient.refetchQueries({ queryKey: portRegionsQueryKey });
      setDeleteDialogOpen(false);
      setPortRegionToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleFormSubmit = (data: Partial<IPortRegion>) => {
    setPendingSaveData(data);
    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = async () => {
    if (!pendingSaveData) return;
    try {
      await saveMutation.mutateAsync(pendingSaveData);
      await queryClient.refetchQueries({ queryKey: portRegionsQueryKey });
      setDialogOpen(false);
      setSelectedPortRegion(null);
      setSaveDialogOpen(false);
      setPendingSaveData(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPortRegion(null);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    queryClient.refetchQueries({ queryKey: portRegionsQueryKey });
  };

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

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        {hasNoPortRegionRights ? (
          <TableSkeleton showLock rowCount={10} columnCount={6} />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <PortRegionTable
            data={portRegions}
            totalRecords={totalRecords}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={mounted && canCreate ? handleAdd : undefined}
            onRefresh={handleRefresh}
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
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            currentPage={currentPage}
            pageSize={effectivePageSize}
            pageSizes={
              preferredPageSize && ![50, 100, 200].includes(preferredPageSize)
                ? [50, preferredPageSize, 100, 200].sort((a, b) => a - b)
                : undefined
            }
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
            selectedPortRegion
              ? viewMode
                ? "View Port Region"
                : "Edit Port Region"
              : "Create Port Region"
          }
          onClose={handleCloseDialog}
          width={560}
        >
          {viewMode && selectedPortRegion ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Code
                  </span>
                  <p className="font-medium">
                    {selectedPortRegion.portRegionCode}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Name
                  </span>
                  <p className="font-medium">
                    {selectedPortRegion.portRegionName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Country
                  </span>
                  <p className="font-medium">
                    {selectedPortRegion.countryName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Active
                  </span>
                  <p className="font-medium">
                    {selectedPortRegion.isActive ? "Yes" : "No"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Remarks
                  </span>
                  <p className="font-medium">
                    {selectedPortRegion.remarks || "—"}
                  </p>
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
              {!selectedPortRegion && (
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Add a new port region to the system database.
                </p>
              )}
              <PortRegionForm
                key={selectedPortRegion?.portRegionId ?? "new"}
                initialData={selectedPortRegion}
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
        title={
          selectedPortRegion ? "Update Port Region" : "Create Port Region"
        }
        message={
          selectedPortRegion
            ? `Are you sure you want to update port region "${selectedPortRegion.portRegionName}"?`
            : "Are you sure you want to create this port region?"
        }
        confirmLabel={selectedPortRegion ? "Update" : "Save"}
        loading={saveMutation.isPending}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPortRegionToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        type="delete"
        title="Delete Port Region"
        message={
          portRegionToDelete
            ? `Are you sure you want to delete port region "${portRegionToDelete.portRegionName}"? This action cannot be undone.`
            : "Are you sure you want to delete this item?"
        }
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
