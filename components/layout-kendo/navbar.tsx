"use client";

import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { LayoutDashboard, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "ERP";

interface NavbarProps {
  companyId: string;
}

export function Navbar({ companyId }: NavbarProps) {
  const router = useRouter();
  const { user, logOut } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logOut();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-11 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <Link
          href={companyId ? `/${companyId}/master/customer` : "/"}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white"
        >
          <LayoutDashboard className="h-5 w-5 text-indigo-500" />
          <span>{SITE_NAME}</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{user?.userName || "User"}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-3 py-1.5 dark:border-slate-700">
                  <p className="truncate text-xs font-medium text-slate-900 dark:text-white">
                    {user?.userName || "User"}
                  </p>
                  <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {user?.userEmail || ""}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
