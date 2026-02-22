"use client";

import { FinanceForm } from "./components/finance-form";

export default function SettingsFinancePage() {
  return (
    <div className="container mx-auto space-y-2 px-4 py-4 sm:space-y-3 sm:px-6 sm:py-6">
      <FinanceForm />
    </div>
  );
}
