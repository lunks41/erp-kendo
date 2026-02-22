"use client";

import { AccountForm } from "./components/account-form";

export default function SettingsAccountPage() {
  return (
    <div className="container mx-auto space-y-2 px-4 py-4 sm:space-y-3 sm:px-6 sm:py-6">
      <AccountForm />
    </div>
  );
}
