"use client";

import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface RootShellProps {
  companyId: string;
  children: React.ReactNode;
}

export function RootShell({ companyId, children }: RootShellProps) {
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
