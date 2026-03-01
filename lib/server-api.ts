/**
 * Server-only API helpers. Only import from Server Components or server code.
 */
import { cache } from "react";
import { headers, cookies } from "next/headers";

export type ApiResponse<T> = {
  result: number;
  message: string;
  data: T[];
  totalRecords?: number;
};

/**
 * Call the app's /api/proxy from the server (e.g. in Server Components).
 * Forwards cookies and optionally X-Company-Id so the proxy can authenticate.
 */
export async function getServerData<T>(
  path: string,
  params: Record<string, string> = {},
  companyId?: string,
): Promise<ApiResponse<T>> {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:4100";
  const protocol =
    headersList.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const base = `${protocol}://${host}`;

  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") query.set(k, v);
  });
  const url = `${base}/api/proxy/${path}${query.toString() ? `?${query.toString()}` : ""}`;
  const reqHeaders: Record<string, string> = {
    Cookie: cookieStore.toString(),
  };
  if (companyId) reqHeaders["X-Company-Id"] = companyId;

  const res = await fetch(url, { headers: reqHeaders, cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message ?? `Server request failed: ${path}`);
  }
  return json as ApiResponse<T>;
}

/** User setting response shape (getusersetting returns single object or array). */
type UserSettingData = { m_Grd_TotRec?: number };

/**
 * Cached fetch for country list. Deduplicates within the same request so when
 * the Server Component runs twice (e.g. RSC double render), only one API call is made.
 */
export const getCachedCountryPage = cache(
  async <T>(
    pageNumber: number,
    pageSize: number,
    searchString: string,
    companyId: string | undefined,
  ): Promise<ApiResponse<T> | null> => {
    return getServerData<T>("master/getcountry", {
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
      searchString: searchString || "null",
    }, companyId).catch(() => null);
  },
);

/**
 * Cached fetch of user setting default page size (masterGridTotalRecords).
 * Deduplicates calls within the same request so setting/getusersetting is only called once.
 */
export const getCachedUserSettingDefaultPageSize = cache(
  async (companyId: string | undefined): Promise<number> => {
    const res = await getServerData<UserSettingData>(
      "setting/getusersetting",
      {},
      companyId,
    ).catch(() => null);
    const data = (res as { data?: UserSettingData | UserSettingData[] })?.data;
    const setting = Array.isArray(data) ? data[0] : data;
    return Number(setting?.m_Grd_TotRec) || 50;
  },
);
