/**
 * COUNTRY RSC – "use server" (server-only)
 *
 * Grid state is stored in a cookie so the Server Component can read it and
 * pass it to the client. When the user changes page/sort/size, the client
 * calls saveState (server action), which writes the cookie; then router.refresh()
 * re-renders the server with the new state.
 *
 * WHERE COOKIES ARE USED (this file only):
 * - Cookie name: "country-rsc-grid-state" (COUNTRY_GRID_STATE_COOKIE)
 * - cookies() from next/headers: getState() reads, saveState() sets, resetGridState() deletes
 * - Path: "/", maxAge: 7 days when setting
 */

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { State } from "@progress/kendo-data-query";
import type { GridDataStateChangeEvent } from "@progress/kendo-react-grid";
import { debug } from "@/lib/debug";

const COUNTRY_GRID_STATE_COOKIE = "country-rsc-grid-state";

/**
 * Reads the current country grid state from the cookie.
 * Used by the Server Component (page.tsx) to pass skip, take, sort into the client grid.
 */
export async function getState(): Promise<State | undefined> {
  try {
    const c = await cookies();
    const value = c.get(COUNTRY_GRID_STATE_COOKIE)?.value;
    if (!value) return undefined;
    return JSON.parse(value) as State;
  } catch {
    return undefined;
  }
}

/**
 * Server Action: saves grid state to the cookie (merge with existing).
 * When the user changes page, sort, or page size, the client calls this;
 * we persist the new state so the next server render passes it to the grid.
 */
export async function saveState(event: GridDataStateChangeEvent) {
  debug.log("[Country RSC] saveState (runs on server):", event.dataState);
  const state = await getState();
  const merged = { ...state, ...event.dataState };
  const c = await cookies();
  c.set(COUNTRY_GRID_STATE_COOKIE, JSON.stringify(merged), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/**
 * Server Action: deletes the grid state cookie and redirects.
 * "Reset grid" uses this so getState() returns undefined and the grid resets to page 1.
 */
export async function resetGridState(path: string) {
  const c = await cookies();
  c.delete(COUNTRY_GRID_STATE_COOKIE);
  redirect(path);
}
