import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar", "ja"],
  defaultLocale: "en",
  localePrefix: "always",
});
