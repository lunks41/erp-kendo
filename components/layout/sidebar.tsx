"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import {
  ChevronRight,
  Ship,
  Users,
  FileText,
  Settings,
  FolderKanban,
  Receipt,
  CreditCard,
  Banknote,
  BookOpenText,
  Truck,
  Landmark,
  ClipboardList,
  FileCheck,
  LayoutDashboard,
  MapPin,
  Coins,
  Globe,
  Calendar,
  Building,
  GraduationCap,
  FileX,
  Wallet,
  FileStack,
  Anchor,
  Box,
  Briefcase,
  Scale,
  ArrowLeftRight,
  BarChart,
  Sliders,
  ChartArea,
  CalendarDays,
  HandCoins,
  FileMinus,
  FilePlus,
  Undo2,
  MinusCircle,
  PlusCircle,
  Lock,
  UserCheck,
  ShieldCheck,
  Shield,
  Share,
  UserRoundPen,
  History,
  AlertTriangle,
  CircleUserRound,
  Grid,
  Search,
  Package,
  Target,
  Key,
  Award,
  CircleDot,
  Pencil,
  Clock,
} from "lucide-react";
import type { IUserTransactionRights } from "@/interfaces/auth";
import { useAuthStore } from "@/stores/auth-store";

// Icon mapping for modules (main categories)
function getModuleIcon(moduleCode: string): React.ComponentType<{ className?: string }> {
  const code = moduleCode.toLowerCase();
  const map: Record<string, React.ComponentType<{ className?: string }>> = {
    master: FileText,
    operations: FolderKanban,
    hr: Users,
    ar: Receipt,
    ap: CreditCard,
    cb: Banknote,
    gl: BookOpenText,
    logistics: Truck,
    admin: Landmark,
    setting: Settings,
    settings: Settings,
    request: ClipboardList,
    requests: ClipboardList,
    approvals: FileCheck,
    document: FileText,
    dashboard: LayoutDashboard,
    inquiry: Search,
  };
  return map[code] ?? FolderKanban;
}

// Icon mapping for transactions
function getTransactionIcon(transactionCode: string): React.ComponentType<{ className?: string }> {
  const code = transactionCode.toLowerCase().replace(/-/g, "");
  const map: Record<string, React.ComponentType<{ className?: string }>> = {
    accountgroup: Landmark,
    accountsetup: Sliders,
    accounttype: Landmark,
    bank: Banknote,
    barge: Ship,
    category: FolderKanban,
    chartofaccount: ChartArea,
    charge: Coins,
    country: Globe,
    creditterm: Calendar,
    currency: Coins,
    customer: Users,
    department: Building,
    designation: GraduationCap,
    documenttype: FileX,
    entitytypes: Building,
    gst: FileText,
    leavetype: CalendarDays,
    loantype: Wallet,
    ordertype: FileStack,
    paymenttype: Wallet,
    port: Anchor,
    portregion: MapPin,
    product: Box,
    servicetype: Briefcase,
    subcategory: FolderKanban,
    supplier: Building,
    task: FileCheck,
    tax: FileText,
    uom: Scale,
    vessel: Ship,
    voyage: ArrowLeftRight,
    worklocation: MapPin,
    checklist: ClipboardList,
    tariff: Coins,
    employees: Users,
    loan: Wallet,
    leave: CalendarDays,
    attendance: Clock,
    payruns: Calendar,
    setting: Settings,
    invoice: Receipt,
    debitnote: FileMinus,
    creditnote: FilePlus,
    receipt: Receipt,
    refund: Undo2,
    adjustment: Sliders,
    docsetoff: FileStack,
    documentsetoff: FileStack,
    payment: MinusCircle,
    batchpayment: FileStack,
    transfer: ArrowLeftRight,
    reconciliation: Scale,
    generalpayment: MinusCircle,
    generalreceipt: PlusCircle,
    banktransfer: ArrowLeftRight,
    journalentry: BookOpenText,
    arapcontra: ArrowLeftRight,
    yearendprocess: Lock,
    periodclose: Lock,
    openingbalance: Scale,
    users: Users,
    userroles: UserCheck,
    usergroup: Users,
    userrights: ShieldCheck,
    usergrouprights: Shield,
    sharedata: Share,
    profile: UserRoundPen,
    auditlog: History,
    errorlog: AlertTriangle,
    userlog: CircleUserRound,
    grid: Grid,
    document: FileText,
    decimal: Scale,
    finance: Wallet,
    lookup: Search,
    carrier: Truck,
    consignmenttype: Package,
    jobstatus: CircleDot,
    landingpurpose: Target,
    landingtype: MapPin,
    passtype: Key,
    rank: Award,
    servicemode: Sliders,
    taskstatus: CircleDot,
    visa: Globe,
    geolocation: MapPin,
    transportlocation: MapPin,
    transportmode: Sliders,
    vesseltype: Ship,
    cbbankrecon: Scale,
    cbbanktransfer: ArrowLeftRight,
    cbgenpayment: MinusCircle,
    cbgenreceipt: PlusCircle,
    cbpettycash: HandCoins,
    freight: Truck,
    transportation: ArrowLeftRight,
    reports: BarChart,
    overview: BarChart,
  };
  return map[code] ?? FileText;
}

