"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import {
  usePersist,
  useDelete,
  useGetWithPagination,
} from "@/hooks/use-common";
import { Port } from "@/lib/api-routes";
import type { IPort } from "@/interfaces/port";

import { PortForm } from "./components/port-form";
import { MasterTransactionId, ModuleId } from "@/lib/utils";
import { usePermissionStore } from "@/stores/permission-store";
import { useUserSettingDefaults } from "@/hooks/use-settings";
import { PortTable } from "./components/port-table";

export default function PortMasterPage() {
  const moduleId = ModuleId.master;
  const transactionId = MasterTransactionId.port;

  const queryClient = useQueryClient();
  const { hasPermission } = usePermissionStore();
  const canView = hasPermission(moduleId, transactionId, "isRead");
  const canEdit = hasPermission(moduleId, transactionId, "isEdit");
  const canDelete = hasPermission(moduleId, transactionId, "isDelete");
  const canCreate = hasPermission(moduleId, transactionId, "isCreate");
  const { defaults } = useUserSettingDefaults();

  const params = useParams();
  const companyId = (params?.companyId as string) ?? "";
  const [mounted, setMounted] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPort, setSelectedPort] = useState<IPort | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const preferredPageSize = defaults?.common?.masterGridTotalRecords || 50;
  const [pageSize, setPageSize] = useState(preferredPageSize);

  useEffect(() => {
    if (defaults?.common?.masterGridTotalRecords) {
      setPageSize(defaults.common.masterGridTotalRecords);
    }
  }, [defaults?.common?.masterGridTotalRecords]);

  useEffect(() => setMounted(true), []);

  const { data: portsResponse, isLoading } = useGetWithPagination<IPort>(
    `${Port.get}`,
    "ports",
    searchFilter,
    currentPage,
    pageSize,
  );

  const ports = portsResponse?.data ?? [];
  const totalRecords = portsResponse?.totalRecords ?? 0;
  const saveMutation = usePersist<IPort>(Port.add);
  const deleteMutation = useDelete(Port.delete);

  const handleAdd = () => {
    setSelectedPort(null);
    setViewMode(false);
    setDialogOpen(true);
  };

  const handleView = (item: IPort) => {
    setSelectedPort(item);
    setViewMode(true);
    setDialogOpen(true);
  };

  const handleEdit = (item: IPort) => {
    setSelectedPort(item);
    setViewMode(false);
    setDialogOpen(true);
  };

  const handleDelete = async (item: IPort) => {
    if (!confirm(`Delete port "${item.portName}"?`)) return;
    try {
      await deleteMutation.mutateAsync(String(item.portId));
      queryClient.invalidateQueries({ queryKey: ["ports"] });
    } catch {
      // Error handled by mutation
    }
  };

  const handleFormSubmit = async (data: Partial<IPort>) => {
    try {
      await saveMutation.mutateAsync(data);
      queryClient.invalidateQueries({ queryKey: ["ports"] });
      setDialogOpen(false);
      setSelectedPort(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPort(null);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["ports"] });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
          <MapPin className="h-5 w-5 text-rose-500" />
          Port Master
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Manage ports and port regions.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <PortTable
          data={ports}
          totalRecords={totalRecords}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={mounted && canCreate ? handleAdd : undefined}
          onRefresh={handleRefresh}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          pageSize={pageSize}
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
            selectedPort
              ? viewMode
                ? "View Port"
                : "Edit Port"
              : "Create Port"
          }
          onClose={handleCloseDialog}
          width={560}
        >
          {viewMode && selectedPort ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Code</span>
                  <p className="font-medium">{selectedPort.portCode}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Name</span>
                  <p className="font-medium">{selectedPort.portName}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Short Name
                  </span>
                  <p className="font-medium">
                    {selectedPort.portShortName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Region
                  </span>
                  <p className="font-medium">{selectedPort.portRegionName}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Remarks
                  </span>
                  <p className="font-medium">{selectedPort.remarks || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Active
                  </span>
                  <p className="font-medium">
                    {selectedPort.isActive ? "Yes" : "No"}
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
              {!selectedPort && (
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Add a new port to the system database.
                </p>
              )}
              <PortForm
                initialData={selectedPort}
                companyId={companyId}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseDialog}
                isLoading={saveMutation.isPending}
              />
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}
