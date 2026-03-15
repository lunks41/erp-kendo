"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import {
  ChevronRight,
  ChevronLeft,
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
  Clock,
} from "lucide-react";
import type { IUserTransactionRights } from "@/interfaces/auth";
import { useAuthStore } from "@/stores/auth-store";
import { useSidebarStore } from "@/stores/sidebar-store";

// Module icon colors (parent + sub-items inherit)
function getModuleIconColor(moduleCode: string): string {
  const code = moduleCode.toLowerCase();
  const map: Record<string, string> = {
    master: "text-blue-600 dark:text-blue-400",
    operations: "text-violet-600 dark:text-violet-400",
    hr: "text-rose-600 dark:text-rose-400",
    ar: "text-emerald-600 dark:text-emerald-400",
    ap: "text-amber-600 dark:text-amber-400",
    cb: "text-cyan-600 dark:text-cyan-400",
    gl: "text-indigo-600 dark:text-indigo-400",
    logistics: "text-orange-600 dark:text-orange-400",
    admin: "text-slate-600 dark:text-slate-400",
    setting: "text-slate-600 dark:text-slate-400",
    settings: "text-slate-600 dark:text-slate-400",
    dashboard: "text-indigo-600 dark:text-indigo-400",
    inquiry: "text-sky-600 dark:text-sky-400",
  };
  return map[code] ?? "text-slate-600 dark:text-slate-400";
}

// Master transaction category icon colors (category + its sub-items inherit)
function getCategoryIconColor(transCategoryCode: string): string {
  const code = transCategoryCode.toLowerCase().replace(/\s+/g, "");
  const map: Record<string, string> = {
    region: "text-teal-600 dark:text-teal-400",
    product: "text-lime-600 dark:text-lime-400",
    customer: "text-fuchsia-600 dark:text-fuchsia-400",
    "customer/vendor": "text-fuchsia-600 dark:text-fuchsia-400",
    finance: "text-amber-600 dark:text-amber-400",
    glcode: "text-blue-600 dark:text-blue-400",
    category: "text-violet-600 dark:text-violet-400",
    employee: "text-rose-600 dark:text-rose-400",
    other: "text-slate-600 dark:text-slate-400",
    others: "text-slate-600 dark:text-slate-400",
  };
  return map[code] ?? "text-slate-600 dark:text-slate-400";
}

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

