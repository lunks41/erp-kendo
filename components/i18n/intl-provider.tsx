"use client";

import { IntlProvider, load } from "@progress/kendo-react-intl";
import type { ReactNode } from "react";

// Load supplemental CLDR data (required for all locales)
import likelySubtags from "cldr-core/supplemental/likelySubtags.json";
import currencyData from "cldr-core/supplemental/currencyData.json";
import weekData from "cldr-core/supplemental/weekData.json";

// English (default - en-US is built-in, load en for consistency)
import enNumbers from "cldr-numbers-full/main/en/numbers.json";
import enCurrencies from "cldr-numbers-full/main/en/currencies.json";
import enCaGregorian from "cldr-dates-full/main/en/ca-gregorian.json";
import enDateFields from "cldr-dates-full/main/en/dateFields.json";

// Arabic
import arNumbers from "cldr-numbers-full/main/ar/numbers.json";
import arCurrencies from "cldr-numbers-full/main/ar/currencies.json";
import arCaGregorian from "cldr-dates-full/main/ar/ca-gregorian.json";
import arDateFields from "cldr-dates-full/main/ar/dateFields.json";

// Japanese
import jaNumbers from "cldr-numbers-full/main/ja/numbers.json";
import jaCurrencies from "cldr-numbers-full/main/ja/currencies.json";
import jaCaGregorian from "cldr-dates-full/main/ja/ca-gregorian.json";
import jaDateFields from "cldr-dates-full/main/ja/dateFields.json";

type Locale = "en" | "ar" | "ja";

const cldrData: Record<Locale, object[]> = {
  en: [enNumbers, enCurrencies, enCaGregorian, enDateFields],
  ar: [arNumbers, arCurrencies, arCaGregorian, arDateFields],
  ja: [jaNumbers, jaCurrencies, jaCaGregorian, jaDateFields],
};

let loadedLocales = new Set<Locale>();

function loadLocale(locale: Locale) {
  if (loadedLocales.has(locale)) return;
  load(
    likelySubtags,
    currencyData,
    weekData,
    ...(cldrData[locale] as object[])
  );
  loadedLocales.add(locale);
}

// Map our locale codes to Kendo/BCP47 format
function toKendoLocale(locale: string): string {
  if (locale === "ar") return "ar";
  if (locale.startsWith("ja")) return "ja-JP";
  return "en-US";
}

export function KendoIntlProvider({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const loc = (locale.split("-")[0] === "ar" ? "ar" : locale.startsWith("ja") ? "ja" : "en") as Locale;
  loadLocale(loc);
  const kendoLocale = toKendoLocale(locale);

  return (
    <IntlProvider locale={kendoLocale}>{children}</IntlProvider>
  );
}
