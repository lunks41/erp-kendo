/**
 * Country master – Server Component (server-side table).
 *
 * Grid state (page, sort, size) is stored in a cookie and read here.
 * First page of data is fetched on the server and passed as initialData so the
 * grid can show without waiting for a client-side API call (faster first paint).
 * Cookies: see country-rsc-actions.ts – cookie name "country-rsc-grid-state".
 */
import { getState, saveState } from "./country-rsc-actions";
import {
  getCachedCountryPage,
  getCachedUserSettingDefaultPageSize,
} from "@/lib/server-api";
import type { ICountry } from "@/interfaces/country";
import { CountryClient } from "./country-client";

export default async function CountryMasterPage({
  params,
}: {
  params: Promise<{ locale: string; companyId: string }>;
}) {
  const { companyId } = await params;

  /** Current grid state (skip, take, sort) from cookie; undefined on first load. */
  const dataState = await getState();
  /** Default page size from user setting (e.g. masterGridTotalRecords). */
  const defaultPageSize = await getCachedUserSettingDefaultPageSize(companyId);

  const take = dataState?.take ?? defaultPageSize;
  const skip = dataState?.skip ?? 0;
  const pageNumber = Math.floor(skip / take) + 1;

  /** Fetch on server (cached per request so double render = one API call). */
  const initialResponse = await getCachedCountryPage<ICountry>(
    pageNumber,
    take,
    "null",
    companyId,
  );

  const initialCountries = initialResponse?.data ?? [];
  const initialTotalRecords = initialResponse?.totalRecords ?? 0;

  return (
    <div className="flex flex-col gap-4 p-2">
      <CountryClient
        dataState={dataState}
        defaultPageSize={defaultPageSize}
        onDataStateChangeAction={saveState}
        companyId={companyId}
        initialCountries={initialCountries}
        initialTotalRecords={initialTotalRecords}
      />
    </div>
  );
}
