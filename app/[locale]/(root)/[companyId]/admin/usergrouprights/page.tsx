"use client";

import { usePermissionStore } from "@/stores/permission-store";
import { AdminTransactionId, ModuleId } from "@/lib/utils";
import { UserGroupRightsTable } from "./components/usergrouprights-table";

export default function AdminGroupRightsPage() {
  const moduleId = ModuleId.admin;
  const transactionId = AdminTransactionId.userGroupRights;
  const { hasPermission } = usePermissionStore();
  hasPermission(moduleId, transactionId, "isRead");

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          Group Rights
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Manage group rights
        </p>
      </div>
      <UserGroupRightsTable />
    </div>
  );
}
