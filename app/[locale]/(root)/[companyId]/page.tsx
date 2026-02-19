"use client";

import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Banknote,
  BookOpenText,
  Users,
  Building,
} from "lucide-react";

/** Flat tile: icon on top in colored block, label below (reference style) */
const moduleTiles = [
  {
    label: "Customer",
    href: (cid: string) => `/${cid}/master/customer`,
    icon: Users,
    iconBg: "bg-blue-400 text-white dark:bg-blue-500",
  },
  {
    label: "Supplier",
    href: (cid: string) => `/${cid}/master/supplier`,
    icon: Building,
    iconBg: "bg-slate-500 text-white dark:bg-slate-600",
  },
  {
    label: "Bank",
    href: (cid: string) => `/${cid}/master/bank`,
    icon: Banknote,
    iconBg: "bg-teal-500 text-white dark:bg-teal-600",
  },
  {
    label: "Receivables",
    href: (cid: string) => `/${cid}/ar/overview`,
    icon: Receipt,
    iconBg: "bg-amber-400 text-white dark:bg-amber-500",
  },
  {
    label: "Payables",
    href: (cid: string) => `/${cid}/ap/overview`,
    icon: CreditCard,
    iconBg: "bg-emerald-500 text-white dark:bg-emerald-600",
  },
  {
    label: "Cash Book",
    href: (cid: string) => `/${cid}/cb/overview`,
    icon: Banknote,
    iconBg: "bg-blue-500 text-white dark:bg-blue-600",
  },
  {
    label: "General Ledger",
    href: (cid: string) => `/${cid}/gl/overview`,
    icon: BookOpenText,
    iconBg: "bg-violet-500 text-white dark:bg-violet-600",
  },
];

export default function DashboardPage() {
  const params = useParams();
  const companyId = (params?.companyId as string) ?? "";
  const { user, currentCompany } = useAuthStore();

  const userName = user?.userName ?? "User";
  const companyName = currentCompany?.companyName ?? "";

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Welcome */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <LayoutDashboard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Welcome back, {userName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {companyName
                ? `You are working in ${companyName}`
                : "Select a company to get started"}
            </p>
          </div>
        </div>
      </section>

      {/* Module grid – icon on top, label below, flat colored tiles */}
      <section className="rounded-xl bg-slate-100/80 p-6 dark:bg-slate-800/30">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {moduleTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.label}
                href={tile.href(companyId)}
                className="flex flex-col items-center gap-3 rounded-xl p-2 transition-opacity hover:opacity-90"
              >
                <div
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl ${tile.iconBg}`}
                >
                  <Icon className="h-10 w-10" strokeWidth={1.25} />
                </div>
                <span className="text-center text-sm font-medium text-slate-800 dark:text-slate-200">
                  {tile.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Info */}
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/30">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Use the sidebar to navigate to modules and transactions. Your menu is
          based on your assigned permissions.
        </p>
      </section>
    </div>
  );
}
