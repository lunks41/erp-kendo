"use client";

import { usePermissionStore } from "@/stores/permission-store";
import { AdminTransactionId, ModuleId } from "@/lib/utils";
import { UserRightsTable } from "./components/userrights-table";

export default function AdminUserRightsPage() {
  const moduleId = ModuleId.admin;
  const transactionId = AdminTransactionId.userRights;
  const { hasPermission } = usePermissionStore();
  hasPermission(moduleId, transactionId, "isRead"); // Permission check placeholder

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          User Rights
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Manage user rights
        </p>
      </div>
      <UserRightsTable />
    </div>
  );
}
