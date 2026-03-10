"use client";

export interface FormFieldProps {
  label: string;
  isRequired?: boolean;
  error?: string;
  className?: string;
  /** Optional class for the control wrapper so label and control align (e.g. w-fit for checkboxes/switches) */
  controlClassName?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  isRequired = false,
  error,
  className,
  controlClassName,
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        className={`mb-1.5 block text-sm font-medium ${
          isRequired
            ? "text-rose-600 dark:text-rose-400"
            : "text-slate-700 dark:text-slate-100"
        }`}
      >
        {label}
        {isRequired && <span className="text-rose-500"> *</span>}
      </label>
      {controlClassName ? (
        <div className={controlClassName}>{children}</div>
      ) : (
        children
      )}
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
    </div>
  );
}
