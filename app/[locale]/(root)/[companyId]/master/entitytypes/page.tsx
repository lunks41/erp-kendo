import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; companyId: string }>;
}

/** Redirect /master/entitytypes to /master/entitytype (same CRUD). */
export default async function EntityTypesMasterPage({ params }: PageProps) {
  const { locale, companyId } = await params;
  redirect(`/${locale}/${companyId}/master/entitytype`);
}
