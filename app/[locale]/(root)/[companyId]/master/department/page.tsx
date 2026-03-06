import { Building2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ApiResponse } from "@/interfaces/auth";
import type { IDepartment } from "@/interfaces/department";
import { Department, Lookup } from "@/lib/api-routes";
import { formatDateTime } from "@/lib/date-utils";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Fallback for local dev (matches README: port 5000)
  return "http://localhost:5000";
}

interface PageProps {
  params: { locale: string; companyId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

async function fetchDepartmentsRsc(
  companyId: string,
  search?: string,
): Promise<ApiResponse<IDepartment>> {
  const searchString =
    typeof search === "string" && search.trim().length > 0
      ? search.trim()
      : "null";

  const query = new URLSearchParams({
    pageNumber: "1",
    pageSize: "2000",
    searchString,
  });

  const baseUrl = getBaseUrl();
  const res = await fetch(
    `${baseUrl}/api/proxy${Department.get}?${query.toString()}`,
    {
      // Important: pass company header so proxy can route correctly
      headers: {
        "X-Company-Id": companyId,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to load departments");
  }

  return (await res.json()) as ApiResponse<IDepartment>;
}

async function fetchDepartmentLookupRsc(companyId: string) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/proxy${Lookup.getDepartment}`, {
    headers: {
      "X-Company-Id": companyId,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  // Lookup endpoints typically return { result, message, data }
  return (await res.json()) as { data?: unknown[] };
}

export default async function DepartmentPage({
  params,
  searchParams,
}: PageProps) {
  const { locale, companyId } = params;
  const tPage = await getTranslations({
    locale,
    namespace: "departmentPage",
  });
  const tTable = await getTranslations({
    locale,
    namespace: "departmentTable",
  });

  const searchQuery =
    (typeof searchParams?.q === "string" ? searchParams.q : undefined) ?? "";

  // RSC: call backend twice (master + lookup) as requested
  const [departmentsResponse, departmentLookupResponse] = await Promise.all([
    fetchDepartmentsRsc(companyId, searchQuery),
    fetchDepartmentLookupRsc(companyId),
  ]);

  const departments = departmentsResponse.data ?? [];
  const totalRecords =
    departmentsResponse.totalRecords ?? departments.length ?? 0;
  const activeCount = departments.filter((d) => d.isActive).length;
  const lookupCount = Array.isArray(departmentLookupResponse?.data)
    ? departmentLookupResponse!.data!.length
    : 0;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
          <Building2 className="h-5 w-5 text-rose-500" />
          {tPage("title")}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {tPage("description")}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
          {tTable("summary", {
            total: totalRecords,
            active: activeCount,
            lookup: lookupCount,
          })}
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2 text-xs" method="get">
        <input
          type="text"
          name="q"
          defaultValue={searchQuery}
          placeholder={tTable("searchDepartmentsPlaceholder")}
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          className="rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
        >
          {tTable("search")}
        </button>
        <a
          href="?"
          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {tTable("clearSearch")}
        </a>
      </form>

      <DepartmentRscTable
        departments={departments}
        t={tTable}
        datetimeFormat="dd/MM/yyyy HH:mm:ss"
      />
    </div>
  );
}

type DepartmentTableTranslations = (key: string) => string;

interface DepartmentRscTableProps {
  departments: IDepartment[];
  t: DepartmentTableTranslations;
  datetimeFormat: string;
}

function DepartmentRscTable({
  departments,
  t,
  datetimeFormat,
}: DepartmentRscTableProps) {
  const hasData = departments.length > 0;

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="max-h-[60vh] overflow-auto">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2 font-medium">{t("code")}</th>
              <th className="px-3 py-2 font-medium">{t("name")}</th>
              <th className="px-3 py-2 font-medium">{t("active")}</th>
              <th className="px-3 py-2 font-medium hidden md:table-cell">
                {t("remarks")}
              </th>
              <th className="px-3 py-2 font-medium hidden lg:table-cell">
                {t("createdBy")}
              </th>
              <th className="px-3 py-2 font-medium hidden lg:table-cell">
                {t("createdDate")}
              </th>
              <th className="px-3 py-2 font-medium hidden xl:table-cell">
                {t("editedBy")}
              </th>
              <th className="px-3 py-2 font-medium hidden xl:table-cell">
                {t("editedDate")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {hasData ? (
              departments.map((dept) => {
                const created = formatDateTime(dept.createDate, datetimeFormat);
                const edited = formatDateTime(dept.editDate, datetimeFormat);
                const isActive = dept.isActive;
                const activeLabel = isActive ? t("active") : t("inactive");
                const activeClass = isActive
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white";

                return (
                  <tr
                    key={dept.departmentId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-3 py-1.5 align-middle text-[11px] font-medium text-slate-900 dark:text-slate-100">
                      {dept.departmentCode}
                    </td>
                    <td className="px-3 py-1.5 align-middle text-[11px] text-slate-800 dark:text-slate-200">
                      {dept.departmentName}
                    </td>
                    <td className="px-3 py-1.5 align-middle">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${activeClass}`}
                      >
                        {activeLabel}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 align-middle hidden md:table-cell text-[11px] text-slate-700 dark:text-slate-300">
                      {dept.remarks || "—"}
                    </td>
                    <td className="px-3 py-1.5 align-middle hidden lg:table-cell text-[11px] text-slate-700 dark:text-slate-300">
                      {dept.createBy || "—"}
                    </td>
                    <td className="px-3 py-1.5 align-middle hidden lg:table-cell text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {created || "—"}
                    </td>
                    <td className="px-3 py-1.5 align-middle hidden xl:table-cell text-[11px] text-slate-700 dark:text-slate-300">
                      {dept.editBy || "—"}
                    </td>
                    <td className="px-3 py-1.5 align-middle hidden xl:table-cell text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {edited || "—"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center text-xs text-slate-500 dark:text-slate-400"
                >
                  {t("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

