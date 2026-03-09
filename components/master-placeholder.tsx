"use client";

import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";

export interface MasterPlaceholderProps {
  /** Slug used for sidebarMenu key (e.g. accountsetup, bank) */
  slug: string;
}

export function MasterPlaceholder({ slug }: MasterPlaceholderProps) {
  const tMenu = useTranslations("sidebarMenu");
  const label = (() => {
    try {
      const val = tMenu(slug);
      if (val && !val.startsWith("sidebarMenu.")) return val;
    } catch {
      // ignore
    }
    return slug
      .replace(/([a-z])([A-Z])|[-_](.)/g, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join(" ")
      )
      .replace(/^./, (s) => s.toUpperCase());
  })();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
          <FileText className="h-5 w-5 text-rose-500" />
          {label}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Coming soon
        </p>
      </div>
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/30 dark:text-slate-400">
        <p>This master is coming soon.</p>
      </div>
    </div>
  );
}
