"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { useQueryClient } from "@tanstack/react-query";
import { Ship } from "lucide-react";
import {
  usePersist,
  useDelete,
  useGetWithPagination,
} from "@/hooks/use-common";
import { Vessel } from "@/lib/api-routes";
import type { IVessel } from "@/interfaces/vessel";

import { ConfirmationDialog } from "@/components/ui/confirmation";
import { TableSkeleton } from "@/components/skeleton";

import { MasterTransactionId, ModuleId } from "@/lib/utils";
import { usePermissionStore } from "@/stores/permission-store";
import { useUserSettingDefaults } from "@/hooks/use-settings";
import { VesselTable } from "./components/vessel-table";
import { VesselForm } from "./components/vessel-form";

export default function VesselMasterPage() {
  const t = useTranslations("vesselPage");
  const moduleId = ModuleId.master;
  const transactionId = MasterTransactionId.vessel;

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
  const vesselPermission = getPermissions(moduleId, transactionId);
  const hasNoVesselRights =
    mounted && permissionsLoaded && vesselPermission === undefined;

  const [searchFilter, setSearchFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vesselToDelete, setVesselToDelete] = useState<IVessel | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] =
    useState<Partial<IVessel> | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<IVessel | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const preferredPageSize = defaults?.common?.masterGridTotalRecords || 50;
  const [pageSize, setPageSize] = useState<number | null>(null);
  const effectivePageSize = pageSize ?? preferredPageSize;

  const mountTimeRef = useRef<number>(0);
  const [timeToDataMs, setTimeToDataMs] = useState<number | null>(null);
  const reportedRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (mountTimeRef.current === 0) mountTimeRef.current = performance.now();
  }, []);

  const { data: vesselsResponse, isLoading } = useGetWithPagination<IVessel>(
    `${Vessel.get}`,
    "vessels",
    searchFilter,
    currentPage,
    effectivePageSize,
    { enabled: !defaultsLoading },
  );

  const vessels = vesselsResponse?.data ?? [];
  const totalRecords = vesselsResponse?.totalRecords ?? 0;

  useEffect(() => {
    if (reportedRef.current || defaultsLoading || isLoading) return;
    reportedRef.current = true;
    setTimeToDataMs(Math.round(performance.now() - mountTimeRef.current));
  }, [defaultsLoading, isLoading]);

  const saveMutation = usePersist<IVessel>(Vessel.add);
  const deleteMutation = useDelete(Vessel.delete);

  const handleAdd = () => {
    setSelectedVessel(null);
    setViewMode(false);
    setDialogOpen(true);
  };

  const handleView = (item: IVessel) => {
    setSelectedVessel(item);
    setViewMode(true);
    setDialogOpen(true);
  };

  const handleEdit = (item: IVessel) => {
    setSelectedVessel(item);
    setViewMode(false);
    setDialogOpen(true);
  };

  const handleDelete = (item: IVessel) => {
    setVesselToDelete(item);
    setDeleteDialogOpen(true);
  };

  const vesselsQueryKey = [
    "vessels",
    searchFilter,
    currentPage,
    effectivePageSize,
  ];

  const handleDeleteConfirm = async () => {
    if (!vesselToDelete) return;
    try {
      await deleteMutation.mutateAsync(String(vesselToDelete.vesselId));
      await queryClient.refetchQueries({ queryKey: vesselsQueryKey });
      setDeleteDialogOpen(false);
      setVesselToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleFormSubmit = (data: Partial<IVessel>) => {
    setPendingSaveData(data);
    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = async () => {
    if (!pendingSaveData) return;
    try {
      await saveMutation.mutateAsync(pendingSaveData);
      await queryClient.refetchQueries({ queryKey: vesselsQueryKey });
      setDialogOpen(false);
      setSelectedVessel(null);
      setSaveDialogOpen(false);
      setPendingSaveData(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedVessel(null);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    queryClient.refetchQueries({ queryKey: vesselsQueryKey });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
              <Ship className="h-5 w-5 text-rose-500" />
              {t("title")}
            </h1>
            {timeToDataMs !== null && (
              <span
                className="rounded bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-300"
                title="Client: time from mount until vessel data loaded"
              >
                Client: {timeToDataMs} ms
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t("description")}
          </p>
        </div>
        <Link
          href="vessel/rsc"
          className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          Try RSC grid
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        {hasNoVesselRights ? (
          <TableSkeleton showLock rowCount={10} columnCount={6} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : (
          <VesselTable
            data={vessels}
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
            selectedVessel
              ? viewMode
                ? "View Vessel"
                : "Edit Vessel"
              : "Create Vessel"
          }
          onClose={handleCloseDialog}
          width={640}
        >
          {viewMode && selectedVessel ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Code
                  </span>
                  <p className="font-medium">{selectedVessel.vesselCode}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Name
                  </span>
                  <p className="font-medium">{selectedVessel.vesselName}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Call Sign
                  </span>
                  <p className="font-medium">
                    {selectedVessel.callSign || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    IMO Code
                  </span>
                  <p className="font-medium">{selectedVessel.imoCode || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Vessel Type
                  </span>
                  <p className="font-medium">
                    {selectedVessel.vesselTypeName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    GRT
                  </span>
                  <p className="font-medium">{selectedVessel.grt || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Active
                  </span>
                  <p className="font-medium">
                    {selectedVessel.isActive ? "Yes" : "No"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Remarks
                  </span>
                  <p className="font-medium">{selectedVessel.remarks || "—"}</p>
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
              {!selectedVessel && (
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Add a new vessel to the system database.
                </p>
              )}
              <VesselForm
                key={selectedVessel?.vesselId ?? "new"}
                initialData={selectedVessel}
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
        title={selectedVessel ? "Update Vessel" : "Create Vessel"}
        message={
          selectedVessel
            ? `Are you sure you want to update vessel "${selectedVessel.vesselName}"?`
            : "Are you sure you want to create this vessel?"
        }
        confirmLabel={selectedVessel ? "Update" : "Save"}
        loading={saveMutation.isPending}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setVesselToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        type="delete"
        title="Delete Vessel"
        message={
          vesselToDelete
            ? `Are you sure you want to delete vessel "${vesselToDelete.vesselName}"? This action cannot be undone.`
            : "Are you sure you want to delete this item?"
        }
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
