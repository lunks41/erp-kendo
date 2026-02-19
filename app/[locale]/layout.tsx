import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { NotificationContainer } from "@/components/layout/notification-container";
import { KendoIntlProvider } from "@/components/i18n/intl-provider";
import { QueryProvider } from "@/components/providers/query-provider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <QueryProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <KendoIntlProvider locale={locale}>
          {children}
          <NotificationContainer />
        </KendoIntlProvider>
      </NextIntlClientProvider>
    </QueryProvider>
  );
}
