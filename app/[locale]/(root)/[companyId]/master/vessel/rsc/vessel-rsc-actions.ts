/**
 * VESSEL RSC – "use server" (server-only)
 * =======================================
 *
 * This file runs ONLY on the server. The "use server" directive at the top
 * makes every exported async function a Server Action (invokable from the client).
 *
 * "use server" in this file
 * -------------------------
 * - getState()        – reads cookie on the server (cookies() from next/headers)
 * - saveState(event)  – Server Action: merges grid state into cookie
 * - resetGridState(path) – Server Action: deletes cookie and redirects
 *
 * "use client" in this file
 * ------------------------
 * - Nothing. This file has no "use client"; it never runs in the browser.
 *
 * STEP-BY-STEP (when these run on the server)
 * -------------------------------------------
 * 1. getState()
 *    - Called from page.tsx (Server Component) during render.
 *    - cookies().get("vessel-rsc-grid-state") → parse JSON → return State | undefined.
 *
 * 2. saveState(event) [Server Action – called from client when user changes page/sort/size]
 *    - Client (grid) calls saveState(event) → request sent to server.
 *    - Server: getState() to read current cookie.
 *    - Server: merged = { ...current, ...event.dataState }.
 *    - Server: cookies().set("vessel-rsc-grid-state", JSON.stringify(merged)).
 *    - Response sent to client; client then calls router.refresh().
 *
 * 3. resetGridState(path) [Server Action – called when user clicks Reset grid]
 *    - Client submits form with action=resetGridState(gridPagePath).
 *    - Server: cookies().delete("vessel-rsc-grid-state").
 *    - Server: redirect(path) → browser loads same page; getState() now returns undefined.
 */

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { State } from "@progress/kendo-data-query";
import type { GridDataStateChangeEvent } from "@progress/kendo-react-grid";
import { debug } from "@/lib/debug";

const VESSEL_GRID_STATE_COOKIE = "vessel-rsc-grid-state";

/**
 * Reads the current vessel grid state from the cookie.
 * Purpose: Used by the Server Component (page.tsx) on each render to pass skip, take, sort, filter
 * into the client grid so the grid shows the correct page and options. Also used inside saveState
 * to merge existing state with the new change.
 * Runs on: Server only (uses cookies() from next/headers).
 * Returns: State (skip, take, sort, filter, group) or undefined if cookie missing/invalid.
 */
export async function getState(): Promise<State | undefined> {
  try {
    const c = await cookies();
    const value = c.get(VESSEL_GRID_STATE_COOKIE)?.value;
    if (!value) return undefined;
    return JSON.parse(value) as State;
  } catch {
    return undefined;
  }
}

/**
 * Server Action: saves grid state to the cookie (merge with existing).
 * Purpose: When the user changes page, sort, or page size in the grid, the client calls this
 * action; we persist the new state in the cookie so the next server render (after router.refresh())
 * passes the updated state to the grid.
 * Runs on: Server (invoked from client when grid fires onDataStateChange).
 * @param event – Kendo grid event; we use event.dataState (skip, take, sort, filter, etc.).
 */
export async function saveState(event: GridDataStateChangeEvent) {
  debug.log("[Vessel RSC] saveState (runs on server):", event.dataState);
  const state = await getState();
  const merged = { ...state, ...event.dataState };
  const c = await cookies();
  c.set(VESSEL_GRID_STATE_COOKIE, JSON.stringify(merged), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/**
 * Server Action: deletes the grid state cookie and redirects to the given path.
 * Purpose: "Reset grid" button submits a form with this action; after redirect the page
 * loads with no saved state, so getState() returns undefined and the grid shows page 1
 * with default page size.
 * Runs on: Server (invoked when user submits the Reset grid form).
 * @param path – Full path to redirect to (e.g. /en/1/master/vessel/rsc).
 */
export async function resetGridState(path: string) {
  const c = await cookies();
  c.delete(VESSEL_GRID_STATE_COOKIE);
  redirect(path);
}
