"use client";

import { VisibleTable } from "./components/visible-table";

export default function SettingsVisiblePage() {
  return (
    <div className="container mx-auto space-y-2 px-4 py-4 sm:space-y-3 sm:px-6 sm:py-6">
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">Visible Fields</h1>
        <p className="text-muted-foreground text-sm">
          Configure visible field settings
        </p>
      </div>
      <VisibleTable />
    </div>
  );
}
