/**
 * VESSEL RSC GRID PAGE (Server Component)
 * =======================================
 *
 * This file has NO "use client" and NO "use server" directive. It is a
 * Server Component: it runs only on the server during the request.
 *
 * "use server" in this file
 * -------------------------
 * - Nothing. Server actions live in vessel-rsc-actions.ts.
 * - This page imports getState, saveState, resetGridState from that file.
 *
 * "use client" in this file
 * ------------------------
 * - Nothing. This page runs on the server.
 * - The only client code is inside VesselRscGridClient (vessel-rsc-grid-client.tsx),
 *   which we render here and pass props to.
 *
 * STEP-BY-STEP (when this page runs on the server)
 * ------------------------------------------------
 * 1. User navigates to /[locale]/[companyId]/master/vessel/rsc
 *
 * 2. VesselRscPage(params) runs on the server.
 *    - getState() from vessel-rsc-actions.ts → reads cookie "vessel-rsc-grid-state" → dataState.
 *    - getCachedUserSettingDefaultPageSize(companyId) → defaultPageSize (cached per request).
 *    - getTranslations("vesselTable") → t() for column titles.
 *    - Build columns array.
 *
 * 3. Return JSX: header, Reset form (action=resetGridState), Back link,
 *    and <VesselRscGridClient dataState={...} defaultPageSize={...} onDataStateChangeAction={saveState} columns={...} />.
 *
 * 4. Client hydrates VesselRscGridClient; grid fetches data and shows it.
 *
 * 5. When user changes page/sort/size: grid calls saveState (server action) → server writes cookie;
 *    then router.refresh() → this page runs again from step 2 with new dataState from cookie.
 *
 * 6. When user clicks Reset grid: form posts to resetGridState(path) → server deletes cookie and redirects;
 *    page loads again, getState() returns undefined → grid gets initial state.
 *
 * @see https://www.telerik.com/kendo-react-ui/components/grid/rsc-mode
 */

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Ship } from "lucide-react";
import { type MasterDataGridRSCColumn } from "@/components/table";
import { getCachedUserSettingDefaultPageSize } from "@/lib/server-api";
import { getState, saveState, resetGridState } from "./vessel-rsc-actions";
import { VesselRscGridClient } from "./vessel-rsc-grid-client";

/**
 * Vessel RSC page – Server Component.
 * Purpose: Renders the Vessel (RSC Grid) screen. Runs only on the server; reads grid state
 * from cookie and user-setting default page size, builds column config, and renders the
 * client grid component with those props. No hooks; uses async/await for server APIs.
 */
export default async function VesselRscPage({
  params,
}: {
  params: Promise<{ locale: string; companyId: string }>;
}) {
  /* eslint-disable react-hooks/purity -- Server execution timing is intentionally impure */
  const startMs =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  /* eslint-enable react-hooks/purity */

  const { locale, companyId } = await params;
  const gridPagePath = `/${locale}/${companyId}/master/vessel/rsc`;
  const t = await getTranslations("vesselTable");

  /** Current grid state (skip, take, sort, filter) from cookie; undefined on first load. */
  const dataState = await getState();
  /** Default page size from user setting (e.g. masterGridTotalRecords); cached per request. */
  const defaultPageSize = await getCachedUserSettingDefaultPageSize(companyId);

  /* eslint-disable react-hooks/purity -- Server execution timing */
  const endMs =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const serverExecutionMs = Math.round(endMs - startMs);
  /* eslint-enable react-hooks/purity */

  /** Column definitions for the grid; titles come from vesselTable namespace. */
  const columns: MasterDataGridRSCColumn[] = [
    { field: "vesselId", title: "Vessel Id", width: 80, minWidth: 60 },
    { field: "vesselCode", title: t("code"), width: 100, minWidth: 80 },
    { field: "vesselName", title: t("name"), flex: true, minWidth: 150 },
    { field: "vesselTypeCode", title: t("type"), width: 100, minWidth: 80 },
    { field: "callSign", title: t("callSign"), width: 90 },
    { field: "imoCode", title: t("imoCode"), width: 100 },
    { field: "grt", title: t("grt"), width: 80 },
    { field: "isActive", title: t("active"), width: 80 },
    { field: "remarks", title: t("remarks"), flex: true, minWidth: 100 },
    { field: "createBy", title: t("createdBy"), width: 100 },
    { field: "editBy", title: t("editedBy"), width: 100 },
    { field: "createDate", title: t("createdDate"), width: 130 },
    { field: "editDate", title: t("editedDate"), width: 130 },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
              <Ship className="h-5 w-5 text-rose-500" />
              Vessel (RSC Grid)
            </h1>
            <span
              className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
              title="Server Component: time to run getState, getCachedUserSettingDefaultPageSize, getTranslations, build columns"
            >
              Server: {serverExecutionMs} ms
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Server-rendered grid with cookie state. Use the pager at the bottom
            to load the next page of records; sort, page size, and search
            trigger a server refresh.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Reset grid: server action deletes cookie and redirects to same page. */}
          <form action={resetGridState.bind(null, gridPagePath)}>
            <button
              type="submit"
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Reset grid
            </button>
          </form>
          <Link
            href={`/${companyId}/master/vessel`}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ← Back to Vessel
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        {/* Client grid: receives state from cookie and saveState server action for persistence. */}
        <VesselRscGridClient
          dataState={dataState}
          defaultPageSize={defaultPageSize}
          onDataStateChangeAction={saveState}
          columns={columns}
          companyId={companyId}
        />
      </div>
    </div>
  );
}
