"use client";

/**
 * Country grid client for server-side table.
 * Receives grid state from server (cookie); on page/sort/size change calls
 * onDataStateChangeAction (server action) then grid triggers router.refresh().
 */
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { useQueryClient } from "@tanstack/react-query";
import { Globe } from "lucide-react";
import {
  usePersist,
  useDelete,
  useGetWithPagination,
} from "@/hooks/use-common";
import { Country } from "@/lib/api-routes";
import type { ICountry } from "@/interfaces/country";
import type { State } from "@progress/kendo-data-query";
import type { GridDataStateChangeEvent } from "@progress/kendo-react-grid";
import { ConfirmationDialog } from "@/components/ui/confirmation";
import { TableSkeleton } from "@/components/skeleton";
import { CountryForm } from "./components/country-form";
import { CountryTable } from "./components/country-table";
import { MasterTransactionId, ModuleId, TableName } from "@/lib/utils";
import { usePermissionStore } from "@/stores/permission-store";
import { useUserSettingDefaults } from "@/hooks/use-settings";

export interface CountryClientProps {
  /** Grid state from server (cookie). Undefined on first load. */
  dataState: State | undefined;
  /** Default page size when dataState has no take (from user setting). */
  defaultPageSize: number;
  /** Server action: save state to cookie. Grid calls this on page/sort/size change. */
  onDataStateChangeAction: (event: GridDataStateChangeEvent) => Promise<void>;
  /** Company ID from route params (from server). */
  companyId: string;
  /** First page of data fetched on server – avoids client round-trip for faster first paint. */
  initialCountries?: ICountry[];
  initialTotalRecords?: number;
}

