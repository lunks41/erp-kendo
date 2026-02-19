"use client";

import { Lock } from "lucide-react";

const TABLE_HEIGHT = "min(650px, 70vh)";

export interface TableSkeletonProps {
  /** Show lock icon and no-permission message above the skeleton */
  showLock?: boolean;
  /** Number of skeleton rows (default 10) */
  rowCount?: number;
  /** Number of columns (default 6) */
  columnCount?: number;
  className?: string;
}

export function TableSkeleton({
  showLock = false,
  rowCount = 10,
  columnCount = 6,
  className = "",
}: TableSkeletonProps) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-4 ${className}`}
      aria-busy="true"
      aria-label="Loading table"
    >
      {showLock && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <Lock className="h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">
              You don&apos;t have permission to access this content.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Contact your administrator to request access.
            </p>
          </div>
        </div>
      )}

      {/* Toolbar skeleton */}
      <div className="flex justify-between gap-2">
        <div className="flex gap-2">
          <div className="h-9 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-9 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-9 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* Grid container + table skeleton */}
      <div
        className="k-grid-container min-w-0 shrink-0 overflow-hidden rounded border border-slate-500 bg-white dark:border-slate-700 dark:bg-slate-800/50"
        style={{ height: TABLE_HEIGHT }}
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
          <div className="h-8 flex-1 max-w-xs animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Table header */}
        <div className="flex border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
          {Array.from({ length: columnCount }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-slate-200 px-3 py-2 last:border-r-0 dark:border-slate-700"
              style={{
                minWidth: i === 0 ? 130 : i === 1 ? 150 : 100,
              }}
            >
              <div
                className="h-4 w-3/4 max-w-[80px] animate-pulse rounded bg-slate-300 dark:bg-slate-600"
                style={{ width: `${60 + (i % 3) * 15}%` }}
              />
            </div>
          ))}
        </div>

        {/* Table body rows */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex bg-white dark:bg-slate-800/50"
            >
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="flex-1 border-r border-slate-100 px-3 py-2.5 last:border-r-0 dark:border-slate-700/50"
                  style={{
                    minWidth: colIndex === 0 ? 130 : colIndex === 1 ? 150 : 100,
                  }}
                >
                  <div
                    className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
                    style={{
                      width: `${70 + (rowIndex + colIndex) % 4 * 8}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
