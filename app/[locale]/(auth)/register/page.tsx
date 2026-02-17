"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@progress/kendo-react-buttons";
import type { RegisterSchemaType } from "@/schemas/auth";
import { registerSchema } from "@/schemas/auth";

const inputClassName =
  "w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60";

export default function RegisterPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userName: "",
      userEmail: "",
      userPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterSchemaType) => {
    setApiError(null);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const regId = process.env.NEXT_PUBLIC_DEFAULT_REGISTRATION_ID ?? "";
    if (!backendUrl) {
      setApiError("Registration is not configured");
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Reg-Id": regId },
        body: JSON.stringify({
          userName: data.userName,
          userEmail: data.userEmail,
          userPassword: data.userPassword,
        }),
      });
      const resData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resData.message || "Registration failed");
      }
      if (resData.result === 1 || response.status === 200) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        throw new Error(resData.message || "Registration failed");
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
          <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-emerald-400">Account created successfully.</p>
        <p className="mt-1 text-sm text-slate-400">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-lg font-medium text-white">Create your account</h2>
        <p className="mt-1 text-sm text-slate-400">Fill in the form below to get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div>
          <label htmlFor="userName" className="mb-1.5 block text-sm font-medium text-slate-300">
            Username
          </label>
          <input id="userName" type="text" autoComplete="username" placeholder="johndoe" className={inputClassName} {...register("userName")} />
          {errors.userName && <p className="mt-1 text-sm text-rose-400">{errors.userName.message}</p>}
        </div>

        <div>
          <label htmlFor="userEmail" className="mb-1.5 block text-sm font-medium text-slate-300">
            Email
          </label>
          <input id="userEmail" type="email" autoComplete="email" placeholder="you@example.com" className={inputClassName} {...register("userEmail")} />
          {errors.userEmail && <p className="mt-1 text-sm text-rose-400">{errors.userEmail.message}</p>}
        </div>

        <div>
          <label htmlFor="userPassword" className="mb-1.5 block text-sm font-medium text-slate-300">
            Password
          </label>
          <input id="userPassword" type="password" autoComplete="new-password" placeholder="••••••••" className={inputClassName} {...register("userPassword")} />
          {errors.userPassword && <p className="mt-1 text-sm text-rose-400">{errors.userPassword.message}</p>}
          <p className="mt-1 text-xs text-slate-500">Min 8 characters, include uppercase, lowercase, number, and special character</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-300">
            Confirm Password
          </label>
          <input id="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••" className={inputClassName} {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="mt-1 text-sm text-rose-400">{errors.confirmPassword.message}</p>}
        </div>

        {apiError && (
          <div className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400" role="alert">
            {apiError}
          </div>
        )}

        <Button type="submit" themeColor="primary" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </>
  );
}
