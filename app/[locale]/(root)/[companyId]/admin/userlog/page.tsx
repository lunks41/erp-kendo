"use client";

import { useCallback, useState } from "react";
import { IUserLog } from "@/interfaces/admin";
import { ApiResponse } from "@/interfaces/auth";
import { AuditLog } from "@/lib/api-routes";
import { AdminTransactionId, ModuleId } from "@/lib/utils";
import { useGet } from "@/hooks/use-common";
import { TableSkeleton } from "@/components/skeleton";
import { UserLogTable } from "./components/userlog-table";

export default function AdminUserLogPage() {
  const moduleId = ModuleId.admin;
  const transactionId = AdminTransactionId.notDefine;
  const [searchInput, setSearchInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const {
    data: userLogsResponse,
    refetch: refetchUserLogs,
    isLoading: isLoadingUserLogs,
  } = useGet<IUserLog>(`${AuditLog.getuserlog}`, "userlogs", searchFilter);

  const { data: userLogsData } = (userLogsResponse as ApiResponse<IUserLog>) ?? {
    result: 0,
    message: "",
    data: [],
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          User Logs
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          View system user logs
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        {isLoadingUserLogs ? (
          <TableSkeleton rowCount={8} columnCount={5} />
        ) : (
          <UserLogTable
            data={userLogsData || []}
            isLoading={isLoadingUserLogs}
            onRefresh={refetchUserLogs}
            searchFilter={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={() => setSearchFilter(searchInput)}
            onSearchClear={() => {
              setSearchInput("");
              setSearchFilter("");
            }}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        )}
      </div>
    </div>
  );
}
