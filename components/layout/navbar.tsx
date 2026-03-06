"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { useAuthStore } from "@/stores/auth-store";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  companyId: string;
}

export function Navbar({ companyId }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user, logOut, companies, isCompanySwitchEnabled } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const showCompanyDropdown = isCompanySwitchEnabled && companies.length > 1;
  const currentCompanyItem = companies.find(
    (c) => c.companyId.toString() === companyId,
  );
  const companyName = currentCompanyItem?.companyName ?? "";

  const handleCompanyChange = (e: { value: { companyId: string } | null }) => {
    const newCompany = e.value;
    if (!newCompany || newCompany.companyId === companyId) return;
    const newPath = pathname.replace(/^\/[^/]+/, `/${newCompany.companyId}`);
    const fullUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${locale}${newPath}`;
    window.open(fullUrl, "_blank");
  };

  const handleLogout = async () => {
    await logOut();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-slate-200/80 bg-white px-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/95">
      <div className="flex items-center gap-4">
        {/* 1. Company dropdown */}
        {showCompanyDropdown ? (
          <DropDownList
            data={companies}
            textField="companyName"
            dataItemKey="companyId"
            value={currentCompanyItem ?? null}
            onChange={handleCompanyChange}
            style={{ minWidth: 140, fontSize: "0.8125rem" }}
          />
        ) : companyName ? (
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            {companyName}
          </span>
        ) : null}
      </div>

      {/* 2. Company name (centered, bold) - Fintech-style title */}
      <div className="flex flex-1 items-center justify-center px-4">
        {companyName && (
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            {companyName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* 3. Language */}
        <LanguageSwitcher />

        {/* 4. Kendo theme */}
        <ThemeSwitcher variant="compact" />

        {/* 5. User menu - Fintech-style */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <User className="h-4 w-4 shrink-0 opacity-80" />
            <span className="hidden sm:inline">{user?.userName || "User"}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
          </button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-lg border border-slate-200/80 bg-white py-1 shadow-lg dark:border-slate-700/80 dark:bg-slate-800">
                <div className="border-b border-slate-200/80 px-3 py-2 dark:border-slate-700/80">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                    {user?.userName || "User"}
                  </p>
                  <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {user?.userEmail || ""}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <LogOut className="h-3.5 w-3.5 shrink-0" />
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