export function CountryClient({
  dataState,
  defaultPageSize,
  onDataStateChangeAction,
  companyId,
  initialCountries = [],
  initialTotalRecords = 0,
}: CountryClientProps) {
  const tPage = useTranslations("countryPage");
  const moduleId = ModuleId.master;
  const transactionId = MasterTransactionId.country;

  const queryClient = useQueryClient();
  const router = useRouter();
  const { hasPermission, getPermissions, permissions } = usePermissionStore();
  const canView = hasPermission(moduleId, transactionId, "isRead");
  const canEdit = hasPermission(moduleId, transactionId, "isEdit");
  const canDelete = hasPermission(moduleId, transactionId, "isDelete");
  const canCreate = hasPermission(moduleId, transactionId, "isCreate");
  const { defaults, isLoading: defaultsLoading } = useUserSettingDefaults();

  const [mounted, setMounted] = useState(false);
  const [loadTimeMs, setLoadTimeMs] = useState<number | null>(null);
  const loadStartRef = useRef<number | null>(null);
  /** Set when user changes page/size; cleared when server sends data for that page. Prevents duplicate client fetch. */
  const [pendingServerPage, setPendingServerPage] = useState<number | null>(null);

  const permissionsLoaded = Object.keys(permissions).length > 0;
  const countryPermission = getPermissions(moduleId, transactionId);
  const hasNoCountryRights =
    mounted && permissionsLoaded && countryPermission === undefined;

  const [searchFilter, setSearchFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<ICountry | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<Partial<ICountry> | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [viewMode, setViewMode] = useState(false);

  const preferredPageSize = defaults?.common?.masterGridTotalRecords ?? defaultPageSize;
  const take = dataState?.take ?? preferredPageSize;
  const skip = dataState?.skip ?? 0;
  const currentPage = Math.floor(skip / take) + 1;

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Clear "waiting for server" when we receive server data for the requested page
  useEffect(() => {
    if (pendingServerPage === null || !dataState) return;
    const serverPage = Math.floor((dataState.skip ?? 0) / (dataState.take ?? take)) + 1;
    if (serverPage === pendingServerPage && (initialCountries.length > 0 || initialTotalRecords > 0)) {
      setPendingServerPage(null);
    }
  }, [pendingServerPage, dataState, take, initialCountries.length, initialTotalRecords]);

  const hasInitialData =
    initialCountries.length > 0 || initialTotalRecords > 0;

  /** When no search: use only server data so we never call API from client (avoids duplicate with server fetch). */
  const serverOnlyMode = !searchFilter.trim();

  const { data: countriesResponse, isLoading: queryLoading } = useGetWithPagination<ICountry>(
    Country.get,
    "countries-rsc",
    searchFilter,
    currentPage,
    take,
    {
      enabled: !defaultsLoading && !serverOnlyMode,
      initialData: undefined,
    },
  );

  const countries = serverOnlyMode ? initialCountries : (countriesResponse?.data ?? []);
  const totalRecords = serverOnlyMode ? initialTotalRecords : (countriesResponse?.totalRecords ?? 0);
  const isLoading = serverOnlyMode ? pendingServerPage !== null : queryLoading;

  const didSetServerTimeRef = useRef(false);
  useEffect(() => {
    if (isLoading) {
      loadStartRef.current = loadStartRef.current ?? Date.now();
    } else if (loadStartRef.current != null) {
      setLoadTimeMs(Date.now() - loadStartRef.current);
      loadStartRef.current = null;
    } else if (
      (serverOnlyMode || hasInitialData) &&
      !didSetServerTimeRef.current &&
      countries.length > 0
    ) {
      didSetServerTimeRef.current = true;
      setLoadTimeMs(0);
    }
  }, [isLoading, hasInitialData, serverOnlyMode, countries.length]);

  const saveMutation = usePersist<ICountry>(Country.add);
  const deleteMutation = useDelete(Country.delete);

  const handleAdd = () => {
    setSelectedCountry(null);
    setViewMode(false);
    setDialogOpen(true);
  };

  const handleView = (item: ICountry) => {
    setSelectedCountry(item);
    setViewMode(true);
    setDialogOpen(true);
  };

  const handleEdit = (item: ICountry) => {
    setSelectedCountry(item);
    setViewMode(false);
    setDialogOpen(true);
  };

  const handleDelete = (item: ICountry) => {
    setCountryToDelete(item);
    setDeleteDialogOpen(true);
  };

  const countriesQueryKey = ["countries-rsc", searchFilter, currentPage, take];

  const handleDeleteConfirm = async () => {
    if (!countryToDelete) return;
    try {
      await deleteMutation.mutateAsync(String(countryToDelete.countryId));
      if (serverOnlyMode) router.refresh();
      else await queryClient.refetchQueries({ queryKey: countriesQueryKey });
      setDeleteDialogOpen(false);
      setCountryToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleFormSubmit = (data: Partial<ICountry>) => {
    setPendingSaveData(data);
    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = async () => {
    if (!pendingSaveData) return;
    try {
      await saveMutation.mutateAsync(pendingSaveData);
      if (serverOnlyMode) router.refresh();
      else await queryClient.refetchQueries({ queryKey: countriesQueryKey });
      setDialogOpen(false);
      setSelectedCountry(null);
      setSaveDialogOpen(false);
      setPendingSaveData(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCountry(null);
  };

  const handleRefresh = () => {
    if (serverOnlyMode) router.refresh();
    else queryClient.refetchQueries({ queryKey: countriesQueryKey });
  };

  const handleDataStateChange = async (e: GridDataStateChangeEvent) => {
    const requestedPage =
      e.dataState?.skip != null || e.dataState?.take != null
        ? Math.floor((e.dataState.skip ?? 0) / (e.dataState.take ?? take)) + 1
        : null;
    if (requestedPage != null) {
      setPendingServerPage(requestedPage);
    }
    await onDataStateChangeAction(e);
  };

  return (
    <div className="flex flex-col gap-4 p-2">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <Globe className="h-5 w-5 text-rose-500" />
          {tPage("title")}
          {loadTimeMs != null && (
            <span
              className="inline-flex items-center rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
              title={
                loadTimeMs === 0
                  ? "Data from server (no client fetch)"
                  : "Client fetch time"
              }
            >
              {loadTimeMs === 0
                ? "Server"
                : loadTimeMs < 1000
                  ? `${loadTimeMs} ms`
                  : `${(loadTimeMs / 1000).toFixed(1)} s`}
            </span>
          )}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {tPage("description")}
        </p>
      </div>

      <div>
        {hasNoCountryRights ? (
          <TableSkeleton showLock rowCount={10} columnCount={6} />
        ) : isLoading ? (
          <TableSkeleton rowCount={10} columnCount={6} />
        ) : (
          <CountryTable
            data={countries}
            totalRecords={totalRecords}
            dataState={dataState ?? { skip: 0, take: preferredPageSize }}
            onDataStateChange={handleDataStateChange}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={mounted && canCreate ? handleAdd : undefined}
            onRefresh={handleRefresh}
            searchFilter={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={() => {
              setSearchFilter(searchInput);
            }}
            onSearchClear={() => {
              setSearchInput("");
              setSearchFilter("");
            }}
            pageSize={take}
            pageSizes={[50, 100, 200, 500]}
            moduleId={moduleId}
            transactionId={transactionId}
            canView={mounted ? canView : false}
            canEdit={mounted ? canEdit : false}
            canDelete={mounted ? canDelete : false}
            canCreate={mounted ? canCreate : false}
            skipRefreshOnStateChange={false}
            tableName={TableName.country}
          />
        )}
      </div>

      {dialogOpen && (
        <Dialog
          title={
            selectedCountry
              ? viewMode
                ? "View Country"
                : "Edit Country"
              : "Create Country"
          }
          onClose={handleCloseDialog}
          width={640}
        >
          {viewMode && selectedCountry ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Code</span>
                  <p className="font-medium">{selectedCountry.countryCode}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Name</span>
                  <p className="font-medium">{selectedCountry.countryName}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Phone Code</span>
                  <p className="font-medium">{selectedCountry.phoneCode || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Active</span>
                  <p className="font-medium">{selectedCountry.isActive ? "Yes" : "No"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">Remarks</span>
                  <p className="font-medium">{selectedCountry.remarks || "—"}</p>
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
              {!selectedCountry && (
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Add a new country to the system database.
                </p>
              )}
              <CountryForm
                key={selectedCountry?.countryId ?? "new"}
                initialData={selectedCountry}
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
        title={selectedCountry ? "Update Country" : "Create Country"}
        message={
          selectedCountry
            ? `Are you sure you want to update country "${selectedCountry.countryName}"?`
            : "Are you sure you want to create this country?"
        }
        confirmLabel={selectedCountry ? "Update" : "Save"}
        loading={saveMutation.isPending}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCountryToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        type="delete"
        title="Delete Country"
        message={
          countryToDelete
            ? `Are you sure you want to delete country "${countryToDelete.countryName}"? This action cannot be undone.`
            : "Are you sure you want to delete this item?"
        }
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
