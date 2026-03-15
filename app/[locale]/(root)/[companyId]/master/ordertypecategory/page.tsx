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
import type { IOrderTypeCategory } from "@/interfaces/ordertype";
import { OrderTypeCategory } from "@/lib/api-routes";
import { MasterTransactionId, ModuleId } from "@/lib/utils";
import { usePermissionStore } from "@/stores/permission-store";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { useQueryClient } from "@tanstack/react-query";
import { ChartArea } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";
import { OrderTypeCategoryForm } from "./components/ordertypecategory-form";
import { OrderTypeCategoryTable } from "./components/ordertypecategory-table";

export default function OrderTypeCategoryMasterPage() {
  const t = useNamespaceTranslations("orderTypeCategory");
  const tc = useNamespaceTranslations("common");
  const moduleId = ModuleId.master;
  const transactionId = MasterTransactionId.orderTypeCategory;
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
  const [itemToDelete, setItemToDelete] =
    useState<IOrderTypeCategory | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingSaveData, setPendingSaveData] =
    useState<Partial<IOrderTypeCategory> | null>(null);
  const [selectedItem, setSelectedItem] =
    useState<IOrderTypeCategory | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | null>(null);
  const effectivePageSize =
    pageSize ?? (defaults?.common?.masterGridTotalRecords || 50);
  const { data: response, isLoading } =
    useGetWithPagination<IOrderTypeCategory>(
      `${OrderTypeCategory.get}`,
      "orderTypeCategory",
      searchFilter,
      currentPage,
      effectivePageSize,
      { enabled: !defaultsLoading },
    );
  const data = response?.data ?? [];
  const totalRecords = response?.totalRecords ?? 0;
  const saveMutation = usePersist<IOrderTypeCategory>(OrderTypeCategory.add);
  const deleteMutation = useDelete(OrderTypeCategory.delete);
  const invalidateList = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["orderTypeCategory"] }),
    [queryClient],
  );
  const handleAdd = useCallback(() => {
    setSelectedItem(null);
    setViewMode(false);
    setDialogOpen(true);
  }, []);
  const handleView = useCallback((item: IOrderTypeCategory) => {
    setSelectedItem(item);
    setViewMode(true);
    setDialogOpen(true);
  }, []);
  const handleEdit = useCallback((item: IOrderTypeCategory) => {
    setSelectedItem(item);
    setViewMode(false);
    setDialogOpen(true);
  }, []);
  const handleDelete = useCallback((item: IOrderTypeCategory) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }, []);
  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync(
        String(itemToDelete.orderTypeCategoryId),
      );
      await invalidateList();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {}
  }, [itemToDelete, deleteMutation, invalidateList]);
  const handleFormSubmit = useCallback(
    (payload: Partial<IOrderTypeCategory>) => {
      setPendingSaveData(payload);
      setSaveDialogOpen(true);
    },
    [],
  );
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
          <ChartArea className="h-5 w-5 text-rose-500" />
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
          <OrderTypeCategoryTable
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
                ? t("viewOrderTypeCategory")
                : t("editOrderTypeCategory")
              : t("createOrderTypeCategory")
          }
          onClose={handleCloseDialog}
          width={560}
        >
          {viewMode && selectedItem ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("orderTypeCategoryCode")}
                  </span>
                  <p className="font-medium">
                    {selectedItem.orderTypeCategoryCode}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("orderTypeCategoryName")}
                  </span>
                  <p className="font-medium">
                    {selectedItem.orderTypeCategoryName}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    {tc("remarks")}
                  </span>
                  <p className="font-medium">
                    {selectedItem.remarks || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("active")}
                  </span>
                  <p className="font-medium">
                    {selectedItem.isActive ? "Yes" : "No"}
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
            <OrderTypeCategoryForm
              key={selectedItem?.orderTypeCategoryId ?? "new"}
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
        title={
          selectedItem
            ? t("updateOrderTypeCategory")
            : t("createOrderTypeCategory")
        }
        message={
          selectedItem
            ? `Update "${selectedItem.orderTypeCategoryName}"?`
            : "Create this order type category?"
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
        title={t("deleteOrderTypeCategory")}
        message={
          itemToDelete
            ? `Delete "${itemToDelete.orderTypeCategoryName}"?`
            : "Delete this item?"
        }
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
