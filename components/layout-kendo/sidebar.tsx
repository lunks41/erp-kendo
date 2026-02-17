"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { Ship, Users, FileText, Settings, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface SidebarProps {
  companyId: string;
}

const navItems = [
  {
    labelKey: "master.port",
    href: (cid: string) => `/${cid}/master/port`,
    icon: Ship,
  },
  {
    labelKey: "master.customer",
    href: (cid: string) => `/${cid}/master/customer`,
    icon: Users,
  },
  {
    label: "Reports",
    href: (cid: string) => `/${cid}/reports`,
    icon: FileText,
  },
  {
    label: "Settings",
    href: (cid: string) => `/${cid}/settings`,
    icon: Settings,
  },
];

export function Sidebar({ companyId }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
      <nav className="flex-1 space-y-1 p-4">
        <div className="mb-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Master
          </p>
        </div>
        {navItems.map((item) => {
          const href = item.href(companyId);
          const label =
            "labelKey" in item
              ? t(item.labelKey as "master.port" | "master.customer")
              : (item as { label: string }).label;
          const Icon = item.icon;
          const isActive = pathname?.includes(href.split("?")[0]);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight
                className={`h-4 w-4 shrink-0 ${isActive ? "opacity-100" : "opacity-50"}`}
              />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
