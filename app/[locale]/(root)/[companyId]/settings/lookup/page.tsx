"use client";

import { DynamicLookupForm } from "./components/dynamiclookup-form";

export default function SettingsLookupPage() {
  return (
    <div className="container mx-auto space-y-2 px-4 py-4 sm:space-y-3 sm:px-6 sm:py-6">
      <DynamicLookupForm />
    </div>
  );
}
