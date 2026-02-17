/**
 * Centralized debug logging utility.
 * Debug output is enabled when:
 * - NODE_ENV === "development" OR
 * - NEXT_PUBLIC_DEBUG === "true"
 *
 * Set NEXT_PUBLIC_DEBUG=true in .env to enable debug in production (use with care).
 */

const isDev = process.env.NODE_ENV === "development";
const debugEnabled =
  process.env.NEXT_PUBLIC_DEBUG === "true" || isDev;

export const debug = {
  log: (...args: unknown[]) => {
    if (debugEnabled) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (debugEnabled) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Always log errors - they're important for diagnostics
    console.error(...args);
  },
  /** Only in development - never in production even with NEXT_PUBLIC_DEBUG */
  devOnly: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
};

/** Check if debug mode is enabled (e.g. for conditional UI) */
export const isDebugEnabled = (): boolean => debugEnabled;
