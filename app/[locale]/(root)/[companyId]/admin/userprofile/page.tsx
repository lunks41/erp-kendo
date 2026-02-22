"use client";

import { User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminUserProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
          <User className="h-5 w-5" />
          Account Profile
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Manage your account settings, personal information, and security preferences
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">User</p>
            <p className="text-slate-600 dark:text-slate-400">
              {user?.userName ?? "—"} ({user?.userCode ?? "—"})
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</p>
            <p className="text-slate-600 dark:text-slate-400">{user?.userEmail ?? "—"}</p>
          </div>
          <p className="text-sm text-slate-500">
            Profile editing (personal info, password, photo upload) can be extended via
            /admin/GetUserProfile and /admin/SaveUserProfile API endpoints.
          </p>
        </div>
      </div>
    </div>
  );
}
