"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { MasterTransactionId, ModuleId } from "@/lib/utils";
import { usePermissionStore } from "@/stores/permission-store";
import { useUserSettingDefaults } from "@/hooks/use-settings";

export default function CountryMasterPage() {
  const tPage = useTranslations("countryPage");
  const moduleId = ModuleId.master;
  const transactionId = MasterTransactionId.country;

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

  const preferredPageSize = defaults?.common?.masterGridTotalRecords || 50;
  const [dataState, setDataState] = useState<State>({
    skip: 0,
    take: preferredPageSize,
  });
  const take = dataState.take ?? preferredPageSize;
  const skip = dataState.skip ?? 0;
  const currentPage = Math.floor(skip / take) + 1;

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const { data: countriesResponse, isLoading } = useGetWithPagination<ICountry>(
    Country.get,
    "countries",
    searchFilter,
    currentPage,
    take,
    { enabled: !defaultsLoading },
  );

  const countries = countriesResponse?.data ?? [];
  const totalRecords = countriesResponse?.totalRecords ?? 0;
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

  const countriesQueryKey = ["countries", searchFilter, currentPage, take];

  const handleDeleteConfirm = async () => {
    if (!countryToDelete) return;
    try {
      await deleteMutation.mutateAsync(String(countryToDelete.countryId));
      await queryClient.refetchQueries({ queryKey: countriesQueryKey });
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
      await queryClient.refetchQueries({ queryKey: countriesQueryKey });
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
    queryClient.refetchQueries({ queryKey: countriesQueryKey });
  };

  const handleDataStateChange = async (e: GridDataStateChangeEvent) => {
    setDataState((prev) => ({ ...prev, ...e.dataState }));
  };

  const pageSizes =
    preferredPageSize && ![50, 100, 200, 500].includes(preferredPageSize)
      ? [50, preferredPageSize, 100, 200, 500].sort((a, b) => a - b)
      : [50, 100, 200, 500];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
          <Globe className="h-5 w-5 text-rose-500" />
          {tPage("title")}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {tPage("description")}
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        {hasNoCountryRights ? (
          <TableSkeleton showLock rowCount={10} columnCount={6} />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <CountryTable
            data={countries}
            totalRecords={totalRecords}
            dataState={dataState}
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
              setDataState((prev) => ({ ...prev, skip: 0 }));
            }}
            onSearchClear={() => {
              setSearchInput("");
              setSearchFilter("");
              setDataState((prev) => ({ ...prev, skip: 0 }));
            }}
            pageSize={take}
            pageSizes={pageSizes}
            moduleId={moduleId}
            transactionId={transactionId}
            canView={mounted ? canView : false}
            canEdit={mounted ? canEdit : false}
            canDelete={mounted ? canDelete : false}
            canCreate={mounted ? canCreate : false}
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
