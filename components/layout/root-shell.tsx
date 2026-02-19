"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/stores/auth-store";

interface RootShellProps {
  companyId: string;
  children: React.ReactNode;
}

export function RootShell({ companyId, children }: RootShellProps) {
  const { currentCompany, companies, switchCompany } = useAuthStore();

  // Sync URL companyId to auth store when opening in new tab or navigating directly
  useEffect(() => {
    if (!companyId || companies.length === 0) return;
    if (currentCompany?.companyId === companyId) return;
    const company = companies.find((c) => c.companyId.toString() === companyId);
    if (!company) return;
    switchCompany(companyId, true).catch(() => {});
  }, [companyId, companies, currentCompany?.companyId, switchCompany]);

  return (
    <div className="flex h-screen flex-col bg-slate-100 dark:bg-slate-950">
      <Navbar companyId={companyId} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar companyId={companyId} />

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
