"use client";

import { DropDownList } from "@progress/kendo-react-dropdowns";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const options = [
  { locale: "en" as const, label: "English" },
  { locale: "ar" as const, label: "العربية" },
  { locale: "ja" as const, label: "日本語" },
];

export function LanguageSwitcher() {
  const currentLocale = useLocale() as "en" | "ar" | "ja";
  const pathname = usePathname();
  const router = useRouter();

  const selected = options.find((o) => o.locale === currentLocale) ?? options[0];

  return (
    <DropDownList
      data={options}
      textField="label"
      dataItemKey="locale"
      value={selected}
      onChange={(e) => {
        const val = e.value;
        if (val && val.locale !== currentLocale) {
          router.replace(pathname, { locale: val.locale });
        }
      }}
      style={{ minWidth: 90, fontSize: "0.8125rem" }}
    />
  );
}
