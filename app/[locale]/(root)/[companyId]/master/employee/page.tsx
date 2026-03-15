"use client";

import { TableSkeleton } from "@/components/skeleton";
import {
  useGetWithPagination,
} from "@/hooks/use-common";
import { useNamespaceTranslations } from "@/hooks/use-form-translations";
import { useUserSettingDefaults } from "@/hooks/use-settings";
import type { IEmployee } from "@/interfaces/employee";
import { Employee } from "@/lib/api-routes";
import { MasterTransactionId, ModuleId } from "@/lib/utils";
import { usePermissionStore } from "@/stores/permission-store";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";
import { EmployeeTable } from "./components/employee-table";

export default function EmployeeMasterPage() {
  const t = useNamespaceTranslations("employee");
  const tc = useNamespaceTranslations("common");
  const moduleId = ModuleId.master;
  const transactionId = MasterTransactionId.employee;
  const queryClient = useQueryClient();
  const { hasPermission, getPermissions, permissions } = usePermissionStore();
  const canView = hasPermission(moduleId, transactionId, "isRead");
  const { defaults, isLoading: defaultsLoading } = useUserSettingDefaults();
  const params = useParams();
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
  const [selectedItem, setSelectedItem] = useState<IEmployee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | null>(null);
  const effectivePageSize =
    pageSize ?? (defaults?.common?.masterGridTotalRecords || 50);
  const { data: response, isLoading } = useGetWithPagination<IEmployee>(
    `${Employee.get}`,
    "employee",
    searchFilter,
    currentPage,
    effectivePageSize,
    { enabled: !defaultsLoading },
  );
  const data = response?.data ?? [];
  const totalRecords = response?.totalRecords ?? 0;
  const invalidateList = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["employee"] }),
    [queryClient],
  );
  const handleView = useCallback((item: IEmployee) => {
    setSelectedItem(item);
    setDialogOpen(true);
  }, []);
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
          <EmployeeTable
            data={data}
            totalRecords={totalRecords}
            onView={handleView}
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
            canView={mounted ? canView : false}
          />
        )}
      </div>
      {dialogOpen && selectedItem && (
        <Dialog
          title={t("viewEmployee")}
          onClose={handleCloseDialog}
          width={560}
        >
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  {t("employeeCode")}
                </span>
                <p className="font-medium">{selectedItem.employeeCode}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  {t("employeeName")}
                </span>
                <p className="font-medium">{selectedItem.employeeName || "—"}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  {tc("department")}
                </span>
                <p className="font-medium">{selectedItem.departmentName || "—"}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  {tc("designation")}
                </span>
                <p className="font-medium">{selectedItem.designationName || "—"}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  {tc("workLocation")}
                </span>
                <p className="font-medium">{selectedItem.workLocationName || "—"}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  {tc("phone")}
                </span>
                <p className="font-medium">{selectedItem.phoneNo || "—"}</p>
              </div>
            </div>
            <DialogActionsBar>
              <Button themeColor="primary" onClick={handleCloseDialog}>
                {tc("close")}
              </Button>
            </DialogActionsBar>
          </div>
        </Dialog>
      )}
    </div>
  );
}
