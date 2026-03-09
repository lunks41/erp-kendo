"use client";

import { useTranslations } from "next-intl";

/**
 * Translations for a namespace with fallback to common.
 * Use in master form/table components so shared keys resolve from common when missing in the namespace.
 */
export function useNamespaceTranslations(namespace: string) {
  const tNamespace = useTranslations(namespace);
  const tCommon = useTranslations("common");
  return (key: string, values?: Record<string, string | number>) => {
    try {
      const v = tNamespace(key, values);
      if (v !== key) return v;
    } catch {
      // key missing in namespace
    }
    try {
      return tCommon(key, values);
    } catch {
      return key;
    }
  };
}
