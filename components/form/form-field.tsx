"use client";

export interface FormFieldProps {
  label: string;
  isRequired?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  isRequired = false,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {isRequired && <span className="text-rose-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
    </div>
  );
}
