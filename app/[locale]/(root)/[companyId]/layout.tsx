import { RootShell } from "@/components/layout/root-shell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string; companyId: string }>;
};

export default async function CompanyRootLayout({
  children,
  params,
}: Props) {
  const { companyId } = await params;

  return <RootShell companyId={companyId}>{children}</RootShell>;
}
