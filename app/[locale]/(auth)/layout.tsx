import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "ERP";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("auth");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      {/* Language switcher - top right */}
      <div className="absolute right-4 top-4 z-20">
        <LanguageSwitcher />
      </div>
      {/* Background gradient mesh */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_50%,rgba(14,165,233,0.15),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_50%,rgba(168,85,247,0.12),transparent)]" />
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {SITE_NAME}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{t("secureAccess")}</p>
        </div>

        {/* Card container - shared by all auth pages */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-sm">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
