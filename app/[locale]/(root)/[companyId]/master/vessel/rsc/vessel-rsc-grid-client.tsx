/**
 * VESSEL RSC – "use client" (client-only grid)
 * ============================================
 *
 * This file runs in the browser. The "use client" directive at the top
 * makes this module a Client Component. It is imported and rendered by
 * the Server Component (page.tsx).
 *
 * "use client" in this file
 * -------------------------
 * - This entire file: VesselRscGridClient, all hooks and handlers run in the browser.
 * - useGetWithPagination() – fetches vessel data (same API as vessel page).
 * - useState, useEffect are not used here; dataState comes from server via props.
 * - MasterDataGridRSC – Kendo Grid; onDataStateChange calls the server action then router.refresh().
 *
 * "use server" in this file
 * -------------------------
 * - Nothing. We import saveState from vessel-rsc-actions.ts and pass it to the grid;
 *   when the grid calls it, that function runs on the server (Server Action).
 *
 * STEP-BY-STEP (when this runs on the client)
 * -------------------------------------------
 * 1. Page (server) renders and passes: dataState, defaultPageSize, columns, saveState (server action).
 *
 * 2. VesselRscGridClient hydrates in the browser.
 *    - take = dataState?.take ?? defaultPageSize, skip = dataState?.skip ?? 0.
 *    - currentPage = floor(skip / take) + 1.
 *
 * 3. useGetWithPagination(Vessel.get, "vessels-rsc", "", currentPage, take) runs.
 *    - Fetches one page of vessels from the API.
 *
 * 4. Grid renders with vessels, totalRecords, dataState, onDataStateChange={saveState}.
 *
 * 5. User clicks "Next page" (or sort, or page size).
 *    - Grid calls onDataStateChange(event) → that is saveState (server action).
 *    - Client sends request to server; server runs saveState (writes cookie), responds.
 *    - MasterDataGridRSC then calls router.refresh().
 *
 * 6. Server re-renders page.tsx; getState() returns new cookie; new dataState passed to this component.
 *    - useGetWithPagination refetches with new currentPage/take → grid shows new page.
 */

"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
  useGetWithPagination,
  usePersist,
  useDelete,
} from "@/hooks/use-common";
import { Vessel } from "@/lib/api-routes";
import type { IVessel } from "@/interfaces/vessel";
import type { State } from "@progress/kendo-data-query";
import type { GridDataStateChangeEvent } from "@progress/kendo-react-grid";
import {
  MasterDataGridRSC,
  type MasterDataGridRSCColumn,
} from "@/components/table";
import { TableSkeleton } from "@/components/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation";

import { MasterTransactionId, ModuleId } from "@/lib/utils";
import { usePermissionStore } from "@/stores/permission-store";
import { VesselForm } from "../components/vessel-form";

/**
 * Props for the client grid wrapper. All come from the Server Component (page.tsx).
 */
export interface VesselRscGridClientProps {
  /** Current grid state from cookie (skip, take, sort, etc.); undefined on first load. */
  dataState: State | undefined;
  /** Default page size when dataState has no take (from user setting). */
  defaultPageSize: number;
  /** Server action: saveState from vessel-rsc-actions.ts. Grid calls this on page/sort/size change. */
  onDataStateChangeAction: (event: GridDataStateChangeEvent) => Promise<void>;
  /** Column definitions (field, title, width, etc.) from server. */
  columns: MasterDataGridRSCColumn[];
  /** Company ID for forms and API (from server). */
  companyId: string;
}

/**
 * Client component: vessel grid with server-driven state.
 * Purpose: Fetches one page of vessel data via useGetWithPagination (same API as main vessel page),
 * and renders MasterDataGridRSC. When the user changes page/sort/size, it calls the server action
 * (onDataStateChangeAction); the grid then triggers router.refresh() so the server re-renders with
 * the new cookie state. Runs only in the browser (hooks, event handlers).
 */
export function VesselRscGridClient({
  dataState,
  defaultPageSize,
  onDataStateChangeAction,
  columns,
  companyId,
}: VesselRscGridClientProps) {
  const t = useTranslations("vesselTable");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { hasPermission } = usePermissionStore();
  const moduleId = ModuleId.master;
  const transactionId = MasterTransactionId.vessel;
  const canView = hasPermission(moduleId, transactionId, "isRead");
  const canEdit = hasPermission(moduleId, transactionId, "isEdit");
  const canDelete = hasPermission(moduleId, transactionId, "isDelete");
  const canCreate = hasPermission(moduleId, transactionId, "isCreate");

  const [searchInput, setSearchInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<IVessel | null>(null);
  const [vesselToDelete, setVesselToDelete] = useState<IVessel | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] =
    useState<Partial<IVessel> | null>(null);

  /** Page size: from saved state or user-setting default. */
  const take = dataState?.take ?? defaultPageSize;
  /** Number of records to skip (for current page). */
  const skip = dataState?.skip ?? 0;
  /** 1-based page number for the API (pageNumber). */
  const currentPage = Math.floor(skip / take) + 1;
  /** State to pass to the grid; use defaults when cookie is empty. */
  const effectiveDataState = dataState ?? { skip: 0, take: defaultPageSize };

  const vesselsQueryKey = ["vessels-rsc", searchFilter, currentPage, take];

  /** Fetches one page of vessels; refetches when currentPage or take changes (e.g. after refresh). */
  const { data: vesselsResponse, isLoading } = useGetWithPagination<IVessel>(
    `${Vessel.get}`,
    "vessels-rsc",
    searchFilter,
    currentPage,
    take,
  );

  const vessels = vesselsResponse?.data ?? [];
  const totalRecords = vesselsResponse?.totalRecords ?? 0;

  const saveMutation = usePersist<IVessel>(Vessel.add);
  const deleteMutation = useDelete(Vessel.delete);

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

  const handleAdd = () => {
    setSelectedVessel(null);
    setViewMode(false);
    setDialogOpen(true);
  };

  const handleRefresh = () => {
    queryClient.refetchQueries({ queryKey: vesselsQueryKey });
  };

  const resetToFirstPage = () => {
    onDataStateChangeAction({
      dataState: { skip: 0, take },
    } as GridDataStateChangeEvent);
    setTimeout(() => router.refresh(), 50);
  };

  const handleSearchSubmit = () => {
    setSearchFilter(searchInput);
    resetToFirstPage();
  };

  const handleSearchClear = () => {
    setSearchInput("");
    setSearchFilter("");
    resetToFirstPage();
  };

  /** Show skeleton while the first page is loading. */
  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <>
      <MasterDataGridRSC<IVessel>
        data={vessels}
        columns={columns}
        dataItemKey="vesselId"
        dataState={effectiveDataState}
        onDataStateChange={onDataStateChangeAction}
        pageable
        pageSize={take}
        total={totalRecords}
        pageSizes={[50, 100, 500, 1000]}
        sortable
        csvFileName="vessels"
        actions={{
          onView: handleView,
          onEdit: handleEdit,
          onDelete: handleDelete,
        }}
        showView={canView}
        showEdit={canEdit}
        showDelete={canDelete}
        onAdd={canCreate ? handleAdd : undefined}
        addButtonLabel={t("addVessel")}
        onRefresh={handleRefresh}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onSearchClear={handleSearchClear}
        searchPlaceholder={t("searchVesselsPlaceholder")}
        showLayoutButtons
      />

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
    </>
  );
}
