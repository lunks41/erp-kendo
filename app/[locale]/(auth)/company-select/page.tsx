"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { useAuthStore } from "@/stores/auth-store";
import type { ICompany } from "@/interfaces/auth";

export default function CompanySelectPage() {
  const router = useRouter();
  const {
    companies,
    currentCompany,
    getCompanies,
    switchCompany,
    isAuthenticated,
    isLoading: storeLoading,
  } = useAuthStore();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    currentCompany?.companyId ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && companies.length === 0) {
      getCompanies();
    }
  }, [isAuthenticated, companies.length, getCompanies]);

  useEffect(() => {
    if (currentCompany?.companyId) {
      setSelectedCompanyId(currentCompany.companyId);
    }
  }, [currentCompany?.companyId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleContinue = async () => {
    if (!selectedCompanyId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await switchCompany(selectedCompanyId, true);
      router.push(`/${selectedCompanyId}/master/customer`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to select company"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = storeLoading || companies.length === 0;

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-lg font-medium text-white">Select a company</h2>
        <p className="mt-1 text-sm text-slate-400">
          Choose a workspace to continue
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          No companies available. Please contact your administrator.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {companies.map((company: ICompany) => (
              <CompanyCard
                key={company.companyId}
                company={company}
                selected={selectedCompanyId === company.companyId}
                onSelect={() => setSelectedCompanyId(company.companyId)}
                disabled={isSubmitting}
              />
            ))}
          </div>

          {error && (
            <div
              className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400"
              role="alert"
            >
              {error}
            </div>
          )}

          <Button
            type="button"
            themeColor="primary"
            disabled={!selectedCompanyId || isSubmitting}
            onClick={handleContinue}
            className="mt-6 w-full"
          >
            {isSubmitting ? "Loading..." : "Continue"}
          </Button>
        </div>
      )}
    </>
  );
}

function CompanyCard({
  company,
  selected,
  onSelect,
  disabled,
}: {
  company: ICompany;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all ${
        selected
          ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
          : "border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <input
        type="radio"
        name="company"
        value={company.companyId}
        checked={selected}
        onChange={onSelect}
        disabled={disabled}
        className="h-4 w-4 border-slate-500 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
      />
      <div className="flex-1">
        <span className="font-medium text-white">{company.companyName}</span>
        {company.companyCode && (
          <span className="ml-2 text-sm text-slate-400">
            ({company.companyCode})
          </span>
        )}
      </div>
    </label>
  );
}
