"use client";

import type { ReactNode } from "react";
import { FormProvider, type UseFormReturn } from "react-hook-form";

export type FormProps<T extends object = object> = UseFormReturn<T> & {
  children: ReactNode;
};

/**
 * Form wrapper providing react-hook-form context.
 * Usage: <Form {...form}>{children}</Form>
 */
export function Form<T extends object>({ children, ...formProps }: FormProps<T>) {
  return <FormProvider {...formProps}>{children}</FormProvider>;
}
