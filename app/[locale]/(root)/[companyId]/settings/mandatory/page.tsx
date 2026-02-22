"use client";

import { MandatoryTable } from "./components/mandatory-table";

export default function SettingsMandatoryPage() {
  return (
    <div className="container mx-auto space-y-2 px-4 py-4 sm:space-y-3 sm:px-6 sm:py-6">
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">Mandatory Fields</h1>
        <p className="text-muted-foreground text-sm">
          Configure mandatory field settings
        </p>
      </div>
      <MandatoryTable />
    </div>
  );
}
