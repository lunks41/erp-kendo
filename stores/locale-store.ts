"use client";

import Cookies from "js-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "ar" | "ja";

const LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale: Locale) => {
        Cookies.set(LOCALE_COOKIE, locale, {
          path: "/",
          maxAge: COOKIE_MAX_AGE,
        });
        set({ locale });
        window.location.reload();
      },
    }),
    { name: "locale-storage" }
  )
);