export interface DynamicMenuItem {
  title: string;
  url: string;
  transactionCode: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface DynamicMenuGroup {
  title: string;
  url: string;
  moduleCode: string;
  icon: React.ComponentType<{ className?: string }>;
  items: DynamicMenuItem[];
}

function buildDynamicMenu(transactions: IUserTransactionRights[]): DynamicMenuGroup[] {
  const menuMap = new Map<string, DynamicMenuGroup>();

  const visible = transactions.filter((t) => t.isVisible === true);

  visible.forEach((t) => {
    const key = `${t.moduleId}_${t.moduleName}`;
    const moduleCode = t.moduleCode.toLowerCase();
    const transactionCode = t.transactionCode.toLowerCase().replace(/-/g, "");
    if (!menuMap.has(key)) {
      menuMap.set(key, {
        title: t.moduleName,
        url: `/${moduleCode}`,
        moduleCode,
        icon: getModuleIcon(t.moduleCode),
        items: [],
      });
    }
    const group = menuMap.get(key)!;
    group.items.push({
      title: t.transactionName,
      url: `/${moduleCode}/${t.transactionCode.toLowerCase()}`,
      transactionCode,
      icon: getTransactionIcon(t.transactionCode),
    });
  });

  return Array.from(menuMap.values()).filter((g) => g.items.length > 0);
}

function useUserTransactions() {
  const { currentCompany, user, getUserTransactions } = useAuthStore();
  const [transactions, setTransactions] = useState<IUserTransactionRights[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!currentCompany || !user) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await getUserTransactions();
        if (!cancelled && Array.isArray(data)) {
          setTransactions(data);
        } else if (!cancelled) {
          setTransactions([]);
        }
      } catch {
        if (!cancelled) setTransactions([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [currentCompany?.companyId, user?.userId, getUserTransactions]);

  return { transactions, isLoading };
}

interface SidebarProps {
  companyId: string;
}

export function Sidebar({ companyId }: SidebarProps) {
  const t = useTranslations("sidebar");
  const tMenu = useTranslations("sidebarMenu");
  const pathname = usePathname();
  const { transactions, isLoading } = useUserTransactions();
  const [openModule, setOpenModule] = useState<string | null>(null);

  const dynamicMenu = useMemo(() => buildDynamicMenu(transactions), [transactions]);

  const getMenuLabel = useCallback(
    (code: string, fallback: string) => {
      const val = tMenu(code);
      // When key is missing, next-intl returns the key or "sidebarMenu.code" — use fallback instead
      if (!val || val === code || val.startsWith("sidebarMenu.")) return fallback;
      return val;
    },
    [tMenu],
  );

  const getUrl = useCallback(
    (path: string) => {
      if (!companyId || path === "#") return path;
      return `/${companyId}${path}`;
    },
    [companyId]
  );

  // Expand module that contains current path
  useEffect(() => {
    if (!pathname) return;
    for (const group of dynamicMenu) {
      for (const item of group.items) {
        if (pathname === getUrl(item.url) || pathname.startsWith(getUrl(item.url) + "/")) {
          setOpenModule((m) => m ?? group.title);
          return;
        }
      }
    }
  }, [pathname, dynamicMenu, getUrl]);

  const dashboardHref = getUrl("");
  const isDashboardActive =
    pathname === dashboardHref ||
    pathname === `/${companyId}` ||
    (pathname?.endsWith(companyId) && !pathname?.slice(pathname.indexOf(companyId) + companyId.length).split("/").filter(Boolean).length);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {/* Dashboard / Home - always first */}
        <div className="mb-2">
          <Link
            href={companyId ? `/${companyId}` : "#"}
            className={`flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-colors ${
              isDashboardActive
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span className="flex-1">{t("dashboard")}</span>
            <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isDashboardActive ? "opacity-100" : "opacity-50"}`} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-slate-500 dark:text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span className="text-xs">{t("loadingMenu")}</span>
          </div>
        ) : (
          dynamicMenu.map((group) => {
            const isOpen = openModule === group.title;
            const GroupIcon = group.icon;
            return (
              <div key={group.title} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setOpenModule((m) => (m === group.title ? null : group.title))}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <GroupIcon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{getMenuLabel(group.moduleCode, group.title)}</span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  />
                </button>
                {isOpen && group.items.length > 0 && (
                  <div className="ml-3 space-y-0.5 border-l border-slate-200 pl-2 dark:border-slate-700">
                    {group.items.map((item) => {
                      const href = getUrl(item.url);
                      const isActive =
                        pathname === href || pathname?.startsWith(href + "/");
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.url}
                          href={href}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                            isActive
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="flex-1 truncate">{getMenuLabel(item.transactionCode, item.title)}</span>
                          <ChevronRight
                            className={`h-3 w-3 shrink-0 ${isActive ? "opacity-100" : "opacity-50"}`}
                          />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
}
