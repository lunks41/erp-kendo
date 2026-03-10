"use client";

import { useCallback, useSyncExternalStore, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import {
  usePersist,
  useDelete,
  useGetWithPagination,
} from "@/hooks/use-common";
import { Department } from "@/lib/api-routes";
import type { IDepartment } from "@/interfaces/department";

import { ConfirmationDialog } from "@/components/ui/confirmation";
import { TableSkeleton } from "@/components/skeleton";
import { DepartmentForm } from "./components/department-form";
import { MasterTransactionId, ModuleId } from "@/lib/utils";
import { usePermissionStore } from "@/stores/permission-store";
import { useUserSettingDefaults } from "@/hooks/use-settings";
import { DepartmentTable } from "./components/department-table";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";

export default function DepartmentMasterPage() {
  const t = useNamespaceTranslations("department");
  const moduleId = ModuleId.master;
  const transactionId = MasterTransactionId.department;

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
  const departmentPermission = getPermissions(moduleId, transactionId);
  const hasNoDepartmentRights =
    mounted && permissionsLoaded && departmentPermission === undefined;
  const [searchFilter, setSearchFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<IDepartment | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<Partial<IDepartment> | null>(
    null,
  );
  const [selectedDepartment, setSelectedDepartment] = useState<IDepartment | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const preferredPageSize = defaults?.common?.masterGridTotalRecords || 50;
  const [pageSize, setPageSize] = useState<number | null>(null);
  const effectivePageSize = pageSize ?? preferredPageSize;

  const { data: departmentsResponse, isLoading } = useGetWithPagination<IDepartment>(
    `${Department.get}`,
    "departments",
    searchFilter,
    currentPage,
    effectivePageSize,
    { enabled: !defaultsLoading },
  );

  const departments = departmentsResponse?.data ?? [];
  const totalRecords = departmentsResponse?.totalRecords ?? 0;

  const saveMutation = usePersist<IDepartment>(Department.add);
  const deleteMutation = useDelete(Department.delete);

  const invalidateDepartmentsList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["departments"] });
  }, [queryClient]);

  const handleAdd = useCallback(() => {
    setSelectedDepartment(null);
    setViewMode(false);
    setDialogOpen(true);
  }, []);

  const handleView = useCallback((item: IDepartment) => {
    setSelectedDepartment(item);
    setViewMode(true);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((item: IDepartment) => {
    setSelectedDepartment(item);
    setViewMode(false);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback((item: IDepartment) => {
    setDepartmentToDelete(item);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!departmentToDelete) return;
    try {
      await deleteMutation.mutateAsync(String(departmentToDelete.departmentId));
      await invalidateDepartmentsList();
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    } catch {
      // Error handled by mutation
    }
  }, [departmentToDelete, deleteMutation, invalidateDepartmentsList]);

  const handleFormSubmit = useCallback((data: Partial<IDepartment>) => {
    setPendingSaveData(data);
    setSaveDialogOpen(true);
  }, []);

  const handleSaveConfirm = useCallback(async () => {
    if (!pendingSaveData) return;
    try {
      await saveMutation.mutateAsync(pendingSaveData);
      await invalidateDepartmentsList();
      setDialogOpen(false);
      setSelectedDepartment(null);
      setSaveDialogOpen(false);
      setPendingSaveData(null);
    } catch {
      // Error handled by mutation
    }
  }, [pendingSaveData, saveMutation, invalidateDepartmentsList]);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedDepartment(null);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    [],
  );
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(
    () => invalidateDepartmentsList(),
    [invalidateDepartmentsList],
  );

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
          <Building2 className="h-5 w-5 text-rose-500" />
          {t("title")}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t("description")}
        </p>
      </div>

      <div>
        {hasNoDepartmentRights ? (
          <TableSkeleton showLock rowCount={10} columnCount={6} />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <DepartmentTable
            data={departments}
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
            selectedDepartment
              ? viewMode
                ? t("view")
                : t("update")
              : t("createDepartment")
          }
          onClose={handleCloseDialog}
          width={560}
        >
          {viewMode && selectedDepartment ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("departmentCode")}
                  </span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {selectedDepartment.departmentCode}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("departmentName")}
                  </span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {selectedDepartment.departmentName}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Remarks
                  </span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {selectedDepartment.remarks || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Active
                  </span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {selectedDepartment.isActive ? "Yes" : "No"}
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
              <DepartmentForm
                key={selectedDepartment?.departmentId ?? "new"}
                initialData={selectedDepartment}
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
        title={selectedDepartment ? t("update") : t("createDepartment")}
        message={
          selectedDepartment
            ? `Are you sure you want to update department "${selectedDepartment.departmentName}"?`
            : "Are you sure you want to create this department?"
        }
        confirmLabel={selectedDepartment ? "Update" : "Save"}
        loading={saveMutation.isPending}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDepartmentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        type="delete"
        title="Delete Department"
        message={
          departmentToDelete
            ? `Are you sure you want to delete department "${departmentToDelete.departmentName}"? This action cannot be undone.`
            : "Are you sure you want to delete this item?"
        }
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