// Icon mapping for Master sub-categories (AdmTransactionCategory: Region, Product, Finance, etc.)
function getCategoryIcon(transCategoryCode: string): React.ComponentType<{ className?: string }> {
  const code = transCategoryCode.toLowerCase().replace(/\s+/g, "");
  const map: Record<string, React.ComponentType<{ className?: string }>> = {
    region: MapPin,
    product: Box,
    customer: Users,
    "customer/vendor": Users,
    finance: Wallet,
    glcode: ChartArea,
    category: FolderKanban,
    employee: Users,
    other: CircleDot,
    others: CircleDot,
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

/** Category sub-group for Master module (AdmTransactionCategory) */
export interface DynamicMenuCategory {
  title: string;
  transCategoryCode: string;
  seqNo: number;
  items: DynamicMenuItem[];
}

export interface DynamicMenuGroup {
  title: string;
  url: string;
  moduleCode: string;
  icon: React.ComponentType<{ className?: string }>;
  items: DynamicMenuItem[];
  /** When set (e.g. for Master), sidebar shows category subheaders and items under each */
  categoryGroups?: DynamicMenuCategory[];
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
    const item: DynamicMenuItem = {
      title: t.transactionName,
      url: `/${moduleCode}/${t.transactionCode.toLowerCase()}`,
      transactionCode,
      icon: getTransactionIcon(t.transactionCode),
    };
    group.items.push(item);

    // For Master module, also group by AdmTransactionCategory for sidebar sub-grouping
    if (moduleCode === "master" && t.transCategoryId !== undefined) {
      if (!group.categoryGroups) group.categoryGroups = [];
      const catSeq = t.transCatSeqNo ?? t.transCategoryId ?? 999;
      const catName =
        (t.transCategoryName && t.transCategoryName.trim()) ||
        (t.transCategoryCode && t.transCategoryCode.trim())
          ? (t.transCategoryName || t.transCategoryCode || "").trim()
          : "Other";
      const catCode = (t.transCategoryCode || "").trim() || "other";
      let cat = group.categoryGroups.find((c) => c.transCategoryCode === catCode);
      if (!cat) {
        cat = {
          title: catName,
          transCategoryCode: catCode,
          seqNo: catSeq,
          items: [],
        };
        group.categoryGroups.push(cat);
      }
      cat.items.push(item);
    }
  });

  // Sort category groups by seqNo (AdmTransactionCategory.SeqNo / transCatSeqNo)
  const out = Array.from(menuMap.values()).filter((g) => g.items.length > 0);
  out.forEach((g) => {
    if (g.categoryGroups && g.categoryGroups.length > 0) {
      g.categoryGroups.sort((a, b) => a.seqNo - b.seqNo);
    }
  });

  return out;
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
  }, [currentCompany, currentCompany?.companyId, user, user?.userId, getUserTransactions]);

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
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [pinnedGroup, setPinnedGroup] = useState<string | null>(null);
  const [floatingMenuRect, setFloatingMenuRect] = useState<{ top: number; left: number } | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openFloating = pinnedGroup ?? hoveredGroup;

  useEffect(
    () => () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    },
    [],
  );
  /** Categories user has explicitly collapsed */
  const [closedCategoryKeys, setClosedCategoryKeys] = useState<Set<string>>(new Set());
  /** Categories user has explicitly expanded (overrides default closed when on another page) */
  const [userOpenedCategoryKeys, setUserOpenedCategoryKeys] = useState<Set<string>>(new Set());

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

  // Derive which module contains current path (avoids setState in effect)
  const moduleContainingPath = useMemo(() => {
    if (!pathname) return null;
    for (const group of dynamicMenu) {
      for (const item of group.items) {
        const href = getUrl(item.url);
        if (pathname === href || pathname.startsWith(href + "/")) return group.title;
      }
    }
    return null;
  }, [pathname, dynamicMenu, getUrl]);

  // User can toggle; when null we use path-derived module
  const isModuleOpen = useCallback(
    (groupTitle: string) => openModule !== null ? openModule === groupTitle : moduleContainingPath === groupTitle,
    [openModule, moduleContainingPath]
  );

  const toggleModule = useCallback((groupTitle: string) => {
    setOpenModule((m) => (m === groupTitle ? null : groupTitle));
  }, []);

  const categoryKey = useCallback((groupTitle: string, transCategoryCode: string) => `${groupTitle}|${transCategoryCode}`, []);

  /** Which category (in Master) contains the current path – used to keep only that one open by default */
  const categoryContainingPathKey = useMemo(() => {
    if (!pathname) return null;
    for (const group of dynamicMenu) {
      if (!group.categoryGroups?.length) continue;
      for (const cat of group.categoryGroups) {
        for (const item of cat.items) {
          const href = getUrl(item.url);
          if (pathname === href || pathname.startsWith(href + "/")) return categoryKey(group.title, cat.transCategoryCode);
        }
      }
    }
    return null;
  }, [pathname, dynamicMenu, getUrl, categoryKey]);

  /** By default, close all Master categories except the one containing the current path (when not on Master, close all) */
  const defaultClosedCategoryKeys = useMemo(() => {
    const set = new Set<string>();
    const group = dynamicMenu.find((g) => g.title === "Master");
    if (!group?.categoryGroups?.length) return set;
    for (const cat of group.categoryGroups) {
      const key = categoryKey("Master", cat.transCategoryCode);
      if (categoryContainingPathKey === null || key !== categoryContainingPathKey) set.add(key);
    }
    return set;
  }, [dynamicMenu, categoryContainingPathKey, categoryKey]);

  /** Effective closed = default (from path) + user closed, minus user opened */
  const effectiveClosedCategoryKeys = useMemo(() => {
    const closed = new Set([...defaultClosedCategoryKeys, ...closedCategoryKeys]);
    userOpenedCategoryKeys.forEach((k) => closed.delete(k));
    return closed;
  }, [defaultClosedCategoryKeys, closedCategoryKeys, userOpenedCategoryKeys]);

  const isCategoryOpen = useCallback(
    (groupTitle: string, transCategoryCode: string) =>
      !effectiveClosedCategoryKeys.has(categoryKey(groupTitle, transCategoryCode)),
    [effectiveClosedCategoryKeys, categoryKey]
  );

  const toggleCategory = useCallback((groupTitle: string, transCategoryCode: string) => {
    const key = categoryKey(groupTitle, transCategoryCode);
    const isOpen = !effectiveClosedCategoryKeys.has(key);
    if (isOpen) {
      setClosedCategoryKeys((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      setUserOpenedCategoryKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    } else {
      setClosedCategoryKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setUserOpenedCategoryKeys((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
    }
  }, [categoryKey, effectiveClosedCategoryKeys]);

  /** When user clicks a menu link, close all other categories so only the current one stays open */
  const closeOtherCategoriesExcept = useCallback(
    (groupTitle: string, keepCategoryCode: string) => {
      const group = dynamicMenu.find((g) => g.title === groupTitle);
      if (!group?.categoryGroups?.length) return;
      const keepKey = categoryKey(groupTitle, keepCategoryCode);
      setClosedCategoryKeys((prev) => {
        const next = new Set(prev);
        for (const cat of group.categoryGroups!) {
          const key = categoryKey(groupTitle, cat.transCategoryCode);
          if (key === keepKey) next.delete(key);
          else next.add(key);
        }
        return next;
      });
      setUserOpenedCategoryKeys(new Set());
    },
    [dynamicMenu, categoryKey]
  );

  const dashboardHref = getUrl("");
  const isDashboardActive =
    pathname === dashboardHref ||
    pathname === `/${companyId}` ||
    (pathname?.endsWith(companyId) && !pathname?.slice(pathname.indexOf(companyId) + companyId.length).split("/").filter(Boolean).length);

  const userName = useAuthStore((s) => s.user?.userName) ?? "User";

  return (
    <>
    {/* Click-outside overlay when floating menu is pinned (collapsed) */}
    {collapsed && pinnedGroup && (
      <div
        className="fixed inset-0 z-40"
        aria-hidden
        onClick={() => {
          setPinnedGroup(null);
          setHoveredGroup(null);
          setFloatingMenuRect(null);
        }}
      />
    )}
    <aside
      className={`flex shrink-0 flex-col border-r border-slate-200/80 bg-white transition-[width] duration-200 ease-in-out dark:border-slate-700/80 dark:bg-slate-900/80 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Fintech-style header: compact logo + greeting + toggle */}
      <div
        className={`flex shrink-0 flex-col gap-1 border-b border-slate-200/80 dark:border-slate-700/80 ${
          collapsed ? "items-center px-0 py-3" : "px-4 py-4"
        }`}
      >
        <div
          className={`flex w-full items-center gap-2 ${
            collapsed ? "flex-col" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
              <LayoutDashboard className="h-4 w-4" aria-hidden />
            </div>
            {!collapsed && (
              <span className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                {t("dashboard")}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            title={collapsed ? t("expandSidebar") : t("collapseSidebar")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        {!collapsed && (
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t("greeting", { userName })}
          </p>
        )}
      </div>

      <nav
        className={`flex-1 space-y-0.5 overflow-y-auto ${
          collapsed ? "p-2" : "p-3"
        }`}
      >
        {/* Dashboard / Home - always first */}
        <div className="mb-2">
          <Link
            href={companyId ? `/${companyId}` : "#"}
            onClick={() => setOpenModule(null)}
            title={collapsed ? t("dashboard") : undefined}
            className={`flex items-center rounded-lg text-xs font-medium transition-colors ${
              collapsed ? "justify-center px-0 py-2" : "gap-2 px-2.5 py-2"
            } ${
              isDashboardActive
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            {!collapsed && (
              <>
                <span className="flex-1">{t("dashboard")}</span>
                <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isDashboardActive ? "opacity-100" : "opacity-50"}`} />
              </>
            )}
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-slate-500 dark:text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span className="text-xs">{t("loadingMenu")}</span>
          </div>
        ) : (
          dynamicMenu.map((group) => {
            const isOpen = isModuleOpen(group.title);
            const GroupIcon = group.icon;
            const moduleColor = getModuleIconColor(group.moduleCode);
            const label = getMenuLabel(group.moduleCode, group.title);
            const hasSubmenu = group.items.length > 0;
            const isParentOfActive = moduleContainingPath === group.title;

            const handleGroupMouseEnter = (e: React.MouseEvent) => {
              if (!collapsed || !hasSubmenu || pinnedGroup) return;
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              // Overlap 12px into sidebar to avoid gap (prevents flicker when moving cursor)
              setFloatingMenuRect({ top: rect.top, left: rect.right - 12 });
              setHoveredGroup(group.title);
            };

            const handleGroupMouseLeave = () => {
              if (!collapsed || pinnedGroup) return;
              hoverTimeoutRef.current = setTimeout(() => {
                setHoveredGroup(null);
                setFloatingMenuRect(null);
                hoverTimeoutRef.current = null;
              }, 300);
            };

            const handleGroupClick = (e: React.MouseEvent) => {
              if (collapsed && hasSubmenu) {
                const nextPinned = pinnedGroup === group.title ? null : group.title;
                setPinnedGroup(nextPinned);
                if (nextPinned) {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setFloatingMenuRect({ top: rect.top, left: rect.right - 12 });
                } else {
                  setFloatingMenuRect(null);
                }
                return;
              }
              toggleModule(group.title);
            };

            const handleFloatingEnter = () => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
            };

            const handleFloatingLeave = () => {
              if (pinnedGroup) return;
              setHoveredGroup(null);
              setFloatingMenuRect(null);
            };

            const handleCloseFloating = () => {
              setPinnedGroup(null);
              setHoveredGroup(null);
              setFloatingMenuRect(null);
            };

            return (
              <div
                key={group.title}
                className="relative space-y-0.5"
                onMouseEnter={handleGroupMouseEnter}
                onMouseLeave={handleGroupMouseLeave}
              >
                <button
                  type="button"
                  onClick={handleGroupClick}
                  title={collapsed ? label : undefined}
                  className={`flex w-full items-center rounded-lg text-left text-xs font-medium transition-colors ${
                    collapsed ? "justify-center px-0 py-2" : "gap-2 px-2.5 py-2"
                  } ${
                    isParentOfActive
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <GroupIcon className={`h-4 w-4 shrink-0 ${moduleColor}`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{label}</span>
                      <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                      />
                    </>
                  )}
                </button>
                {!collapsed && isOpen && group.items.length > 0 && (
                  <div className="ml-3 space-y-0.5 border-l border-slate-200/80 pl-2 dark:border-slate-700/80">
                    {group.categoryGroups && group.categoryGroups.length > 0
                      ? group.categoryGroups.map((cat) => {
                          const catOpen = isCategoryOpen(group.title, cat.transCategoryCode);
                          const CatIcon = getCategoryIcon(cat.transCategoryCode);
                          const catColor = getCategoryIconColor(cat.transCategoryCode);
                          const catKey = categoryKey(group.title, cat.transCategoryCode);
                          const isCategoryParentOfActive = categoryContainingPathKey === catKey;
                          return (
                            <div key={cat.transCategoryCode} className="space-y-0.5">
                              <button
                                type="button"
                                onClick={() => toggleCategory(group.title, cat.transCategoryCode)}
                                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                                  isCategoryParentOfActive
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                }`}
                              >
                                <CatIcon className={`h-4 w-4 shrink-0 ${catColor}`} />
                                <span className="flex-1">{cat.title}</span>
                                <ChevronRight
                                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${catOpen ? "rotate-90" : ""}`}
                                />
                              </button>
                              {catOpen && (
                                <div className="ml-3 space-y-0.5 border-l border-slate-200/80 pl-2 dark:border-slate-700/80">
                                  {cat.items.map((item) => {
                                    const href = getUrl(item.url);
                                    const isActive =
                                      pathname === href || pathname?.startsWith(href + "/");
                                    const ItemIcon = item.icon;
                                    const itemColor = catColor;
                                    return (
                                      <Link
                                        key={item.url}
                                        href={href}
                                        onClick={() => closeOtherCategoriesExcept(group.title, cat.transCategoryCode)}
                                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                                          isActive
                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                        }`}
                                      >
                                        <ItemIcon className={`h-3.5 w-3.5 shrink-0 ${itemColor}`} />
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
                      : group.items.map((item) => {
                          const href = getUrl(item.url);
                          const isActive =
                            pathname === href || pathname?.startsWith(href + "/");
                          const ItemIcon = item.icon;
                          const itemColor = moduleColor;
                          return (
                            <Link
                              key={item.url}
                              href={href}
                              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                isActive
                                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                              }`}
                            >
                              <ItemIcon className={`h-3.5 w-3.5 shrink-0 ${itemColor}`} />
                              <span className="flex-1 truncate">{getMenuLabel(item.transactionCode, item.title)}</span>
                              <ChevronRight
                                className={`h-3 w-3 shrink-0 ${isActive ? "opacity-100" : "opacity-50"}`}
                              />
                            </Link>
                          );
                        })}
                  </div>
                )}
                {/* Floating submenu when collapsed (hover or click/pin) */}
                {collapsed && openFloating === group.title && hasSubmenu && floatingMenuRect && (
                  <div
                    className="fixed z-50 min-w-[200px] rounded-lg border border-slate-200/80 bg-white py-2 shadow-lg dark:border-slate-700/80 dark:bg-slate-800"
                    style={{ top: floatingMenuRect.top, left: floatingMenuRect.left }}
                    onMouseEnter={handleFloatingEnter}
                    onMouseLeave={handleFloatingLeave}
                  >
                    <div className="mb-2 border-b border-slate-200/80 px-3 pb-2 dark:border-slate-700/80">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{label}</p>
                    </div>
                    {group.categoryGroups && group.categoryGroups.length > 0
                      ? group.categoryGroups.map((cat) => {
                          const catColor = getCategoryIconColor(cat.transCategoryCode);
                          return (
                          <div key={cat.transCategoryCode} className="px-2 py-1">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {cat.title}
                            </p>
                            <div className="space-y-0.5">
                              {cat.items.map((item) => {
                                const href = getUrl(item.url);
                                const isActive =
                                  pathname === href || pathname?.startsWith(href + "/");
                                const ItemIcon = item.icon;
                                return (
                                  <Link
                                    key={item.url}
                                    href={href}
                                    onClick={handleCloseFloating}
                                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                                      isActive
                                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                    }`}
                                  >
                                    <ItemIcon className={`h-3.5 w-3.5 shrink-0 ${catColor}`} />
                                    <span className="truncate">{getMenuLabel(item.transactionCode, item.title)}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                          );
                        })
                      : group.items.map((item) => {
                          const href = getUrl(item.url);
                          const isActive =
                            pathname === href || pathname?.startsWith(href + "/");
                          const ItemIcon = item.icon;
                          return (
                            <Link
                              key={item.url}
                              href={href}
                              onClick={handleCloseFloating}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                isActive
                                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                              }`}
                            >
                              <ItemIcon className={`h-3.5 w-3.5 shrink-0 ${moduleColor}`} />
                              <span className="truncate">{getMenuLabel(item.transactionCode, item.title)}</span>
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
    </>
  );
}
