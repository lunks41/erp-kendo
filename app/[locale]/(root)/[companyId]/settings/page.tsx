"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";

export default function SettingsPage() {
  const params = useParams();
  const companyId = (params?.companyId as string) ?? "";
  const router = useRouter();

  useEffect(() => {
    if (companyId) {
      router.replace(`/${companyId}/settings/default`);
    }
  }, [companyId, router]);

  return null;
}
